# ADR-0008: Gameplay and Replay Camera Policies

**Status:** Accepted separation; projection provisional, 2026-07-26

Live gameplay uses a stable camera whose movement cannot alter drag meaning. Fixed orthographic is
the conservative default; low-FOV perspective and between-action bounded framing remain lab
variants. No camera move occurs during owned precision input.

A later post-run replay camera may be cinematic but never changes the recorded simulation.
