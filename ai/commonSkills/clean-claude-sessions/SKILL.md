---
name: clean-claude-sessions
description: Scan and clean stale Claude Code sessions from the shared store at ~/.local/share/claude/projects (used by all .claude / .claude-accountN dirs via symlink). Removes session JSONLs older than N days, orphan subagent dirs, and reports reclaimable space.
args: [days, mode]
---

All `.claude` and `.claude-account*` dirs symlink their `projects/` to `~/.local/share/claude/projects`, so cleanup runs once for every account.

**`days`** — age threshold for `.jsonl` (default `3`)
**`mode`** — one of:
- `scan` (default) — report only, no delete
- `clean` — delete sessions older than `days` + orphan subagent UUID dirs
- `deep` — `clean` plus telemetry rác + `file-history` >14 days across every `~/.claude*` account

## Steps

1. Resolve args:
   ```
   DAYS=${days:-3}
   MODE=${mode:-scan}
   SCRIPT=~/dotfiles/ai/commonSkills/clean-claude-sessions/scripts/clean.sh
   ```

2. Run the script — it prints a per-project table (sessions >threshold / total / size) and totals:
   ```bash
   bash "$SCRIPT" "$DAYS" "$MODE"
   ```

3. If `MODE=scan`, ask the user **"Xoá hết? (clean/deep/n)"** before running again with the chosen mode. Never delete without confirmation.

## What the script removes

| Mode | Targets |
|---|---|
| `scan` | nothing — read-only audit |
| `clean` | `.jsonl` files >`DAYS` days under `~/.local/share/claude/projects/`; orphan UUID subdirs whose matching `.jsonl` is gone; empty dirs |
| `deep` | everything from `clean` + `~/.claude/telemetry/*` + files under `~/.claude*/file-history/` older than 14 days |

## What it never touches

- Project dirs that still exist on disk and have recent sessions
- `~/.claude*/plugins/` (plugin code, not session data)
- `~/.claude*/agents/`, `memory/`, `settings*.json`, `CLAUDE.md`
- Anything outside `~/.local/share/claude/projects` and (in `deep`) telemetry / file-history
