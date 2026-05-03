---
name: find-ticket
description: Search all occurrences of ticket ID in code, commits, and branches
args: [ticket_id]
---

Find all references to ${ticket_id} across the codebase:

1. **In commits**: `git log --all --oneline --grep="${ticket_id}"`
2. **In branches**: `git branch -a | grep -i "${ticket_id}"`
3. **In code**: Use Grep to search for ${ticket_id} in all files
4. **In current changes**: `git diff master...HEAD | grep "${ticket_id}"`

Report format:
```
## Ticket ${ticket_id} References

### Commits (X found)
- abc1234 [${ticket_id}] commit message

### Branches (X found)
- feature/${ticket_id}-branch-name

### Code References (X found)
- `File.swift:45` - // TODO: ${ticket_id}

### Current Branch Changes
- Found in X files
```
