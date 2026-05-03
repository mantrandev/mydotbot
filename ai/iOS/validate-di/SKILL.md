---
name: validate-di
description: Validate DI container registrations and usages
---

Check Dependency Injection setup:

1. **Find registrations**: Search for `AppDependency.shared.register` patterns
2. **Find resolutions**: Search for `AppDependency.shared.resolve` patterns
3. **Cross-reference**: Ensure all resolved types are registered
4. **Check protocols**: Verify protocols are registered, not concrete types

Use Grep to find:
- Registration pattern: `\.register\(`
- Resolution pattern: `\.resolve\(`

Report format:
```
## DI Validation

### Registered Types (X found)
- ProtocolName → ConcreteType

### Resolved Types (X found)
- ProtocolName in File.swift:123

### Issues
- ✗ TypeName resolved but not registered in File.swift:45
- ✗ Concrete type registered instead of protocol in DIContainer.swift:67

Status: PASS/FAIL
```

If all validations pass, report "DI container valid."
