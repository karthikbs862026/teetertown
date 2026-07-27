# Observability and Diagnostic Plan

## Local-first decision

Phase 1 uses a vendor-neutral `DiagnosticSink` and bounded in-memory ring buffer. No diagnostic,
input trace, or replay is uploaded. A hosted service requires owner approval and an ADR covering
cost, privacy, source maps, offline behavior, release tagging, retention, access, deletion, and age
boundaries.

## Required breadcrumbs

- Build/commit/game/Rapier/physics/replay/content identity and quality tier.
- State transitions and lifecycle events.
- Recent quantized commands and aggregate raw-input metrics, not silent raw trace upload.
- Rapier init/self-test, asset/content, IndexedDB/migration, and service-worker failures.
- NaN/infinity, runaway velocity, joint explosion, bounds, soft lock, invalid objective state,
  duplicate terminal result, and replay divergence.
- WebGL context lost/restored, pointer cancel, resize/orientation, visibility, offline/online.
- Resource counts and before/after level-unload report.
- Release ID, asset-set hash, candidate install/verification/activation/recovery failure.
- Bounded frame/physics p50/p95/p99/max, long-task count/time, first meaningful interaction, draw
  calls, triangles, and explicit resource registries.

## Event structure

Every entry has deterministic category, severity, fixed-step index when applicable, stable
entity/level identifiers, short code, structured fields, and a monotonic sequence number. Wall time
is diagnostic metadata only and never enters replay or simulation.

The ring buffer is capped by entry count and exported only through an explicit QA action. Export
contains version identity, environment metadata, counters, transitions, failure classification, hash
checkpoints, and redacted command summaries. It excludes secrets and personal data.

## Physics-trust incident rule

Replay divergence, repeated invalid state, context loss during a run, or an ambiguous engine-caused
failure enters `PHYSICS_FAILURE_MODE_REGISTER.md`; it is not dismissed as an ordinary crash.
