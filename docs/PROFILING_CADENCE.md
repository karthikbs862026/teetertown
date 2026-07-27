# Profiling Cadence

## Every runtime/physics/input/render PR

- Build size, draw calls, triangles, geometries, materials, textures, bodies, colliders, joints,
  contacts, frame-time and physics-time sample.
- `npm run test:performance:browser` runs a non-retrying Chromium profile after a stable forced-GC
  baseline, at least 50 post-baseline scene pairs, four heap/resource checkpoints, and exact
  registry comparison. The default PR duration is 30 seconds.
- `npm run test:e2e:pwa` verifies offline Rapier boot and atomic release update/recovery faults.
- Changed golden replays and state hashes.
- Targeted performance trace if a provisional budget moves materially.
- Phone, tablet, and desktop fixed-seed screenshots for visible changes, including overlays for
  contact-critical changes.

## Scheduled

- Nightly: full golden/failure/perturbation suite, adversarial fixtures, cross-browser smoke,
  repeated load/unload, bundle trend.
- Weekly GitHub schedule: the browser performance test warms the transition workload for 300
  seconds, then runs a 1,200-second measured window with before/after heap node summaries and
  retains its Playwright report for 30 days.
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
The GitHub artifact for the PR profile is retained for 14 days; the scheduled long profile is
retained for 30 days. A retry is not allowed to turn a failed PWA or performance measurement green.
