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

Active skills are merged from three sources:

| Source | Committed to git | Purpose |
|---|---|---|
| `ai/commonSkills/` | Yes | Cross-agent shared skills |
| `ai/iOS/` | Yes | iOS-specific skills |
| `~/.localskills/` | No (device-only) | Private skills with sensitive data (tokens, user IDs, internal channels) |

`sync-agent-config.sh` merges all three into `ai/skills/` and propagates to every agent on the device. Skills in `~/.localskills/` are never committed to this repo.

See each `skill.md` for details.

## Agents

4 Claude Code subagents in `ai/agents/` — lightweight tasks run on Haiku.

| Agent | Model | Description |
|---|---|---|
| branch-cleaner | haiku | Find and delete merged feature branches |
| find-ticket | haiku | Search ticket ID across code, commits, branches |
| validate-di | haiku | Validate Swinject DI registrations |
| web-simulator | haiku | Stream iOS Simulator to browser via serve-sim |

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

For private/device-only skills, edit directly in `~/.localskills/<skill-name>/skill.md`, then run `./ai/sync-agent-config.sh`. No commit needed.
