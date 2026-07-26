# Teetertown — First ChatGPT Work Execution Command (v2.1)

Begin the Teetertown project using `TEETERTOWN_MASTER_BUILD_PROMPT.md` as the complete governing specification and `TEETERTOWN_PERSISTENT_PROJECT_INSTRUCTION.md` as the compact always-on operating layer. Do not expect the persistent instruction to repeat the master prompt.

Your immediate objective is to complete the **Phase 0 pre-production foundation** and establish the **smallest credible Phase 1 graybox risk laboratory**. Do not attempt to build the full game, mass-produce levels, or add real monetization.

Operate as a skeptical senior game architect and producer. The output of this work cycle must be evidence, decisions, experiments, and a functioning risk-test foundation—not encouragement or a large unverified code dump.

## 0. Operating rules for this execution

Before changing files:

1. Inspect the connected repository, current branch, git status, recent commits, existing documentation, package manifest, lockfile, build scripts, and available assets.
2. Preserve unrelated and user-authored work.
3. Read `TEETERTOWN_MASTER_BUILD_PROMPT.md` in full if this is the first repository session.
4. Read `AGENTS.md`, `docs/PROJECT_STATE.md`, relevant ADRs, and pre-production documents if they already exist.
5. State the current phase, gate, objective, acceptance criteria, main physics-trust risks, and evidence plan.
6. Record non-blocking assumptions and continue. Do not ask broad questions that can be resolved provisionally through the master prompt.
7. Do not claim a test, visual review, browser result, or device result unless it was actually performed.

If the repository is empty, create an intentional branch such as:

```text
feat/teetertown-preproduction-foundation
```

Use small, reviewable commits. Do not deploy or publish production.

---

# A. Pre-production decision package

Create or substantially update the following documents. Do not fill them with generic template language; make Teetertown-specific decisions, risks, experiments, and thresholds.

## A1. Product and decision documents

Create:

- `docs/PRODUCT_VISION.md`
- `docs/GAME_DESIGN.md`
- `docs/PREPRODUCTION_DECISION_MATRIX.md`
- `docs/RISK_REGISTER.md`
- `docs/PROJECT_STATE.md`

The decision matrix must cover at least:

1. One-axis versus constrained two-axis versus full two-axis tilt.
2. Raw drag versus bounded virtual-track/joystick-style control.
3. Gravity-vector tilt versus kinematic support-root rotation.
4. Full dynamic physics versus constrained or deterministic assisted behavior.
5. Orthographic versus low-FOV perspective camera.
6. Fixed gameplay camera versus bounded event framing.
7. Direct Three.js versus React Three Fiber versus full ECS.
8. Modular monolith versus a more distributed architecture.
9. PWA/WebGL first versus early native wrapping.
10. Handcrafted levels versus semi-procedural candidate generation.
11. Restoration meta scope for the vertical slice.
12. Replay/share feature scope.
13. Monetization features that are safe, conditional, deferred, or prohibited.
14. Content cadence a two-to-three-person team can realistically support.
15. Art-direction originality, readability, performance, and production-cost trade-offs.

For each entry include:

- Teetertown-specific risk.
- Options.
- Physics-trust impact.
- Art/readability impact.
- Performance/memory impact.
- Content/team impact.
- Experiment.
- Metric and pass/fail threshold.
- Provisional decision.
- Confidence and revisit trigger.

## A2. Physics fairness documents

Create:

- `docs/PHYSICS_FAIRNESS_CONTRACT.md`
- `docs/PHYSICS_FAILURE_MODE_REGISTER.md`
- `docs/PHYSICS_AUTHORITY_MATRIX.md`
- `docs/CONTROL_CAMERA_EXPERIMENT_PLAN.md`

Seed the failure-mode register with concrete cases covering:

- Small input changes causing outcome bifurcation.
- Friction stick-slip.
- Sleeping/wake inconsistencies.
- Unintended stable states and wedging.
- Pileups and simultaneous contacts.
- Joint-limit instability.
- Tunnelling/high-speed contact.
- Fragile-object threshold noise.
- Collider/mesh/pivot/center-of-mass mismatch.
- Camera occlusion and off-camera chain reactions.
- Pointer cancellation, browser gesture interference, and input latency.
- Frame stalls, thermal throttling, background/resume, orientation, and context loss.
- Replay divergence across browser/device environments.
- Ambiguous failure followed by monetization.

