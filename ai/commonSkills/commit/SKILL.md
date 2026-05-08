---
name: commit
description: Create git commits. Use when user says "commit", "commit this", "commit changes", "split commit", "split commit change", "split the changes".
args: [ticket, type, scope, description]
---

Create a commit: `[${ticket}] ${type}(${scope}): ${description}`

**Types**: feat, fix, refactor, chore, docs, style, test, ci, perf

## Steps

1. If diff unknown: `git status` + `git diff` + branch name — in parallel
2. If diff already known from context: skip step 1
3. Stage files explicitly — never `git add .`
4. `git commit -m "[${ticket}] ${type}(${scope}): ${description}"`
5. `git status` to verify

For split: repeat 3–4 per topic bucket.

## Rules
- Never push, never amend, never `--no-verify`
- No `Co-Authored-By`, no AI attribution
