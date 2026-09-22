---
name: writing-unit-tests
description: "Write unit tests for an iOS project — test placement, naming, mocking and assertions, matching the project's own test target, framework and mocking approach. Use when creating or adding tests in Swift."
---

# Write unit tests

Before writing, read the project's existing tests. Their framework, mocking
approach and naming are the convention — this skill describes the shape, not the
specific names.

## Discover first

```bash
find . -type d -name '*Tests*' -maxdepth 3 -not -path '*/.*'
grep -rl 'import Cuckoo\|import Mockingbird\|import Testing\|import XCTest' --include='*.swift' . | head
grep -rh '@testable import' --include='*.swift' . | sort -u
```

That gives three things this skill needs:

| Needed | From |
|---|---|
| test target directory | the `*Tests*` directory |
| XCTest or Swift Testing | which framework the existing tests import |
| mocking approach | Cuckoo, Mockingbird, or hand-written protocol fakes |
| module under test | the `@testable import` line |

A project with no tests yet gets the conventions below; a project with tests
gets its own.

## Placement

Tests mirror the source tree inside the test target:

| Source | Test |
|---|---|
| `{Module}/Presentation/{Feature}/{Feature}ViewModel.swift` | `{Module}Tests/Presentation/{Feature}ViewModelTests.swift` |
| `{Module}/Domain/UseCases/{Action}{Entity}UseCase.swift` | `{Module}Tests/Domain/{Action}{Entity}UseCaseTests.swift` |
| `{Module}/Data/Repositories/{Entity}RepositoryImpl.swift` | `{Module}Tests/Data/{Entity}RepositoryTests.swift` |

## Naming

```
test_{methodName}_{scenario}_{expectedResult}
```

- `test_loadData_success_stateIsLoaded`
- `test_loadData_networkError_stateIsError`
- `test_execute_invalidInput_throwsError`

The scenario and the expected result both appear in the name, so a failure
report names the broken behaviour without opening the file.

## XCTest template

Reproduce the header format of the sibling test files, or omit it if they have
none.

```swift
import XCTest
@testable import {Module}

@MainActor
final class {Name}Tests: XCTestCase {

    private var sut: {ClassUnderTest}!
    private var mockDependency: Mock{DependencyProtocol}!

    override func setUp() {
        super.setUp()
        mockDependency = Mock{DependencyProtocol}()
        sut = {ClassUnderTest}(dependency: mockDependency)
    }

    override func tearDown() {
        sut = nil
        mockDependency = nil
        super.tearDown()
    }
}
```

Nil out both in `tearDown`. `XCTestCase` instances are retained for the whole
run, so a `sut` left assigned keeps its dependency graph alive across every
later test.

## Swift Testing template

For projects on the newer framework:

```swift
import Testing
@testable import {Module}

@MainActor
struct {Name}Tests {

    @Test
    func loadData_success_stateIsLoaded() async {
        let mock = Mock{DependencyProtocol}()
        let sut = {ClassUnderTest}(dependency: mock)

        await sut.loadData()

        #expect(sut.state == .loaded(expected))
    }
}
```

A struct with per-test state needs no `setUp` or `tearDown` — each test gets a
fresh instance.

## Test body shape

Three phases, separated by blank lines rather than labelled:

```swift
func test_loadData_success_stateIsLoaded() async {
    stub(mockUseCase) { stub in
        when(stub.execute()).thenReturn(expected)
    }

    await sut.loadData()

    XCTAssertEqual(sut.state, .loaded(expected))
    verify(mockUseCase).execute()
}
```

Arrange, act, assert. If a test needs a comment to explain which phase a line
belongs to, the test is doing too much.

## Mocking

The syntax below is Cuckoo's. Use whatever the project already uses.

Stubbing a return, an error, and an async result:

```swift
stub(mockRepository) { stub in
    when(stub.fetch(id: any())).thenReturn(expected)
}

stub(mockRepository) { stub in
    when(stub.fetch(id: any())).thenThrow(NetworkError.timeout)
}
```

Verifying a call, a count, and an absence:

```swift
verify(mockRepository).fetch(id: equal(to: "123"))
verify(mockRepository, times(2)).fetch(id: any())
verify(mockRepository, never()).delete(id: any())
```

With generated mocks, find the generation command before adding a protocol —
often a `run` script, a `Makefile` target, or a build phase:

```bash
grep -rn 'cuckoo\|mockingbird' Makefile *.sh fastlane/ 2>/dev/null | head
```

Without a mocking library, write a fake conforming to the protocol, recording
calls in an array. That is often shorter than the stub syntax above.

## What to cover

For a view model: the success path, each failure path, and the empty result.
State assertions beat method-call assertions — `state == .loaded(x)` describes
behaviour, `verify(...)` describes implementation.

For a use case: the business rule it exists for, and the error it translates.
A use case test that only checks the repository was called tests nothing.

For a repository: the mapping from response to domain type, and the error
surface. Not the network client.

## Running

Find the project's own commands before inventing one:

```bash
grep -nE '^[a-z-]+:' Makefile 2>/dev/null | head
ls *.xcworkspace *.xcodeproj Package.swift 2>/dev/null
```

Single class, when no make target exists:

```bash
xcodebuild test \
  -project {Project}.xcodeproj \
  -scheme {Scheme} \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  -only-testing:{Module}Tests/{TestClassName} \
  CODE_SIGNING_ALLOWED=NO
```

## Checklist

- [ ] Placed to mirror the source file, in the project's test target
- [ ] Framework and mocking approach match the existing tests
- [ ] Name says method, scenario and expected result
- [ ] Arrange, act, assert, separated by blank lines
- [ ] Success and failure paths both covered
- [ ] Async tests declared `async` or `async throws`
- [ ] `XCTestCase` properties nilled in `tearDown`
- [ ] Assertions on state, not on implementation calls
- [ ] Header matches sibling test files
- [ ] No force unwrap outside mock setup, no `print`
