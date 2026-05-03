---
name: creating-repository
description: "Scaffolds a Repository protocol and implementation with network or database layer. Use when creating a new Repository."
---

# Create Repository

Scaffolds a Repository following Clean Architecture with protocol in Domain and implementation in Data.

## File Structure

| File | Location | Purpose |
|------|----------|---------|
| `{Entity}RepositoryProtocol.swift` | `ShopHelp/Domain/Abstractions/` | Repository contract |
| `{Entity}RepositoryImpl.swift` | `ShopHelp/Data/Repositories/` | Implementation |
| `{Action}{Entity}Request.swift` | `ShopHelp/Data/Network/APIRequest/` | API request model |
| `{Entity}Response.swift` | `ShopHelp/Data/Network/APIResponse/` | API response model |

## Templates

### Protocol (Domain Layer)

```swift
//
//  {Entity}RepositoryProtocol.swift
//  ShopHelp
//
//  Created by Man Tran on DD/MM/YY.
//

protocol {Entity}RepositoryProtocol {
    func fetch{Entity}(id: String) async throws -> {Entity}Domain
    func save{Entity}(_ entity: {Entity}Domain) async throws
}
```

### Implementation (Data Layer)

```swift
//
//  {Entity}RepositoryImpl.swift
//  ShopHelp
//
//  Created by Man Tran on DD/MM/YY.
//

final class {Entity}RepositoryImpl: {Entity}RepositoryProtocol {

    private let networking: AppGatewayNetworkingProtocol

    init(networking: AppGatewayNetworkingProtocol) {
        self.networking = networking
    }

    func fetch{Entity}(id: String) async throws -> {Entity}Domain {
        let request = Get{Entity}Request(id: id)
        let response: {Entity}Response = try await networking.request(request)
        return response.toDomain()
    }

    func save{Entity}(_ entity: {Entity}Domain) async throws {
        let request = Save{Entity}Request(entity: entity)
        try await networking.request(request)
    }
}
```

### API Request Model

```swift
//
//  Get{Entity}Request.swift
//  ShopHelp
//
//  Created by Man Tran on DD/MM/YY.
//

import Networking

struct Get{Entity}Request: APIRequest {
    typealias Response = {Entity}Response

    let id: String
    var path: String { "/api/v1/entities/\(id)" }
    var method: HTTPMethod { .get }
}
```

### API Response Model

```swift
//
//  {Entity}Response.swift
//  ShopHelp
//
//  Created by Man Tran on DD/MM/YY.
//

struct {Entity}Response: Decodable {
    let id: String
    let name: String

    func toDomain() -> {Entity}Domain {
        {Entity}Domain(
            id: id,
            name: name
        )
    }
}
```

## Gateway Selection

Choose the correct gateway based on the feature area:

| Gateway | Use For |
|---------|---------|
| `AppGatewayNetworkingProtocol` | Products, product details, reviews |
| `OrderGatewayNetworkingProtocol` | Cart, checkout operations |
| `FrontGatewayNetworkingProtocol` | Order details, login |
| `TrackingGatewayNetworkingProtocol` | Analytics events |
| `AIGatewayNetworkingProtocol` | Chat, AI features |
| `RemoteConfigsGatewayNetworkingProtocol` | Feature flags |
| `NotificationGatewayNetworkingProtocol` | Push notifications |

## Domain Mapping

- Response models live in Data layer and implement `toDomain()`.
- Domain models live in `ShopHelp/Domain/Entities/`.
- Never expose response/request types to Presentation layer.
- Domain models are simple structs with no framework dependencies.

## DI Registration

Register in `RepositoriesAssembly.swift` (or equivalent):

```swift
container.register({Entity}RepositoryProtocol.self) { resolver in
    let networking = resolver.resolve(AppGatewayNetworkingProtocol.self)!
    return {Entity}RepositoryImpl(networking: networking)
}.inObjectScope(.container)
```

## Database Repositories

For repositories backed by local DB (GRDB):

```swift
final class {Entity}LocalRepositoryImpl: {Entity}RepositoryProtocol {

    private let database: MainDatabaseProtocol

    init(database: MainDatabaseProtocol) {
        self.database = database
    }

    func fetch{Entity}(id: String) async throws -> {Entity}Domain {
        let record = try await database.read { db in
            try {Entity}Record.fetchOne(db, key: id)
        }
        return record?.toDomain()
    }
}
```

## Checklist

- [ ] Protocol in `Domain/Abstractions/` with async throws methods
- [ ] Implementation in `Data/Repositories/` as `final class`
- [ ] Correct gateway injected
- [ ] Request model with path, method, parameters
- [ ] Response model with `toDomain()` mapping
- [ ] Domain entity created if new
- [ ] DI registered in assembly with correct scope
- [ ] File headers with correct date
- [ ] No force unwrap (except DI resolution)
- [ ] No print, no Combine

## Reference

See `docs/PATTERNS.md` for the canonical Repository pattern.
See `ShopHelp/Data/Repositories/` for existing implementations.
See `docs/ARCHITECTURE.md` for gateway documentation.
