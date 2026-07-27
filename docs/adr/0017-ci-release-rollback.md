# ADR-0017: CI, Release Approval, and Rollback

**Status:** Accepted boundary, 2026-07-26

Feature/PR checks precede immutable staging. Physical-device and phase-gate evidence plus explicit
owner approval precede production. Rollback restores a compatible code/content/physics/replay/save/
service-worker/configuration set, not individual mismatched pieces.

No production deployment or paid CI/service integration is authorized in Phase 0/1.
