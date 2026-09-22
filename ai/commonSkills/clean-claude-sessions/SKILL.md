---
name: clean-claude-sessions
description: Scan and clean stale Claude Code sessions from a profile's own store at <profile>/projects. Removes session JSONLs older than N days, orphan subagent dirs, and reports reclaimable space.
args: [days, mode]
---

Each Claude profile keeps its own `projects/`, so run the script once per profile. The third argument selects it and defaults to `~/.claude`; pass `~/.claude-company` for the work profile.

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

3. If `MODE=scan`, ask the user **"Delete now? (clean/deep/n)"** before running again with the chosen mode. Never delete without confirmation.

## What the script removes

| Mode | Targets |
|---|---|
| `scan` | nothing — read-only audit |
| `clean` | `.jsonl` files >`DAYS` days under `<profile>/projects/`; orphan UUID subdirs whose matching `.jsonl` is gone; empty dirs |
| `deep` | everything from `clean` + `~/.claude/telemetry/*` + files under `~/.claude*/file-history/` older than 14 days |

## What it never touches

- Project dirs that still exist on disk and have recent sessions
- `~/.claude*/plugins/` (plugin code, not session data)
- `~/.claude*/agents/`, `memory/`, `settings*.json`, `CLAUDE.md`
- Anything outside `<profile>/projects` and (in `deep`) telemetry / file-history
