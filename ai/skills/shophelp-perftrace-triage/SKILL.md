---
name: shophelp-perftrace-triage
description: Diagnose ShopHelp PerfTrace logs and telemetry artifacts. Use when the user shares PerfTrace output, slow-flow logs, abnormal span timings, or asks what a PerfTrace trace means before fixing anything.
---

# ShopHelp PerfTrace Triage

Use this skill for symptom-first interpretation of ShopHelp tracing output.

## Use When
- The user shares `PerfTrace` logs, span dumps, or slow-flow telemetry.
- The user asks what a trace means, why durations look wrong, or which span is suspicious.
- The user wants explanation first, not an immediate fix.

## Do Not Use When
- The request is a general code review of a diff or branch. Use `$review-agent`.
- The primary artifact is a failing test rather than trace output. Use `$shophelp-test-failure-triage`.
- The user wants a broad debugging investigation across multiple unrelated symptoms. Use `$diagnostics-agent`.

## Inputs
- PerfTrace log lines or screenshots of logs.
- Optional related files such as `PerfTraceUseCase`, logger code, or README/docs.
- Optional recent diff if the trace changed after a code change.

## Workflow
1. Restate the traced operation and the visible status transitions.
2. Build a narrative from the spans: what started, what ended, and what dominates wall time.
3. Check anomalies using `references/perftrace-taxonomy.md`.
4. Separate likely product latency from likely trace instrumentation bugs.
5. Rank the top hypotheses and list the exact next probes.
6. If evidence is insufficient, say what is missing instead of guessing.

## Output Contract
- `Narrative`: what the flow appears to have done.
- `Anomalies`: suspicious spans, timing relationships, or missing events.
- `Likely causes`: ranked list with evidence.
- `Next checks`: concrete files, logs, or comparisons to inspect.
- `Confidence`: high / medium / low with a short reason.

## Rules
- Prefer explanation over fix proposals unless the user explicitly asks for a fix.
- Call out when a long duration may include cancellation, waiting, or span-lifecycle bugs rather than active work.
- Do not treat a child span sum as proof of actual wall-clock latency without checking overlap.
- If the trace semantics are unclear, ask for the adjacent code or a successful comparison trace.
