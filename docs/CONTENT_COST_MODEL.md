# Content Cost Model

## Measurement unit

Track elapsed person-hours and rework separately for every level and theme. “Reskin-cheap” is
rejected as an assumption.

| Workstream                   | Definition of measured finish                                   | Phase-1 actual     | Phase-2 target set after data |
| ---------------------------- | --------------------------------------------------------------- | ------------------ | ----------------------------- |
| Paper/graybox design         | New decision/topology/objective documented and loadable         | Pending            | Unset                         |
| Physics setup/tuning         | Materials, colliders, joints, bounds, failure rules stable      | Pending            | Unset                         |
| Golden replay                | Completion + expected failure recorded and hashed               | Pending            | Unset                         |
| Robustness                   | Difficulty corridor and adversarial cases pass                  | Pending            | Unset                         |
| Art/collision integration    | Source/provenance, runtime asset, overlays, low tier            | Graybox only       | Unset                         |
| Audio/VFX                    | Causal material/threshold feedback and accessibility equivalent | Out of scope       | Unset                         |
| Performance remediation      | Approved budgets on target/minimum physical tiers               | Blocked by devices | Unset                         |
| QA/regression                | Automated suite + manual browser/device/art review              | Pending            | Unset                         |
| Localization/analytics/hints | Externalized strings, events, hint/recovery                     | Spec only          | Unset                         |
| Release packaging            | Version identities, artifact, staging/rollback                  | Skeleton only      | Unset                         |

Record number of tuning iterations, defects after approval, regression reopens, and senior-engineer
hours spent on scene-specific fixes. Process/hiring review triggers if median release-quality level
exceeds its approved person-day budget, tuning consumes >40% of senior engineering for several
sprints, or QA delays one planned cycle.
