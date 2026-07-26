# ADR-0010: Replay, State Hashes, and Compatibility

**Status:** Accepted, 2026-07-26

Replays contain build/game/Rapier/physics/replay/content identity, seed, ordered quantized commands,
periodic quantized state hashes, and exactly one classified outcome. Hash fields iterate in stable
entity order. Environment metadata is diagnostic only.

Different physics/content versions are never compared in future standardized rankings. Unexplained
divergence blocks release and records the first differing step.
