# Profiling Cadence

## Every runtime/physics/input/render PR

- Build size, draw calls, triangles, geometries, materials, textures, bodies, colliders, joints,
  contacts, frame-time and physics-time sample.
- Changed golden replays and state hashes.
- Targeted performance trace if a provisional budget moves materially.
- Phone, tablet, and desktop fixed-seed screenshots for visible changes, including overlays for
  contact-critical changes.

## Scheduled

- Nightly: full golden/failure/perturbation suite, adversarial fixtures, cross-browser smoke,
  repeated load/unload, bundle trend.
- Weekly during production: Chrome allocation/heap/long-task trace; physical iOS Safari Web
  Inspector timeline; Android Chrome input/frame trace; WebGL capture when state changes are
  unclear.
- Phase gate: cold/warm start, worst-case scene, replay rendering, 20–30-minute thermal soak,
  background/foreground, orientation, offline, storage pressure, context loss, and 50 unload cycles.

## Evidence identity

Reports live under `docs/performance/<build-or-commit>/` and record code commit, game version,
Rapier version, physics/config/content hashes, browser/device, viewport, quality tier, run length,
tool, and whether evidence is desktop, emulation, or physical device.

No desktop result may be relabeled as mobile thermal, battery, touch-latency, or memory evidence.
