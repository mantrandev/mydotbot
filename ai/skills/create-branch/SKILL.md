---
name: create-branch
description: Create a new git branch and unstash CLAUDE.md
args: [branchname]
---

First, fetch the latest changes from origin using `git fetch origin`.

Then create a new git branch named `${branchname}` from origin/master using `git checkout -b ${branchname} origin/master`.

After creating the branch, check if CLAUDE.md is in the stash using `git stash list`. Look for a stash entry containing "CLAUDE" (case-insensitive).

If found, unstash it using `git checkout stash@{0} -- CLAUDE.md` (assuming it's in stash@{0}).

If CLAUDE.md is not found in any stash, inform the user that CLAUDE.md was not found in the stash.
