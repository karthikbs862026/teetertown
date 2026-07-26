# Teetertown Prompt Pack v2.1 — Pre-Production Enhancement Change Log

This change log maps the Pre-Production Deep Dive requirements into the revised master prompt, persistent project instruction, and first ChatGPT Work execution command.

## 0. v2.1 platform-limit correction: compact persistent instruction

**Changed**

- Reduced `TEETERTOWN_PERSISTENT_PROJECT_INSTRUCTION.md` from 14,493 characters to **6,473 Unicode characters (6,503 UTF-8 bytes)**.
- Preserved the non-negotiable Physics Trust Promise, source precedence, architecture boundaries, deterministic replay rules, art–physics requirements, performance/memory discipline, monetization firewall, approval boundaries, and end-of-cycle evidence report.
- Removed duplicated deep-detail policy from the persistent field and retained it in `TEETERTOWN_MASTER_BUILD_PROMPT.md`, which remains the full source of truth.
- Added an explicit prompt-pack installation/context rule to the master prompt.
- Updated the first execution command to treat the persistent instruction as a compact always-on layer rather than a duplicate master specification.
- Established a preferred persistent-instruction ceiling below 7,000 characters; this version leaves more than 1,500 characters of headroom below the 8,000-character platform limit.

**Why**

ChatGPT Work rejects project instructions above 8,000 characters. Keeping detailed policy in the repository master prompt and concise invariant behavior in project instructions avoids losing important controls while respecting the product limit.

**Files updated**

- `TEETERTOWN_MASTER_BUILD_PROMPT.md`
- `TEETERTOWN_PERSISTENT_PROJECT_INSTRUCTION.md`
- `TEETERTOWN_FIRST_CHATGPT_WORK_EXECUTION_COMMAND.md`
- `TEETERTOWN_PREPRODUCTION_ENHANCEMENT_CHANGELOG.md`

## 1. Skeptical pre-production operating mode

**Added**

- A formal pre-production decision state: decided, provisional experiment, blocked, or rejected.
- Evidence hierarchy from real-device proof down to design reasoning.
- Mandatory red-team question for every mechanic, camera, control, art, monetization, and optimization change.
- `PREPRODUCTION_DECISION_MATRIX.md` as a persistent project artifact.
- GO / ITERATE / HOLD / STOP gate recommendations instead of generic completion claims.

**Why**

The deep dive asks for a real greenlight review by a skeptical architect and producer, not generic encouragement.

**Files updated**

- `TEETERTOWN_MASTER_BUILD_PROMPT.md`
- `TEETERTOWN_PERSISTENT_PROJECT_INSTRUCTION.md`
- `TEETERTOWN_FIRST_CHATGPT_WORK_EXECUTION_COMMAND.md`

## 2. Formal tilt-only failure-mode register

**Added**

- Concrete failure taxonomy for input, simulation, level content, device/lifecycle, feedback, and monetization.
- Specific cases: stick-slip, sleep/wake errors, unintended stable states, pileups, contact ordering, joint limits, tunnelling, fragile-threshold noise, camera occlusion, pointer cancellation, thermal/lifecycle divergence, and ambiguous failure.
- Stable incident IDs, replay/input evidence, device/browser metadata, severity, mitigation, owner, and regression test.
- `PHYSICS_FAILURE_MODE_REGISTER.md` as a first-class project document.

**Why**

The deep dive explicitly asks for concrete failure modes of the tilt-only control model rather than a generic statement that physics can be unpredictable.

## 3. “Good puzzle difficulty” versus “unfair physics” test

**Added**

- A side-by-side diagnostic framework distinguishing reasoning/skill difficulty from unstable execution difficulty.
- Seven-part Physics Trust Review for every level.
- Rule that a player who understands the solution but cannot execute it triggers a defect investigation.
- Required failure attribution during human playtests and analytics review.

**Why**

This makes the central Physics Trust Promise operational and testable rather than aspirational.

## 4. Full physics versus constrained/scripted-feeling physics policy

**Added**

- A Physics Authority Matrix with five types:
  - Full dynamic physics.
  - Constrained dynamic physics.
  - Kinematic authored motion.
  - Deterministic visible assist/state machine.
  - Decorative presentation only.
- Required authority tags in content and dev tools.
- Explicit policy that full rigid-body simulation is used only when it creates readable player decisions.
- Bounded-assistance requirements: visible affordance, replay/version inclusion, debug overlays, threshold tests, and evidence that raw physics was less fair.

**Why**

The deep dive asks where Rapier should be authoritative and where constrained or assisted behavior is safer for a puzzle game.

## 5. Physics-complexity ceiling and diminishing-return triggers

**Added**

- Provisional limits on simultaneously active secondary mechanics and critical dynamic objects.
- Rule to introduce one new systemic mechanic at a time.
- Diminishing-return triggers based on ambiguous-failure rate, perturbation success, camera readability, cross-device divergence, and tuning cost.
- Mechanic candidate scorecard covering novelty, trust, testability, content yield, performance, art synergy, and small-team cost.

