# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Apply all symlinks (run after any change):
```bash
./install.sh
```

Rebuild `ai/skills/` from sources and re-apply symlinks:
```bash
./ai/sync-agent-config.sh
./install.sh
```

## Architecture

**Symlink management** — `install.conf.yaml` + `dotbot/` wires repo files into `~`. Run `./install.sh` to re-apply. Dotbot is a git submodule at `dotbot/`.

**Skills pipeline** — `ai/skills/`, `ai/skills-claude/`, and `ai/skills-company/` are generated; never edit them directly. `sync-agent-config.sh` symlinks every directory from `ai/commonSkills/` and `ai/iOS/` into `ai/skills/` (consumed by Codex and `~/.agents_common/`), then builds one root per Claude profile from `ai/skill-profiles.conf`. `ai/web/` is parked and not included.

**Agent targets** — `ai/CLAUDE.md` is the source for the non-Claude agents: `install.conf.yaml` symlinks it to `~/.codex/AGENTS.md`, `~/.pi/agent/AGENTS.md`, and `~/.agents_common/AGENTS.md`.

**Claude profiles** — two, fully separate, nothing shared between them:

| | `~/.claude` (Personal) | `~/.claude-company` (Company) |
|---|---|---|
| rules | `ai/claude/CLAUDE.md` | `ai/claude-company/CLAUDE.md` |
| skills | `ai/skills-claude` (11) | `ai/skills-company` (23) |
| memory | `ai/memory` | `ai/memory-company` |
| history, projects | own, local | own, local |
| alias | `claude-mine` | `claude-company` |

`ai/agents/` is still symlinked into both.

**Subagents** — `ai/agents/` contains Claude Code subagent definitions (`.md` files with frontmatter). Lightweight/mechanical tasks use `model: haiku`. Symlinked into both profiles' `agents/`. Never edit those directly — edit source in `ai/agents/`.

**Memory** — one store per profile: `ai/memory/` → `~/.claude/memory`, `ai/memory-company/` → `~/.claude-company/memory`. Never shared.

**Codex accounts** — `install.conf.yaml` symlinks conversation history, sessions, memories, goals, attachments, and generated artifacts from `~/.codex` and `~/.codex-1` into `~/.local/share/codex`. Authentication, config, cache, logs, queues, and installation IDs remain account-local. Adding an account means adding its link entries to `install.conf.yaml`. Skills are linked from `ai/skills/`; native plugins are synchronized per account by `scripts/install-codex-plugins.sh`.

**Shell** — `zsh/` contains `.zshrc`, `.zprofile`, `jira.zsh`, and `statusline-command.sh`. Symlinked to `~/.zshrc`, `~/.zprofile`, `~/.zsh/jira.zsh`, and both profiles' `statusline-command.sh` respectively. The statusline labels the profile `Personal` or `Company`.

**App install** — `Brewfile` manages all casks and formulae. `scripts/install-vscode-extensions.sh` and `scripts/install-npm-globals.sh` handle VS Code extensions and npm globals; `scripts/install-claude-plugins.sh` synchronizes the shared user-scope Claude Code plugin set across every config dir; `scripts/install-codex-plugins.sh` installs and updates the native Matt Pocock plugin for Codex. All run automatically via the `shell:` blocks in `install.conf.yaml`.

## Adding a skill

1. Create the skill directory under `ai/commonSkills/` (cross-agent) or `ai/iOS/` (iOS-only).
2. Add its name to `ai/skill-profiles.conf` under `[claude]`, `[company]`, or both. A skill missing from both roots reaches Codex only.
3. Run `./ai/sync-agent-config.sh && ./install.sh`.
4. Add the new `~/.codex/skills/<name>` entry to `install.conf.yaml` if the sync script didn't update it.
5. Commit the new skill directory and its `ai/skills/<name>`, `ai/skills-claude/<name>`, `ai/skills-company/<name>` symlinks.

## Adding a subagent

1. Create `ai/agents/<name>.md` with frontmatter (`name`, `description`, `tools`, `model`).
2. Use `model: haiku` for mechanical/lightweight tasks, omit for complex reasoning.
3. Run `./install.sh` to re-apply symlinks.
4. Commit `ai/agents/<name>.md`.

## Tone & Communication

**Never use**: thanks, sorry, please, maybe, perhaps, hope this helps, let me know, what do you think

**Allowed**: Fixed. Wrong. Fixing. Do it this way. This is wrong because X. Delete this. No.

**Core behavior**:
- Zero fluff, get straight to point
- Never ramble or make up facts
- Shortest answer that is 100% correct
- Never introduce yourself

## Code Review Responses

**When reviewer is correct**:
- "Fixed."
- "Fixed in [file]."

**When you were wrong**:
- "Wrong. Fixing."
- "Missed that. Fixed."
- "Wrong. Fixed in [file]."

Never explain why you were wrong unless explicitly asked.

## Rules

- Edit `ai/CLAUDE.md` for shared agent rules — never edit the symlink targets directly.
- Edit `ai/agents/` for subagent definitions — never edit `~/.claude/agents/` directly.
- `ai/skills/` is generated — changes there are lost on next sync.
- `ai/skills/<name>` symlinks must be committed to git for consistency.
- `install.conf.yaml` is the single hand-maintained source consumed by `./install.sh`. `sync-agent-config.sh` no longer rewrites it — it only creates the dynamic symlinks dotbot doesn't (subagents, per-account skills, codex/`ai/skills` links). When adding a skill, add its `~/.codex/skills/<name>` entry to `install.conf.yaml` by hand.
