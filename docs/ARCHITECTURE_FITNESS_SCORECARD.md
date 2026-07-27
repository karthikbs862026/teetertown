# Architecture Fitness Scorecard

| Fitness function                                         | Phase 0/1 threshold                                            | Current evidence                                                           | State                             |
| -------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------- |
| Headless simulation has no Three/DOM/platform dependency | Boundary script and TypeScript compile pass                    | Boundary, typecheck, lint pass                                             | Pass                              |
| Same replay is deterministic                             | Identical periodic/final hashes across repeated runs           | Node compat and Chromium modular golden match through 278                  | Node/Chromium pass                |
| Render cadence does not alter outcome                    | 30/60/120-Hz synthetic render schedule yields same result/hash | Fixed clock yields 120/120/120                                             | Provisional; browser pending      |
| Level unload returns resource baseline                   | No monotonic registry growth after 50 post-warm-up cycles      | Simulation `11/11/2` ×50; Chromium registries stable across 20 transitions | Partial pass; memory/soak pending |
| New object family avoids unrelated changes               | Content/factory registration only; no UI/render rule hack      | One graybox family only                                                    | Blocked by later work             |
| New mechanic is data/events, not scene code              | Schema + typed command/event representation                    | Level/material schemas and commands                                        | Provisional pass                  |
| Frame loop avoids unbounded allocation                   | Stable registries and manual allocation profile after warm-up  | Headless p95 0.2494 ms; browser registries stable; heap/FPS absent         | Partial; profiling pending        |
| Dependency graph is acyclic                              | Circular/import-boundary scripts pass                          | 27 TypeScript modules checked, no cycle                                    | Pass                              |
| Production bundle excludes admin lab                     | Audit script passes exact markers                              | Lab-leak audit passes                                                      | Pass                              |
| Public JS bundle stays within provisional budget         | Entry + chunks ≤650 KiB gzip review; first payload 4–6 MB max  | JS 171.1 KiB + WASM 572.6 KiB gzip; 1.34 MiB total                         | Pass under ADR-0018               |
| Test feedback remains small-team practical               | Fast checks ≤2 min local; browser checks separated             | Headless suite ≈2 s; browser separate                                      | Pass for headless                 |
| Contributor can locate ownership                         | README, AGENTS, architecture, state, ADR index present         | Repository inspection                                                      | Provisional pass                  |

Gate recommendation cannot exceed **ITERATE** until replay, browser, visual, resource, performance,
and physical-device rows have evidence.
