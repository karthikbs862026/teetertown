# CI/CD and Rollback Plan

## Flow

1. Feature branch: local fast checks and optional lab artifact.
2. Pull request: install integrity, static checks, unit/simulation/replay, budgets, content/assets,
   Chromium smoke, targeted cross-browser/visual checks.
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

GitHub Actions runs static/simulation/build checks and a Chromium job. Scheduled cross-browser,
fuzz, soak, physical-device, staging hosting, artifact retention, and rollback execution remain
unverified. No paid CI or deployment service was added.
