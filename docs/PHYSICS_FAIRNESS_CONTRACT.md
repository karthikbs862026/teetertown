# Physics Fairness Contract

These invariants block release. The detailed governing source is
`TEETERTOWN_MASTER_BUILD_PROMPT.md`, §10.

## Authority and time

1. Simulation advances at a fixed 1/60-second step with capped catch-up. Render timing never
   advances rules.
2. Rapier owns body pose, velocity, contacts, sleep, and joints at fixed steps.
3. Input becomes bounded, quantized commands before affecting simulation.
4. Rendering reads previous/current snapshots and interpolates presentation only.
5. UI, camera, analytics, quality tier, payer/ad/network/config state, and asset completion order
   cannot change simulation constants or results.

## Determinism

- Rapier and all production dependencies are exact-pinned.
- Bodies, colliders, joints, commands, contacts used by rules, and hash fields use stable IDs/order.
- No `Math.random`, wall clock, render delta, unordered iteration, or Three.js transform may decide
  gameplay.
- Every replay records build, game, Rapier, physics, replay schema, content hash, seed, commands,
  periodic hashes, and classified outcome.
- Unexplained hash divergence, NaN/infinity, runaway velocity, joint explosion, impossible objective
  state, or duplicate terminal result blocks release.

## Human-sized solution corridor

- Tutorial/easy target: ≥90% success around the golden command stream with approximately ±5%
  magnitude and ±1 fixed-step timing variation.
- Medium target: ≥70% at approximately ±3% and ±1 step.
- A representative player who can explain the solution but cannot execute it within the intended
  corridor exposes a defect until deliberate mastery difficulty is proven.

## Contact and assistance

- Dynamic triangle-mesh colliders are prohibited. Physics-critical visuals use primitives,
  compounds, or validated convex shapes.
- Art, pivot, anchor, collider, COM, material behavior, audio, and haptic cues must agree at phone
  size.
- Assistance requires a visible physical affordance, named profile, bounded deterministic rule,
  debug overlay, replay/hash inclusion, entry/exit/threshold/high-speed tests, and evidence that raw
  physics was less fair.
- Hidden rescue forces and monetization-dependent assistance are prohibited.

## Failure treatment

Every terminal outcome is exactly one classified success/failure. Player-attributable failures must
have a visible cause and useful correction. Invalid, engine-caused, or ambiguous failures:

- are not player error;
- generate diagnostic evidence;
- offer free retry/recovery;
- never trigger monetization.

## Good difficulty review

| Pass                                                | Block                                                  |
| --------------------------------------------------- | ------------------------------------------------------ |
| Goal and relevant risk visible before action        | Hidden collider, threshold, state, or off-camera cause |
| Equivalent human inputs produce equivalent outcomes | Visually equivalent traces bifurcate                   |
| Failure teaches a correction                        | Player cannot identify what changed                    |
| Repetition improves success                         | Solver variance creates learned helplessness           |
| Free pause/restart/recovery                         | Confusion or anomaly is monetized                      |
| Same physics across device/quality tier             | Tier, frame timing, or lifecycle changes result        |

No level passes Physics Trust Review without a golden replay, expected-failure case, perturbation
corridor, classifiable failures, readable camera/art, and relevant browser/device evidence.
