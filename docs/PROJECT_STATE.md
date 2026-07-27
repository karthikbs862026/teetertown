# Project State

**Updated:** 2026-07-26 UTC

**Phase:** Phase 0 complete; smallest Phase 1 graybox risk laboratory established

**Gate:** Gate 1 attempted — **ITERATE**

**Branch:** `feat/teetertown-preproduction-foundation`

## Last verified

- Canonical v2.1 governing files are byte-preserved in the repository.
- Strict TypeScript, Vite, direct Three.js, and exact
  `@dimforge/rapier3d-compat@0.19.3` build from the lockfile.
- Tutorial content validates at hash `5aac8b9a`; adversarial lab at `1e4655f2`; material catalog at
  `05d66915`.
- Rapier bootstrap self-test matches frozen hash `74e1d58f`.
- The constrained tutorial golden reaches success at step 278 with final state hash `c965c01f`.
- The same command under raw capture exits bounds at step 264 with final hash `e18433eb`.
- Gravity-vector tilt succeeds; the current kinematic-support comparison exits bounds at step 229
  with hash `35a12c8c`. This is comparison evidence, not a selected production winner.
- Ten tutorial traces across ±5% command magnitude and a one-step activation delay succeeded 10/10.
- Two identical golden runs match every 30-step and final replay hash; a one-command perturbation
  produces a detected divergence.
- The adversarial fragile-threshold fixture classifies failure at step 46.
- Fifty headless simulation create/play/dispose cycles retain exact `11/11/2`
  body/collider/joint topology.
- Headless Node profile over 4,000 fixed steps measured 0.2494 ms p95 and 9.4454 ms maximum. This
  is not browser or device performance evidence.
- Production build excludes adversarial data and internal controls.

## Gate blockers

1. The production JavaScript chunk is approximately 949 KiB gzip, above the provisional 650 KiB
   review threshold. The exact-pinned compatibility Rapier module is approximately 810 KiB gzip by
   itself. Changing package/loader strategy requires an ADR and replay migration evidence.
2. Playwright 1.62.0 is installed, but no browser binary exists in this workspace. Chromium download
   returned a zero-byte/truncated archive, so browser, WebGL, screenshot, visual, render-lifecycle,
   and emulated-phone claims remain not run.
3. No physical Android or iOS/Safari determinism, latency, thermal, memory, lifecycle, or input
   evidence exists.
4. No representative player comprehension, correct-strategy execution, or failure-attribution
   evidence exists.
5. Camera variants and two-axis/track variants are executable in the lab but have not yet received
   browser, device, or player comparison evidence.

## Observed incidents and decisions

- A first control-law implementation oscillated under a constant command and reversed gravity
  intent. It was replaced with a jerk/acceleration/speed-bounded convergent response and has a
  regression test.
- Raw capture visibly fails the scripted corridor while constrained and felt-assisted capture
  succeed. The visible constrained basket remains the leading hypothesis; hidden rescue forces
  remain prohibited.
- Kinematic support currently performs worse than gravity-vector tilt on the golden command.
  Gravity-vector remains the leading hypothesis, pending visual/device evidence.
- The production lab-separation audit initially found emitted lab chunks. Compile-time guards now
  eliminate the lab controls and adversarial content from production output.

## Recommendation

**ITERATE.** The foundation proves deterministic headless control and classification behavior, but
Gate 1 cannot pass without browser/device/player evidence and a resolved bundle review.

## Next action

Run a measured ADR spike comparing the accepted compatibility Rapier loader against a
separate-WASM loading strategy without changing physics version, then run CI Chromium/WebKit/Firefox
smoke, screenshots, WebGL lifecycle tests, and representative phone checks on the selected build.
