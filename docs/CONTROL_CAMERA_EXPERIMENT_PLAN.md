# Control, Tilt, Capture, and Camera Experiment Plan

## Common protocol

- Same tutorial content hash, stable seed, physics/material configuration, and ordered command
  stream.
- Record raw samples, quantized commands, event-to-step latency, target/actual tilt, acceleration,
  jerk, reversals, terminal classification, periodic hashes, and resource counters.
- Automated runs establish repeatability, not player comprehension.
- Player/device study must include novice casual players, puzzle players, left/right-handed users,
  and representative phone tiers.
- Stop a candidate on unexplained replay divergence, invalid state, invisible assistance, camera
  change during pointer ownership, or tutorial perturbation below the intended corridor.

## E-INPUT: input model

Variants:

1. one-axis raw delta;
2. constrained two-axis raw delta;
3. one-axis bounded virtual track;
4. constrained two-axis bounded virtual track.

Metrics: normalized command equivalence across viewports/orientations, p50/p95 latency, thumb
travel, overshoot, reversals, cancellations, first-attempt success, successful-trace repeatability,
left/right-hand reach, and explanation of control.

Pass hypothesis: bounded one-axis meets ≥80% comprehension, tutorial ≥90% perturbation corridor, and
real-phone latency targets without materially more thumb travel. Automated desktop results cannot
select the winner.

## E-TILT: physical implementation

Variants:

- rotated effective gravity plus bounded presentation-root rotation;
- fixed gravity plus kinematic support-root rotation at fixed steps.

Metrics: state-hash repeatability, contact/joint anomalies, p50/p95 physics time, awake bodies,
sudden-reversal behavior, collider/art overlay agreement, authoring steps, and player prediction.

Selection rule: prefer gravity-vector if perception is equivalent and its stability/cost is no
worse. Kinematic support wins only with clear predictability or art/authoring benefit.

## E-CAPTURE: authority

Variants:

- raw dynamic apple and open goal;
- visible constrained basket lips;
- constrained lips plus a visible felt region applying bounded deterministic low-speed damping.

Cases: slow center entry, slow edge entry, threshold-speed entry, high-speed pass, exit, repeated
entry, perturbation corridor, and assist disabled/enabled replay.

Pass rule: no high-speed false capture; human-sized slow entry succeeds reliably; assist bounds and
state are visible and hashed. If constrained geometry meets the corridor, reject extra assist.

## E-CAMERA: projection and framing

Variants:

- fixed orthographic;
- fixed low-FOV perspective;
- bounded event framing only between precision-control moments.

Metrics: goal/risk visibility, contact/hinge legibility, depth judgment, occlusion, stable drag
meaning, motion comfort, phone safe areas, and chain readability. A separate post-run replay camera
is out of live simulation.

Selection rule: fixed orthographic is the conservative default. No framing movement while a pointer
is owned or an object is in a precision threshold region.

## Evidence matrix

| Evidence               | Automated desktop  | Emulated phone viewport | Physical Android   | Physical iOS/Safari |
| ---------------------- | ------------------ | ----------------------- | ------------------ | ------------------- |
| Replay/hash            | Required           | Required                | Gate required      | Gate required       |
| Input mapping          | Required           | Required                | Gate required      | Gate required       |
| Latency/overshoot      | Diagnostic only    | Diagnostic only         | Selection required | Selection required  |
| Camera/art readability | Screenshot review  | Screenshot review       | Player review      | Player review       |
| Thermal/memory         | Not representative | Not representative      | Gate required      | Gate required       |

Actual Chromium desktop and Pixel 7 emulation now cover replay parity, cancellation, camera
composition, and screenshot review for the graybox. These results reduce implementation risk but do
not select the final control/camera winner.

Gate 1 remains **blocked for final control/camera selection** until physical-device and
representative-player evidence exists, even though the overall work recommendation remains
**ITERATE**.
