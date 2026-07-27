# Gate 1 Blocker Iteration Evidence — 2026-07-27

## 1. Status and scope

- Phase: Phase 1 graybox risk-laboratory iteration.
- Gate recommendation: **ITERATE**.
- Objective: resolve the JavaScript payload and unavailable-local-browser blockers without changing
  Rapier `0.19.3`, content, authority boundaries, the control promise, or frozen physics outcomes.
- Excluded: final art, campaign expansion, meta, monetization, backend, accounts, rankings,
  production deployment, and physical-device/player claims.

## 2. Baseline reproduced

The published feature-branch baseline installed from its lockfile and passed typecheck, lint,
format, content, boundary, cycle, and 11-file/16-test headless checks. Its production budget
reproduced the blocker:

- production JavaScript: 950.1 KiB gzip;
- per-JavaScript-chunk gate: 650 KiB gzip;
- `check:budgets`: fail.

## 3. Selected alternatives

### Payload

ADR-0018 retains exact Rapier `0.19.3` but uses the two official package shapes by environment:

- Node evidence: `@dimforge/rapier3d-compat@0.19.3`;
- browser build: `@dimforge/rapier3d@0.19.3`, emitted as separate same-origin WASM.

The bootstrap supports the official explicit-init and module-initialized contracts. Replay schema 2
records the runtime variant. A threshold waiver and a physics-version change were rejected.

### Browser execution

The Playwright CDN path remained unavailable in this workspace. A task-scoped
`@sparticuz/chromium@149.0.0` package supplied an actual 191 MiB Chromium/headless-shell executable.
Lambda-only `--single-process` was not used; SwiftShader/WebGL flags, task-scoped libraries, and
system font configuration were supplied. The package is not a game dependency and no browser/font
binary is committed or shipped.

GitHub Actions is separately configured to install official Playwright Chromium, Firefox, and WebKit
binaries on pull requests.

## 4. Physics/replay identity

| Evidence                                | Result                                                           |
| --------------------------------------- | ---------------------------------------------------------------- |
| Node bootstrap                          | `74e1d58f`                                                       |
| Actual Chromium bootstrap               | `74e1d58f`                                                       |
| Node command-from-step-one golden       | Success, step 278, `c965c01f`                                    |
| Actual Chromium modular-WASM golden     | Success, step 278, `c965c01f`                                    |
| Raw capture                             | `object_out_of_bounds`, step 264, `e18433eb`                     |
| Human-sized scripted perturbation sweep | 10/10 success                                                    |
| Identical headless replay comparison    | Periodic and final hashes match                                  |
| One-command perturbation                | Divergence detected                                              |
| Content/material hashes                 | Tutorial `5aac8b9a`; lab `1e4655f2`; materials `05d66915`        |
| Runtime identity                        | `compat-embedded-node` / `modular-wasm-browser`, replay schema 2 |

A first browser assertion incorrectly expected a human-style drag that began after neutral settling
to match the command-from-step-one hash. The session correctly captured later with a different state
history. The test was split into a real sustained-drag capture case and a lab-only exact quantized
parity runner. No physics threshold or expected hash was weakened.

## 5. Browser, lifecycle, input, and visual evidence

The final built-preview matrix used actual Chromium for desktop and the same executable under
Playwright Pixel 7 device/viewport emulation:

- 21 passed;
- 3 intentionally skipped because a baseline was scoped to desktop or mobile viewport;
- no unexpected skip or retry.

Covered:

- WebGL boot and bootstrap identity;
- pause and fixed-step freeze;
- sustained pointer drag to visible constrained capture;
- exact browser/headless golden parity;
- restart from paused state;
- pointer cancel and lost-pointer-capture neutralization;
- WebGL context loss, fixed-step freeze while lost, and restore using the original extension;
- 20 tutorial/adversarial transitions with one canvas and stable body/collider/joint/render
  registries;
- orthographic, low-FOV perspective, and bounded-event camera variants;
- production/lab separation.

Five screenshots were manually inspected:

1. tutorial desktop orthographic;
2. tutorial Pixel 7 emulation;
3. tutorial desktop perspective;
4. tutorial desktop bounded event;
5. adversarial desktop.

The phone goal was initially clipped under the original orthographic aspect rule. The camera now
preserves a minimum horizontal half-extent of 5.3, with unit, rendered-layout, and screenshot
regressions. Camera screenshots also gained an explicit rendered-model readiness marker after visual
review showed that status text alone could admit a transition-frame capture.

This is actual desktop Chromium and viewport/device emulation. It is not physical Android, physical
iOS, Safari, touch-latency, thermal, battery, or device-memory evidence.

## 6. Bundle and separation evidence

Final production-shaped output:

| Artifact                   | Raw         | Gzip      | Gate                     |
| -------------------------- | ----------- | --------- | ------------------------ |
| Application JavaScript     | 736.1 KiB   | 171.1 KiB | Pass: below 650 KiB gzip |
| Rapier WASM                | 1,533.4 KiB | 572.6 KiB | Asset; separately cached |
| Total budget-script output | —           | 1.34 MiB  | Pass: below 6 MiB        |

Vite emits a raw/minified-size advisory. The repository gate is explicitly gzip-based, so this is a
non-blocking review signal rather than a silent threshold change.

The production audit finds no adversarial fixture data, internal controls, diagnostic export
markers, or `__TEETERTOWN_LAB_API__`.

## 7. Commands run

```text
env npm_config_cache=/tmp/teetertown-npm-cache npm ci
env npm_config_cache=/tmp/teetertown-npm-cache npm run check:fast
env npm_config_cache=/tmp/teetertown-npm-cache npm run check:production
env npm_config_cache=/tmp/teetertown-npm-cache npm run build:lab
env TEETERTOWN_CHROMIUM_EXECUTABLE_PATH=/tmp/chromium \
  TEETERTOWN_E2E_SERVER_COMMAND='npm run preview:e2e' \
  FONTCONFIG_FILE=/etc/fonts/fonts.conf LD_LIBRARY_PATH=/tmp \
  npx playwright test --project=chromium --project=mobile-chromium
```

The final post-format gate repeated successfully: 13 unit/simulation files with 21 tests, production
budget/lab-leak checks, lab build, and the 21-pass/3-intentional-skip Chromium matrix. GitHub
Actions results are recorded only after the draft pull request actually runs.

## 8. Remaining blockers and stop conditions

- Firefox, desktop WebKit, and mobile WebKit: configured, not yet run.
- Physical Android/iOS Safari: not run.
- Representative-player comprehension/execution/failure attribution: not run.
- Separate-WASM offline/service-worker update atomicity: not run.
- Browser heap/frame-time/long-task/soak and real first-interaction timing: not measured.
- Dedicated contact-ordering, sleep/wake, CCD, and joint-reversal assertions: incomplete.

Stop Gate-1 advancement on any cross-browser/device replay divergence, invalid/ambiguous failure,
hidden goal/collider/camera cause, non-neutral cancellation, resource growth, offline version mix,
or correctly understood strategy that representative players cannot repeat.

## 9. Recommendation

**ITERATE.** The two locally solvable blockers are resolved with evidence. Gate 1 remains blocked
from **GO** by cross-browser CI, physical-device, and representative-player evidence. Do not expand
campaign content, art production, meta systems, or monetization yet.
