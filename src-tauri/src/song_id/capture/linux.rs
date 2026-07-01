use super::AudioClip;
use pulse::callbacks::ListResult;
use pulse::context::{Context, FlagSet as ContextFlagSet, State as ContextState};
use pulse::def::BufferAttr;
use pulse::mainloop::standard::{IterateResult, Mainloop};
use pulse::sample::{Format, Spec};
use pulse::stream::{FlagSet as StreamFlagSet, PeekResult, State as StreamState, Stream};
use std::cell::RefCell;
use std::rc::Rc;
use std::thread;
use std::time::{Duration, Instant};

const SAMPLE_RATE: u32 = 44_100;
const CHANNELS: u8 = 2;
const CAPTURE_GRACE: Duration = Duration::from_secs(3);
const POLL_INTERVAL: Duration = Duration::from_millis(5);
const FRAGMENT_MILLIS: usize = 100;

pub fn capture(seconds: u32) -> Result<AudioClip, String> {
    let deadline = Instant::now() + Duration::from_secs(seconds as u64) + CAPTURE_GRACE;
    let spec = capture_spec();
    if !spec.is_valid() {
        return Err("The requested PulseAudio capture format is invalid".into());
    }

    let mut mainloop = Mainloop::new().ok_or("Could not create a PulseAudio event loop")?;
    let mut context = Context::new(&mainloop, "Harbor song identification")
        .ok_or("Could not create a PulseAudio context")?;
    context
        .connect(None, ContextFlagSet::NOFLAGS, None)
        .map_err(|e| format!("Could not connect to PulseAudio or pipewire-pulse: {e}"))?;
    wait_for_context(&mut mainloop, &context, deadline)?;

    let monitor_source = default_monitor_source(&mut mainloop, &context, deadline)?;
    let mut stream = Stream::new(&mut context, "Identify song", &spec, None)
        .ok_or("Could not create a PulseAudio recording stream")?;
    let fragment_bytes = SAMPLE_RATE as usize * CHANNELS as usize * 2 * FRAGMENT_MILLIS / 1_000;
    let buffer_attr = BufferAttr {
        maxlength: u32::MAX,
        tlength: u32::MAX,
        prebuf: u32::MAX,
        minreq: u32::MAX,
        fragsize: fragment_bytes as u32,
    };
    stream
        .connect_record(
            Some(&monitor_source),
            Some(&buffer_attr),
            StreamFlagSet::ADJUST_LATENCY,
        )
        .map_err(|e| format!("Could not record output monitor '{monitor_source}': {e}"))?;
    wait_for_stream(&mut mainloop, &stream, &context, deadline)?;

    let target_bytes = SAMPLE_RATE as usize * CHANNELS as usize * seconds as usize * 2;
    let capture_result =
        collect_audio(&mut mainloop, &context, &mut stream, target_bytes, deadline);
    let disconnect_result = stream
        .disconnect()
        .map_err(|e| format!("Could not close the PulseAudio recording stream: {e}"));
    let bytes = capture_result?;
    disconnect_result?;

    let samples = bytes
        .chunks_exact(2)
        .map(|chunk| i16::from_le_bytes([chunk[0], chunk[1]]))
        .collect();
    Ok(AudioClip {
        samples,
        sample_rate: SAMPLE_RATE,
        channels: CHANNELS as u16,
    })
}

fn capture_spec() -> Spec {
    Spec {
        format: Format::S16le,
        channels: CHANNELS,
        rate: SAMPLE_RATE,
    }
}

fn wait_for_context(
    mainloop: &mut Mainloop,
    context: &Context,
    deadline: Instant,
) -> Result<(), String> {
    loop {
        match context.get_state() {
            ContextState::Ready => return Ok(()),
            ContextState::Failed | ContextState::Terminated => {
                return Err("PulseAudio connection failed or terminated".into())
            }
            _ => pump(mainloop, deadline, "connecting to PulseAudio")?,
        }
    }
}