Define a formal test for **good puzzle difficulty versus unfair physics difficulty**. Include the rule:

> If a representative player can explain the correct solution but cannot execute it within the intended human-sized input corridor, treat the issue as a defect until evidence proves it is deliberate mastery difficulty.

The physics-authority matrix must classify objects and behaviors as:

- Full dynamic physics.
- Constrained dynamic physics.
- Kinematic authored motion.
- Deterministic visible assist/state machine.
- Decorative presentation only.

## A3. Architecture and operations documents

Create:

- `docs/ARCHITECTURE.md`
- `docs/ARCHITECTURE_FITNESS_SCORECARD.md`
- `docs/PERFORMANCE_BUDGET.md`
- `docs/PROFILING_CADENCE.md`
- `docs/QA_STRATEGY.md`
- `docs/OBSERVABILITY_PLAN.md`
- `docs/CI_CD_PLAN.md`

Create ADRs for at least:

1. Direct Three.js versus React Three Fiber versus full ECS.
2. Modular-monolith architecture.
3. Authoritative simulation/Rapier/render/UI state boundaries.
4. Fixed timestep and render interpolation.
5. Rapier/WASM asynchronous bootstrap and exact-version pinning.
6. Gravity-vector versus kinematic-root tilt.
7. Input model and viewport normalization.
8. Camera model and separation of gameplay/replay cameras.
9. Physics-authority/assistance policy.
10. Replay, state hashes, content hashes, and compatibility policy.
11. Three.js scene ownership, resource scopes, pooling, and disposal.
12. Asset source/runtime pipeline, compression, provenance, and validation.
13. PWA lifecycle, service-worker update safety, and future wrapper adapters.
14. Persistence, save migrations, and corruption recovery.
15. Analytics, diagnostics, crash reporting, and privacy boundaries.
16. Admin/test environment separation from production.
17. CI/CD preview, staging, release, and rollback.

Do not merely list alternatives. Make provisional, opinionated decisions and identify what evidence could overturn them.

## A4. Art, content, team, and product documents

Create:

- `docs/ART_BIBLE.md`
- `docs/LOOK_DEV_SCORECARD.md`
- `docs/MECHANIC_SCORECARD.md`
- `docs/CONTENT_COST_MODEL.md`
- `docs/TEAM_OPERATING_MODEL.md`
- `docs/LIVEOPS_CAPACITY.md`
- `docs/PLAYER_RESEARCH_PLAN.md`
- `docs/ANALYTICS_TAXONOMY.md`
- `docs/ECONOMY_MONETIZATION.md`
- `docs/MONETIZATION_SAFETY_MATRIX.md`
- `docs/MONETIZATION_BENCHMARKS.md`
- `docs/AUDIO_HAPTICS.md`
- `docs/ACCESSIBILITY_COMFORT.md`
- `docs/LOCALIZATION_PLAN.md`
- `docs/PRIVACY_COMPLIANCE.md`
- `docs/MARKETABILITY_TEST_PLAN.md`

The art direction must use this original north star:

> A handcrafted kinetic storybook town using tactile wood, brass, ceramic, glass, paper, cloth, painted signs, warm miniature lighting, whimsical asymmetry, and restrained magical accents.

Define three distinct look-development treatments using the same market-stall composition. Do not create final production assets yet. Score each treatment on:

- Distinctiveness.
- Mobile readability.
- Physics/material readability.
- Performance.
- Production repeatability.
- Originality and rights confidence.
- Low-tier fallback.
- Emotional miniature-world storytelling.

The audio/accessibility/localization/privacy plans must cover:

- iOS Safari audio gesture gating without blocking or changing the first physics gesture.
- Material/contact audio, voice limiting, interruption, background/resume, and visual equivalents.
- Sensitivity/dead-zone options and unranked practice/slow mode where appropriate.
- Color-independent goal/danger cues, reduced motion/VFX, haptics off, and readable touch targets.
- Pseudolocalization, long strings, plurals/numbers, bidirectional layouts, and no critical text in textures.
- Data minimization, diagnostics consent, retention, deletion, age/consent boundaries, and future ad/analytics SDK review.

The team model must define ownership for:

- Game direction/product.
- Core engineering and Rapier.
- Level design and physics tuning.
- Technical art and asset integration.
- Art production.
- Audio.
- QA/release.
- Analytics/economy.
- Store/support/compliance.

One person may own several areas, but no critical area may be ownerless.

---

# B. Repository and engineering foundation

Unless existing repository evidence supports a better choice, use:

- TypeScript in strict mode.
- Vite.
- Direct imperative Three.js for gameplay rendering.
- Rapier 3D WASM pinned to an exact version.
- A lightweight DOM/React layer only for non-frame-critical UI.
- A modular monolith.
- No React Three Fiber in the physics-critical runtime.
- No full ECS in v1.
- Vitest or equivalent for unit/simulation tests.
- Playwright for browser, touch, lifecycle, smoke, and visual checks.
- IndexedDB behind a versioned storage adapter.
- One WebGL renderer and one gameplay canvas.

Create or validate this modular structure:

```text
/src
  /app
  /simulation
  /gameplay
  /rendering
  /input
  /camera
  /audio
  /meta
  /platform
  /ui
  /devtools
  /analytics
/content
  /levels
  /materials
  /economy
/assets-src
/public/assets
/scripts
/tests
  /unit
  /simulation
  /e2e
  /visual
  /performance
  /fixtures
/docs
  /adr
  /audits
  /playtests
  /performance
```

Add:

- Strict type checking.
- Linting and formatting.
- Dependency-boundary and circular-dependency checks.
- Reproducible lockfile.
- Build/test scripts.
- Asset/content schema validation.
- CI skeleton.
- Preview/staging build configuration where available.
- Concise README.
- `AGENTS.md` containing the non-negotiable rules from the master prompt.

The deterministic simulation layer must not import Three.js, React, DOM APIs, analytics, advertising, IAP, storage, or platform APIs.

---

# C. Authoritative state and bootstrap foundation

Implement the minimum architecture needed to prove correct ownership:

1. Capability check.
2. Rapier/WASM asynchronous initialization.
3. Tiny deterministic bootstrap-world self-test in development/test builds.
4. Validated configuration/content load.
5. Minimum asset load.
6. Simulation-world creation.
7. Renderer/view binding.
8. Ready state.

Create explicit typed states for at least:

- Boot.
- Capability check.
- Loading.
- Ready.
- Playing.
- Paused.
- Success.
- Failure.
- Rewinding.
- Context lost.
- Recovering.
- Fatal error.

Implement the source-of-truth contract:

- Simulation/session owns objectives, scoring, fixed-step timers, actions, success/failure, and replay rules.
- Rapier owns physical transforms, velocity, contacts, sleep, and joints at fixed steps.
- Input is converted into normalized, quantized fixed-step commands.
- Rendering reads previous/current snapshots and interpolates presentation only.
- UI/meta cannot mutate active physics directly.

Prevent mesh/body double authority. Do not accept gameplay input until the Rapier world and simulation are ready.

---

# D. Phase 1 graybox risk laboratory

Build only two graybox scenes.

## D1. Clean tutorial scene

Include:

- Two connected see-saw platforms.
- One apple.
- One basket goal.
- One fragile glass bottle.
- One visible hinge and anchor relationship.
- Clear bounds.
- A fixed/simple camera.
- Clear success and failure states.
- Reset, pause, resume, and retry.

The intended first realization is:

> “I am moving the world, not the apple.”

Do not add final art, restoration UI, ads, currencies, or unrelated content.

## D2. Adversarial physics laboratory

Create isolated test cases for:

- Edge contact.
- Wedge/trap state.
- Pileup.
- Simultaneous contacts.
- Sleep/wake after tilt.
- High-speed/tunnelling.
- Joint-limit reversal.
- Fragile-object low, medium, and high impulse.
- Small collider/mesh mismatch demonstration.
- Goal capture at slow and high speed.
- Out-of-bounds and soft-lock detection.

The laboratory is not player content. It exists to break the engine and expose unfair outcomes before levels are produced.

---

# E. Required comparative experiments

Implement thin, switchable prototypes and measure them rather than assuming the winner.

## E1. Input models

Compare:

1. One-axis raw drag.
2. Constrained two-axis raw drag.
3. One-axis bounded virtual track/joystick.
4. Constrained two-axis bounded virtual track/joystick.

Measure:

- Comprehension.
- Event-to-fixed-step latency.
- Thumb travel.
- Overshoot.
- Reversal count.
- Pointer cancellation.
- Viewport/orientation normalization.
- Left/right-hand usability.
- First-attempt success.
- Ability to reproduce a known successful move.

OrbitControls must not run on the gameplay surface.

## E2. Tilt implementation

Compare:

1. Rotating effective gravity with a bounded visual root tilt.
2. Kinematic rotation of the support structure with fixed gravity.

Measure:

- Joint stability.
- Contact quality.
- Replay consistency.
- CPU cost.
- Authoring complexity.
- Sudden-reversal behavior.
- Art/collider alignment.
- Player predictability.

## E3. Physics authority and assistance

Choose one risky interaction, such as basket capture or a guided hinge latch, and compare:

1. Raw full physics.
2. Visibly constrained physics.
3. Bounded deterministic assist with an obvious physical affordance.

Measure:

- Human-sized success corridor.
- Readability.
- High-speed edge cases.
- Perceived fairness.
- Replay determinism.
- Content-tuning cost.

Do not use invisible rescue forces.

## E4. Camera

Compare:

1. Orthographic fixed camera.
2. Low-FOV perspective fixed camera.
3. Bounded event framing that moves only between precision-control moments.

Measure:

- Goal/risk visibility.
- Depth judgment.
- Occlusion.
- Drag-direction stability.
- Motion comfort.
- Chain-reaction readability.
- Replay/share framing.

Gameplay and replay cameras must be separate policies.

---

# F. Determinism, replay, rewind, and fairness tests

Implement an initial replay contract containing:

- Build and commit hash.
- Game version.
- Rapier version.
- Physics version/configuration hash.
- Replay schema version.
- Level ID and content hash.
- Asset manifest version where relevant.
- Deterministic seed.
- Ordered fixed-step input commands.
- Periodic state hashes.
- Final success/failure result and failure classification.
- Browser/device metadata for diagnostics only.

Create:

- One golden completion replay.
- One expected failure replay.
- One recovery or rewind replay if rewind scaffolding is implemented.
- Replay divergence detection.
- A fixed-step input recorder and playback runner.
- A small ring buffer suitable for a future three-second rewind.
- A state-hash comparison report.

Implement a first robustness test that perturbs the golden input by small timing and magnitude variations. The tutorial solution must not require pixel-perfect or frame-perfect input.

Test:

- Same-build repeated replay.
- Different render frame rates with the same fixed simulation inputs.
- Chromium, WebKit, and Firefox where available.
- Representative viewport sizes.
- Real Android and iOS Safari when devices are available.

Do not use `Math.random`, `Date.now`, asynchronous asset completion order, render delta, or unordered collection iteration for simulation decisions.

---

# G. Physics fairness implementation

Implement or document:

- Consistent world units.
- Central physics-material profiles.
- Stable IDs and deterministic creation order.
- Simple validated colliders.
- Visible pivots and anchors.
- Stable fragility based on impulse/relative velocity/acceleration with tolerance.
- Bounds, runaway velocity, NaN, infinity, and joint-explosion assertions.
- Soft-lock detection.
- Failure classification.
- No hidden monetization-dependent assistance.
- Fixed timestep with capped catch-up.
- Render interpolation only.
- CCD only for demonstrated cases.
- Sleep/wake verification during world tilt.

Every observed failure must be assigned to one of:

- Player-understandable gameplay failure.
- Input/control defect.
- Camera/readability defect.
- Art/collider/center-of-mass defect.
- Level-design defect.
- Physics instability.
- Lifecycle/performance/device defect.
- Invalid state or script/content error.

Invalid, engine-caused, or ambiguous failures must not be treated as player error.

---

# H. Three.js lifecycle, memory, and asset foundation

Implement:

- One gameplay renderer and canvas.
- A predictable diorama scene structure.
- `LevelResourceScope` ownership for geometry, materials, textures, render targets, audio, physics world objects, listeners, timers, workers, and subscriptions.
- Explicit level unload.
- Resource-count before/after report.
- Reusable temporary vectors/quaternions.
- No unbounded per-frame allocation after warm-up.
- Pooling only for a small demonstrably reusable asset/effect set.
- WebGL context-lost/restored handling.
- Background/foreground and orientation handling.

Create a minimal asset-pipeline skeleton that can validate:

