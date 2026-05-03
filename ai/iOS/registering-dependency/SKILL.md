---
name: registering-dependency
description: "Registers a new dependency in Swinject DI container. Use when adding new UseCase, Repository, or Service to DI."
---

# Register Dependency

Registers a new dependency in the Swinject DI container following ShopHelp patterns.

## Identify the Correct Assembly

| Dependency Type | Assembly File |
|-----------------|---------------|
| UseCase | `AppUsecasesAssembly.swift` |
| Repository | `RepositoriesAssembly.swift` |
| Service | `AppServicesAssembly.swift` |
| Networking Gateway | `NetworkAssembly.swift` |

Search for these files in the project if unsure of exact location.

## Registration Pattern

### Basic Registration (Transient)

```swift
container.register(MyUseCaseProtocol.self) { resolver in
    let repository = resolver.resolve(MyRepositoryProtocol.self)!
    return MyUseCase(repository: repository)
}
```

### Singleton Registration (Container Scope)

```swift
container.register(MyRepositoryProtocol.self) { resolver in
    let networking = resolver.resolve(AppGatewayNetworkingProtocol.self)!
    return MyRepositoryImpl(networking: networking)
}.inObjectScope(.container)
```

### Object Scopes

| Scope | Behavior | Use For |
|-------|----------|---------|
| Default (transient) | New instance every resolve | UseCases, ViewModels |
| `.container` | Singleton within container | Repositories, Services |

## Resolution in Coordinator

```swift
let useCase = dependency.resolve(MyUseCaseProtocol.self)!
let dependencies = FeatureDependencies(useCase: useCase)
let viewModel = FeatureViewModel(dependencies: dependencies)
```

Force unwrap (`!`) is allowed ONLY at DI resolution in Coordinators — this is the project convention.

## Adding to Dependencies Struct

```swift
struct FeatureDependencies {
    let myUseCase: MyUseCaseProtocol
    let anotherUseCase: AnotherUseCaseProtocol
}
```

Fields are always protocol types, never concrete implementations.

## Workflow

1. **Define** the protocol (in Domain or appropriate layer).
2. **Implement** the concrete class (in Data or appropriate layer).
3. **Register** in the correct assembly file.
4. **Add** to the Dependencies struct for the consuming feature.
5. **Resolve** in the Coordinator when creating the ViewModel.
6. **Update PreviewMocks** if SwiftUI previews use mock dependencies.

## Common Registration Chains

### UseCase → Repository → Gateway

```swift
// 1. Repository
container.register(ProductRepositoryProtocol.self) { resolver in
    let networking = resolver.resolve(AppGatewayNetworkingProtocol.self)!
    return ProductRepositoryImpl(networking: networking)
}.inObjectScope(.container)

// 2. UseCase
container.register(GetProductListUseCaseProtocol.self) { resolver in
    let repo = resolver.resolve(ProductRepositoryProtocol.self)!
    return GetProductListUseCase(repository: repo)
}
```

### UseCase with Multiple Dependencies

```swift
container.register(CheckoutUseCaseProtocol.self) { resolver in
    let orderRepo = resolver.resolve(OrderRepositoryProtocol.self)!
    let cartRepo = resolver.resolve(CartRepositoryProtocol.self)!
    return CheckoutUseCase(orderRepository: orderRepo, cartRepository: cartRepo)
}
```

## Checklist

- [ ] Protocol exists before registering
- [ ] Correct assembly file chosen
- [ ] Correct object scope (transient vs container)
- [ ] All sub-dependencies resolved in closure
- [ ] Dependencies struct updated
- [ ] Coordinator resolves correctly
- [ ] PreviewMocks updated if needed
- [ ] No circular dependencies

## Reference

See `docs/PATTERNS.md` for the DI pattern.
See `docs/ARCHITECTURE.md` for `AppDependency.shared.resolve()` usage.
