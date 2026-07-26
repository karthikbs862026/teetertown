# ADR-0015: Diagnostics and Privacy Boundary

**Status:** Accepted, 2026-07-26

Phase 1 uses a bounded local ring buffer and explicit diagnostic export. No silent replay/raw-input
upload occurs. Aggregate command/latency metrics are preferred. A hosted crash/analytics provider
requires owner approval plus cost, privacy, consent, retention, deletion, source-map, and offline
review.
