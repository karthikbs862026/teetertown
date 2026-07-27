# CI/CD and Rollback Plan

## Flow

1. Feature branch: local fast checks and optional lab artifact.
2. Pull request: install integrity, static checks, unit/simulation/replay, budgets, content/assets,
   and Chromium/Firefox/WebKit plus Chromium/WebKit phone-emulation browser checks.
3. Merge to `main`: immutable staging-shaped artifact tagged with code/content/physics/replay
   versions.
4. Staging: smoke, replay, save migration, offline, lifecycle, diagnostic export, and rollback
   verification.
5. Release candidate: manual owner approval after physical Android/iOS phase-gate evidence.
6. Production: controlled deployment retaining the previous known-good compatible artifact.

No production deployment is authorized in Phase 0/1.

## Compatibility and rollback

A release identity binds code commit, service-worker version, content manifest, physics version,
replay schema, save schema, and remote configuration. An active session may not mix versions.
Rollback restores the compatible set together; it does not point old code at a new content pack or
service worker.

## Current skeleton limits

GitHub Actions runs static/simulation/build/budget checks plus three engine-isolated Playwright
jobs: Chromium with Pixel 7 emulation, headed Firefox under Xvfb/software WebGL, and WebKit with
iPhone 13 emulation. The first fully green engine-isolated draft-PR run
[`30249144668`](https://github.com/karthikbs862026/teetertown/actions/runs/30249144668) passed:
Firefox 11/1 intentional skip, Chromium 21/3, WebKit 21/3, and static/production.

Local built-preview evidence uses actual npm-packaged Chromium plus Pixel 7 viewport/device
emulation. The engine split keeps failures attributable and avoids one browser hiding another's
result. Scheduled fuzz/soak, physical devices, staging hosting, artifact retention, offline
WASM/service-worker faults, and rollback execution remain unverified. No paid CI or deployment
service was added.
