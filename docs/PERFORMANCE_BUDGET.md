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
