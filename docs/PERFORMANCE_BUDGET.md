# Provisional Performance and Content Budgets

These are design thresholds, not engine capability claims. Changes require a measured ADR.

## Runtime

| Metric                                         | Target tier                        | Minimum tier / review threshold  |
| ---------------------------------------------- | ---------------------------------- | -------------------------------- |
| Frame time p95                                 | ≤20 ms (60 fps intent)             | ≤33 ms (stable 30 fps)           |
| Physics time p95                               | ≤4 ms                              | ≤8 ms                            |
| Pointer event → fixed-step p95, physical phone | ≤50 ms                             | ≤80 ms                           |
| Awake dynamic bodies, normal level             | ≤40                                | Hard review at 64                |
| Active joints                                  | ≤8                                 | Hard review at 12                |
| Medium-tier draw calls                         | ≤80                                | High-tier review at 120          |
| Visible triangles                              | ≤250,000                           | Scene-specific review            |
| Decoded texture memory                         | ≤96 MB medium                      | ≤64 MB low                       |
| First-play compressed payload                  | 4–6 MB                             | Must be progressive              |
| First meaningful interaction                   | ≤5 s on measured mid-range profile | Device/network evidence required |

Physics accuracy, timestep, material constants, objectives, and input mapping are identical across
quality tiers.

## Graybox targets

- ≤12 dynamic bodies, ≤4 joints, ≤30 draw calls, ≤50,000 triangles, no runtime textures beyond
  generated canvas/solid materials.
- No full-screen post-processing, dynamic environment map, or unnecessary shadow casters.
- No more than three critical dynamic objects in onboarding.

## Lifecycle

- 50 load/play/unload cycles after warm-up show no monotonic increase in geometry, material,
  texture, render target, body, collider, joint, listener, timer, worker, or audio counts.
- Investigate >5% unexplained memory/resource drift from a stable baseline.
- A context loss is a physics-trust incident even if memory APIs appear stable.

## Bundle gate

`scripts/check-budgets.ts` reports raw/gzip output. A JavaScript chunk above 650 KiB gzip or total
first-load output above 6 MB blocks the provisional Phase-1 production-shaped build pending review.

## First foundation measurement — 2026-07-26

- Headless Node v24.14.0, 4,000 fixed steps: 0.2494 ms p95, 9.4454 ms maximum. This is not
  browser/device evidence.
- Production JavaScript: 950.1 KiB gzip, so the 650 KiB chunk gate fails.
- Exact-pinned `@dimforge/rapier3d-compat@0.19.3` is approximately 810 KiB gzip before application
  bundling. Resolution requires an ADR-backed loader/package experiment; the threshold is not
  silently waived.

## Blocker iteration measurement — 2026-07-27

- ADR-0018 keeps Rapier `0.19.3` and emits its browser WASM separately.
- Production JavaScript: 736.1 KiB raw, 171.1 KiB gzip — passes the 650 KiB gzip JavaScript gate.
- Rapier WASM: 1,533.4 KiB raw, 572.6 KiB gzip.
- Total output reported by `check:budgets`: 1.34 MiB gzip — passes the 6 MiB gate.
- Vite still emits a raw/minified-size advisory because the JavaScript file is above 650 KiB raw.
  This is not the repository gate, which is explicitly gzip-based; it remains a review signal.
- Built-preview Chromium reproduces bootstrap `74e1d58f` and golden step 278/hash `c965c01f`.

## Automated closure measurement — 2026-07-27

- Production JavaScript: 743.6 KiB raw, 173.4 KiB gzip.
- Rapier WASM: 1,533.4 KiB raw, 572.6 KiB gzip.
- Generated manifest plus verified atomic service worker: 2.1 KiB gzip combined.
- Total output reported by `check:budgets`: 1.35 MiB gzip.
- Headless Node v24.14.0, 4,000 fixed steps: 0.2662 ms p95, 0.5423 ms p99, 8.4998 ms maximum. This
  remains headless evidence.
- Actual local packaged Chromium/SwiftShader, 30-second transition stress after heap stabilization:
  60 warm-up scene pairs, 154 measured transitions, first meaningful interaction 553 ms, physics p95
  1.1 ms, 30 draw calls, 1,800 triangles, exact `11/11/2` simulation and `31/30` geometry/material
  registries, 43→43 DOM listeners, +1.30% final heap drift, and +2.39% maximum observed heap drift.
- The same software-rendered run recorded a steady 180-frame p95 of 50.0 ms and transition-stress
  frame p95 of 366.6 ms. It passes the deliberately broad 100 ms automation-health ceiling, not the
  20/33 ms physical-device frame budgets. Transition rebuilds are not normal-play frame evidence.
- The definitive no-retry run adds a 300.610-second/980-cycle workload warm-up before its
  authoritative baseline, then measures 5,820 transitions over 1,200 seconds. Forced-GC heap changes
  from 7,593,612 to 7,542,428 bytes (−0.67%) with no positive measured peak; DOM `1/526/43` becomes
  `1/367/43`; explicit resources remain exact; steady-frame p95 is 66.6 ms, physics p95 0.4 ms, FMI
  543 ms, and renderer load 30 calls/1,800 triangles.

The performance test disables Playwright tracing while sampling heap, forces GC, requires at least
60 scene-pair warm-ups and a stable three-sample plateau, and requires at least five minutes of the
same workload before a 1,200-second baseline. It then requires at least 50 measured pairs. It fails
on >5% drift at any timed checkpoint, changed resource counts, DOM/listener growth, physics p95

> 8 ms, first interaction >5 s, or graybox draw/triangle budget excess.

Physical-device frame time, input latency, memory pressure, thermal, battery, and throttled-network
startup remain unmeasured and cannot be inferred from desktop software rendering.
