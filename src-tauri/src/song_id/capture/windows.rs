use super::AudioClip;
use std::collections::VecDeque;
use wasapi::*;

pub fn capture(seconds: u32) -> Result<AudioClip, String> {
    initialize_mta()
        .ok()
        .map_err(|e| format!("COM init failed: {e}"))?;

    let sample_rate = 44_100u32;
    let channels = 2u16;
    let bits = 16usize;
    let device = get_default_device(&Direction::Render)
        .map_err(|e| format!("Could not open the default output device: {e}"))?;
    let mut audio_client = device.get_iaudioclient().map_err(|e| e.to_string())?;
    let format = WaveFormat::new(
        bits,
        bits,
        &SampleType::Int,
        sample_rate as usize,
        channels as usize,
        None,
    );

    let (_, min_period) = audio_client.get_periods().map_err(|e| e.to_string())?;
    audio_client
        .initialize_client(
            &format,
            min_period,
            &Direction::Capture,
            &ShareMode::Shared,
            true,
        )
        .map_err(|e| format!("Could not start output loopback capture: {e}"))?;

    let event = audio_client
        .set_get_eventhandle()
        .map_err(|e| e.to_string())?;
    let capture_client = audio_client
        .get_audiocaptureclient()
        .map_err(|e| e.to_string())?;
    let block_align = format.get_blockalign() as usize;
    let target_bytes = sample_rate as usize * seconds as usize * block_align;
    let mut queue = VecDeque::new();

    audio_client.start_stream().map_err(|e| e.to_string())?;
    let capture_result = (|| {
        while queue.len() < target_bytes {
            capture_client
                .read_from_device_to_deque(&mut queue)
                .map_err(|e| e.to_string())?;
            event
                .wait_for_event(2_000)
                .map_err(|_| "Timed out while capturing system audio".to_string())?;
        }
        Ok::<(), String>(())
    })();
    let stop_result = audio_client.stop_stream().map_err(|e| e.to_string());
    capture_result?;
    stop_result?;

    let bytes: Vec<u8> = queue.into_iter().take(target_bytes).collect();
    let samples = bytes
        .chunks_exact(2)
        .map(|chunk| i16::from_le_bytes([chunk[0], chunk[1]]))
        .collect();
    Ok(AudioClip {
        samples,
        sample_rate,
        channels,
    })
}
