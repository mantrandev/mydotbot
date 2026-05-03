---
name: create-desc-mr
description: Generate a concise merge request description from git diff and commit history.
---

# Create MR Description

Create a concise merge request description:

1. Run `git diff master...HEAD` and `git log master..HEAD --oneline`
2. Analyze the changes
3. Generate description using this template:

```markdown
# [TICKET] Summary of change

## What changed
- Brief description (1-2 lines)

## Impact
- **Users**: what users will notice
- **System**: architecture/performance changes
- **Files**: modules/components affected
- **Breaking changes**: yes/no

## Testing
- [ ] Functional tests passed
- [ ] No regressions
- [ ] Edge cases covered
- [ ] Performance checked
```

**Instructions**:
- Use ticket number from branch name
- Be specific and concise
- Fill all sections based on actual changes
- Output in code block for easy copying
