# Review Rubric

Use this reference when deciding whether a change deserves a review finding.

## Review priorities
- Correctness regressions.
- Behavior changes that violate existing contracts.
- Missing or weakened test coverage for risky paths.
- Reliability / performance / security issues introduced by the change.

## Concurrency & memory safety
Flag a finding only with concrete evidence of a real defect, not a style miss.
- Data races: shared mutable state read/written from multiple tasks or threads without isolation.
- Actor / `@MainActor` isolation broken: UI or actor-bound state mutated off its isolation domain.
- Retain cycles: strong `self` captured in escaping closures, `Task`, or stored delegates without `[weak self]` / `weak`.
- Lifecycle leaks: observers (NotificationCenter / KVO), `Timer`, `Task`, or Combine subscriptions created but never removed or cancelled.
- Main-thread blocking: heavy work, sync I/O, or network waits on the main thread.

## Data, error & security safety
- Data integrity: unvalidated input, lost or silently mutated data, broken serialization / persistence.
- Swallowed errors: empty `catch {}`, `try?` that hides a meaningful failure, errors not propagated or surfaced at the boundary.
- Secret / PII leakage: tokens, credentials, or user data written to logs, embedded in URLs, or stored in insecure locations (e.g. UserDefaults instead of Keychain).

## API design
Flag only when an unclear or leaky API creates real risk for callers or future change — not subjective taste.
- Public methods / properties carry a clear, single meaning.
- Function and variable names express the actual intent, not the mechanism.
- The API does not expose more implementation detail than callers need.
- The method contract is explicit: what input it takes, what it returns, what error cases it can produce.
- Non-obvious or special behavior is documented.

## Design system & consistency
Flag only when an inconsistency adds maintenance cost or breaks an established pattern.
- The change follows the project's existing conventions.
- It does not introduce a new pattern when an existing one already fits.
- Naming, file layout, and responsibility split stay consistent with surrounding code.
- For UI changes: uses the project's components / design tokens / styles instead of one-off implementations.
- No hard-coded colors, spacing, fonts, copy, or config that belong in shared tokens / constants.

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
