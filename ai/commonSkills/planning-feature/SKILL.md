---
name: planning-feature
description: "Plan an iOS feature before writing it — affected layers, files to create or modify, data flow, dependency registrations and edge cases. Use when asked to plan, design or architect a feature in a Swift project."
---

# Plan a feature

Produces a plan, not code. Nothing is written until the plan is approved.

## Step 0 — Problem and solution

Two sentences, before anything else:

- **Problem**: what needs to be built.
- **Solution**: the approach in one line.

Stop. Wait for an explicit go.

## Step 1 — Read the project

Never plan against assumed paths. Establish, from the repository:

```bash
find . -type d \( -name Domain -o -name Data -o -name Presentation \) -not -path '*/.*' | head
grep -rlE 'import (Swinject|Factory|Resolver)|container\.register' --include='*.swift' . | head -3
grep -rhE 'init\(.*(Networking|Gateway|Client|API)[A-Za-z]*(Protocol)?' --include='*Repository*.swift' . | head
```

That yields the layer directory names, the DI mechanism and its registration
files, and the networking abstractions the project actually exposes. Use those
names in the plan. If the project has an architecture document, it outranks the
greps.

## Step 2 — Clarify

Ask only what the codebase cannot answer:

- What user action triggers this?
- What data does it read or change?
- New screen, or an extension of an existing one?
- Network, local storage, or both?
- Any analytics events?
- Is there a ticket? Take the ID from the branch name if there is one.

## Step 3 — Affected layers

Map the feature onto the directories found in step 1:

| Layer | Holds | Location |
|---|---|---|
| Presentation | screen, view model, navigation | the screens directory |
| Domain | use cases, entities | the use cases and entities directories |
| Domain abstractions | repository protocols | the abstractions directory |
| Data | repository implementations, DTOs | the repositories and network directories |
| Data persistence | records, DAOs | the persistence directory, if one exists |

## Step 4 — File table

| Action | File | Layer | Purpose |
|---|---|---|---|
| Create | `{Feature}Screen.swift` | Presentation | entry point |
| Create | `{Feature}ViewModel.swift` | Presentation | state |
| Create | `{Feature}Dependencies.swift` | Presentation | injected use cases |
| Create | `{Action}{Entity}UseCase.swift` | Domain | business action |
| Create | `{Entity}RepositoryProtocol.swift` | Domain abstractions | contract |
| Create | `{Entity}RepositoryImpl.swift` | Data | implementation |
| Create | `{Action}{Entity}Request.swift` | Data | request model |
| Create | `{Entity}Response.swift` | Data | response model |
| Modify | the registration file | DI | register the new types |
| Modify | the parent screen or router | Presentation | navigation entry |

Drop the rows the feature does not need. A plan that lists every row regardless
of the feature has not been thought through.

## Step 5 — Data flow

```
user action
  → {Feature}Screen
    → {Feature}ViewModel
      → {Action}{Entity}UseCase
        → {Entity}Repository, protocol in Domain, implementation in Data
          → the networking abstraction this area of the app uses
            → request, response
              → response.toDomain()
                → domain entity
                  → view model state
                    → view
```

Pick the networking abstraction by finding the existing repository closest in
purpose and using the same one. There is no universal mapping from feature area
to abstraction.

## Step 6 — Registrations

List every new binding: repository protocol to implementation, use case protocol
to implementation, any new service, and the fields added to the dependencies
struct. Name the file each belongs in, from step 1.

## Step 7 — Edge cases

Empty, loading, error. Then the ones that depend on the feature: offline
behaviour, pagination, deep links, authentication, overlapping async calls,
retain cycles. List only those that actually apply, with what should happen.

## Step 8 — Output

1. Problem and solution
2. File table
3. Data flow
4. Registrations
5. Edge cases
6. Size: S, M or L

## Rules

- Wait for approval before writing code.
- Follow the project's naming and file conventions, not this skill's placeholders.
- `async`/`await`, protocol-typed dependencies, no force unwrap outside DI
  resolution, no `print`, no commented-out code.
- Reasoning belongs in the plan and the MR description, not in code comments.
