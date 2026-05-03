---
name: creating-viewmodel
description: "Scaffolds a ViewModel with @MainActor, ObservableObject, async/await, and Swinject DI. Use when creating a new ViewModel."
---

# Create ViewModel

Scaffolds a ViewModel following ShopHelp patterns from `docs/PATTERNS.md`.

## File Naming

`{Feature}ViewModel.swift` → placed in `ShopHelp/Presentation/{Feature}/`

## Template

```swift
//
//  {Feature}ViewModel.swift
//  ShopHelp
//
//  Created by Man Tran on DD/MM/YY.
//

import Foundation

@MainActor
final class {Feature}ViewModel: ObservableObject {

    @Published var state: {Feature}State = .loading
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let dependencies: {Feature}Dependencies

    init(dependencies: {Feature}Dependencies) {
        self.dependencies = dependencies
    }

    func onAppear() async {
        await loadData()
    }

    func loadData() async {
        isLoading = true
        errorMessage = nil
        do {
            let result = try await dependencies.someUseCase.execute()
            state = .loaded(result)
        } catch {
            state = .error
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}
```

## Dependencies Struct

Every ViewModel must have a corresponding `{Feature}Dependencies.swift`:

```swift
//
//  {Feature}Dependencies.swift
//  ShopHelp
//
//  Created by Man Tran on DD/MM/YY.
//

struct {Feature}Dependencies {
    let someUseCase: SomeUseCaseProtocol
    let anotherUseCase: AnotherUseCaseProtocol
}
```

## Patterns

### Constructor Injection

- Inject via `Dependencies` struct, not individual parameters (when > 2 dependencies).
- For 1-2 dependencies, direct injection is acceptable.
- Dependencies struct fields are always protocol types.

### State Management

- Use `@Published` for all observable state.
- Define a state enum if the screen has distinct states:

```swift
enum {Feature}State {
    case loading
    case loaded(DomainModel)
    case empty
    case error
}
```

### Async Methods

- All data-fetching methods are `async`.
- No completion handlers, no Combine publishers.
- Handle errors with do/catch, update `@Published` properties.

### Error Handling

```swift
func performAction() async {
    do {
        let result = try await dependencies.useCase.execute()
        state = .loaded(result)
    } catch {
        errorMessage = error.localizedDescription
    }
}
```

### ViewModel Extensions

Separate concerns into extensions for tracking, performance:
- `{Feature}ViewModel+Tracking.swift` for analytics
- `{Feature}ViewModel+SaleFunnelPerfTrace.swift` for performance

## Checklist

- [ ] File header with correct date
- [ ] `@MainActor final class` + `ObservableObject`
- [ ] `@Published` for all observable state
- [ ] Dependencies struct created
- [ ] Constructor injection
- [ ] All methods use async/await
- [ ] Error handling with do/catch
- [ ] No force unwrap
- [ ] No print statements
- [ ] No Combine publishers
- [ ] No commented-out code

## Reference

See `docs/PATTERNS.md` for the canonical ViewModel pattern.
See existing ViewModels in `ShopHelp/Presentation/` for real examples.
