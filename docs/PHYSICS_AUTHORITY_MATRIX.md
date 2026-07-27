# Physics Authority Matrix

Every entity declares one authority in content. Runtime validation rejects illegal combinations.

| Authority     | Teetertown use                                             | Phase 1 instances                              | Allowed behavior                                                                               | Prohibited behavior                                                               |
| ------------- | ---------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `dynamic`     | Freely moving objects whose motion is the puzzle           | Apple, bottle, pileup cubes, fast projectile   | Rapier owns transform/velocity; simple collider; stable ID; optional CCD only with evidence    | Render/UI transform writes; dynamic triangle mesh; quality-tier tuning            |
| `constrained` | Physics with visible bounds/hinges/rails                   | See-saw platforms and joint probe; basket lips | Rapier owns physical state; joint/geometry constraint is visible and overlaid                  | Hidden limits; decorative joint art that disagrees with anchor                    |
| `kinematic`   | Exact authored movement where free simulation adds noise   | Kinematic support-root tilt spike              | Fixed-step simulation command sets next pose; recorded/versioned                               | Animation/render delta directly moving gameplay collider                          |
| `assist`      | Visible deterministic state machine that improves fairness | Optional felt-lined low-speed basket damping   | Named bounds, thresholds and force/damping; visible felt; debug overlay; replay/hash inclusion | Invisible magnet/snap; payer/device-specific behavior; rescue after invalid state |
| `decorative`  | Presentation with no gameplay authority                    | Market-stall trim, labels, ambient accents     | Rendering only; disposable resource scope                                                      | Collider, goal, failure, objective, replay, or input effect                       |

## Scene assignment

| Entity / behavior                 | Authority                                        | Owner                                 | Evidence required                                                 |
| --------------------------------- | ------------------------------------------------ | ------------------------------------- | ----------------------------------------------------------------- |
| Apple                             | `dynamic`                                        | Rapier                                | Golden/failure/perturbation replay, collider overlay              |
| Fragile bottle                    | `dynamic`                                        | Rapier + deterministic fragility rule | Low/medium/high threshold tests and visible warning state         |
| Two platform surfaces             | `constrained` in gravity mode                    | Rapier joints                         | Joint limit/reversal, sleep/wake, overlay                         |
| Kinematic tilt comparison support | `kinematic`                                      | Simulation command → Rapier           | Fixed-step pose, replay consistency, contact comparison           |
| Basket lip                        | `constrained` static geometry                    | Rapier                                | Slow/high-speed capture cases                                     |
| Felt capture region               | `assist` when enabled                            | Simulation state machine              | On/off/threshold/high-speed tests; visible/debug-visible          |
| Diorama presentation root         | `decorative`                                     | Rendering                             | Never written into Rapier; root rotation excluded from state hash |
| Goal sensor                       | Simulation rule reading Rapier intersection/pose | Simulation                            | Stable ID/order and exactly-one terminal result                   |
| Debug overlays                    | `decorative`, development only                   | Devtools                              | Production-bundle exclusion                                       |

Raw full-physics basket capture, constrained lips, and felt assist remain comparative experiment
options. No assist is selected for campaign use until fairness evidence supports it.
