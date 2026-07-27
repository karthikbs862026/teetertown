# ADR-0010: Replay, State Hashes, and Compatibility

**Status:** Accepted; schema 2 runtime identity amendment, 2026-07-27

Replays contain build/game/Rapier version, Rapier runtime variant, physics/replay/content identity,
seed, ordered quantized commands, periodic quantized state hashes, and exactly one classified
outcome. Hash fields iterate in stable entity order. Environment metadata is diagnostic only.

Replay schema 2 makes `rapierRuntimeVariant` mandatory. Current values are `compat-embedded-node`
and `modular-wasm-browser`; future values require an ADR/migration.

Different physics/content versions are never compared in future standardized rankings. Unexplained
divergence blocks release and records the first differing step.
