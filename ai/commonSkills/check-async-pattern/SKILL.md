---
name: check-async-pattern
description: Ensure no Combine publishers, only async/await
args: [path]
---

Verify async patterns in ${path:-"."} Swift files:

1. **Check for Combine**: Search for:
   - `import Combine`
   - `@Published`
   - `PassthroughSubject`
   - `CurrentValueSubject`
   - `AnyPublisher`
   - `.sink(`
   - `.subscribe(`

2. **Verify async/await usage**: Look for proper patterns:
   - `async` functions
   - `await` keywords
   - `AsyncStream`
   - `Task {`

Report format:
```
## Async Pattern Check

### Combine Usage Found (should be 0)
- `File.swift:45` - import Combine
- `File.swift:67` - @Published var

### Async/Await Usage
- X async functions found
- X AsyncStream found

Status: PASS/FAIL
```

If Combine found, list all occurrences with file:line.
If only async/await found, report "Async patterns valid."
