# Project State

**Updated:** 2026-07-27 UTC

**Phase:** Phase 0 complete; Phase 1 graybox automated engineering closure

**Gate:** Gate 1 re-evaluated — **ITERATE**

**Branch:** `feat/teetertown-preproduction-foundation`

## Objective and acceptance

This cycle closes the locally executable Gate-1 engineering gaps without changing Rapier `0.19.3`,
content, the player-facing control promise, or frozen golden/failure outcomes.

Acceptance required:

- canonical contact ordering and explicit changed-command wake behavior with frozen Node/browser
  summaries;
- dedicated CCD control/treatment and 480-step joint-reversal probes in Node and every CI browser;
- verified offline Rapier boot and atomic whole-release service-worker updates that fail closed on
  HTTP, digest, or manifest-identity faults;
- bounded frame/physics samples, first-interaction, draw/triangle, DOM, explicit resource, heap,
  repeated-transition, and long-soak evidence;
- unchanged bootstrap/golden/failure/content hashes, passing production budgets, and no lab leak;
- physical-device/player gaps kept explicit.

## Last verified

- Strict TypeScript, Vite, direct Three.js, exact `@dimforge/rapier3d-compat@0.19.3` for Node, and
  exact `@dimforge/rapier3d@0.19.3` for the browser build install from the lockfile.
- ADR-0018 emits browser Rapier as a same-origin WASM asset. Replay schema 2 records
  `compat-embedded-node` or `modular-wasm-browser`.
- Tutorial content remains hash `5aac8b9a`; adversarial lab `1e4655f2`; materials `05d66915`.
- Rapier bootstrap remains `74e1d58f` in Node, actual local Chromium, and every GitHub browser
  project.
- The command-from-step-one constrained golden remains success at step 278/hash `c965c01f` in Node
  and every Chromium, Firefox, WebKit, Pixel 7 emulation, and iPhone 13 emulation CI project.
- Raw capture remains `object_out_of_bounds` at step 264/hash `e18433eb`.
- Ten traces across ±5% magnitude and a one-step activation delay remain 10/10 successful.
- Identical headless runs match periodic/final replay hashes; a perturbed command is detected.
- Fifty headless simulation cycles retain exact `11/11/2` body/collider/joint topology.
- Physics policy is `phase1-physics-2`, configuration hash `53cfb827`, under ADR-0019. The exact
  probe set is pileup/contact `0fe7d31e`, sleep/wake `b3c1c78a`, CCD `dd85d291`, and joint reversal
  `b033984b`.
- Production JavaScript is 173.4 KiB gzip; separate WASM is 572.6 KiB gzip; total budget output is
  1.35 MiB gzip. The gzip gates pass.
- Production lab-leak audit excludes adversarial content, controls, diagnostics markers, and the
  browser parity API.
- Built-preview actual Chromium and Pixel 7 emulation: 23 passed, 3 viewport-intentional skips.
- Chromium cases include sustained-drag capture, exact browser/headless parity, paused restart,
  pointer cancel/lost capture, WebGL loss/restore with a frozen fixed-step counter, 20 scene
  transitions with one canvas/stable registries, and all three camera variants.
