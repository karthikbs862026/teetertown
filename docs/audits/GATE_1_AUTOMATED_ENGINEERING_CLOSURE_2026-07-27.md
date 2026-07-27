# Gate 1 Automated Engineering Closure — 2026-07-27

## 1. Scope and recommendation

- Phase: Phase 1 graybox physics-trust laboratory.
- Recommendation while this report is prepared: **ITERATE**.
- Objective: close the specifically recommended automated contact, sleeping, CCD, joint, offline
  release, frame/physics, memory/resource, first-interaction, and soak gaps.
- Preserved: Rapier `0.19.3`, tutorial/adversarial/material content, control promise, authority
  boundary, bootstrap `74e1d58f`, constrained golden step 278/hash `c965c01f`, raw failure step
  264/hash `e18433eb`, and the draft/unmerged status of PR #1.
- Excluded: physical-device claims, representative-player claims, production deployment, final art,
  campaign/meta expansion, monetization, backend, and merge approval.

Automation can close desktop/browser-engine risks. It cannot close touch latency, mobile GPU,
thermal, battery, OS storage pressure, physical background/orientation behavior, or player trust.

## 2. Physics-risk closure

ADR-0019 advances replay-visible physics policy to `phase1-physics-2`, configuration hash
`53cfb827`:

- contact-force events normalize entity pairs, reverse direction when the pair swaps, and sort by
  pair/impulse/direction before fragility rules or diagnostics;
- a changed quantized command wakes sleeping dynamic bodies in stable entity order before the
  controller/world step;
- unchanged commands preserve sleeping; sleep is not globally disabled.

The exact `phase1-risk-probes-2` result is:

| Probe            | Observable                                                                                              | Frozen summary |
| ---------------- | ------------------------------------------------------------------------------------------------------- | -------------- |
| Contact ordering | 132 contacts over 43 steps; `pile-a/pile-b` and `pile-b/pile-c` observed; repeated canonical trace      | `0fe7d31e`     |
| Sleep/wake       | Bottle sleeping after neutral step 121; awake after changed command at 122; step-150 state `36f4ba00`   | `b3c1c78a`     |
| CCD              | Discrete control crosses to x=0.4; CCD remains before wall at x=−0.059961 then x=−0.039948, velocity ≈0 | `dd85d291`     |
| Joint reversal   | 480 steps; angle [−0.249077, 0.291891], max angular speed 1.381745, all pose/velocity values finite     | `b033984b`     |

Node runs repeat these results. The lab-only browser API reproduces the complete result in actual
local modular-WASM Chromium. The test is compile-time excluded from production and its probe marker
is part of the production lab-leak audit. Official CI engine evidence is required on the published
head before cross-browser scope closes.

The sleeping test exposed and corrected a real defect: the tutorial bottle slept at step 121 and
remained asleep after a changed tilt command. No outcome threshold was altered.

## 3. Offline Rapier and atomic update closure

ADR-0013 now requires a generated schema-2 release:

1. Vite emits the complete production asset set.
2. The build hashes JavaScript, Rapier WASM, HTML, styles, manifest, and shell assets with SHA-256.
3. A release-specific worker fetches and verifies every response.
4. Any HTTP or digest failure deletes the candidate cache and fails installation.
5. A verified worker waits while the current session remains on its active release.
6. At the next boot, the app queries/activates that exact waiting identity, waits for
   `controllerchange`, and reloads.
7. Compiled release ID must equal the active manifest before Rapier initialization/world creation.
8. Recovery unregisters workers and deletes only `teetertown-release-*` caches.

One actual-Chromium test passes this sequence:

- v1 boots and becomes controlled;
- v1 reloads offline and repeats bootstrap `74e1d58f`;
- v2 with a WASM HTTP 503 becomes redundant; v1 remains active and rendered;
- v2 with a 200 response containing wrong WASM bytes fails SHA-256 and becomes redundant;
- healthy v2 installs but does not replace the mid-session controller/manifest;
- next boot activates v2, deletes v1 cache, and renders;
- v2 reloads offline and repeats bootstrap `74e1d58f`;
- a deliberately mixed cached manifest fails before canvas/world creation;
- explicit online recovery restores v2.

No fallback physics world exists. These tests do not simulate mobile browser cache eviction or OS
storage pressure.

## 4. Browser performance and lifecycle closure

The runtime now exposes:

- fixed-capacity 2,048-sample frame and physics rings;
- p50/p95/p99/maximum summaries;
- first meaningful interaction;
- long-task count and duration;
- draw calls and triangles;
- bodies, colliders, joints, geometries, materials, textures, render targets, listeners, timers,
  workers, and audio nodes.

