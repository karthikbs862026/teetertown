# Gate 1 Physical-Device and Player Protocol — 2026-07-27

This protocol converts the remaining external evidence gaps into auditable work. It does not itself
close any gate.

## 1. Build identity

Before every session record:

- Git commit and branch;
- game/build version;
- Rapier version and runtime variant;
- physics, replay, level, material, and asset-manifest versions/hashes;
- browser/version, OS/version, device model, RAM class, viewport/orientation, battery state,
  network, and whether the run is automated, emulated, or physical.

Abort if the bootstrap is not `74e1d58f`, content hashes differ, the lab/production identity is
unclear, or a service worker mixes assets from another build.

## 2. Minimum physical matrix

| Device class                  | Minimum evidence role                                      |
| ----------------------------- | ---------------------------------------------------------- |
| Target-tier Android + Chrome  | Main touch, latency, frame, thermal, lifecycle, replay     |
| Minimum-tier Android + Chrome | Stable 30 fps fallback, memory pressure, long-session risk |
| Supported iPhone + iOS Safari | WebKit/WASM, touch, memory, audio/lifecycle, replay        |

One actual Android and one actual iPhone are the absolute minimum. A single high-end phone cannot
stand in for the minimum tier.

## 3. Device procedure

For each device:

1. Cold load after clearing the test build’s site data; record time to first meaningful interaction
   and WASM/network failures.
2. Warm load; verify the same build/content/runtime identity.
3. Run the deterministic lab parity case and compare bootstrap, periodic, final, and outcome hashes.
4. Complete ten tutorial attempts: five left-hand and five right-hand where practical; capture raw
   samples, quantized commands, p50/p95 event-to-step latency, reversals, overshoot, cancellations,
   outcome, and failure class.
5. Exercise pointer cancel, browser gesture interruption, orientation change, background/foreground,
   lock/unlock, incoming interruption, reload between sessions, and offline warm start.
6. Run 50 tutorial/adversarial transitions and compare resource registries before/after.
7. Run a 20–30-minute thermal soak; record frame-time trend, long tasks, quality-tier changes,
   resource growth, battery drop, device thermal warning/comfort, and any context loss.
8. On iOS, capture Safari Web Inspector evidence where available. On Android, capture Chrome
   performance/input evidence.

## 4. Device pass/stop rules

- Exact deterministic lab hashes must match; unexplained divergence is a stop.
- Pointer-event-to-fixed-step p95 target is ≤50 ms on target tier and minimum acceptable is ≤80 ms
  on minimum tier.
- Minimum-tier graybox must remain stable at 30 fps; no physics accuracy or rule may change by tier.
- No active physics time advances while hidden, context-lost, or explicitly paused.
- No monotonic body/collider/joint/geometry/material/texture/listener/resource growth.
- No uncontrolled quality oscillation or severe thermal degradation.
- Offline/update failure must be visible and recoverable; never create a fallback physics world.

## 5. Representative-player pilot

Use at least ten first-time participants for the initial directional Gate-1 pilot. Include novice
casual players, puzzle players, experienced mobile players, left/right-handed participants, and both
Android/iOS exposure. A smaller sample remains exploratory and cannot close the gate.

Protocol:

1. Obtain consent and use a pseudonymous study ID; do not silently upload raw input.
2. Show the playable graybox without written control instruction.
3. Ask the participant to explain the control and intended strategy before precision execution.
4. Observe silently during execution; use think-aloud only before/after the precision attempt.
5. After each failure, capture attribution before showing replay: `did_not_understand`,
   `understood_could_not_execute`, `camera_or_input`, `physics_or_level`, or `player_action`.
6. Then show replay/overlays and ask whether attribution changes.
7. Randomize approved input/camera variant order; never change physics by participant/device.
8. Record comprehension time, first delivery, attempts, reversals, overshoot, cancellation, command
   corridor, success, comfort, and trust response.

## 6. Player pass/stop rules

- At least 80% explain the control correctly without written instruction.
- A participant who states the correct strategy must be able to execute it within the intended human
  robustness corridor; repeated inability is a Physics Trust investigation, not “difficulty.”
- Failure attribution must distinguish player action from camera/input/physics/level causes.
- Any invalid/ambiguous or engine-caused failure receives diagnostics and free recovery; never
  monetization or player blame.
- Do not select the final control/camera/capture variant from desktop preference or emulation alone.

## 7. Required handoff

Store the anonymized summary, device sheets, traces, screenshots, replay/hash comparisons, thermal
notes, defects, and GO/ITERATE/HOLD/STOP recommendation under a build-hash evidence folder. Every
reproducible defect must add a lasting test, replay, visual baseline, or documented device case
before the next gate attempt.
