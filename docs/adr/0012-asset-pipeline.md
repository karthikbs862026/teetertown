# ADR-0012: Asset Pipeline and Provenance

**Status:** Provisional pipeline, 2026-07-26

Source DCC files use meter scale and `VIS_`, `COL_`, `ANCHOR_`, `GOAL_`, `SPAWN_`, `DECOR_`
conventions. Scripted validation precedes GLB export, measured geometry compression and KTX2
conversion. Manifests include hashes, budgets, collider preview, creator/source/license, and
approval.

LOD, atlasing, Draco, or Meshopt is adopted only after representative decode/memory evidence.
