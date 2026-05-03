---
name: review-agent
description: Findings-first review agent for code changes. Use when the user asks to review a branch, PR, diff, commit range, or recent changes and wants prioritized, actionable issues instead of implementation work.
---

# Review Agent

Use this skill as a broad code-review agent for change sets.

## Use When
- The user asks to review a branch, diff, PR, or recent commits.
- The user wants prioritized findings, not a patch.
- The work is about regressions, risk, correctness, or missing tests introduced by a change.

## Do Not Use When
- The request is plan or architecture review before implementation. Use `$plan-exit-review`.
- The request starts from a symptom like logs, crash output, or a failing test. Use `$diagnostics-agent`.
- The user only wants one narrow trace or test failure interpreted. Use the relevant triage skill directly.

## Inputs
- Diff, branch, merge base, commit range, or explicit files.
- Surrounding code, touched call sites, and relevant tests.
- Optional docs if the change affects behavior contracts.

## Workflow
1. Identify the review scope and inspect the change set.
2. Read surrounding code, not just the patch.
3. Apply the severity and coverage rules in `references/review-rubric.md`.
4. Prefer provable regressions, behavior changes, and missing tests over style comments.
5. Emit findings first, ordered by severity.
6. If no findings are discovered, say so explicitly and note residual risks / testing gaps.

## Output Contract
- `Findings`: prioritized, actionable, file/line specific.
- `Open questions / assumptions`: only when needed.
- `Residual risks`: what was not fully validated.

## Rules
- Do not drift into plan review unless the user is reviewing a plan.
- Do not implement fixes while reviewing.
- Only flag issues the original author would likely fix if shown clear evidence.
- Prefer a small number of high-confidence findings over a noisy list.
- If runtime symptoms appear during review, optionally recommend `$diagnostics-agent` for deeper symptom-first analysis.
