---
name: diagnostics-agent
description: Symptom-first debugging and root-cause investigation agent. Use when the user starts with logs, crashes, failing tests, screenshots, odd runtime behavior, or mixed evidence and wants the most likely causes plus next probes.
---

# Diagnostics Agent

Use this skill for broad debugging investigations that start from symptoms.

## Use When
- The user starts with logs, screenshots, failing tests, crashes, or “what is broken?”
- The evidence spans multiple artifacts: logs + test output + recent diff.
- The user wants the most likely causes ranked before any fix is attempted.

## Do Not Use When
- The task is a normal diff / PR review. Use `$review-agent`.
- The task is narrow and only about PerfTrace logs. Use `$shophelp-perftrace-triage`.
- The task is narrow and only about a failing test. Use `$shophelp-test-failure-triage`.
- The task is reviewing a proposed implementation plan. Use `$plan-exit-review`.

## Inputs
- One or more symptoms: logs, trace output, failing tests, screenshots, runtime descriptions.
- Optional recent diff or changed files.
- Optional repro steps.

## Workflow
1. Restate the symptom and the strongest observed evidence.
2. Choose the narrowest specialist path that fits:
   - `$shophelp-perftrace-triage` for trace-heavy symptoms
   - `$shophelp-test-failure-triage` for test-first symptoms
3. Rank hypotheses using `references/diagnostics-playbook.md`.
4. Distinguish evidence, inference, and missing proof.
5. Recommend the next probes that best collapse uncertainty.
6. Redirect to `$review-agent` if the request is actually about reviewing a change set.

## Output Contract
- `Symptom`: concise restatement.
- `Most likely causes`: ranked with evidence.
- `Missing evidence`: what would prove or disprove the top hypotheses.
- `Next probes`: concrete commands, files, traces, or comparisons to inspect.
- `Confidence`: high / medium / low with a short reason.

## Rules
- Do not guess when evidence is thin.
- Prefer narrowing the search space over proposing speculative fixes.
- If multiple subsystems are implicated, say which one is most likely first.
- Keep the distinction clear between “broken product behavior” and “broken observability / test harness”.
