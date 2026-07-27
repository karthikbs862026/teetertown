# Teetertown Repository Rules

Read `TEETERTOWN_MASTER_BUILD_PROMPT.md`, `docs/PROJECT_STATE.md`, relevant ADRs, the decision
matrix, and the physics failure/authority registers before material work.

## Non-negotiable

- Protect the Physics Trust Promise: a correctly understood move must remain repeatably executable
  within its intended human input corridor.
- Use strict TypeScript, direct Three.js, pinned Rapier 3D WASM, one renderer, a modular monolith,
  fixed simulation steps, quantized commands, stable IDs/order, state hashes, and versioned content.
- Simulation owns rules, objectives, results, and replay. Rapier owns physical state at fixed steps.
  Rendering interpolates snapshots only. DOM/meta code never mutates an active physics step.
- Never drive gameplay from render delta, wall clock, `Math.random`, load order, unordered
  iteration, asynchronous asset completion, or Three.js transforms.
- Every entity declares one authority: `dynamic`, `constrained`, `kinematic`, `assist`, or
  `decorative`. Assistance must be bounded, deterministic, visible, debug-visible, versioned, and
  universal.
- One gameplay Pointer Events owner; no OrbitControls. Gameplay and replay cameras are separate.
- Every level owns a disposable resource scope. Removing a mesh is not disposal. Physics accuracy
  may not be reduced to improve rendering FPS.
- A reproducible bug must leave a test, replay, visual baseline, or documented device case.
- Admin/debug capabilities must be absent from the production bundle.
- Do not add final art, mass content, paid services, real ads/IAP/analytics/identity/social SDKs,
  energy, a backend, public rankings, or production deployment in Phase 0/1.

## Work-cycle evidence

Before implementation, record phase/gate, objective, acceptance criteria, affected authority
boundaries, risks, evidence plan, and stop condition. At cycle end, update project state and
affected decisions, risks, failures, and evidence. Distinguish automated desktop browsers, device
emulation, and physical devices. Never claim validation that was not performed.
