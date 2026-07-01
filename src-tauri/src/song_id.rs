mod capture;

use capture::AudioClip;
use serde::Serialize;
use std::sync::atomic::{AtomicBool, Ordering};

static IDENTIFICATION_IN_PROGRESS: AtomicBool = AtomicBool::new(false);

struct IdentificationGuard;

impl IdentificationGuard {
    fn acquire() -> Result<Self, String> {
        IDENTIFICATION_IN_PROGRESS
            .compare_exchange(false, true, Ordering::AcqRel, Ordering::Acquire)
            .map(|_| Self)
            .map_err(|_| "Song identification is already running".to_string())
    }
}

impl Drop for IdentificationGuard {
    fn drop(&mut self) {
        IDENTIFICATION_IN_PROGRESS.store(false, Ordering::Release);
    }
}

#[derive(Serialize)]
pub struct SongResult {
    pub title: String,
    pub artist: String,
    pub album: String,
    pub artwork: String,
    pub link: String,
    #[serde(rename = "durationSec")]
    pub duration_sec: f64,
    #[serde(rename = "startSec")]
    pub start_sec: f64,
}

#[tauri::command]
pub async fn recognize_now_playing(
    api_token: String,
    seconds: Option<u32>,
) -> Result<Option<SongResult>, String> {
    let _guard = IdentificationGuard::acquire()?;
    let seconds = normalize_capture_seconds(seconds);
    let clip = tauri::async_runtime::spawn_blocking(move || capture::capture(seconds))
        .await
        .map_err(|e| format!("Audio capture task failed: {e}"))??;
    validate_clip(&clip, seconds)?;

    let wav = pcm_to_wav(&clip)?;
    audd_recognize(wav, api_token).await
}

fn normalize_capture_seconds(seconds: Option<u32>) -> u32 {
    seconds.unwrap_or(7).clamp(3, 15)
}

fn validate_clip(clip: &AudioClip, seconds: u32) -> Result<(), String> {
    if clip.samples.is_empty() {
        return Err("System audio capture returned no samples".into());
    }
    if clip.sample_rate == 0 || clip.channels == 0 {
        return Err("System audio capture returned an invalid audio format".into());
    }

    let expected = clip.sample_rate as usize * clip.channels as usize * seconds as usize;
    if clip.samples.len() < expected {
        return Err(format!(
            "System audio capture ended early (received {} of {expected} samples)",
            clip.samples.len()
        ));
    }
    if !clip.samples.iter().any(|sample| sample.unsigned_abs() > 8) {
        return Err("No audible system audio was detected".into());
    }
    Ok(())
}

fn pcm_to_wav(clip: &AudioClip) -> Result<Vec<u8>, String> {
    use hound::{SampleFormat, WavSpec, WavWriter};
    use std::io::Cursor;

    let spec = WavSpec {
        channels: clip.channels,
        sample_rate: clip.sample_rate,
        bits_per_sample: 16,
        sample_format: SampleFormat::Int,
    };
    let mut cursor = Cursor::new(Vec::<u8>::new());
    {
        let mut writer = WavWriter::new(&mut cursor, spec).map_err(|e| e.to_string())?;
        for sample in &clip.samples {
            writer.write_sample(*sample).map_err(|e| e.to_string())?;
        }
        writer.finalize().map_err(|e| e.to_string())?;
    }
    Ok(cursor.into_inner())
}

fn parse_timecode(tc: &str) -> f64 {
    tc.split(':').fold(0.0f64, |acc, p| {
        acc * 60.0 + p.parse::<f64>().unwrap_or(0.0)
    })
}

async fn audd_recognize(wav: Vec<u8>, api_token: String) -> Result<Option<SongResult>, String> {
    use reqwest::multipart::{Form, Part};

    let part = Part::bytes(wav)
        .file_name("clip.wav")
        .mime_str("audio/wav")
        .map_err(|e| e.to_string())?;
    let form = Form::new()
        .text("api_token", api_token)
        .text("return", "apple_music,spotify")
        .part("file", part);

    let client = reqwest::Client::new();
    let resp = client
        .post("https://api.audd.io/")
        .multipart(form)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    let json: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;

    if json["status"] != "success" {
        let msg = json["error"]["error_message"]
            .as_str()
            .unwrap_or("unknown error");
        return Err(format!("AudD: {msg}"));
    }

    let r = &json["result"];
    if r.is_null() {
        return Ok(None);
    }

    let title = r["title"].as_str().unwrap_or("").to_string();
    let artist = r["artist"].as_str().unwrap_or("").to_string();
    let album = r["album"].as_str().unwrap_or("").to_string();
    let link = r["song_link"].as_str().unwrap_or("").to_string();

    let artwork = if let Some(url) = r["apple_music"]["artwork"]["url"].as_str() {
        url.replace("{w}", "300").replace("{h}", "300")
    } else {
        r["spotify"]["album"]["images"][0]["url"]
            .as_str()
            .unwrap_or("")
            .to_string()
    };

    let start_sec = r["timecode"].as_str().map(parse_timecode).unwrap_or(0.0);
    let duration_sec = r["apple_music"]["durationInMillis"]
        .as_f64()
        .map(|ms| ms / 1000.0)
        .or_else(|| r["spotify"]["duration_ms"].as_f64().map(|ms| ms / 1000.0))
        .unwrap_or(0.0);

    Ok(Some(SongResult {
        title,
        artist,
        album,
        artwork,
        link,
        duration_sec,
        start_sec,
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn capture_duration_defaults_and_clamps() {
        assert_eq!(normalize_capture_seconds(None), 7);
        assert_eq!(normalize_capture_seconds(Some(1)), 3);
        assert_eq!(normalize_capture_seconds(Some(10)), 10);
        assert_eq!(normalize_capture_seconds(Some(30)), 15);
    }

    #[test]
    fn parses_audd_timecodes() {
        assert_eq!(parse_timecode("01:23"), 83.0);
        assert_eq!(parse_timecode("01:02:03.5"), 3723.5);
    }

    #[test]
    fn writes_pcm_as_wav() {
        let clip = AudioClip {
            samples: vec![-100, 100, -200, 200],
            sample_rate: 44_100,
            channels: 2,
        };
        let wav = pcm_to_wav(&clip).expect("WAV encoding should succeed");
        assert_eq!(&wav[0..4], b"RIFF");
        assert_eq!(&wav[8..12], b"WAVE");
    }

    #[test]
    fn rejects_silent_and_truncated_captures() {
        let silent = AudioClip {
            samples: vec![0; 12],
            sample_rate: 2,
            channels: 2,
        };
        assert_eq!(
            validate_clip(&silent, 3).unwrap_err(),
            "No audible system audio was detected"
        );

        let truncated = AudioClip {
            samples: vec![100; 11],
            sample_rate: 2,
            channels: 2,
        };
        assert!(validate_clip(&truncated, 3)
            .unwrap_err()
            .starts_with("System audio capture ended early"));
    }

    #[test]
    fn identification_guard_rejects_concurrent_work() {
        let first = IdentificationGuard::acquire().expect("first command should acquire the guard");
        assert!(IdentificationGuard::acquire().is_err());
        drop(first);
        assert!(IdentificationGuard::acquire().is_ok());
    }
}
