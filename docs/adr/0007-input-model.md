# ADR-0007: Input Model and Viewport Normalization

**Status:** Provisional, 2026-07-26

One Pointer Events owner captures a pointer and normalizes movement by the smaller gameplay-surface
dimension. Inputs become bounded, quantized target tilt commands. One-axis bounded virtual track is
the default hypothesis; raw and constrained two-axis variants remain switchable experiments.

OrbitControls, accelerometer-required input, multi-owner gesture logic, and render-frame smoothing
are rejected. Physical-phone comprehension, latency, overshoot, cancellation, and repeatability
select the final model.
