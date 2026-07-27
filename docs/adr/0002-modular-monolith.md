# ADR-0002: Modular Monolith

**Status:** Accepted, 2026-07-26

One repository, application build, and typed dependency graph contain simulation, gameplay,
rendering, input, UI, platform adapters, content, and tests. Workspaces/microservices were rejected:
there is no independent deployment boundary, and distribution would add version, CI, and small-team
coordination cost.

Revisit only after a subsystem has an independently deployable consumer and measured monolith
friction that cannot be solved by module boundaries.