- GitHub Actions run
  [`30249144668`](https://github.com/karthikbs862026/teetertown/actions/runs/30249144668) on commit
  `f98c286` passed every required job: Firefox 11 passed/1 viewport skip; Chromium and Pixel 7
  emulation 21 passed/3 viewport skips; WebKit and iPhone 13 emulation 21 passed/3 viewport skips;
  static/simulation/production checks passed.
- Headed Firefox under Xvfb/software WebGL passes renderer boot and context loss/restore. The
  browser matrix uses each engine's actual pointer ID; hardcoding pointer ID `1` was rejected as a
  non-portable test assumption.
- Automated-closure Actions run
  [`30260447230`](https://github.com/karthikbs862026/teetertown/actions/runs/30260447230) on
  published head `12c53a8` passes static 15/31, Firefox 12/1, Chromium 23/3, WebKit 23/3, atomic PWA
  1/1, and a non-retrying 30-second performance profile. That profile records 100 transitions,
  −0.29% final/+0.75% maximum heap drift, exact resources, FMI 291.7 ms, steady-frame p95 33.3 ms,
  and physics p95 0.5 ms.
- Five screenshots were visually inspected. Current tutorial/goal/causal geometry is visible on
  desktop and narrow Pixel emulation; perspective, bounded-event, and adversarial compositions are
  reviewable.
- Generated schema-2 release manifests bind JavaScript and Rapier WASM to one release identity.
  Chromium passes v1/v2 offline boot, HTTP/corrupt-WASM candidate rejection, between-session atomic
  activation, old-cache removal, mixed-manifest fatal state, and explicit recovery.
- The revised 30-second Chromium profile passed after 60 warm-up scene pairs and 154 measured
  transitions: first interaction 553 ms; physics p95 1.1 ms; 30 calls/1,800 triangles; exact
  registries; 43→43 listeners; +1.30% final/+2.39% maximum heap drift.
- The no-retry 20-minute Chromium soak passed after a 300.610-second/980-cycle workload warm-up:
  5,820 transitions retained exact resources; DOM `1/526/43` → `1/367/43`; forced-GC heap −0.67%
  final with no positive measured peak; steady-frame p95 66.6 ms and physics p95 0.4 ms. These
  software-rendered values are not physical-device tier evidence.

## Closed blockers

1. **Production JavaScript budget:** closed for the current build under ADR-0018.
2. **No executable local browser:** closed for Chromium through a task-scoped npm-packaged
   executable. Firefox/WebKit evidence is CI-scoped; none of these runs imply physical devices.
3. **Narrow orthographic goal clipping:** corrected with a minimum horizontal frustum and unit,
   browser-layout, and screenshot evidence.
4. **Camera screenshot readiness ambiguity:** corrected with an explicit rendered camera-model
   marker and fresh-frame wait.
5. **Restart while paused silently retaining the paused clock:** corrected and covered in all CI
   browser projects.
6. **Firefox/WebKit CI execution:** closed for official Playwright engine builds. Firefox uses
   headed Xvfb/software WebGL because GitHub's headless Linux runner cannot create its context.
7. **Dedicated contact/sleep/CCD/joint assertions:** closed in Node, actual local Chromium, and all
   official current-head browser projects.
8. **Separate-WASM offline/update atomicity:** closed for automated Chromium fault scope under
   ADR-0013; physical storage pressure/eviction/update behavior remains open.
9. **Browser profiling and bounded resource soak:** short and no-retry 20-minute local Chromium
   profiles pass; the non-retrying current-head CI profile also passes.

## Remaining Gate-1 blockers

1. No physical Android Chrome or iPhone/iOS Safari determinism, touch latency, thermal, battery,
   memory, orientation, background/resume, or context evidence exists.
2. No representative-player comprehension, correct-strategy repeatability, failure-attribution, or
   comfort evidence exists.

## Decisions and confidence

- **Decided with current evidence:** exact Rapier version remains `0.19.3`; browser packaging uses
  separate WASM; runtime variant is replay identity; lab tooling remains compile-time excluded;
  release sets are hash-verified/atomically activated; contacts and sleeping use ADR-0019 policy.
- **Provisional:** fixed orthographic remains the gameplay-camera default; gravity-vector tilt and
  visible constrained capture remain leading candidates.
- **Blocked:** final control/camera/capture selection, Gate-1 GO, physical-device tiers, and player
  trust claims.
- **Rejected:** threshold waiver, hidden rescue, physics downgrade for FPS, final art, mass content,
  monetization, backend, production deployment, and cross-version ranked comparison.

## Recommendation

**ITERATE.** Automated engineering closure is green locally and in official current-head Actions,
including the 20-minute local browser soak. Gate 1 cannot become **GO** without physical-device and
representative-player evidence.

## Next action

Execute the prepared owner-run physical Android/iOS and representative-player protocols while PR #1
remains draft. Do not expand campaign content or meta systems yet.
