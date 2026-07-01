#[derive(Debug)]
pub struct AudioClip {
    pub samples: Vec<i16>,
    pub sample_rate: u32,
    pub channels: u16,
}

#[cfg(target_os = "linux")]
mod linux;
#[cfg(windows)]
mod windows;

#[cfg(target_os = "linux")]
pub use linux::capture;
#[cfg(windows)]
pub use windows::capture;

#[cfg(not(any(windows, target_os = "linux")))]
pub fn capture(_seconds: u32) -> Result<AudioClip, String> {
    Err("Song identification is not supported on this platform yet".into())
}
