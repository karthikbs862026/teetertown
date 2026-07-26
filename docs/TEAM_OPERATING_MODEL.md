# Team Operating Model

## Two-to-three-person core

| Responsibility                                       | Primary role                          | Backup / external path                      |
| ---------------------------------------------------- | ------------------------------------- | ------------------------------------------- |
| Game direction, product, scope, gate recommendation  | Product/game lead                     | Owner review                                |
| TypeScript architecture, Rapier, replay, performance | Senior game engineer                  | Documented systems + specialist review      |
| Level design, tuning, golden/perturbation cases      | Game lead + engineer                  | Contract level designer after presets exist |
| Technical art, collider/pivot/asset integration      | Technical artist/engineer             | Vetted external technical artist            |
| Production art                                       | Contract or third core member         | Art bible + source/provenance gate          |
| Audio                                                | Contract specialist                   | Material-event specification                |
| QA/release/device matrix                             | Shared; named release owner per cycle | External device/QA pass at gates            |
| Analytics/economy                                    | Product lead                          | Later specialist review                     |
| Store/support/compliance                             | Owner/product lead                    | Qualified legal/privacy/store review        |

No responsibility may be ownerless even when one person wears several hats. A critical system needs
ownership notes, tests, diagnostic path, and backup/restore path.

## Triggers

- Add level-design/tuning support if senior engineering spends >40% of capacity hand-tuning for
  several sprints.
- Add QA/device support if backlog delays a release cycle or device coverage is repeatedly skipped.
- Add technical-art capacity if assets block physics validation.
- Do not promise live ops until eight weeks of measured, tested content capacity exists.
- External contributors receive scale, naming, pivot, collider, budget, source, license, and
  acceptance rules before work begins.
