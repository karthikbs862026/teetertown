# ADR-0013: PWA First and Lifecycle Boundary

**Status:** Accepted; atomic-release amendment, 2026-07-27

WebGL/PWA is the initial platform. Visibility, orientation, context, safe-area, audio, offline, and
service-worker update events enter platform adapters and explicit app transitions. An update is
activated between sessions, never during physics.

Every production build now generates a schema-2 release manifest after Vite finishes. The manifest
binds one release ID to SHA-256 hashes for the JavaScript, Rapier WASM, HTML, styles, and other
shell assets. A candidate worker fetches and verifies the complete set into a release-namespaced
cache; any HTTP or digest failure deletes that candidate cache and fails installation.

A verified worker remains waiting while the current session runs. At the next app boot, the client
queries the waiting worker's release/asset-set identity, requests activation with that exact
identity, waits for `controllerchange`, and reloads. The app validates that its compiled release ID
matches the active cached manifest before Rapier initialization or world construction. There is no
partial cache fallback. Explicit recovery unregisters workers and purges only Teetertown release
caches before reloading from the network.

Automated Chromium evidence covers first install, offline Rapier boot, failed and corrupted-WASM
candidate updates, next-session activation, old-cache purge, second-release offline boot, mixed
manifest fail-closed behavior, and recovery. Physical iOS/Android storage pressure, eviction, and
update lifecycle remain gate evidence.

A native wrapper is deferred until the web vertical slice has physical iOS/Android stability
evidence; wrapper APIs remain behind adapters.
