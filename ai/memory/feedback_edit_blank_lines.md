---
name: Edit blank lines rule
description: Never include blank lines in old_string/new_string unless required for uniqueness; preserve indented blank lines exactly
type: feedback
---

When using the Edit tool:
- Never include a blank line (indented or not) in `old_string`/`new_string` unless it is required to make `old_string` unique
- If a blank line separates two functions and you only need to edit one, scope `old_string` to ONLY inside that function — do not span across the blank line into the next function
- Indented blank lines (e.g. `    ` with 4 spaces) must be preserved exactly — never convert to empty lines

**Why:** Xcode-compatible formatting — indented blank lines are part of the file structure. Violating this breaks formatting silently.

**How to apply:** Every Edit tool call — check that old_string does not cross function boundaries via blank lines, and that indented blank lines are copied exactly as-is.
