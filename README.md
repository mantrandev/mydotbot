# mydotbot

Dotbot-managed agent config for Claude, Codex, and Pi.

## Structure

```
ai/
├── AGENTS.md              # Shared global rules for all agents
├── commonSkills/          # Source skills (Claude + Codex)
├── iOS/                   # iOS-specific source skills
├── web/                   # Parked web skills (not default-loaded)
├── skills/                # Generated active skills (built by sync script)
└── sync-agent-config.sh   # Propagates changes to all agents
```

## Install

```bash
./install.sh
```

Creates symlinks for:
- `~/.claude/` — Claude Code
- `~/.codex/` — Codex
- `~/.pi/agent/` — Pi
- `~/.agents/` — shared

## Skills

| Skill | Description |
|---|---|
| analyzing-source-code | Architecture analysis + Mermaid diagrams |
| analyzing-video | Frame-by-frame video analysis via FFmpeg |
| architecture-validator | Clean Architecture boundary checks |
| branch-cleaner | Find and delete merged feature branches |
| check-async-pattern | Enforce async/await, no Combine publishers |
| clean-debug | Remove debug print statements from staged files |
| create-branch | Create feature branch and unstash CLAUDE.md |
| create-desc-mr | Generate MR description from git diff |
| creating-repository | Scaffold Repository protocol + implementation |
| creating-screen | Scaffold full feature module (Screen/View/ViewModel) |
| creating-usecase | Scaffold UseCase protocol + implementation |
| creating-viewmodel | Scaffold ViewModel with DI and async/await |
| debugging-ios | Debug iOS issues from logs and crash reports |
| diagnostics-agent | Symptom-first root-cause investigation |
| find-skills | Discover and install agent skills |
| find-ticket | Search ticket ID across code, commits, branches |
| gemini-plan | Analyze codebase with Gemini CLI |
| jira-acli | Manage Jira via shell functions |
| liquid-glass-ios | Liquid Glass effects in SwiftUI/UIKit |
| matplotlib | Plotting: line, scatter, bar, heatmap, 3D |
| planning-feature | Plan iOS feature with architecture decisions |
| pre-commit-check | Run all code standard checks before commit |
| quick-commit | Stage all + conventional commit message |
| registering-dependency | Register dependency in Swinject DI container |
| review-agent | Findings-first code review agent |
| reviewing-code | Review Swift code against project standards |
| shophelp-perftrace-triage | Diagnose ShopHelp PerfTrace telemetry |
| shophelp-test-failure-triage | Diagnose ShopHelp XCTest failures |
| sim-validation-flow | iOS simulator validation via lldb + axe |
| simulate-notification | iOS simulator APNS push notification testing |
| swift-lint-check | Swift code standards linting |
| unused-code-finder | Detect unused classes, functions, variables |
| usage-dashboard | Claude Code usage stats dashboard |
| validate-di | Validate Swinject DI registrations |
| visual-explainer | Generate HTML visual explainers for code/systems |
| writing-unit-tests | Write XCTest + Cuckoo mock unit tests |

## Updating skills

Edit source in `ai/commonSkills/` or `ai/iOS/`, then run:

```bash
./ai/sync-agent-config.sh
./install.sh
```
