# ADR-0011: Scene Ownership, Resource Scopes, and Disposal

**Status:** Accepted, 2026-07-26

One renderer persists; every level creates one scope that owns Three/Rapier/audio/listener/timer/
worker/subscription resources and disposes in reverse order. Removing a scene node is not disposal.
Pooling is allowed only with a complete reset contract and measured reuse.

Monotonic post-warm-up resource growth blocks the lifecycle gate.
