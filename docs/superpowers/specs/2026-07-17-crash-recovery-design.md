# Crash Recovery Design

## Goal

Report a previous native panic or unclean shutdown after Harbor restarts, without background uploads or a large crash-handling framework.

## Native Lifecycle

`crash_report.rs` initializes at the start of Tauri setup. It reads any previous panic report and running marker, stores one startup notice in memory, writes a fresh marker, and installs a panic hook. The hook writes a size-limited local JSON report containing the app version, platform, panic message, location, and captured backtrace before delegating to Rust's previous hook.

Normal application shutdown removes the marker. A marker left without a panic report produces a generic unclean-shutdown notice. Taking the startup notice removes the saved panic report so the same incident is not shown again.

## Frontend Experience

`ErrorView` invokes one native command after mounting. A previous panic opens the existing error page with a short apology and technical details. An unclean shutdown opens the same page with a generic message. Reports are sent only when the user presses **Submit report**; dismissing the page sends nothing.

## Limits

The panic report is capped at 64 KiB and only one report is retained. Hard termination, power loss, aborts, and segmentation faults may prevent the panic hook from writing; the running marker still detects that Harbor did not close normally.

## Validation

Rust unit tests cover panic report truncation, startup classification, one-time consumption, and marker cleanup. Frontend tests cover mapping startup notices into the existing error model.
