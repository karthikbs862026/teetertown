# ADR-0019: Canonical Contacts and Explicit Sleep/Wake

**Status:** Accepted for Phase 1 physics, 2026-07-27

Rapier owns contact generation and body sleeping, but Teetertown owns how those results enter rules
and replay-visible state.

- Contact-force events are normalized to lexicographically ordered entity pairs. Direction is
  reversed when the pair is swapped, then events are sorted by pair, impulse, and direction before
  fragility accumulation or diagnostic output.
- A changed quantized tilt command wakes sleeping dynamic bodies in stable level-entity order before
  the controller and world step. An unchanged command does not wake them.

The alternatives—depending on callback order, disabling sleep globally, or waking every dynamic body
every step—were rejected because they make deterministic rules brittle or waste runtime work.

This changes replay-relevant physics policy, so `PHYSICS_VERSION` advances to `phase1-physics-2` and
the configuration hash becomes `53cfb827`. Exact Node and modular-browser probes freeze the pileup
trace (`0fe7d31e`) and sleep/wake result (`b3c1c78a`). Any future change requires a physics
migration, new probe identities, replay review, and physical-device evidence.
