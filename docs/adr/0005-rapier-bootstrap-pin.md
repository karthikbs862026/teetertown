# ADR-0005: Rapier Bootstrap and Version Pin

**Status:** Accepted core pin; browser packaging amended by ADR-0018, 2026-07-27

Use Rapier exactly `0.19.3`. One asynchronous singleton establishes the selected runtime, then a
tiny deterministic world self-test must pass before gameplay. No duplicate/fallback world is allowed
within one runtime session.

Node evidence uses exact `@dimforge/rapier3d-compat@0.19.3`. Browser builds use the official
separate-WASM package under ADR-0018. Both variants must record their identity and reproduce the
frozen bootstrap and gameplay hashes.

Any Rapier upgrade is a physics migration requiring all replays, performance comparison,
compatibility review, representative level/device tests, and an ADR update.
