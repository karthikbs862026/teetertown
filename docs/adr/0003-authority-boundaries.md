# ADR-0003: Authoritative State Boundaries

**Status:** Accepted, 2026-07-26

Simulation/session owns rules, objectives, fixed-step time, terminal result, scoring, and replay.
Rapier owns physical state at fixed steps. Input owns raw samples only until command quantization.
Rendering owns interpolation/camera/material/VFX only. UI/meta/platform cannot mutate active
physics.

Mesh/body double authority, render-delta rules, or direct UI-to-Rapier writes block release.
