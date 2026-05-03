---
name: quick-commit
description: Stage all and commit with auto-formatted conventional commit message
args: [ticket, type, scope, description]
---

Create a commit with proper format: `[${ticket}] ${type}(${scope}): ${description}`

**Valid types**: feat, fix, refactor, chore, docs, style, test, ci, perf

Steps:
1. Run `git add .` to stage all changes
2. Run `git status` to see what's being committed
3. Create commit using:
   ```bash
   git commit -m "[${ticket}] ${type}(${scope}): ${description}"
   ```

Example usage:
- `/quick-commit SHOPHELP-2826 fix chat "correct message height calculation"`
- Result: `[SHOPHELP-2826] fix(chat): correct message height calculation`

Do NOT include Co-Authored-By or any author info.