**Why**

This directly addresses when “more physics” stops creating depth and starts creating noise.

## 6. Expanded mechanical-depth roadmap

**Added or clarified**

- Counterweight routing.
- Stateful surfaces.
- Goal-triggered topology.
- Contradictory deliveries.
- Timed visible material changes.
- Visible wind systems.
- Magnetic rails and fields.
- Gear-linked platforms.
- Clutch-selected sub-platforms.
- Multi-layer dioramas with one active layer at a time.
- Explicit high-risk classification for free liquids, deformables, large domino fields, and several independent tilt layers.

**Why**

The deep dive asks for at least five novel secondary mechanics while protecting fairness and scope.

## 7. Cross-device determinism and future ranked verification

**Added**

- Critical replay suite across Android/Chrome, iOS/Safari, and desktop environments at phase gates.
- Fixed policy for pinned WASM/physics versions, construction order, content hashes, command quantization, and state hashes.
- Separate verified and unverified ranked runs.
- No cross-version score comparison.
- Server re-simulation only if a matching authoritative build is operationally feasible.

**Why**

The deep dive asks how device timing and floating-point differences could change outcomes and how this should be handled.

## 8. Day-2, Day-7, and Day-30 retention architecture

**Added**

- Specific hypotheses for returning on Day 2, district progress and weekly contracts on Day 7, and identity/mastery/town history on Day 30.
- Initial natural-session hypothesis without an energy system.
- Clear primary, secondary, and tertiary retention hierarchy.

**Why**

The original prompt had a persistent loop, but the deep dive requested explicit day-based return reasons.

## 9. Stronger virality and replay design

**Added**

- Deterministic highlight detector for near misses, recoveries, elegant solutions, high-impulse survival, and chain reactions.
- Separate replay-camera director.
- Post-run slow motion only, unless a deterministic taught mechanic explicitly uses it.
- Share-card fallback and metrics proving clips communicate the real mechanic.
- Prohibition on fake or staged gameplay in acquisition creative.

**Why**

The deep dive asks how natural “watch this save” moments can be deliberately surfaced.

## 10. Monetization safety matrix and firewall

**Added**

- Allowed, conditional, deferred, and prohibited monetization classifications.
- Explicit prohibition on paid extra tilt, stronger friction/magnetism, lower break thresholds, better solver quality, and paid rescue after ambiguous failures.
- Unlimited free restart baseline.
- Monetization firewall test proving payer/ad/config state cannot alter physics or replay hashes.
- Low/base/high model requirements for global and Tier-1 scenarios, D90 revenue, CPI, content cost, and live-ops cost.

**Why**

The deep dive asks where monetization must not interfere with the Physics Trust Promise and requests realistic floor/ceiling modeling.

## 11. Content-cost and small-team capacity tracking

**Added**

- `CONTENT_COST_MODEL.md` with design, physics tuning, replay, robustness, art, performance, QA, localization, and release effort.
- `TEAM_OPERATING_MODEL.md` with explicit role ownership and no ownerless critical functions.
- Hiring/contractor triggers based on engineering time spent hand-tuning levels, median production cost, QA backlog, art throughput, and live-ops capacity.
- “Reskin-cheap” treated as a hypothesis to prove rather than an assumption.

**Why**

The deep dive questions whether dioramas will truly scale cheaply once physics tuning and QA are included.

## 12. Authoritative-state and architecture-fitness contract

**Added**

- Explicit sources of truth for simulation/session, Rapier, input, rendering, and UI/meta state.
- Previous/current fixed-step transform snapshots and presentation-only interpolation.
- Release-blocking treatment of mesh/body double authority and render-delta game rules.
- Architecture fitness scorecard measuring determinism, unload cleanliness, dependency boundaries, feature extension cost, allocation behavior, build size, and testability.

**Why**

The deep dive asks how game, physics, and render state remain synchronized without drift as the game grows.

## 13. Rapier bootstrap and synchronization rules

**Added**

- One explicit asynchronous WASM bootstrap service.
- Tiny deterministic boot-world self-test.
- No gameplay before physics readiness.
- Deterministic contact-event ordering where game rules depend on it.
- Transform snapshot/interpolation contract.
- Cross-device replay verification and assisted-physics threshold tests.

**Why**

This addresses async initialization, stepping, render desynchronization, and deterministic replay in a concrete way.

## 14. Three.js diorama lifecycle and iOS memory discipline

**Added**

- Standard diorama scene structure.
- Per-level `LevelResourceScope` owning Three.js, Rapier, audio, timers, listeners, and decoded assets.
- Pooling only with a complete reset contract.
- Resource-pressure sentinel and explicit treatment of `webglcontextlost` as critical evidence.
- Repeated load/unload reports rather than relying on incomplete browser memory APIs.

**Why**

The deep dive calls out iOS Safari memory spikes and the need for strict scene loading/unloading and disposal discipline.

## 15. Explicit touch-control experiments

