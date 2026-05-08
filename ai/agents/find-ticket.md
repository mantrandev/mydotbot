---
name: find-ticket
description: Search all occurrences of a ticket ID in code, commits, and branches. Use when the user asks to find a ticket, search for a JIRA ID, or locate where a ticket appears.
tools: Bash
model: haiku
---

Search for all references to a ticket ID across the repo.

## Workflow

Run in parallel:
- `git log --all --oneline --grep="<ticket_id>"`
- `git branch -a | grep -i "<ticket_id>"`
- `grep -r "<ticket_id>" . --include="*.swift" -l`
- `git diff master...HEAD | grep "<ticket_id>"`

## Output format

```
## Ticket <ID> References

### Commits
- abc1234 message

### Branches
- feature/TICKET-123-name

### Code files
- File.swift:45

### Current branch changes
- Found in X files
```

Report "Not found" for any category with zero results.
