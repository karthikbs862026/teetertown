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
- PR: full replay suite, Chromium smoke, targeted WebKit/Firefox, budgets, visual baselines, preview
  artifact.
- Main/staging: browser matrix, offline/save migration, immutable version identity, rollback smoke.
- Scheduled: fuzz, 50-cycle lifecycle, soak, cross-browser trend.
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

| Environment              | Automated                | Physical       | Purpose                                 |
| ------------------------ | ------------------------ | -------------- | --------------------------------------- |
| Desktop Chromium         | Required                 | N/A            | Primary smoke, trace, visual            |
| Desktop Firefox          | Required where available | N/A            | Compatibility/divergence                |
| Desktop WebKit           | Required where available | N/A            | WebKit regression signal                |
| Mobile Chromium viewport | Required                 | Not equivalent | Responsive/touch event smoke            |
| Mobile WebKit viewport   | Required                 | Not equivalent | Responsive/WebKit smoke                 |
| Mid-range Android Chrome | No                       | Gate required  | Thumb latency, thermal, memory, replay  |
| iPhone/iOS Safari        | No                       | Gate required  | WebKit lifecycle, audio, memory, replay |

## Blocker-iteration status — 2026-07-27

- Actual packaged Chromium: built-preview boot, sustained drag, exact golden parity, pause/restart,
  pointer cancel/lost capture, WebGL context loss/restore, 20 scene transitions, three camera
  variants, and desktop screenshots pass.
- Pixel 7 project: the same Chromium executable with Playwright device/viewport emulation passes the
  applicable checks and phone screenshot. This is not physical Android.
- Firefox, desktop WebKit, and mobile WebKit are configured for the draft-PR workflow but remain not
  run until GitHub Actions reports results.
- Physical Android Chrome, iPhone/iOS Safari, representative-player trust, real input latency,
  thermal/battery, and sustained memory remain Gate-1 blockers.