- Scale.
- Names.
- Pivots.
- Collision proxies.
- Joint anchors.
- UVs/material slots.
- Triangles.
- Texture dimensions and decoded-memory estimates.
- Hashes and provenance.

Document the intended Blender/DCC to GLB to optimization to KTX2/geometry-compression to manifest pipeline. Do not add unnecessary LOD or atlasing before measuring a benefit.

---

# I. Admin, debug, and diagnostic laboratory

Create an internal-only development route/build that cannot leak into the public production bundle.

It must provide, at minimum:

- Level/test-case selection.
- Seed selection.
- Pause, single-step, slow motion, reset, and restart.
- Collider and joint overlays.
- Contact points and normals.
- Impulses.
- Center of mass.
- Velocity and angular velocity.
- Sleep state and wake reason where available.
- Collision groups.
- Physics-authority tags.
- Goal/failure zones.
- Raw pointer samples.
- Quantized command stream.
- Event-to-step latency.
- Target versus actual tilt.
- Acceleration and jerk.
- Build, content, physics, and replay versions.
- Replay record/load/play/compare.
- State-hash divergence display.
- Body, collider, joint, contact, draw-call, triangle, texture, geometry, frame-time, and physics-time counters.
- Quality-tier selector.
- Resource-count baseline and level-unload report.
- Force success/failure.
- Skip/complete level and unlock progression.
- Set test economy/progression values.
- Teleport or reset a selected object.
- Structured log timeline.
- Exportable diagnostic bundle.

Add fault injection for at least:

- Pointer cancellation.
- Visibility/background change.
- Orientation/resize.
- Failed/delayed asset.
- Offline mode.
- Storage failure or quota condition where testable.
- Corrupt content/save fixture.
- WebGL context loss where testable.
- Duplicate callback placeholder for future platform adapters.

---

# J. Art-direction foundation and visual QA

Do not create final production art.

Create the art bible and three look-development directions around the same market-stall graybox. Define:

- Visual hierarchy.
- Silhouette rules.
- Material language.
- Lighting philosophy.
- Goal, hinge, risk, and fragile-object readability.
- Mass and friction cues.
- Collider/art integrity.
- Camera composition.
- Low-tier fallback.
- Mobile safe areas.
- Originality and asset-rights rules.
- Acceptance criteria for graybox, look-dev, production candidate, and approved final.

If the build contains visible graybox geometry, capture screenshots at representative phone sizes. Also capture collider/joint overlay versions. Clearly label all visuals as graybox.

Do not infer visual quality from source code.

---

# K. QA, profiling, observability, and CI/CD

## K1. Automated checks

Create initial tests for:

- Boot and Rapier initialization.
- Fixed-step clock.
- Input normalization and quantization.
- Tilt limits and response.
- Level load.
- Success.
- Clear failure.
- Restart/reset.
- Pause/resume.
- Background/foreground behavior.
- Replay record/playback.
- State-hash divergence.
- Golden completion.
- Golden failure.
- Robustness perturbation.
- Save/load skeleton.
- Level unload/resource baseline.
- Supported viewport layouts.
- Content-schema validation.

Run Playwright smoke tests in Chromium, WebKit, and Firefox where available.

## K2. Initial budgets and reports

Report:

- Draw calls.
- Triangles.
- Texture count and decoded-memory estimate.
- Geometry/material counts.
- Active and awake bodies.
- Colliders.
- Joints.
- Contact pairs.
- Physics p50/p95 where feasible.
- Frame-time p50/p95 where feasible.
- Bundle size.
- First-level compressed asset size.
- Level load/unload resource delta.

Use the master prompt’s budgets as provisional thresholds. Do not claim real-device performance from desktop results.

## K3. Crash and diagnostic scaffolding

Implement a vendor-neutral local adapter and bounded ring buffer for:

- Window errors.
- Unhandled promise rejections.
- WebGL context lost/restored.
- WASM initialization failure.
- Physics anomalies.
- Replay divergence.
- Asset/load/decode errors.
- Storage and save errors.
- Lifecycle events.

Tag diagnostics with build, commit, physics, replay, level/content, browser/device, and quality-tier information.

## K4. CI/CD skeleton

Create a practical small-team pipeline:

