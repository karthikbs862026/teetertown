# Analytics Taxonomy

No network analytics provider is implemented. This is a privacy-conscious future schema.

## Session/product events

`app_start`, `session_start/end`, capability/quality tier, load phase/error, tutorial milestone,
level start/restart/success/failure/quit, mastery result, restoration progress, daily participation,
share start/complete, save migration, offline transition.

## Physics-trust aggregates

Failure classification, attempts, immediate quit after failure, repeated equivalent attempts,
restart/hint/rewind demand, soft-lock/invalid-state/context-loss incidence, command reversals,
cumulative tilt/jerk, latency histogram, frame/physics budget warnings, and survey response “the
game did what I expected.”

Never emit per-physics-step or per-pointer network events. Full replays/raw traces require explicit
research/diagnostic policy and consent; routine analytics uses bounded aggregates.

Every event includes schema, build, game, physics, replay, content, and configuration versions.
Remote experiments may change text, framing, guidance, hint timing, order, or presentation—not
physics constants, collision, break thresholds, objective rules, command mapping, or comparable
ranked results.
