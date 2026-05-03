---
name: pre-commit-check
description: Run all code standard checks before commit
---

Run comprehensive pre-commit validation:

1. **Get staged files**: Run `git diff --cached --name-only --diff-filter=ACM` to get staged Swift files
2. **Check file headers**: For each Swift file, verify it has correct header format:
   ```
   //
   //  Filename.swift
   //  ShopHelp
   //
   //  Created by Man Tran on DD/MM/YY.
   //
   ```
3. **Swift lint check**: Run swift-lint-check on staged files
4. **Build syntax**: Run `xcodebuild -scheme ShopHelp -destination 'platform=iOS Simulator,name=iPhone 15' -quiet clean build` to verify code compiles

Report all issues found. If all checks pass, report "Ready to commit."

Format:
```
## Pre-Commit Check

### File Headers
✓ All headers valid / ✗ X files missing headers

### Code Standards
✓ No violations / ✗ X violations found

### Build Check
✓ Build successful / ✗ Build failed

Status: PASS/FAIL
```
