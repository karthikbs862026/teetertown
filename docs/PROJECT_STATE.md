# Project State

**Updated:** 2026-07-27 UTC

**Phase:** Phase 0 complete; Phase 1 graybox risk-laboratory blocker iteration

**Gate:** Gate 1 re-evaluated — **ITERATE**

**Branch:** `feat/teetertown-preproduction-foundation`

## Objective and acceptance

This cycle addressed the production JavaScript budget and unavailable local-browser blockers without
changing Rapier `0.19.3`, physics configuration, content, control promise, or frozen outcomes.

Acceptance required:

- every production JavaScript chunk at or below 650 KiB gzip and total output below 6 MiB gzip;
- frozen bootstrap, golden, raw-failure, perturbation, and replay evidence unchanged;
- an actual browser executing WebGL, golden parity, input cancellation, lifecycle, context loss,
  camera, phone-emulation, and screenshot checks;
- lab-only fault/parity tooling absent from production;
- Firefox/WebKit, physical-device, and player gaps kept explicit until actually run.

## Last verified

- Strict TypeScript, Vite, direct Three.js, exact `@dimforge/rapier3d-compat@0.19.3` for Node, and
  exact `@dimforge/rapier3d@0.19.3` for the browser build install from the lockfile.
- ADR-0018 emits browser Rapier as a same-origin WASM asset. Replay schema 2 records
  `compat-embedded-node` or `modular-wasm-browser`.
- Tutorial content remains hash `5aac8b9a`; adversarial lab `1e4655f2`; materials `05d66915`.
- Rapier bootstrap remains `74e1d58f` in Node and actual Chromium.
- The command-from-step-one constrained golden remains success at step 278/hash `c965c01f` in Node
  and actual Chromium.
- Raw capture remains `object_out_of_bounds` at step 264/hash `e18433eb`.
- Ten traces across ±5% magnitude and a one-step activation delay remain 10/10 successful.
- Identical headless runs match periodic/final replay hashes; a perturbed command is detected.
- Fifty headless simulation cycles retain exact `11/11/2` body/collider/joint topology.
- Production JavaScript is 171.1 KiB gzip; separate WASM is 572.6 KiB gzip; total budget output is
  1.34 MiB gzip. The gzip gates pass.
- Production lab-leak audit excludes adversarial content, controls, diagnostics markers, and the
  browser parity API.
- Built-preview actual Chromium and Pixel 7 emulation: 21 passed, 3 viewport-intentional skips.
- Chromium cases include sustained-drag capture, exact browser/headless parity, paused restart,
  pointer cancel/lost capture, WebGL loss/restore with a frozen fixed-step counter, 20 scene
  transitions with one canvas/stable registries, and all three camera variants.
- Five screenshots were visually inspected. Current tutorial/goal/causal geometry is visible on
  desktop and narrow Pixel emulation; perspective, bounded-event, and adversarial compositions are
  reviewable.

## Closed blockers

1. **Production JavaScript budget:** closed for the current build under ADR-0018.
2. **No executable local browser:** closed for Chromium through a task-scoped npm-packaged
   executable. This does not imply Firefox/WebKit or device evidence.
3. **Narrow orthographic goal clipping:** corrected with a minimum horizontal frustum and unit,
   browser-layout, and screenshot evidence.
4. **Camera screenshot readiness ambiguity:** corrected with an explicit rendered camera-model
   marker and fresh-frame wait.
5. **Restart while paused silently retaining the paused clock:** corrected and covered in Chromium.

## Remaining Gate-1 blockers

1. GitHub Actions has not yet reported the configured Firefox, WebKit, and mobile-WebKit runs.
2. No physical Android Chrome or iPhone/iOS Safari determinism, touch latency, thermal, battery,
   memory, orientation, background/resume, or context evidence exists.
3. No representative-player comprehension, correct-strategy repeatability, failure-attribution, or
   comfort evidence exists.
4. Separate-WASM offline/service-worker update atomicity is unverified.
5. Browser frame-time/heap/soak and real first-meaningful-interaction measurements are absent.
6. Dedicated assertions for contact ordering, sleep/wake, CCD, and joint reversal remain incomplete.

## Decisions and confidence

- **Decided with current evidence:** exact Rapier version remains `0.19.3`; browser packaging uses
  separate WASM; runtime variant is replay identity; lab tooling remains compile-time excluded.
- **Provisional:** fixed orthographic remains the gameplay-camera default; gravity-vector tilt and
  visible constrained capture remain leading candidates.
- **Blocked:** final control/camera/capture selection, Gate-1 GO, physical-device tiers, and player
  trust claims.
- **Rejected:** threshold waiver, hidden rescue, physics downgrade for FPS, final art, mass content,
  monetization, backend, production deployment, and cross-version ranked comparison.

## Recommendation

**ITERATE.** The payload and local-browser blockers are resolved, but Gate 1 cannot become **GO**
without cross-browser CI plus physical-device and representative-player evidence.

## Next action

Publish the reviewed blocker iteration to the feature branch, open a draft pull request, inspect the
GitHub Actions matrix, and record its actual results. Then prepare owner-run physical Android/iOS
and representative-player protocols; do not expand campaign content or meta systems yet.