**Added**

- Raw drag, anchored virtual track, and absolute neutral-origin comparisons.
- OrbitControls prohibited on the gameplay surface.
- Viewport normalization, motor accessibility, one-handed reach, and repeatability measurements.
- Provisional real-device event-to-simulation latency targets.

**Why**

The deep dive asks for a specific touch implementation decision and protection against input-reading failure.

## 16. Gameplay-camera versus replay-camera policy

**Added**

- Fixed camera versus bounded event-framing experiment.
- Separate policies for live gameplay and post-run cinematic replay.
- No camera movement that changes drag meaning or hides causality.

**Why**

The deep dive asks how the camera should handle small dioramas and chain reactions while also supporting shareable clips.

## 17. Automated asset-pipeline chain

**Added**

- DCC source validation, scripted GLB export, reproducible optimization, KTX2 conversion, measured Meshopt/Draco choice, optional LOD/atlas generation, manifest, collider preview, provenance, and CI gate.
- Explicit warning that atlases and LODs can increase memory or authoring cost in compact dioramas.

**Why**

The deep dive requests an automated, scriptable path rather than manual per-asset optimization.

## 18. Browser profiling cadence

**Added**

- PR-level automated counters and budget reports.
- Nightly replay, soak, memory, and performance trends.
- Weekly Chrome and iOS Safari profiling workflows.
- Phase-gate and release real-device cold/warm start, thermal, lifecycle, and worst-case tests.
- Build-hash-based storage of traces and summaries.

**Why**

The deep dive asks not only what to profile, but when.

## 19. Practical QA cadence and smoke suite

**Added**

- Local/pre-commit, pull-request, staging, nightly, and pre-release test tiers.
- Golden replay impact rules.
- Full level-solvability and robustness reports.
- Real-device lifecycle, storage, context-loss, rollback, and monetization-safety checks.

**Why**

The deep dive asks for a concrete setup appropriate to a small team rather than enterprise over-engineering.

## 20. Crash reporting and structured diagnostics

**Added**

- Vendor-neutral diagnostic adapter and local bounded ring buffer.
- Error capture for JS errors, unhandled promises, context loss, WASM init, physics anomalies, replay divergence, asset failure, storage/migration failure, and lifecycle events.
- Diagnostic bundle with build, browser/device, level/content/physics versions, state transitions, input summaries, and resource counts.
- Raw replay/input upload prohibited without explicit policy and consent.

**Why**

The deep dive explicitly requests crash/error reporting for WebGL/mobile web and context-loss incidents.

## 21. Small-team CI/CD and rollback

**Added**

- Feature branch and preview artifact.
- PR build/test/budget/visual gates.
- Immutable staging build tagged with code/content/physics versions.
- Manual release approval.
- Known-good artifact retention and tested rollback covering code, content, service worker, and configuration together.

**Why**

The deep dive asks for a realistic minimal build–smoke–staging pipeline.

## 22. Repository and binary/content versioning

**Added**

- One canonically formatted file per level.
- Stable IDs and deterministic ordering.
- Schema and hash generation in CI.
- Git LFS or equivalent for source binaries.
- Separation of source assets, generated assets, and deployed content packs.
- Content/asset versions embedded in replays and staging builds.

**Why**

This reduces merge conflicts and protects replay compatibility as non-programmers author levels.

## 23. Additional pre-production categories

**Added**

- Player research and difficulty calibration.
- Honest acquisition creative and marketability testing.
- Team bus factor and external-contributor pipeline.
- Remote-configuration governance and kill switches.
- Support and incident response.
- Store, brand, age-rating, and platform readiness.
- Competitive integrity and lightweight anti-cheat.
- Build reproducibility, backups, and disaster recovery.

**Why**

These are material greenlight risks not fully captured by design and architecture alone.

## 24. Stronger art-direction validation

**Added**

- Three look-development treatments using the same graybox scene.
- Scoring for distinctiveness, physics readability, mobile performance, production repeatability, low-tier fallback, emotional storytelling, originality, and rights.
- Innovation directed toward kinetic architecture, tactile materials, and readable motion rather than expensive effects.

**Why**

This strengthens the requirement that Teetertown be visually original and beautiful without sacrificing physics clarity or mobile performance.

## 25. Expanded Phase 0, Phase 1, and report gates

**Added**

- Phase 0 now produces the decision matrix, failure register, authority matrix, architecture-fitness scorecard, player-research plan, content-cost model, team model, observability plan, profiling cadence, monetization-safety matrix, marketability plan, and CI/CD plan.
- Phase 1 now includes a clean tutorial and a separate adversarial physics laboratory.
- Required comparisons now include raw versus bounded input, full versus constrained physics, and camera choices.
- Phase gates now require input latency, resource unload, failure classification, and correct-strategy executability evidence.
- End-of-cycle reporting now requires a direct GO / ITERATE / HOLD / STOP recommendation.

**Why**

This converts the pre-production questions into specific work products and decision gates rather than leaving them as discussion topics.
