---
name: branch-cleaner
description: Find and delete merged feature branches
---

Clean up merged branches:

1. **Fetch latest**: `git fetch origin --prune`
2. **Find merged branches**: `git branch --merged master | grep -v "master\|main"`
3. **List candidates**: Show branches that are fully merged into master
4. **Confirm deletion**: Ask user which branches to delete
5. **Delete locally**: `git branch -d <branch-name>`
6. **Delete remotely**: `git push origin --delete <branch-name>`

Report format:
```
## Merged Branches

Local branches merged into master:
- feature/SHOPHELP-1234-old-feature
- feature/SHOPHELP-2345-completed-task

Remote branches merged:
- origin/feature/SHOPHELP-3456-done

Delete these branches? (y/n)
```

Only delete after user confirmation.
