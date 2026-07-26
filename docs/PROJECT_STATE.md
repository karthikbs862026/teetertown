# Project State

**Updated:** 2026-07-26 UTC  
**Phase:** Phase 0 foundation active; smallest Phase 1 risk lab not yet implemented  
**Gate:** Gate 1 not attempted  
**Branch:** `feat/teetertown-preproduction-foundation`

## Last verified

- Repository initialized from seed commit `2ac37a2`.
- Canonical v2.1 governing files imported; master is 117,661 bytes and compact persistent
  instruction is 6,503 bytes.
- Exact dependency pins resolved and lockfile installed.
- Phase 0 decision/risk/physics/architecture/product plans drafted.
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm run format:check`: pass.
- No gameplay build, simulation, replay, browser, visual, performance, memory, input-latency,
  lifecycle, or physical-device result has yet been claimed.

## Decisions

- Direct Three.js + DOM UI, modular monolith, fixed 1/60-step Rapier, quantized commands, one
  renderer, versioned replay/state hashes.
- One-axis bounded control, gravity-vector tilt, fixed orthographic camera, and constrained basket
  are hypotheses, not selected winners.
- Full two-axis campaign tilt, hidden assistance, final art, monetization SDKs, backend, energy,
  accounts, rankings, and mass content are outside this cycle.

## Known failures / incidents

- No runtime incident exists because the runtime is not implemented.
- Initial lint configuration defects were corrected before commit; they did not affect gameplay.
- Canonical master title says v2.1 while footer says “Prompt version: 2.0”; source remains
  byte-preserved and v2.1 governs.

## Open evidence

- Rapier bootstrap self-test and exact known hash.
- Tutorial golden/failure/perturbation replays.
- Gravity/kinematic, raw/bounded, one/two-axis, capture-authority, and camera comparisons.
- Automated Chromium/WebKit/Firefox smoke and replay evidence; browser binaries are not yet present.
- Phone-size screenshots and collider/joint overlays.
- Frame/physics/bundle/resource counters and 50-cycle unload.
- Physical Android/iOS Safari replay, input latency, thermal, memory, lifecycle, and player
  comprehension/failure-attribution evidence.

## Recommendation

**ITERATE.** The documentation/tooling foundation is coherent and statically checked, but no core
physics evidence exists. Gate 1 remains unattempted.

## Next action

Implement and test the headless fixed-step Rapier core, command/replay/hash contract, tutorial
graybox world, and adversarial fixtures before expanding presentation.
