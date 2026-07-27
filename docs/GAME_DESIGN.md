# Game Design Foundation

## Core loop

1. See the objective, basket, hinge topology, fragile risk, and reachable bounds before acting.
2. Drag one finger to set a bounded target world tilt.
3. Anticipate momentum and platform balance while protecting fragile objects.
4. Succeed, receive a classified and understandable failure, or use an unlimited free retry.
5. In later phases, earn restoration progress and optionally replay for mastery.

The Phase 1 build implements steps 1–4 only.

## First-minute target

| Time    | Intended beat                                                 | Evidence needed later                     |
| ------- | ------------------------------------------------------------- | ----------------------------------------- |
| 0–8 s   | Apple, obvious basket, bottle, two platforms, subtle drag cue | Goal and risk recognized without text     |
| 8–20 s  | Whole diorama visibly tilts; apple moves; bottle wobbles      | Player says “I move the world”            |
| 20–32 s | Apple reaches basket with short material response             | Median first delivery <20 s               |
| 32–48 s | Smooth reversal protects bottle                               | Correct strategy executes within corridor |
| 48–60 s | Small causal chain and first restoration beat                 | Deferred to Phase 2                       |

The graybox proves only the first two physical ideas; it does not implement the restoration beat.

## Control candidates

- One-axis raw drag.
- Constrained two-axis raw drag.
- One-axis bounded virtual track.
- Constrained two-axis bounded virtual track.

All map to quantized fixed-step target-tilt commands. Full unrestricted two-axis tilt is rejected
for the initial graybox because it expands ambiguity before thumb and camera evidence exists.

## Phase 1 scenes

### Tutorial graybox

Two connected platform surfaces, a visible central hinge/anchor, one apple, one basket, one fragile
bottle, bounds, and explicit success/failure. It is deliberately sparse: three critical dynamic
objects is the onboarding ceiling, and this scene uses two.

### Adversarial laboratory

An internal scene containing isolated wedge, pileup, edge, sleep/wake, high-speed, joint-limit,
fragility-threshold, mesh/collider mismatch, capture-speed, out-of-bounds, and soft-lock probes. It
is not campaign content and may be visually ugly if that makes defects obvious.

## Initial mastery dimensions

- Completion.
- Safety/no breakage.
- Elegance: low jerk, low cumulative tilt, and few reversals.
- Speed.

Campaign UI should show completion plus at most one optional mastery target. Competitive
standardization is deferred.

## Failure vocabulary

- `object_out_of_bounds`
- `fragile_threshold_exceeded`
- `wrong_goal_object`
- `irrecoverably_trapped`
- `constraint_expired`
- `physics_invalid_state`
- `content_or_script_error`
- `ambiguous`

Only the first five may be presented as player-attributable, and only when the visible cause is
clear. Invalid or ambiguous outcomes require a free recovery path and a diagnostic.

## Second-mechanic boundary

Phase 2 may evaluate One-Pin and acceleration-sensitive fragility. No other campaign mechanic is
authorized until the tilt model, camera, capture authority, replay consistency, and human-sized
solution corridor have evidence.
