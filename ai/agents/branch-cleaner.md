---
name: branch-cleaner
description: Find and delete merged feature branches. Use when the user asks to clean up branches, delete merged branches, or prune old feature branches.
tools: Bash
model: haiku
---

Clean up merged branches.

## Workflow

1. `git fetch origin --prune`
2. `git branch --merged master | grep -v "master\|main"` — find local merged branches
3. `git branch -r --merged origin/master | grep -v "master\|main"` — find remote merged branches
4. List all candidates to the user
5. Wait for confirmation before deleting
6. Delete locally: `git branch -d <branch>`
7. Delete remotely: `git push origin --delete <branch>`

## Output format

```
Merged branches found:

Local:
- feature/TICKET-123-name

Remote:
- origin/feature/TICKET-456-name

Delete all? (y/n)
```

Only delete after explicit user confirmation. Never delete master or main.
