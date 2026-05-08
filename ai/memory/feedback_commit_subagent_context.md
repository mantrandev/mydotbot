---
name: Commit subagent context
description: Always pass change type, root cause, and suggested message when invoking the commit subagent
type: feedback
---

When invoking the commit subagent, always include:
1. Explicit change type — `fix`, `feat`, `test`, etc., with a note if the diff alone could be misread (e.g. "this is a fix, not a refactor")
2. One-sentence root cause or intent
3. Suggested commit message — the agent can refine it but needs a baseline

Example prompt addition:
> Change type: fix (not refactor — corrects a bug where video was never paused on lock screen)
> Root cause: wasPlayingBeforeBackground was removed from appDidEnterBackground and is now only set in appWillResignActive
> Suggested message: [SHOPHELP-3867] fix(video): pause on willResignActive to handle lock during silent push

**Why:** Without this context, the commit agent only sees the diff and misclassifies the change type — requiring an amend.

**How to apply:** Every time the commit subagent is invoked — include all three fields in the prompt.
