# ADR-0001: Direct Three.js Runtime

**Status:** Accepted, 2026-07-26

Direct imperative Three.js owns the single renderer/canvas. Plain DOM owns non-frame-critical UI.
React Three Fiber was rejected because reconciler/frame ownership adds risk around deterministic
physics synchronization and lifecycle without a demonstrated benefit for this two-scene spike. A
full ECS was rejected because v1 scale does not justify its indirection and team cost.

Revisit only if measured authoring/maintenance evidence shows a concrete deficiency while headless
simulation, allocation, replay, and lifecycle fitness functions remain intact.
