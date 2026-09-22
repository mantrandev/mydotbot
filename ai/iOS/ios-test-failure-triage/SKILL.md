---
name: ios-test-failure-triage
description: Triage an iOS XCTest or Swift Testing failure before proposing a fix — classify regression versus flake versus environment versus bad test, with evidence. Use when the user shares a failing test, asks whether a test is flaky, or wants the failure explained rather than patched green.
---

# iOS test failure triage

Use this skill when the main question is why a test failed, not how to make it pass.

## Use When
- The user shares a failing test name, assertion, stack trace, or screenshot.
- The user asks whether a test is flaky, valuable, or masking a deeper bug.
- The user wants explanation first and does not want a “make it green” patch.

## Do Not Use When
- The user wants a whole diff or branch reviewed. Use `/code-review`.
- The primary evidence is trace or telemetry output rather than a failing test. Read the trace first; this skill has nothing to classify without a failing assertion.
- The issue spans multiple runtime symptoms, logs, and recent code changes. Use `mattpocock-skills:diagnosing-bugs`.

## Inputs
- Failing test output.
- Optional screenshot or simulator capture.
- Optional touched diff or nearby implementation files.
- Optional repeat-run notes if the user already retried the failure.

## Workflow
1. State what the test appears to protect.
2. Classify the failure using `references/test-failure-rubric.md`.
3. Explain why this run failed with evidence from the output.
4. Judge regression vs flaky behavior vs bad test assumption.
5. List the next checks needed before changing code.
6. If the evidence is mixed, state that explicitly and lower confidence.

## Output Contract
- `Coverage intent`: what product behavior the test guards.
- `Failure reason`: what likely broke on this run.
- `Classification`: regression / flaky / environment / test-design issue.
- `Next checks`: precise follow-up probes.
- `Confidence`: high / medium / low with a short reason.

## Rules
- Do not optimize for a passing build; optimize for understanding.
- Separate user-visible regressions from test harness timing issues.
- If a test is flaky, explain the instability mechanism rather than just labeling it flaky.
- If the failure output is incomplete, ask for hierarchy dumps, screenshots, or rerun evidence.
