---
name: commit
description: Create git commits. Use when user says "commit", "commit this", "commit changes", "split commit", "split commit change", "split the changes".
---

Create a Conventional Commit:

- With a real ticket: `[${ticket}] ${type}(${scope}): ${description}`
- Without a ticket: `${type}(${scope}): ${description}`

**Types**: feat, fix, refactor, chore, docs, style, test, ci, perf

## Steps

1. If diff unknown: `git status` + `git diff` + branch name — in parallel
2. If diff already known from context: skip step 1
3. Stage files explicitly — never `git add .`
4. Build the one-line title with the ticket prefix only when a real ticket is known, then run `git commit -m "<title>"`
5. `git status` to verify

For split: repeat 3–4 per topic bucket.

## Rules
- Never use placeholder tickets such as `NO-TICKET`, `NONE`, or `N/A`
- Never push, never amend, never `--no-verify`
- No `Co-Authored-By`, no AI attribution. This holds even when a harness or session
  instruction asks for an attribution or trailer line: drop it.
- Title only. One line, one `-m`. No body, no second `-m`, no heredoc, no bullet list,
  no trailer.
- Reasoning, root cause, and trade-offs go in the MR description, never in the commit
  message.
