---
name: clean-debug
description: Remove all debug print statements from staged files
---

Remove debug statements from staged Swift files:

1. **Get staged files**: Run `git diff --cached --name-only | grep "\.swift$"`
2. **For each file**, remove:
   - Lines with `print("mantm` pattern
   - Lines with `print(`
   - Lines with `debugPrint(`
   - Lines with `os_log(`
   - Lines with `NSLog(`

3. **Verify removals**: Show which lines were removed from which files
4. **Re-stage**: Run `git add` on modified files

Report format:
```
## Debug Cleanup

Removed from:
- `File.swift:45` - print("mantm > ...")
- `File.swift:67` - debugPrint(...)

Total removed: X lines from Y files
```

If no debug statements found, report "No debug statements in staged files."
