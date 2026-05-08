---
name: swift-lint-check
description: Check Swift code for violations of project code standards
args: [path]
---

Scan Swift files in ${path:-"."} for code standard violations:

1. **Force unwrapping**: Search for `!` operator (excluding comments, strings, and `!=`)
2. **Implicitly unwrapped optionals**: Search for type declarations with `!` like `String!`, `UIView!`
3. **Debug statements**: Search for `print(`, `debugPrint(`, `os_log(`
4. **Commented code**: Search for lines with `//` followed by code patterns
5. **#if debug**: Search for `#if debug` or `#if DEBUG`

Use Grep with appropriate patterns to find violations. Report findings with file:line format.

Output format:
```
## Swift Lint Check Results

### Force Unwrapping (!)
- `File.swift:123` - found force unwrap

### Implicitly Unwrapped Optionals
- `File.swift:45` - found Type! declaration

### Debug Statements
- `File.swift:67` - found print/debugPrint/os_log

### Commented Code
- `File.swift:89` - found commented code

### Debug Conditionals
- `File.swift:100` - found #if debug

Total violations: X
```

If no violations found, report "No violations found."
