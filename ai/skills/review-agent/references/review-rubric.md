# Review Rubric

Use this reference when deciding whether a change deserves a review finding.

## Review priorities
- Correctness regressions.
- Behavior changes that violate existing contracts.
- Missing or weakened test coverage for risky paths.
- Reliability / performance / security issues introduced by the change.

## Finding standards
- The issue must be discrete and actionable.
- The issue must be introduced by the reviewed change, not pre-existing noise.
- The explanation should show why the change is risky and what path is affected.
- File and line references should point to the changed or directly impacted location.

## Severity guide
- P1: likely user-facing bug, data loss, crash, security issue, or major behavior break.
- P2: meaningful reliability or correctness issue with narrower blast radius.
- P3: maintainability or edge-case issue worth fixing but not urgent.

## Coverage checklist
- Read touched files plus nearby call sites.
- Check whether changed conditions still preserve old invariants.
- Look for error / timeout / nil / cancellation paths.
- Check whether tests cover the new risky path, not only the happy path.
