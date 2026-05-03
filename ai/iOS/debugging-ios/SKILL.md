---
name: debugging-ios
description: "Debugs iOS app issues by analyzing logs, crash reports, and code flow. Use when debugging, fixing bugs, or analyzing crashes."
---

# Debug iOS Issue

Systematic debugging workflow for ShopHelp iOS app.

## Workflow

### Step 1: Reproduce

- Identify the exact scenario (screen, action, state).
- Get the error message, crash log, or unexpected behavior description.
- Determine if reproducible (always, intermittent, specific conditions).

### Step 2: Trace Data Flow

Follow the data through Clean Architecture layers:

```
View (SwiftUI)
  → ViewModel (@MainActor, @Published state)
    → UseCase (protocol-based)
      → Repository (protocol → implementation)
        → Gateway (network) / Database (GRDB)
```

At each layer, check:
- Is the method being called?
- Are parameters correct?
- Is the return value correct?
- Is the error being handled?

### Step 3: Check Async/Await Chains

Common async issues:
- Missing `await` on async calls.
- Missing `try` on throwing calls.
- Error silently caught and ignored.
- Task cancelled but not handled.
- Race condition between multiple async calls.
- `@Published` update not on MainActor.

### Step 4: Check DI Registration

- Is the dependency registered in the correct assembly?
- Is the object scope correct (transient vs `.container`)?
- Is the protocol type matching the registration?
- Is the resolver resolving the right type?
- Check: `AppUsecasesAssembly`, `RepositoriesAssembly`, `AppServicesAssembly`.

### Step 5: Check Optional Chaining

Silent nil failures are common. Look for:
- Optional chaining that silently returns nil (`object?.method()`).
- `guard let` that silently returns without logging.
- `if let` branches that skip important logic.
- Nil coalescing (`??`) hiding real issues.

### Step 6: Debug Print (Temporary Only)

Add debug prints to trace execution flow:

```swift
print("mantm > entering loadData")
print("mantm >> fetching product: \(productId)")
print("mantm >>> result: \(result)")
```

Flow depth levels:
- `>` — entry point
- `>>` — sub-call
- `>>>` — deep trace

**Remove all debug prints before committing.**

### Step 7: Check Network Layer

- Is the API request URL correct?
- Are headers/auth tokens present?
- Is the request body correct?
- Is the response being decoded correctly?
- Is `toDomain()` mapping correct?
- Check the correct Gateway (AppGateway, OrderGateway, etc.).

### Step 8: Check Database Layer

- Is the GRDB query correct?
- Is the record type matching the table schema?
- Is the DAO method being called?
- Are migrations up to date?
- Is the database file accessible?

## Common Issues

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Screen shows nothing | Missing DI registration | Register in assembly |
| Crash on screen open | Force unwrap nil | Check DI resolution |
| Data not updating | `@Published` not triggered | Ensure MainActor update |
| Stale data | Wrong object scope | Change to `.container` or transient |
| Network error silent | Error caught but not shown | Update `errorMessage` in catch |
| Wrong data displayed | Mapping error | Check `toDomain()` method |
| Race condition | Multiple async calls | Add proper sequencing or cancellation |
| Memory leak | Retain cycle | Check closures for `[weak self]` |
| Infinite loop | Recursive state update | Check `@Published` → view → method cycle |

## Debugging Tools

- **Xcode Debugger**: Breakpoints, LLDB, variable inspection.
- **Console Logs**: Filter by "mantm" for debug prints.
- **Network Inspector**: Charles Proxy or Xcode Network instrument.
- **Memory Graph**: Xcode Debug Memory Graph for retain cycles.
- **View Hierarchy**: Xcode Debug View Hierarchy for UI issues.

## Fix Verification

After fixing:
1. Verify the fix resolves the original issue.
2. Check for regression in related features.
3. Remove all debug prints.
4. Ensure no force unwrap, no print, no commented-out code.
5. Run `make unit-test` if tests exist for the affected code.

## Reference

See `docs/ARCHITECTURE.md` for layer structure and gateways.
See `docs/PATTERNS.md` for correct async/DI patterns.
