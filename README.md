# mydotbot

Dotbot-managed dotfiles for shell, agents (Claude, Codex, Pi), and skills.

## Structure

```
ai/
├── AGENTS.md              # Shared global rules for all agents
├── agents/                # Claude Code subagent definitions
├── commonSkills/          # Source skills (Claude + Codex)
├── iOS/                   # iOS-specific source skills
├── web/                   # Parked web skills (not default-loaded)
├── memory/                # Persistent memory shared across all Claude accounts
├── skills/                # Generated active skills (built by sync script)
└── sync-agent-config.sh   # Propagates changes to all agents
zsh/
├── .zshrc                 # Zsh config (oh-my-zsh, nvm, aliases)
├── .zprofile              # Homebrew shellenv
└── jira.zsh               # Jira shell helpers
```

## New device setup

```bash
# 1. Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Clone and install
git clone https://github.com/mantrandev/mydotbot.git ~/mydotbot
cd ~/mydotbot
git submodule update --init
./install.sh
```

`./install.sh` will automatically:
- Install all apps and CLI tools via `brew bundle`
- Install VS Code extensions
- Install npm global packages
- Create all symlinks

## Manual installs

These are not on Homebrew — install once on a new device:

| App | Link |
|---|---|
| Xcode | [Mac App Store](https://apps.apple.com/app/xcode/id497799835) |
| TestFlight | [Mac App Store](https://apps.apple.com/app/testflight/id899247664) |
| Keynote | [Mac App Store](https://apps.apple.com/app/keynote/id409183694) |
| RocketSim | [Mac App Store](https://apps.apple.com/app/rocketsim-for-xcode-simulator/id1504940162) |
| Perplexity | [Mac App Store](https://apps.apple.com/app/perplexity-ask-anything/id1668000334) |
| Zalo | [zalo.me](https://zalo.me/pc) |
| BlueStacks | [bluestacks.com](https://www.bluestacks.com) |
| EarnApp | [earnapp.com](https://earnapp.com/i/sdk) |
| Honeygain | [honeygain.com](https://www.honeygain.com) |
| SF Symbols | [developer.apple.com](https://developer.apple.com/sf-symbols/) |

## Install

```bash
./install.sh
```

Creates symlinks for:

**Shell**
- `~/.zshrc` → `zsh/.zshrc`
- `~/.zprofile` → `zsh/.zprofile`
- `~/.zsh/jira.zsh` → `zsh/jira.zsh`
- `~/.claude/statusline-command.sh` → `zsh/statusline-command.sh`

**Agents**
- `~/.claude/` — Claude Code
- `~/.codex/` — Codex
- `~/.pi/agent/` — Pi
- `~/.agents/` — shared

**Memory** (shared across all Claude accounts)
- `~/.claude/memory` → `ai/memory`
- `~/.claude-account1/memory` → `ai/memory`
- `~/.claude-account2/memory` → `ai/memory`
- `~/.claude-account3/memory` → `ai/memory`

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
| registering-dependency | Register dependency in Swinject DI container |
| review-agent | Findings-first code review agent |
| reviewing-code | Review Swift code against project standards |
| sim-validation-flow | iOS simulator validation via lldb + axe |
| simulate-notification | iOS simulator APNS push notification testing |
| swift-lint-check | Swift code standards linting |
| unused-code-finder | Detect unused classes, functions, variables |
| usage-dashboard | Claude Code usage stats dashboard |
| validate-di | Validate Swinject DI registrations |
| visual-explainer | Generate HTML visual explainers for code/systems |
| writing-unit-tests | Write XCTest + Cuckoo mock unit tests |

## Agents

Claude Code subagent definitions live in `ai/agents/`. Each file is a standalone agent with its own model, tools, and instructions.

| Agent | Description |
|---|---|
| commit | Create a single focused git commit |

## Submodules

| Submodule | Source |
|---|---|
| `dotbot` | https://github.com/anishathalye/dotbot |
| `ai/commonSkills/visual-explainer` | https://github.com/nicobailon/visual-explainer |

Update visual-explainer to latest upstream:
```bash
git submodule update --remote ai/commonSkills/visual-explainer
git add ai/commonSkills/visual-explainer
git commit -m "chore: update visual-explainer submodule"
```

## Updating skills

Edit source in `ai/commonSkills/` or `ai/iOS/`, then run:

```bash
./ai/sync-agent-config.sh
./install.sh
```
