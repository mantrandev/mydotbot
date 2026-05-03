---
name: analyzing-source-code
description: "Analyzes source code architecture and implementation, generates Mermaid diagrams, and outputs documented results to an artifacts folder. Use when asked to analyze code, explain architecture, understand code flow, or generate code diagrams."
argument-hint: "Ask your questions about the source code, e.g. 'How does the login flow work from UI to API?'"
---

# Analyzing Source Code

Analyzes source code from architecture down to implementation details. Accepts user questions as input, generates Mermaid diagrams, and outputs structured documentation to an artifacts folder.

## Input

The user MUST provide:
1. **Questions about the source code** — What do they want to understand? Examples:
   - "How does the chat feature work end-to-end?"
   - "What is the dependency graph of the order module?"
   - "How does data flow from API response to UI?"
   - "What are all the components involved in authentication?"
2. **Target scope** — Specific files, folders, features, or the entire project.

If the user does not provide clear questions, ask:
- What specific part of the codebase do you want to analyze?
- What questions do you have about it?
- Do you want architecture-level, module-level, or function-level analysis?

## Workflow

### Step 1: Gather Questions & Scope

Collect and confirm:
- The user's specific questions (list them back)
- The target files/folders/features to analyze
- The depth of analysis: `architecture` | `module` | `implementation` | `all`

Default to `all` if not specified.

### Step 2: Read & Analyze Source Code

Use `finder`, `Read`, `Grep`, and `glob` to thoroughly explore the target code.

#### 2a: Architecture Analysis
- Identify all layers (Presentation, Domain, Data, etc.)
- Map dependencies between layers
- Identify design patterns used (MVVM, Clean Architecture, Repository, Coordinator, etc.)
- Identify DI registrations and how components are wired

#### 2b: Module Analysis
- List all modules/features in scope
- Identify each module's responsibilities
- Map inter-module dependencies
- Identify shared services and utilities

#### 2c: Implementation Analysis
- Trace data flow for the user's specific questions
- Identify key classes, protocols, and their responsibilities
- Map function call chains
- Identify async flows, state management, and side effects

### Step 3: Generate Mermaid Diagrams

Generate diagrams using the `mermaid` tool. Choose diagram types based on what best answers the user's questions:

#### 3a: Architecture Diagram (always generate)
```
flowchart TB — showing layers and their dependencies
```

#### 3b: Module Dependency Diagram (when analyzing multiple modules)
```
flowchart LR — showing how modules depend on each other
```

#### 3c: Data Flow Diagram (when analyzing a feature flow)
```
sequenceDiagram — showing how data moves from user action to API and back
```

#### 3d: Class/Protocol Diagram (when analyzing implementation)
```
classDiagram — showing class hierarchies, protocol conformances, and relationships
```

#### 3e: State Diagram (when analyzing state management)
```
stateDiagram-v2 — showing state transitions in ViewModels or state machines
```

#### 3f: Coordinator/Navigation Diagram (when analyzing navigation)
```
flowchart TD — showing screen navigation and coordinator hierarchy
```

**Diagram rules:**
- ALWAYS include `citations` linking nodes/edges to actual source files with line numbers
- Use DARK fill colors with light text for custom styles
- Keep diagrams readable — split large diagrams into multiple smaller ones
- Label all edges with meaningful descriptions (function names, data types)

### Step 4: Document Component Responsibilities

For each component/class/protocol found in the analysis, document:

| Component | File | Type | Responsibility |
|-----------|------|------|----------------|
| `{Name}` | `{path}` | class/protocol/struct/enum | One-line description of what it does |

For key functions, document:

| Function | Owner | Purpose | Input → Output |
|----------|-------|---------|----------------|
| `{name}()` | `{ClassName}` | What it does | `ParamType → ReturnType` |

### Step 5: Output Results to Artifacts Folder

Create output folder: `.amp/in/artifacts/code-analysis-{feature-or-scope}/`

Generate these files:

#### 5a: `README.md` — Main analysis document
Structure:
```markdown
# Code Analysis: {Scope/Feature}

## Questions Answered
- Q1: ...
- Q2: ...

## Architecture Overview
{Description + reference to architecture diagram}

## Module Breakdown
{For each module: purpose, key files, dependencies}

## Data Flow
{Step-by-step flow description + reference to sequence diagram}

## Component Reference
{Tables from Step 4}

## Function Reference
{Key function tables from Step 4}

## Diagrams
- architecture-diagram.md
- data-flow-diagram.md
- class-diagram.md
- (etc.)
```

#### 5b: Individual diagram files (`{name}-diagram.md`)
Each file contains:
```markdown
# {Diagram Title}

## Description
{What this diagram shows}

## Diagram
{Mermaid code block so user can render it}

## Notes
{Any important observations about relationships shown}
```

### Step 6: Present Summary

After generating all artifacts, present:
1. List of all generated files with one-line descriptions
2. Key findings and answers to the user's original questions
3. Any notable patterns, issues, or observations discovered

## Analysis Depth Reference

### Architecture Level
- Layer boundaries and dependencies
- Design patterns used
- DI/IoC container structure
- Gateway/API structure

### Module Level
- Feature modules and their boundaries
- Shared services and utilities
- Inter-module communication patterns
- Coordinator/navigation graph

### Implementation Level
- Class hierarchies and protocol conformances
- Function call chains for specific flows
- State management (Published properties, state machines)
- Async flow (Task, AsyncStream, continuation patterns)
- Error handling paths
- Data mapping (Response → Entity → ViewModel state)

## Rules

- Never guess — only document what is confirmed by reading source code.
- Always include file paths and line numbers in citations.
- Split complex diagrams into multiple focused diagrams.
- Answer the user's specific questions first, then provide broader context.
- Use the `mermaid` tool to render diagrams (not just code blocks).
- Output all artifacts to `.amp/in/artifacts/` so they appear in the Artifacts tab.
