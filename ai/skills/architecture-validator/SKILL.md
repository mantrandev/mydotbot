---
name: architecture-validator
description: Validate Clean Architecture boundaries and dependencies
args: [path]
---

Check Clean Architecture compliance in ${path:-"."} :

**Layer Rules:**
- **Presentation** → can import Domain (ViewModels, Coordinators, Views)
- **Domain** → no imports (UseCases, Entities, Repository Protocols)
- **Data** → can import Domain (Repository implementations, DTOs, Network)

**Check violations:**

1. **Domain importing Data/Presentation**:
   - Search Domain files for `import` statements
   - Should only have Foundation/Swift imports

2. **Presentation importing Data**:
   - Presentation should only import Domain
   - Check for Data layer imports in Presentation files

3. **Repository pattern**:
   - Protocols in Domain/Repositories/
   - Implementations in Data/Repositories/
   - Use Glob to find Repository files

4. **ViewModel dependencies**:
   - Should depend on protocols, not concrete types
   - Check init parameters use protocols

Report format:
```
## Architecture Validation

### Layer Dependencies
✓ Domain has no external dependencies
✓ Presentation imports only Domain
✓ Data imports only Domain

### Violations
- ✗ DomainFile.swift:12 - imports Data layer
- ✗ ViewModelFile.swift:34 - depends on concrete Repository

### Repository Pattern
✓ X protocols in Domain
✓ X implementations in Data
✗ Missing implementation for ProtocolName

Status: PASS/FAIL
```
