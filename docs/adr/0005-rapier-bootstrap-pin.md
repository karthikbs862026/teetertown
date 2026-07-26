# ADR-0005: Rapier Bootstrap and Version Pin

**Status:** Accepted, 2026-07-26

Use `@dimforge/rapier3d-compat` exactly `0.19.3`. One asynchronous singleton initializes WASM, then
a tiny deterministic world self-test must pass before gameplay. No duplicate/fallback world is
allowed.

Any Rapier upgrade is a physics migration requiring all replays, performance comparison,
compatibility review, representative level/device tests, and an ADR update.