fn default_monitor_source(
    mainloop: &mut Mainloop,
    context: &Context,
    deadline: Instant,
) -> Result<String, String> {
    let default_sink = Rc::new(RefCell::new(None::<String>));
    let server_query_done = Rc::new(RefCell::new(false));
    let callback_sink = Rc::clone(&default_sink);
    let callback_done = Rc::clone(&server_query_done);
    let _server_operation = context.introspect().get_server_info(move |info| {
        *callback_sink.borrow_mut() = info.default_sink_name.as_ref().map(|name| name.to_string());
        *callback_done.borrow_mut() = true;
    });
    while !*server_query_done.borrow() {
        ensure_context_ready(context)?;
        pump(mainloop, deadline, "resolving the default output device")?;
    }
    let default_sink = default_sink
        .borrow_mut()
        .take()
        .ok_or("PulseAudio did not report a default output device")?;

    let monitor = Rc::new(RefCell::new(None::<String>));
    let query_done = Rc::new(RefCell::new(false));
    let callback_monitor = Rc::clone(&monitor);
    let callback_done = Rc::clone(&query_done);
    let _sink_operation =
        context
            .introspect()
            .get_sink_info_by_name(&default_sink, move |result| match result {
                ListResult::Item(info) => {
                    *callback_monitor.borrow_mut() = info
                        .monitor_source_name
                        .as_ref()
                        .map(|name| name.to_string());
                }
                ListResult::End | ListResult::Error => *callback_done.borrow_mut() = true,
            });
    while !*query_done.borrow() {
        ensure_context_ready(context)?;
        pump(mainloop, deadline, "resolving the output monitor")?;
    }

    let monitor = monitor.borrow_mut().take();
    monitor
        .ok_or_else(|| format!("The default output device '{default_sink}' has no monitor source"))
}

fn wait_for_stream(
    mainloop: &mut Mainloop,
    stream: &Stream,
    context: &Context,
    deadline: Instant,
) -> Result<(), String> {
    loop {
        ensure_context_ready(context)?;
        match stream.get_state() {
            StreamState::Ready => return Ok(()),
            StreamState::Failed | StreamState::Terminated => {
                return Err("PulseAudio recording stream failed or terminated".into())
            }
            _ => pump(mainloop, deadline, "starting system audio capture")?,
        }
    }
}

fn collect_audio(
    mainloop: &mut Mainloop,
    context: &Context,
    stream: &mut Stream,
    target_bytes: usize,
    deadline: Instant,
) -> Result<Vec<u8>, String> {
    let mut bytes = Vec::with_capacity(target_bytes);
    while bytes.len() < target_bytes {
        ensure_context_ready(context)?;
        match stream.get_state() {
            StreamState::Ready => {}
            StreamState::Failed | StreamState::Terminated => {
                return Err("PulseAudio recording stream failed or terminated".into())
            }
            _ => return Err("PulseAudio recording stream became unavailable".into()),
        }

        pump(mainloop, deadline, "capturing system audio")?;
        if stream.readable_size().unwrap_or(0) == 0 {
            continue;
        }

        let remaining = target_bytes - bytes.len();
        match stream
            .peek()
            .map_err(|e| format!("Could not read captured system audio: {e}"))?
        {
            PeekResult::Empty => continue,
            PeekResult::Hole(size) => bytes.resize(bytes.len() + size.min(remaining), 0),
            PeekResult::Data(data) => bytes.extend_from_slice(&data[..data.len().min(remaining)]),
        }
        stream
            .discard()
            .map_err(|e| format!("Could not release captured audio data: {e}"))?;
    }
    Ok(bytes)
}

fn pump(mainloop: &mut Mainloop, deadline: Instant, operation: &str) -> Result<(), String> {
    if Instant::now() >= deadline {
        return Err(format!("Timed out while {operation}"));
    }
    match mainloop.iterate(false) {
        IterateResult::Success(_) => {
            thread::sleep(POLL_INTERVAL);
            Ok(())
        }
        IterateResult::Quit(_) => Err("PulseAudio event loop quit unexpectedly".into()),
        IterateResult::Err(error) => Err(format!("PulseAudio event loop failed: {error}")),
    }
}

fn ensure_context_ready(context: &Context) -> Result<(), String> {
    match context.get_state() {
        ContextState::Ready => Ok(()),
        ContextState::Failed | ContextState::Terminated => {
            Err("PulseAudio connection failed or terminated".into())
        }
        _ => Err("PulseAudio connection became unavailable".into()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn capture_format_and_fragment_are_frame_aligned() {
        let spec = capture_spec();
        assert!(spec.is_valid());
        let fragment_bytes = SAMPLE_RATE as usize * CHANNELS as usize * 2 * FRAGMENT_MILLIS / 1_000;
        assert_eq!(fragment_bytes % spec.frame_size(), 0);
    }
}