The Chromium profile uses CDP forced GC and DOM counters. It:

- refuses a baseline before at least 60 scene-pair warm-ups;
- for a 1,200-second soak, requires at least five minutes of the same transition workload before
  baseline acceptance;
- requires the last three warm-up heap samples to span no more than 3%;
- takes the authoritative baseline after cadence/profiler setup;
- runs at least 50 post-baseline scene pairs and four timed heap/resource checkpoints;
- fails on >5% drift at any checkpoint, changed explicit resources, DOM/listener growth, first
  interaction >5 s, physics p95 >8 ms, >30 draw calls, or >50,000 triangles;
- permits no CI retry;
- optionally compares before/after heap node counts for scheduled diagnostics.

### Short local result

Environment: actual npm-packaged Chromium 149 with SwiftShader on desktop Linux; not a physical
phone.

| Measurement                  | Result                                             |
| ---------------------------- | -------------------------------------------------- |
| Heap warm-up                 | Stable after 60 scene pairs / 18.998 s; span 1.20% |
| Measured transitions         | 154 over 30 seconds                                |
| First meaningful interaction | 553 ms                                             |
| Physics p95                  | 1.1 ms                                             |
| Draw calls / triangles       | 30 / 1,800                                         |
| Simulation resources         | `11/11/2` bodies/colliders/joints, unchanged       |
| Render resources             | `31/30/0/0`, unchanged                             |
| DOM listeners                | 43 → 43                                            |
| Heap drift                   | +1.30% final; +2.39% maximum observed              |
| 180-frame steady cadence p95 | 50.0 ms                                            |
| Transition-stress frame p95  | 366.6 ms                                           |

The software-rendered frame result passes a 100 ms automation-health ceiling. It does not pass or
fail the 20/33 ms physical-device budgets; transition rebuilds are not normal play.

### Rejected measurement shortcuts

The first stress shape issued unpaced reloads and failed at 12.96% heap drift. A paced repeat
produced 6.03%, then 3.80%, revealing an unstable baseline. A first stabilization attempt still
failed at 12.40% because it accepted a pre-JIT plateau. Disabling Playwright trace did not explain
the growth. Forced-GC heap snapshots found no retained Rapier/Three/resource family; positive
self-size was dominated by V8 instruction streams and browser performance records.

Measurement order was corrected first: exercise at least 60 scene pairs, run the 180-frame cadence
probe, then take the authoritative baseline. That made short runs repeatable, but the first
1,200-second execution still failed honestly: 6,078 transitions retained exact resources and reduced
DOM nodes, while total V8 heap ended +7.13% and peaked +8.07%. Heap-node deltas were dominated by
late instruction-stream/trusted-array compilation and bounded browser Performance Timing records,
not Rapier/Three/resource families.

The long-run correction therefore requires five minutes of the same transition workload before
baseline acceptance. It does not subtract VM categories, shorten the 20-minute measured window,
retry a failure, or widen the 5% limit.

### Long local result

Environment: actual npm-packaged Chromium 149 with SwiftShader on desktop Linux; not a physical
phone. One no-retry process exited successfully:

| Measurement                  | Result                                                         |
| ---------------------------- | -------------------------------------------------------------- |
| Workload warm-up             | 300.610 s / 980 scene-pair cycles; last-three heap span 0.057% |
| Measured window              | 1,200 s / 5,820 scene transitions                              |
| First meaningful interaction | 543 ms                                                         |
| 180-frame steady cadence p95 | 66.6 ms                                                        |
| Transition-stress frame p95  | 416.7 ms                                                       |
| Physics p95                  | 0.4 ms                                                         |
| Draw calls / triangles       | 30 / 1,800                                                     |
| Simulation/render resources  | `11/11/2` and `31/30/0/0` at every sample and final            |
| DOM docs/nodes/listeners     | `1/526/43` → `1/367/43`                                        |
| Forced-GC heap               | 7,593,612 → 7,542,428 bytes; −0.67% final; no positive peak    |
| Diagnostic long tasks        | 4,143 / 1,053,709 ms during intentionally synchronous rebuilds |

The positive final heap-node deltas are small VM weak-array/code metadata; no retained
Rapier/Three/resource family appears. The software-rendered timing remains automation-health
evidence, not a physical-device performance claim.

## 5. Build, static, and visual evidence

- `check:fast`: 15 files / 31 tests; strict typecheck, lint, formatting, content, boundary, and
  circular checks pass.
