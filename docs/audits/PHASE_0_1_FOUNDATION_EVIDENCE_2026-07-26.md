# Phase 0 / Phase 1 Foundation Evidence — 2026-07-26

## 1. Status, phase, gate, and scope

- Phase 0 required control documents, ADRs, risk/decision registers, repository scaffold, CI
  skeleton, budgets, research plans, and operating plans are present.
- The smallest Phase 1 proof is implemented: one tutorial graybox and one separately bundled
  adversarial laboratory.
- Gate 1 was attempted and the recommendation is **ITERATE**.
- Final art, real ads/IAP, accounts, energy, backend, rankings, mass content, deployment, and
  production publication remain outside scope.

## 2. Implementation summary

- One 1/60-second simulation owner with five-step catch-up cap.
- Exact-pinned Rapier WASM bootstrap with known tiny-world hash.
- Stable-ID data schemas, content/material hashes, primitive colliders, visible hinges, bounds,
  goal hold/speed rule, accumulated fragility window, and classified terminal failures.
- Quantized one/two-axis raw/track input models; jerk/acceleration/speed-bounded tilt response.
- Gravity-vector and kinematic-support implementations.
- Raw, visible constrained, and deterministic felt-assisted capture variants.
- Fixed orthographic, fixed low-FOV perspective, and bounded-event camera variants.
- Immutable snapshots, render interpolation, command recording, replay metadata, periodic state
  hashes, comparison, and checkpoint ring.
- One Three.js renderer/canvas with per-level resource scope.
- Collider/authority, center-of-mass, contact-normal/impulse, joint, goal, resource, and input-age
  diagnostics. Internal lab can export a local diagnostic JSON.
- Versioned IndexedDB boundary, tested memory adapter, no-op Phase 1 platform services, PWA manifest,
  service-worker lifecycle shell, and an empty provenance/asset manifest.

## 3. Physics fairness and authority evidence

| Case | Actual headless result | Assessment |
| --- | --- | --- |
| Constrained golden, constant `-0.55` one-axis command | Success, step 278, hash `c965c01f` | Initial good-difficulty evidence: correct intent converts to a stable visible capture. |
| ±5% magnitude × zero/one-step activation delay | 10/10 successes | Passes the initial ≥90% scripted robustness corridor; player execution is still unverified. |
| Raw capture, same command | `object_out_of_bounds`, step 264, hash `e18433eb` | Demonstrates the risky overshoot the visible basket constraints are intended to prevent. |
| Felt assist, same command | Success, step 278, hash `9f36d455` | Executable comparison only; no evidence yet justifies selecting assist over visible geometry. |
| Kinematic support, same command | `object_out_of_bounds`, step 229, hash `35a12c8c` | Current implementation is inferior on this trace; not enough visual/device evidence for final rejection. |
| Adversarial fragile fixture | `fragile_threshold_exceeded`, step 46 | Classified threshold path executes without an invalid-state claim. |

Simulation owns commands, objectives, timers, capture rules, failure classification, and replay.
Rapier owns body/contact/joint state. Input owns raw pointer samples until quantization. Rendering
only consumes snapshots and never writes dynamic body transforms back to physics.

The observed constant-command control oscillation was unfair difficulty because correct continuous
intent was reversed by the controller. It was corrected before the golden was frozen and now has a
convergence regression.

## 4. Commands and actual results

| Command | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass, zero warnings |
| `npm run format:check` | Pass after repository formatting |
| `npm run validate:content` | Pass: 11/11 entities in tutorial/lab; locked hashes |
| `npm run check:boundaries` | Pass: simulation imports no Three/DOM/UI/platform/analytics |
| `npm run check:circular` | Pass: acyclic TypeScript graph |
| `npm test` | Pass; unit/simulation/replay/lifecycle suite |
| `npm run build` | Pass |
| `npm run build:lab` | Pass |
| `npm run check:lab-leak` | Pass after compile-time lab separation fix |
| `npm run profile:headless` | Pass; 4,000 steps, p95 0.2494 ms in Node |
| `npm run check:budgets` | **Fail:** production JS approximately 949 KiB gzip >650 KiB |
| `npx playwright install chromium` | **Not available:** default cache path could not be created |
| workspace-scoped Playwright Chromium install | **Fail:** CDN response produced a zero-byte/truncated archive |

## 5. Browser, device, visual, performance, and memory evidence

- Browser/WebGL: not run; browser executable unavailable.
- Automated desktop/mobile Playwright cases: authored and typechecked, not run.
- Screenshots and visual inspection: none claimed.
- Real Android and real iOS/Safari: unavailable and not run.
- Input-age p95: instrumented in the browser lab, not measured on a device.
- Headless physics: 4,000 steps, p50 0.0918 ms, p95 0.2494 ms, p99 0.4632 ms, maximum
  9.4454 ms on Node v24.14.0. These numbers do not establish a frame-rate tier.
- Simulation lifecycle: exact topology across 50 cycles. GPU materials/geometries/listeners and
  WebGL context recovery still require browser evidence.
- Bundle: total output remains below 6 MiB gzip, but the JavaScript chunk exceeds its 650 KiB gzip
  review threshold.

## 6. Product, content, team, and policy impact

- One handcrafted tutorial and one non-campaign laboratory were added; no cadence or content-cost
  claim can be inferred from two fixtures.
- Runtime uses primitives and no sourced art/audio/font assets, so provenance is currently empty by
  design.
- The implementation remains a modular monolith appropriate to a two-to-three-person team.
- No monetization or ranking provider exists. Commerce is explicitly unavailable in the Phase 1
  adapter, so failure state cannot change purchase state.
- Analytics remain local/no-op; diagnostic export is user-triggered and local. No new personal data,
  retention promise, virality mechanic, or privacy surface was added.

## 7. Risks reduced and still open

Reduced:

- fixed-step ownership, replay identity, same-build repeatability, content hashing, classified raw
  overshoot, lab separation, and simulation topology teardown now have executable evidence;
- the constant-input oscillation has a lasting regression;
- visible constrained capture has stronger headless evidence than raw capture.

Open:

- browser/device replay divergence, WebGL/context lifecycle, camera/input visual comprehension,
  physical latency/thermal/memory, player attribution, actual FPS tiers, render-resource teardown,
  and bundle threshold;
- contact-ordering, sleep/wake, CCD, and joint fixtures exist but need dedicated lasting assertions
  beyond the currently asserted fragility case;
- the accepted compatibility Rapier package cannot meet the current single-JS-chunk threshold by
  minification alone.

## 8. Gate recommendation and next action

**ITERATE.** Do not add campaign content, meta systems, art production, or monetization.

Next: run an ADR-backed loader/package spike to resolve the Rapier bundle review while preserving
physics/replay identity, then execute the prepared browser suite and visually inspect desktop and
phone screenshots before scheduling representative physical-device and player sessions.
