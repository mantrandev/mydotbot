# clean-claude-sessions

Clean stale Claude Code session data when the HOME directory starts ballooning.

## The problem

Claude Code stores every conversation as a `.jsonl` file under
`~/.local/share/claude/projects/<encoded-project-path>/`. These files are **never auto-purged** — running Claude for a while accumulates anywhere from tens to hundreds of MB.

There are 6 account dirs in HOME: `~/.claude`, `~/.claude-account1..5`. **All of them symlink their `projects/` directory to the same backing store** at `~/.local/share/claude/projects`, so cleaning runs once for every account — no duplication.

```
~/.claude/projects           ─┐
~/.claude-account1/projects  ─┤
~/.claude-account2/projects  ─┼─►  ~/.local/share/claude/projects  ← clean here
~/.claude-account3/projects  ─┤
~/.claude-account4/projects  ─┤
~/.claude-account5/projects  ─┘
```

## Project dir layout

```
-Users-maybe-Desktop-projects-mdotbot/
├── 97b80be1-…-ebfe2f10600d.jsonl          ← session file (kept if recent)
├── 97b80be1-…-ebfe2f10600d/                ← subagent meta dir for the session above
│   └── subagents/agent-xxx.meta.json
└── …
```

The project name encodes the full filesystem path with both `/` and `-` collapsed into `-`, so the path can't be uniquely decoded (e.g. `Desktop-shophelp-master` could be `Desktop/shophelp-master` or `Desktop/shophelp/master`).

## Usage

```bash
/clean-claude-sessions              # scan, 3 days (default)
/clean-claude-sessions 7            # scan, 7 days
/clean-claude-sessions 3 clean      # delete .jsonl >3 days old + orphan UUID dirs
/clean-claude-sessions 3 deep       # clean + telemetry junk + file-history >14 days
```

Or invoke the script directly:

```bash
bash ~/dotfiles/ai/commonSkills/clean-claude-sessions/scripts/clean.sh 3 scan
bash ~/dotfiles/ai/commonSkills/clean-claude-sessions/scripts/clean.sh 3 clean
bash ~/dotfiles/ai/commonSkills/clean-claude-sessions/scripts/clean.sh 3 deep
```

## Modes

| Mode | Action |
|---|---|
| `scan` | Read-only — prints a per-project table (sessions >threshold / total / size) |
| `clean` | Deletes `.jsonl` >N days + orphan UUID subdirs (whose parent `.jsonl` is gone) + empty dirs |
| `deep` | `clean` + deletes `~/.claude/telemetry/*` + `~/.claude*/file-history/` files older than 14 days |

## Never touched

- Project dirs whose source folder still exists on disk and has recent sessions
- `~/.claude*/plugins/` (plugin code, not session data)
- `~/.claude*/agents/`, `memory/`, `settings*.json`, `CLAUDE.md`, `.claude.json`
- Anything outside `~/.local/share/claude/projects` (except in `deep` mode, which also touches telemetry + file-history)

## Reference — first-run yield

- Session store: 103M → 29M (~74M reclaimed)
- 189 → 11 session files
- 28 → 7 project dirs (many source projects were already deleted from Desktop; sessions remained orphaned)
- Bonus from `deep` mode: telemetry 22M + file-history 16M = ~38M more

## When to run

- When `du -sh ~/.local/share/claude/projects` exceeds 100M
- Before backing up or syncing HOME
- Monthly cleanup

**Do not put this on cron.** `clean` only checks mtime — it doesn't know whether a session is currently open. Run manually when you're sure no important active session would get caught by the threshold.
