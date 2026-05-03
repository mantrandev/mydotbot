---
name: planning-feature
description: "Plans iOS feature implementation with architecture decisions, file changes, and data flow. Use when asked to plan, design, or architect a new feature."
---

# Plan Feature Implementation

Plans a new feature for the ShopHelp iOS app following Clean Architecture (Presentation → Domain ← Data), MVVM-C, and Swinject DI.

## Workflow

### Step 0: Problem & Solution Summary

Before anything else, output:
- **Problem**: One sentence describing what needs to be built.
- **Solution**: One sentence describing the approach.

Wait for explicit approval ("go" / "next") before proceeding.

### Step 1: Understand the Requirement

Ask clarifying questions if any of these are unclear:
- What user action triggers this feature?
- What data does it display or mutate?
- Does it require a new screen, or extend an existing one?
- Does it need network calls, local DB, or both?
- Are there tracking/analytics events required?
- Is there a ticket ID (e.g., SHOPHELP-XXXX)?

### Step 2: Identify Affected Layers

Map the feature to Clean Architecture layers:

| Layer | Purpose | Location |
|-------|---------|----------|
| **Presentation** | Screen, View, ViewModel, Coordinator | `ShopHelp/Presentation/{Feature}/` |
| **Domain** | UseCase protocols + implementations, Entities | `ShopHelp/Domain/UseCases/`, `ShopHelp/Domain/Entities/` |
| **Domain Abstractions** | Repository protocols | `ShopHelp/Domain/Abstractions/` |
| **Data** | Repository implementations, Network models | `ShopHelp/Data/Repositories/`, `ShopHelp/Data/Network/` |
| **Data Database** | GRDB records, DAOs | `ShopHelp/Data/Database/` |

### Step 3: List All Files to Create/Modify

Output a markdown table:

| Action | File | Layer | Purpose |
|--------|------|-------|---------|
| Create | `{Feature}Screen.swift` | Presentation | SwiftUI view |
| Create | `{Feature}ViewModel.swift` | Presentation | State management |
| Create | `{Feature}Dependencies.swift` | Presentation | DI container |
| Create | `{Feature}Coordinator.swift` | Presentation | Navigation + DI resolution |
| Create | `{Action}{Entity}UseCase.swift` | Domain | Business logic |
| Create | `{Entity}RepositoryProtocol.swift` | Domain/Abstractions | Repository contract |
| Create | `{Entity}RepositoryImpl.swift` | Data | Repository implementation |
| Create | `{Action}{Entity}Request.swift` | Data/Network | API request model |
| Create | `{Entity}Response.swift` | Data/Network | API response model |
| Modify | Assembly file | DI | Register new dependencies |
| Modify | Parent Coordinator | Presentation | Add navigation route |

### Step 4: Define Data Flow

Draw the data flow diagram:

```
User Action
  → {Feature}Screen (SwiftUI View)
    → {Feature}ViewModel (@MainActor, ObservableObject)
      → {Action}{Entity}UseCase (protocol-based)
        → {Entity}Repository (protocol in Domain, impl in Data)
          → Gateway (AppGateway / OrderGateway / etc.)
            → API Request/Response
              → Response.toDomain() mapping
                → Domain Entity
                  → ViewModel @Published state
                    → View refresh (SwiftUI)
```

Identify which gateway to use:
- **AppGateway**: Products, reviews
- **OrderGateway**: Cart, checkout
- **FrontGateway**: Orders, login
- **AIGateway**: Chat
- **TrackingGateway**: Analytics
- **RemoteConfigsGateway**: Feature flags
- **NotificationGateway**: Push notifications

### Step 5: Identify DI Registrations

List all registrations needed:
- Repository protocol → implementation (in `RepositoriesAssembly`)
- UseCase protocol → implementation (in `AppUsecasesAssembly`)
- Any new services (in `AppServicesAssembly`)
- Dependencies struct fields

### Step 6: List Edge Cases

Consider:
- Empty state (no data)
- Loading state
- Error state (network failure, timeout)
- Offline behavior
- Pagination (if list-based)
- Deep linking
- Authentication required?
- Race conditions in async calls
- Memory management (retain cycles)

### Step 7: Output Final Plan

Combine all steps into a structured plan document with:
1. Problem & Solution summary
2. File changes table
3. Data flow diagram
4. DI registrations list
5. Edge cases list
6. Estimated complexity (S/M/L)

## Rules

- Wait for approval before implementing any code.
- Follow file naming from `docs/CONVENTIONS.md`.
- Every new Swift file needs the standard header.
- No force unwrap, no print, no Combine, no commented-out code.
- Async/await only, no completion handlers.
 Protocol-based DI via Swinject, no singletons.
