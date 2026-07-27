# ADR-0018: Separate Rapier WASM Browser Loader

**Status:** Accepted for the Phase 1 browser risk laboratory, 2026-07-27

## Context

The exact-pinned `@dimforge/rapier3d-compat@0.19.3` production build emitted 950.1 KiB gzip
JavaScript, above the 650 KiB per-JavaScript-chunk review threshold. Minification and ordinary code
splitting could not remove the embedded WASM bytes.

## Decision

- Keep Rapier at exact version `0.19.3`.
- Keep `@dimforge/rapier3d-compat@0.19.3` for Node simulation evidence.
- Alias the browser build to exact `@dimforge/rapier3d@0.19.3`, which emits a same-origin,
  separately cached WASM asset.
- Support both official initialization contracts in the singleton bootstrap: compat explicitly
  initializes; the modular package is initialized by its generated WASM module.
- Record `compat-embedded-node` or `modular-wasm-browser` in replay schema 2.
- Require the frozen bootstrap hash, command-from-step-one golden result/hash, raw failure,
  perturbation corridor, replay equality, production lab-exclusion audit, and bundle gate before
  accepting either path.

## Evidence

- Production JavaScript: 171.1 KiB gzip.
- Separate WASM: 572.6 KiB gzip.
- Total `check:budgets` output: 1.34 MiB gzip.
- Bootstrap: `74e1d58f` in Node, local Chromium, and every GitHub browser project.
- Golden: success at step 278, state hash `c965c01f` in Node and every Chromium, Firefox, WebKit,
  Pixel 7 emulation, and iPhone 13 emulation CI project.
- Production contains no lab controls, adversarial content, or lab parity API markers.

## Consequences and revisit triggers

The official packages do not contain byte-identical WASM binaries, so runtime identity is not
collapsed into the Rapier semantic version. Any unexplained hash difference blocks release. Physical
Android/iOS, offline/service-worker WASM caching, and future Rapier upgrades remain required
evidence. Revert this decision if same-origin/offline loading is brittle, the runtime variants
diverge, or payload interaction timing misses the measured startup budget.
