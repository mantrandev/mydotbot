---
name: creating-screen
description: "Scaffolds a complete feature module with Screen, View, ViewModel, Coordinator, and Dependencies. Use when creating a new screen or feature."
---

# Create Screen / Feature Module

Scaffolds a complete feature module following ShopHelp's MVVM-C + Clean Architecture.

## Files to Create

All files go in `ShopHelp/Presentation/{Feature}/`:

| File | Purpose |
|------|---------|
| `{Feature}Screen.swift` | SwiftUI View entry point with `@StateObject` ViewModel |
| `{Feature}View.swift` | UI layout (optional, for complex UIs) |
| `{Feature}ViewModel.swift` | `@MainActor final class ObservableObject` |
| `{Feature}Dependencies.swift` | Struct with injected use cases/services |
| `{Feature}Coordinator.swift` | Resolves DI, creates ViewModel, manages navigation |

## Templates

### {Feature}Screen.swift

```swift
//
//  {Feature}Screen.swift
//  ShopHelp
//
//  Created by Man Tran on DD/MM/YY.
//

import SwiftUI

struct {Feature}Screen: View {

    @StateObject private var viewModel: {Feature}ViewModel

    init(viewModel: {Feature}ViewModel) {
        _viewModel = StateObject(wrappedValue: viewModel)
    }

    var body: some View {
        content
            .task {
                await viewModel.onAppear()
            }
    }

    @ViewBuilder
    private var content: some View {
        switch viewModel.state {
        case .loading:
            ProgressView()
        case .loaded(let data):
            {Feature}ContentView(data: data)
        case .empty:
            EmptyStateView()
        case .error:
            ErrorView(message: viewModel.errorMessage)
        }
    }
}
```

### {Feature}ViewModel.swift

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

enum {Feature}State {
    case loading
    case loaded(DomainModel)
    case empty
    case error
}
```

### {Feature}Dependencies.swift

```swift
//
//  {Feature}Dependencies.swift
//  ShopHelp
//
//  Created by Man Tran on DD/MM/YY.
//

struct {Feature}Dependencies {
    let someUseCase: SomeUseCaseProtocol
}
```

### {Feature}Coordinator.swift

```swift
//
//  {Feature}Coordinator.swift
//  ShopHelp
//
//  Created by Man Tran on DD/MM/YY.
//

import SHArchitecture

final class {Feature}Coordinator: Coordinator {

    @MainActor
    init(route: Router, dependency: Dependency, coordinator: Coordinator? = nil) {
        let useCase = dependency.resolve(SomeUseCaseProtocol.self)!
        let dependencies = {Feature}Dependencies(someUseCase: useCase)
        let viewModel = {Feature}ViewModel(dependencies: dependencies)
        // Setup navigation
    }
}
```

## Integration Checklist

1. **DI Registration**: Register all UseCases and Repositories in assembly files.
2. **Navigation**: Add route in parent coordinator for presenting this screen.
3. **Tracking**: Add `{Feature}ViewModel+Tracking.swift` if analytics needed.
4. **Preview**: Add SwiftUI preview with mock dependencies if useful.

## Checklist

- [ ] All files have correct header with date
- [ ] Screen uses `@StateObject` for ViewModel
- [ ] ViewModel is `@MainActor final class ObservableObject`
- [ ] Dependencies struct with protocol-typed fields
- [ ] Coordinator resolves DI and creates ViewModel
- [ ] State enum covers loading, loaded, empty, error
- [ ] async/await for all data loading
- [ ] No force unwrap (except DI resolution in Coordinator)
- [ ] No print, no Combine, no commented-out code
- [ ] Navigation wired in parent coordinator
- [ ] DI registered in assembly

## Reference

See existing screens in `ShopHelp/Presentation/` (ProductList, ProductDetail, MyOrder, Chat) for patterns.
See `docs/PATTERNS.md` for Screen/Coordinator pattern.
See `docs/ARCHITECTURE.md` for layer structure.
