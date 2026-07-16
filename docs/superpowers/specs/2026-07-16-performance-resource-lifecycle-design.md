# Performance and Resource Lifecycle Design

## Goal

Prevent Harbor's metadata loading and thumbnail preview features from causing CPU spikes, multi-gigabyte memory growth, or orphaned `mpv` processes while preserving the existing user-facing features on Windows, macOS, and Linux.

## Evidence and scope

A live macOS profile showed Harbor reaching 242% CPU, a 6.6 GB physical footprint, and a 21.2 GB peak. The hottest Tokio stack was `tauri_plugin_http` repeatedly constructing Hickory DNS resolvers while hundreds of TMDB requests were active. The request burst originated in visible React cards resolving external IDs, and TMDB retries amplified rate-limited bursts. Separate inspection found multiple `mpv` thumbnail workers with parent PID 1 that had survived Harbor for hours or days.

This change addresses those two proven causes. Decorative CSS and WebGL effects are not part of this branch because their idle cost was much smaller and another worktree already contains related UI work.

## Architecture

### Reusable frontend request scheduler

Add a framework-independent TypeScript request scheduler under `src/lib/`. It will:

- cap the number of concurrently running jobs;
- coalesce jobs that share a stable key;
- remove settled jobs from the in-flight map;
- expose no React-specific API, allowing future providers to reuse it;
- avoid retaining response bodies or completed promises.

TMDB metadata requests will use one module-level scheduler. A small limit keeps React card hydration responsive without allowing every visible card to start native work simultaneously. Identical TMDB URLs will share one promise.

### Shared native HTTP path

TMDB will use Harbor's existing `safeFetch` path instead of importing the Tauri HTTP plugin directly. On desktop, `safeFetch` invokes `harbor_fetch`, which owns a process-wide `reqwest::Client`; in a browser build it continues to use browser `fetch`.

The existing Rust semaphore in `http_fetch.rs` will apply on Windows, macOS, and Linux rather than Linux only. This is the final native safety boundary: other providers remain protected even if they do not yet adopt the TypeScript scheduler. The shared client retains connection pooling and initializes its DNS resolver once.

TMDB retry handling will coordinate rate-limit cooldowns across requests. A `429` response delays the queue globally before more TMDB attempts run, and retry count remains bounded. Network and parsing failures keep their current null-result behavior.

### Thumbnail worker ownership

The thumbnail `mpv` process will be configured with Tokio's cross-platform `kill_on_drop(true)` behavior. Explicit `thumbs_stop` and URL replacement will continue to request a graceful quit, then force-kill and wait for the child. Waiting after kill prevents zombie handles and makes cleanup deterministic.

The lifecycle rule is simple: `ThumbsState` owns at most one `Shadow`; dropping or replacing that `Shadow` must terminate its child. No platform-specific process scanning or broad `pkill` behavior will be introduced.

## Data flow

1. A visible card requests TMDB metadata with a stable URL key.
2. The TypeScript scheduler returns an existing promise for a duplicate or queues a new job behind the concurrency cap.
3. Desktop requests pass through `harbor_fetch`; web requests use native browser fetch.
4. Rust admits at most the global native limit and sends through the shared `reqwest::Client`.
5. A TMDB rate limit creates one shared cooldown rather than hundreds of independent immediate retries.
6. Settled work releases both scheduler and Rust permits and is removed from in-flight storage.

Thumbnail previews follow a separate ownership flow: `ThumbsState` creates one `Shadow`, commands it over IPC, and terminates/reaps it on stop, replacement, or owner drop.

## Error handling

- Scheduler failures reject only their caller and always release capacity in `finally` cleanup.
- Duplicate callers observe the same success or failure without producing duplicate native work.
- TMDB keeps returning `null` after its bounded attempts, matching current callers.
- Failure to send a graceful `mpv` quit falls through to forced termination.
- Cleanup ignores already-exited child errors but still removes socket and cache paths.

## Testing and verification

TypeScript unit tests will prove that the scheduler never exceeds its configured concurrency, coalesces duplicate keys, releases capacity after rejection, and does not retain settled entries. TMDB tests will exercise shared cooldown and bounded retry behavior at the provider seam without real network access.

Rust tests will cover the platform-independent fetch-limit decision and any pure lifecycle helper introduced during implementation. The implementation will also be verified by:

- running the focused tests through a red-green TDD cycle;
- running `vp check` on changed files;
- running `vp run typecheck` after TypeScript changes;
- running `cargo check --manifest-path src-tauri/Cargo.toml` after Rust changes;
- launching Harbor on macOS and comparing process CPU, memory, active TMDB sockets, and surviving thumbnail workers before and after a cold home load and app shutdown.

## Non-goals

- Removing metadata badges, poster providers, or thumbnail previews.
- Replacing all provider networking in one branch.
- Redesigning React contexts or the home feed.
- Killing unrelated user-launched `mpv` processes.
- Bundling the liquid-glass and animation work from the other branch.
