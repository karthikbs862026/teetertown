# CI/CD and Rollback Plan

## Flow

1. Feature branch: local fast checks and optional lab artifact.
2. Pull request: install integrity, static checks, unit/simulation/replay, budgets, content/assets,
   Chromium/Firefox/WebKit plus Chromium/WebKit phone-emulation browser checks, verified offline
   release faults, and a non-retrying Chromium performance/resource profile.
3. Merge to `main`: immutable staging-shaped artifact tagged with code/content/physics/replay
   versions.
4. Staging: smoke, replay, save migration, offline, lifecycle, diagnostic export, and rollback
   verification.
5. Release candidate: manual owner approval after physical Android/iOS phase-gate evidence.
6. Production: controlled deployment retaining the previous known-good compatible artifact.

No production deployment is authorized in Phase 0/1.

## Compatibility and rollback

A release identity binds the compiled client, SHA-256 asset set, service worker, content manifest,
Rapier WASM, physics version, replay schema, save schema, and remote configuration. A candidate
worker verifies the entire set before waiting; any HTTP/digest failure deletes the candidate cache.
Activation occurs at a session boundary. The app checks compiled-versus-manifest identity before
world construction. Rollback restores the compatible set together; it does not point old code at a
new content pack or service worker.

## Current skeleton limits

GitHub Actions runs static/simulation/build/budget checks plus three engine-isolated Playwright
jobs: Chromium with Pixel 7 emulation, headed Firefox under Xvfb/software WebGL, and WebKit with
iPhone 13 emulation. The workflow now also defines an `automated-closure` Chromium job for the PWA
fault matrix and 30-second profile, plus a scheduled five-minute workload warm-up followed by a
20-minute transition-stress profile with heap node diagnostics and retained reports. The current
automated-closure draft-PR run
[`30260447230`](https://github.com/karthikbs862026/teetertown/actions/runs/30260447230) passed:
Firefox 12/1 intentional skip, Chromium 23/3, WebKit 23/3, static 15/31, atomic PWA 1/1, and the
non-retrying 30-second profile.

Local built-preview evidence uses actual npm-packaged Chromium plus Pixel 7 viewport/device
emulation. The engine split keeps failures attributable and avoids one browser hiding another's
result. The current-head workflow is green at CI scope. Physical devices, staging hosting, full
rollback deployment, and production remain unverified. No paid CI or deployment service was added.
