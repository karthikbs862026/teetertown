# ADR-0004: Fixed Step and Presentation Interpolation

**Status:** Accepted, 2026-07-26

Physics advances at 1/60 second with an accumulator and at most five catch-up steps. Large gaps are
clamped/diagnosed; resume never simulates hidden wall time. Previous/current transform snapshots are
captured after fixed steps and interpolated for display only.

Change requires replay, frame-cadence, performance, and physical-device evidence.
