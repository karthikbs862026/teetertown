# Teetertown

Teetertown is a mobile-first equilibrium puzzle: one-finger drag tilts an entire miniature world
while physics moves objects toward visible goals. This repository currently contains the Phase 0
pre-production foundation and Phase 1 graybox risk laboratory only.

## Current scope

- Tutorial graybox: two connected platforms, apple, basket, bottle, visible hinge.
- Separate adversarial physics laboratory.
- Fixed-step Rapier simulation, quantized input, replay/state hashes, diagnostics, and resource
  lifecycle instrumentation.
- Switchable input, tilt, capture-authority, and camera experiments.
- No production art, monetization SDK, backend, accounts, energy, public rankings, or mass content.

## Local commands

```bash
npm ci
npm run check:fast
npm run dev
npm run build:lab
npm run test:e2e
```

`npm run build` creates the public production-shaped artifact and excludes the internal lab UI.
`npm run build:lab` includes the graybox experiment controls for review.

Current Gate 1 recommendation is **ITERATE**: Node and GitHub Chromium/Firefox/WebKit deterministic
evidence and the production bundle gate pass, while physical devices, representative players,
offline WASM updates, and browser profiling remain open. Read
[docs/PROJECT_STATE.md](docs/PROJECT_STATE.md), the
[foundation report](docs/audits/PHASE_0_1_FOUNDATION_EVIDENCE_2026-07-26.md), and the
[blocker-iteration report](docs/audits/GATE_1_BLOCKER_ITERATION_EVIDENCE_2026-07-27.md) before
continuing work.
