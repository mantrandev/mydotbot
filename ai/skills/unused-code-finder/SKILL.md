---
name: unused-code-finder
description: Detect unused classes, functions, and variables
args: [path]
---

Find unused code in ${path:-"."} Swift files:

**Detection strategy:**

1. **Classes/Structs**: Find declarations, then search for usage
   - Pattern: `(class|struct|enum) (\w+)`
   - Search codebase for type name usage

2. **Functions**: Find private functions, check if called
   - Pattern: `private func (\w+)\(`
   - Search for function calls

3. **Variables**: Find private properties, check if accessed
   - Pattern: `private (let|var) (\w+)`
   - Search for property access

4. **Protocols**: Find protocols, check for conformances
   - Pattern: `protocol (\w+)`
   - Search for `: ProtocolName`

**Exclusions:**
- Don't flag @IBOutlet, @IBAction
- Don't flag test classes
- Don't flag AppDelegate, SceneDelegate
- Don't flag override functions

Report format:
```
## Unused Code

### Classes/Structs (X found)
- `UnusedClass` in File.swift:45 - no references found

### Private Functions (X found)
- `unusedMethod()` in File.swift:123 - never called

### Private Properties (X found)
- `unusedProperty` in File.swift:67 - never accessed

### Protocols (X found)
- `UnusedProtocol` in File.swift:89 - no conformances

Total unused: X items
```
