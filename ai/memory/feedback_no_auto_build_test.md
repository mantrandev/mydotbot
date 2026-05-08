---
name: No auto build or test
description: Never run build or test commands automatically — user runs them manually
type: feedback
---

Never run `make build`, `make unit-test`, `xcodebuild`, or any test/build command unless the user explicitly asks.

**Why:** User builds and tests locally on their own schedule.

**How to apply:** After editing code, notify that changes are done. Do not run verification builds or tests automatically.
