# Test Failure Rubric

Use this reference when deciding how to classify a ShopHelp test failure.

## Classification buckets
- Regression: implementation behavior changed and the assertion still matches the intended contract.
- Flaky: the assertion may be valid, but ordering, timing, async delivery, or simulator state makes the result unstable.
- Environment: setup, fixture, simulator, networking, or dependency state is wrong.
- Test-design issue: the test encodes a stale assumption or overfits implementation details.

## Evidence cues
- Assertion mismatch with deterministic state transition: likely regression.
- Timeout waiting for UI element after animation / async render: often flaky or test-design issue.
- Failures only on reruns, only on CI, or only with stale simulator state: often environment or flaky behavior.
- Screenshot shows correct UI but query fails: accessibility or query-target issue.
- Logs show upstream task never finished: likely product regression, not test flakiness.

## Good next probes
- Re-run with hierarchy dump or screenshot capture.
- Inspect accessibility identifiers and wait targets.
- Compare recent diffs affecting navigation, async flow, or rendering.
- Check whether the test asserts product behavior or internal timing details.
