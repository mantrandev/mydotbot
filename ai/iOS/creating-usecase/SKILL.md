---
name: creating-usecase
description: "Scaffolds a UseCase protocol and implementation following Clean Architecture. Use when creating a new UseCase."
---

# Create UseCase

Scaffolds a UseCase protocol and implementation following `docs/PATTERNS.md`.

## File Naming

`{Action}{Entity}UseCase.swift` → placed in `{App}/Domain/UseCases/{Feature}/`

Examples:
- `GetProductListUseCase.swift`
- `AddToCartUseCase.swift`
- `RecordProductInteractionUseCase.swift`

## Template

```swift
//
//  {Action}{Entity}UseCase.swift
//  {App}
//
//  Created by Man Tran on DD/MM/YY.
//

protocol {Action}{Entity}UseCaseProtocol {
    func execute(input: InputType) async throws -> OutputType
}

final class {Action}{Entity}UseCase: {Action}{Entity}UseCaseProtocol {

    private let repository: {Entity}RepositoryProtocol

    init(repository: {Entity}RepositoryProtocol) {
        self.repository = repository
    }

    func execute(input: InputType) async throws -> OutputType {
        return try await repository.fetchSomething(input: input)
    }
}
```

## Patterns

### Single Responsibility

Each UseCase does exactly one thing. Name it as `{Verb}{Noun}UseCase`:
- `GetProductDetail` — fetches product detail
- `AddToCart` — adds item to cart
- `TrackCheckoutEvents` — sends checkout analytics

### Protocol-Based

- Always define a protocol (`{Name}UseCaseProtocol`) for testability.
- Implementation is a `final class`.
- Protocol method is named `execute()` by convention.

### Constructor Injection

- Inject repository (or other UseCases) via `init`.
- Dependencies are always protocol types.

### Method Signatures

- Use `async throws` for operations that can fail.
- Use `async` for operations that cannot fail.
- Input/output use Domain types only (never API response types).

```swift
// Simple: no input
func execute() async throws -> [Product]

// With input
func execute(productId: String) async throws -> ProductDetail

// No return (side effect only)
func execute(event: TrackingEvent) async

// Multiple inputs: use a struct
func execute(input: CheckoutInput) async throws -> OrderConfirmation
```

### Error Handling

- Let errors propagate to the ViewModel (do not catch internally unless transforming).
- Use domain-specific error types when needed.

## DI Registration

Register in the appropriate assembly file (typically `AppUsecasesAssembly.swift`):

```swift
container.register({Action}{Entity}UseCaseProtocol.self) { resolver in
    let repository = resolver.resolve({Entity}RepositoryProtocol.self)!
    return {Action}{Entity}UseCase(repository: repository)
}
```

## Checklist

- [ ] File header with correct date
- [ ] Protocol defined with `execute()` method
- [ ] `final class` implementation
- [ ] Constructor injection of repository/dependencies
- [ ] Single responsibility (one action per UseCase)
- [ ] Uses Domain types only (no API/DB types)
- [ ] async/await (no completion handlers)
- [ ] DI registration added to assembly
- [ ] No force unwrap
- [ ] No print statements

## Reference

See `docs/PATTERNS.md` for the canonical UseCase pattern.
See `{App}/Domain/UseCases/` for existing implementations.
