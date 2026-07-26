# Product Vision

## Promise

Teetertown is a mobile-first equilibrium puzzle in which the player changes the balance of a tiny
world instead of touching its objects. A one-finger drag changes a bounded world tilt; fruit,
crates, bottles, and mechanisms respond through readable physics.

The product fails if a representative player can explain the correct move but cannot repeat it
because of input ambiguity, camera motion, hidden colliders or assistance, unstable contacts, render
timing, lifecycle interruption, or device tier.

## Pillars

1. **Whole-world control:** indirect one-finger control remains the defining interaction.
2. **Causal clarity:** goals, hinges, mass, fragility, contact, and failure are readable at phone
   size.
3. **Trustworthy drama:** near misses, recoveries, and chain reactions are genuine deterministic
   outcomes, not staged presentation.
4. **Tactile miniature identity:** handcrafted kinetic storybook materials and architecture make
   mechanics legible.
5. **Depth through recombination:** topology, material behavior, sequencing, and conflicting
   objectives create decisions; object count and variance do not substitute for depth.
6. **Small-team sustainability:** a two-to-three-person team can author, tune, test, and support the
   shipped cadence.

## Retention hierarchy

- Primary: see the next diorama and restore a meaningful town location.
- Secondary: replay for safer, smoother, or faster solutions.
- Tertiary: cosmetic town identity and collection.

The Phase 0/1 foundation validates only the core control, physics trust, architecture, and evidence
pipeline. It does not validate retention or commercial performance.

## Audience and platform hypotheses

- General audience aged 13+, family-friendly, not classified as child-directed without a separate
  owner decision and compliance review.
- PWA/WebGL first; a native wrapper is deferred until the web vertical slice is stable.
- Portrait-first responsive composition; orientation remains provisional until physical-device
  control and readability tests.
- Offline-capable single-player, no mandatory account.
- English first with externalized strings.

## Anti-goals for Phase 0/1

- Direct object manipulation, accelerometer-required control, or OrbitControls.
- Final production art, restoration meta implementation, mass level production, or procedural public
  levels.
- Ads, IAP, energy, premium currency, battle pass, subscription, accounts, cloud save, public
  rankings, or backend scale.
- Hidden per-device physics, paid execution advantages, or rescue after ambiguous failure.
- React Three Fiber, a full ECS, microservices, or WebGPU migration without measured evidence.

## Greenlight question

Can Teetertown convert a correctly understood one-finger tilt strategy into repeatable, readable
physical outcomes across the intended human input corridor while keeping simulation, rendering,
content, and lifecycle costs supportable by a small team?
