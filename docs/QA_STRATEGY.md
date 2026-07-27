# QA Strategy

## Evidence layers

1. Static: strict typecheck, lint/format, content validation, dependency boundary/cycle, bundle,
   license/provenance, and lab-leak checks.
2. Unit: fixed clock, input normalization/quantization, state machine, hashing, fragility,
   serialization, storage migrations.
3. Simulation: bootstrap self-test, golden/failure/recovery replays, hashes, perturbations,
   sleep/wake, CCD, joint limit, bounds, soft lock, frame-rate independence, corrupt content.
4. Fuzz/property: bounded command streams must not create NaN/infinity, runaway velocity, duplicate
   terminal events, impossible objective state, or non-termination.
5. Browser E2E: boot, drag, pause/restart/success/failure, background/resume, resize/orientation,
   offline/update, storage, audio unlock, and context loss where testable.
6. Visual: fixed content/seed/camera at phone/tablet/desktop plus collider/joint overlays.
7. Performance/lifecycle: normal/stress cases, resource counters, load/unload/soak, physical thermal
   observation.
8. Human/device: comprehension, correct-strategy execution, failure attribution, comfort, and thumb
   metrics on representative Android and iOS hardware.

## Fast path and gates

- Local: typecheck, lint/format, schema/boundary/cycle checks, unit/simulation suite.
- PR: full replay suite, Chromium smoke, targeted WebKit/Firefox, budgets, visual baselines,
  verified PWA faults, a 30-second browser profile, and retained evidence artifact.
- Main/staging: browser matrix, offline/save migration, immutable version identity, rollback smoke.
- Scheduled: fuzz, 50-cycle lifecycle, 20-minute desktop transition soak with heap diagnostics,
  cross-browser trend.
- Phase gate: physical Android + iOS Safari, thermal/battery observation, lifecycle/context/storage
  fault tests, art–physics, accessibility, privacy, monetization-firewall, and trust audits.

## Gate-1 blockers

- Any unexplained replay divergence, invalid state, tunnelling, joint explosion, random breakage, or
  unclassified failure.
- Tutorial perturbation below target.
- Correct-strategy testers cannot execute within corridor.
- Quality/device state changes simulation.
- Resource counters grow monotonically.
- No actual rendered visual review.
- Missing physical-device and player evidence prevents Gate 1 **GO**, even if automation passes.

## Bug policy

Every reproducible physics/save/lifecycle/regression defect leaves a unit/simulation test, replay,
E2E case, visual baseline, or documented device case. Thresholds may change only with new evidence
and an updated decision/ADR; tests are not weakened to make CI pass.

## Initial browser/device matrix

| Environment              | Automated | Physical       | Purpose                                 |
| ------------------------ | --------- | -------------- | --------------------------------------- |
| Desktop Chromium         | Required  | N/A            | Primary smoke, trace, visual            |
| Desktop Firefox          | Required  | N/A            | Compatibility/divergence                |
| Desktop WebKit           | Required  | N/A            | WebKit regression signal                |
| Mobile Chromium viewport | Required  | Not equivalent | Responsive/touch event smoke            |
| Mobile WebKit viewport   | Required  | Not equivalent | Responsive/WebKit smoke                 |
| Mid-range Android Chrome | No        | Gate required  | Thumb latency, thermal, memory, replay  |
| iPhone/iOS Safari        | No        | Gate required  | WebKit lifecycle, audio, memory, replay |

## Blocker-iteration status — 2026-07-27

- Actual packaged Chromium: built-preview boot, sustained drag, exact golden parity, pause/restart,
  pointer cancel/lost capture, WebGL context loss/restore, 20 scene transitions, three camera
  variants, and desktop screenshots pass.
- Pixel 7 project: the same Chromium executable with Playwright device/viewport emulation passes the
  applicable checks and phone screenshot. This is not physical Android.
- GitHub Actions run `30249144668` passes official Playwright Chromium/Pixel, headed
  Firefox/Xvfb/software-WebGL, and WebKit/iPhone projects: 53 passed, 7 intentional viewport skips.
  This is desktop-engine and emulation evidence, not physical-device evidence.
- Physical Android Chrome, iPhone/iOS Safari, representative-player trust, real input latency,
  thermal/battery, and sustained device memory remain Gate-1 blockers.

## Automated engineering closure status — 2026-07-27

- Node and local modular Chromium freeze canonical pileup contacts (`0fe7d31e`), changed-command
  sleep/wake (`b3c1c78a`), CCD control/treatment (`dd85d291`), and 480-step joint reversal
  (`b033984b`). Current-head Firefox, Chromium/Pixel, and WebKit/iPhone-emulation projects repeat
  the complete probe set.
- Chromium PWA fault evidence passes: v1/v2 offline Rapier boot, HTTP and SHA-mismatched WASM
  candidate rejection, next-session activation, old-cache purge, mixed-manifest fail-closed, and
  recovery.
- The short Chromium profile passes exact registries and post-stabilization heap/resource limits.
  Its software-rendered frame data is an automation-health signal, not mobile tier evidence.
- PWA/performance suites do not retry in CI. Run `30260447230` passes both; its short profile
  records −0.29% final/+0.75% maximum heap drift with exact resources. The general browser config
  excludes the dedicated PWA test so it cannot accidentally run against the wrong server.
