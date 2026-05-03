---
name: reviewing-code
description: "Reviews Swift code against project standards and CLAUDE.md rules. Use when asked to review code, check quality, or validate changes."
---

# Review Code

Reviews Swift code against ShopHelp project standards.

## Review Checklist

Run through every item. Report violations only — do not list passing checks.

### Code Safety
- [ ] No force unwrap (`!`) — except DI resolution in Coordinators
- [ ] No implicitly unwrapped optionals (`String!`, `UIView!`)
- [ ] No `try!` or `as!`

### Code Cleanliness
- [ ] No `print()` / `debugPrint()` / `os_log` in committed code
- [ ] No commented-out code
- [ ] No `#if DEBUG` for production logic
- [ ] No `// TODO:` or `// FIXME:` left behind

### Architecture
- [ ] ViewModels are `@MainActor final class` + `ObservableObject`
- [ ] UseCases are protocol + `final class` implementation
- [ ] Repositories are protocol (Domain) + implementation (Data)
- [ ] Protocol-based DI via Swinject (no singletons)
- [ ] Constructor injection (no service locator pattern)

### Async Patterns
- [ ] Uses async/await (no completion handlers)
- [ ] Uses AsyncStream (no Combine publishers)
- [ ] Proper error handling with do/catch
- [ ] No unhandled Task results

### Formatting
- [ ] File header present and correctly formatted
- [ ] Lines under 120 characters
- [ ] Functions under 60 lines
- [ ] Blank line indentation preserved (spaces not removed)
- [ ] No extra whitespace changes

### Naming
- [ ] ViewModel: `{Feature}ViewModel.swift`
- [ ] UseCase: `{Action}{Entity}UseCase.swift`
- [ ] Repository: `{Entity}RepositoryProtocol.swift` / `{Entity}RepositoryImpl.swift`
- [ ] Domain model: `{Entity}Domain.swift`
- [ ] Request: `{Action}{Entity}Request.swift`
- [ ] Response: `{Entity}Response.swift`

### Git
- [ ] Commit message: `[TICKET-ID] type(scope): description`
- [ ] No detailed body in commit
- [ ] No Co-Authored-By
- [ ] Branch: `feature/SHOPHELP-XXXX-description`

## Response Format

### When code passes review
"No issues."

### When violations found
List each violation with file and line:

```
**{File}:{Line}** — {Rule violated}. {Fix instruction}.
```

Example:
```
**MyViewModel.swift:42** — Force unwrap. Use optional binding.
**MyViewModel.swift:15** — Missing @MainActor. Add @MainActor to class.
**MyUseCase.swift:1** — Missing file header. Add standard header.
```

### When reviewer points out a valid issue
"Fixed." or "Fixed in [file]."

### When the code was wrong
"Wrong. Fixing." or "Missed that. Fixed."

## Severity Levels

| Severity | Action | Examples |
|----------|--------|----------|
| **Blocker** | Must fix | Force unwrap, print statements, missing @MainActor |
| **Major** | Should fix | Missing error handling, wrong naming, no DI |
| **Minor** | Nice to fix | Formatting, line length, missing header |

## Review Scope

When reviewing, check:
1. Changed/added files only (unless full review requested).
2. Each file against the checklist above.
3. Cross-file consistency (DI registration matches usage).
4. Data flow correctness (Domain types flow correctly).

## Reference

See `CLAUDE.md` for the full project rules.
See `docs/CONVENTIONS.md` for naming and style conventions.
