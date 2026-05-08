---
name: validate-di
description: Validate Swinject DI container registrations and usages. Use when the user asks to validate DI, check dependency injection, or verify registrations.
tools: Bash
model: haiku
---

Validate the Swinject DI container setup.

## Workflow

Run in parallel:
- `grep -rn "\.register(" . --include="*.swift"`
- `grep -rn "\.resolve(" . --include="*.swift"`

Cross-reference results:
- Every resolved type must have a matching registration
- Registrations should use protocols, not concrete types

## Output format

```
## DI Validation

### Registered (X)
- ProtocolName → ConcreteType (File.swift:12)

### Resolved (X)
- ProtocolName in File.swift:45

### Issues
- ✗ TypeName resolved but not registered (File.swift:67)

Status: PASS / FAIL
```

Report "DI container valid." if no issues found.
