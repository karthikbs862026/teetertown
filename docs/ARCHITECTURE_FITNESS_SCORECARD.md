# Architecture Fitness Scorecard

| Fitness function                                         | Phase 0/1 threshold                                            | Current evidence                 | State                 |
| -------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------- | --------------------- |
| Headless simulation has no Three/DOM/platform dependency | Boundary script and TypeScript compile pass                    | Not yet run                      | Pending               |
| Same replay is deterministic                             | Identical periodic/final hashes across repeated runs           | Not yet run                      | Pending               |
| Render cadence does not alter outcome                    | 30/60/120-Hz synthetic render schedule yields same result/hash | Not yet run                      | Pending               |
| Level unload returns resource baseline                   | No monotonic registry growth after 50 post-warm-up cycles      | Not yet run                      | Pending               |
| New object family avoids unrelated changes               | Content/factory registration only; no UI/render rule hack      | One graybox family only          | Blocked by later work |
| New mechanic is data/events, not scene code              | Schema + typed command/event representation                    | Tilt/capture experiments pending | Pending               |
| Frame loop avoids unbounded allocation                   | Stable registries and manual allocation profile after warm-up  | Not yet profiled                 | Pending               |
| Dependency graph is acyclic                              | Circular/import-boundary scripts pass                          | Not yet run                      | Pending               |
| Production bundle excludes admin lab                     | Audit script passes exact markers                              | Not yet run                      | Pending               |
| Public JS bundle stays within provisional budget         | Entry + chunks ≤650 KiB gzip review; first payload 4–6 MB max  | Not yet built                    | Pending               |
| Test feedback remains small-team practical               | Fast checks ≤2 min local; browser checks separated             | Not yet timed                    | Pending               |
| Contributor can locate ownership                         | README, AGENTS, architecture, state, ADR index present         | Repository inspection            | Provisional pass      |

Gate recommendation cannot exceed **ITERATE** until replay, browser, visual, resource, performance,
and physical-device rows have evidence.