- Local/pre-commit fast checks.
- Pull-request build, unit/simulation/replay tests, budgets, assets, visual checks, and preview artifact.
- Main-to-staging immutable build.
- Staging smoke and replay checks.
- Manual release approval boundary.
- Known-good artifact retention and rollback documentation.

Do not integrate paid CI, analytics, crash, ad, or IAP services without owner approval.

---

# L. Product-loop, retention, virality, monetization, and capacity analysis

Do not implement the full meta-game. Create evidence-driven specifications for:

## L1. Session and retention loop

Define:

- First 60 seconds.
- One-session loop.
- Day-2 hook.
- Day-7 district milestone.
- Day-30 mastery/identity loop.
- Primary content-driven retention.
- Secondary mastery retention.
- Tertiary collection/identity retention.
- Natural session boundaries without energy.

## L2. Virality

Specify:

- Highlight-event detector.
- Near-miss definition.
- Post-run replay camera.
- Six-to-ten-second clip pipeline.
- Still/share-card fallback.
- Challenge code and future ghost trace.
- Metrics proving shared clips communicate the real mechanic.

Do not fake gameplay or alter replay physics for a clip.

## L3. Monetization safety

Classify:

- Allowed.
- Conditional/high risk.
- Deferred.
- Prohibited.

Explicitly prohibit:

- Extra tilt.
- Stronger magnetism/friction/stability for payers.
- Lower break thresholds or better solver quality.
- Paid rescue after engine-caused or ambiguous failure.
- Ranked advantage.
- Interstitial after short/unclear failure.

Create the structure for a low/base/high monetization model covering retention, ARPDAU/D90 RPI assumptions, rewarded opt-in, ad fill/eCPM, payer conversion/ARPPU, geography, store fees, CPI, content cost, QA cost, and live-operations capacity.

If web research is available, produce a dated current benchmark snapshot using credible, clearly defined sources. Distinguish ARPDAU, ARPU, ARPPU, revenue per install, platform, geography, genre, cohort window, and IAA versus IAP populations. Do not add incompatible metrics or present category benchmarks as a Teetertown forecast. If current external research cannot be completed, leave the values explicitly unverified rather than inventing them.

## L4. Content and team scalability

Define how effort will be measured for:

- Graybox design.
- Physics tuning.
- Golden replay creation.
- Robustness testing.
- Art and collision integration.
- Audio/VFX.
- Performance remediation.
- QA/regression.
- Localization and analytics.
- Release packaging.

Define hiring/contractor triggers instead of assuming a small team can sustain unlimited content.

---

# M. Required final report

At the end of this execution, provide:

1. **Current phase and gate.**
2. **Pre-production questions answered, provisional, blocked, or rejected.**
3. **Direct foundation recommendation: GO, ITERATE, HOLD, or STOP.**
4. **Repository and branch status.**
5. **Architecture decisions and rejected options.**
6. **Physics authority and fairness decisions.**
7. **Files created or changed.**
8. **Implementation summary.**
9. **Exact commands and exact pass/fail results.**
10. **Replay and state-hash evidence.**
11. **Good-difficulty versus unfair-difficulty evidence.**
12. **Browser/device evidence, separating automated browsers, emulation, and physical devices.**
13. **Input-latency, performance, memory, and resource-lifecycle evidence.**
14. **Actual screenshots of the graybox at representative phone dimensions, plus collider/joint overlay screenshots.**
15. **Art-direction and art–physics findings.**
16. **Content-cost and team-capacity implications.**
17. **Retention, virality, monetization-safety, privacy, and marketability findings.**
18. **Risks introduced, reduced, or open.**
19. **Anything not verified.**
20. **Next highest-priority action.**

Update `docs/PROJECT_STATE.md` and all affected decision, risk, failure, cost, and test documents before finishing.

---

# Explicitly out of scope for this execution

Do not implement:

- Final production art.
- More than the clean tutorial graybox and adversarial laboratory.
- Mass level production.
- Real advertising SDKs.
- Real IAP.
- Energy.
- Premium currency.
- Battle pass.
- Subscription.
- Authentication.
- Cloud save.
- Public leaderboard.
- Large backend.
- Public UGC editor.
- Production deployment or store submission.

The purpose of this execution is to prove that Teetertown can convert correct player intent into reliable, readable physical outcomes and that its architecture, art pipeline, QA system, content model, and small-team operating plan are credible enough to continue.