- Content hashes remain tutorial `5aac8b9a`, adversarial `1e4655f2`, materials `05d66915`.
- Dependency graph: 32 TypeScript modules, no cycles.
- Headless 4,000-step profile: p50 0.0967 ms, p95 0.2662 ms, p99 0.5423 ms, max 8.4998 ms.
- Production: 743.6 KiB raw / 173.4 KiB gzip JavaScript, 572.6 KiB gzip WASM, 1.35 MiB total; lab
  leak audit passes.
- Built local Chromium + Pixel emulation: 23 passed, 3 intentional viewport skips.
- All five screenshots were inspected; tutorial goal and causal geometry remain visible on desktop
  and narrow Pixel emulation. Pixel remains emulation.

## 6. CI changes

Pull requests now define:

- existing static/simulation/production checks;
- existing isolated Chromium/Pixel, headed Firefox/Xvfb, and WebKit/iPhone-emulation jobs;
- non-retrying Chromium PWA fault test;
- non-retrying 30-second Chromium performance/resource profile;
- 14-day closure report retention.

The weekly schedule adds a 1,200-second transition stress with heap-node summaries and 30-day
artifact retention.

Draft-PR run [`30260447230`](https://github.com/karthikbs862026/teetertown/actions/runs/30260447230)
passes on published head `12c53a8`:

| Job / project                          | Result                                                           |
| -------------------------------------- | ---------------------------------------------------------------- |
| Static/simulation/production           | 15 files / 31 tests; production budgets and lab isolation pass   |
| Chromium + Pixel emulation             | 23 passed / 3 intentional viewport skips                         |
| Headed Firefox/Xvfb                    | 12 passed / 1 intentional viewport skip                          |
| WebKit + iPhone emulation              | 23 passed / 3 intentional viewport skips                         |
| Atomic PWA fault matrix                | 1 passed                                                         |
| Non-retrying 30-second browser profile | 1 passed; 100 transitions after 80-cycle / 48.091-second warm-up |

The CI profile reports FMI 291.7 ms, steady-frame p95 33.3 ms, physics p95 0.5 ms, 30 draw
calls/1,800 triangles, exact resources, DOM `1/473/43` → `1/473/43`, −0.29% final heap drift, and
+0.75% maximum observed drift. The scheduled long job is correctly skipped for pull requests; the
local 20-minute result above is the current long-run evidence.

## 7. Commands

```text
npm run check:fast
npm run check:production
npm run profile:headless
npm run build:lab
env TEETERTOWN_CHROMIUM_EXECUTABLE_PATH=/tmp/chromium \
  FONTCONFIG_FILE=/tmp/teetertown-packaged-chromium-149/fonts/fonts.conf \
  TEETERTOWN_E2E_SERVER_COMMAND='npm run preview:e2e' \
  npx playwright test --project=chromium --project=mobile-chromium
env TEETERTOWN_CHROMIUM_EXECUTABLE_PATH=/tmp/chromium \
  FONTCONFIG_FILE=/tmp/teetertown-packaged-chromium-149/fonts/fonts.conf \
  npm run test:e2e:pwa
env TEETERTOWN_CHROMIUM_EXECUTABLE_PATH=/tmp/chromium \
  FONTCONFIG_FILE=/tmp/teetertown-packaged-chromium-149/fonts/fonts.conf \
  TEETERTOWN_SOAK_SECONDS=30 \
  npm run test:performance:browser
env TEETERTOWN_CHROMIUM_EXECUTABLE_PATH=/tmp/chromium \
  FONTCONFIG_FILE=/tmp/teetertown-packaged-chromium-149/fonts/fonts.conf \
  TEETERTOWN_SOAK_SECONDS=1200 \
  TEETERTOWN_WARMUP_SECONDS=300 \
  TEETERTOWN_HEAP_DIAGNOSTICS=1 \
  npm run test:performance:browser
```

## 8. Remaining blockers and stop conditions

- Physical target-tier Android Chrome, minimum-tier Android Chrome, and iPhone/iOS Safari evidence.
- Physical touch latency, orientation, background/resume, offline start, cache eviction, memory
  pressure, thermal, battery, and 20–30-minute thermal soak.
- At least 10 representative first-time players, ≥80% unaided control comprehension, repeatable
  correct-strategy execution, and credible failure attribution.

Stop on any replay/probe divergence, mixed release, non-neutral cancellation, resource growth,

> 5% unexplained stable-baseline heap drift, hidden cause/goal, ambiguous failure, or correctly
> understood strategy that players cannot execute.

## 9. Gate recommendation

**ITERATE.** The requested automated engineering work is green locally and in official current-head
CI, including the no-retry 20-minute local transition soak and non-retrying CI closure job. Gate 1
still requires physical-device validation and representative-player evidence. Keep PR #1 draft and
do not merge or expand production scope.
