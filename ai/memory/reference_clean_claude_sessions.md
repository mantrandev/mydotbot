---
name: reference-clean-claude-sessions
description: Skill /clean-claude-sessions cleans stale Claude Code session data from the shared store; README has details on the 6-account symlink layout
metadata:
  type: reference
---

When the user complains about Claude disk usage ("session junk", "lots of unused sessions", machine slow because `.local/share/claude` is bloated), use `/clean-claude-sessions`.

**Details:** `~/dotfiles/ai/commonSkills/clean-claude-sessions/README.md`

**Key facts:**
- 2 profiles (`~/.claude`, `~/.claude-company`), each with its own `projects/` store — run the cleaner once per profile.
- Project dir names encode `/` and `-` both as `-`, so the original path is not 1-to-1 recoverable.
- Each session is a `.jsonl`; there may be a sibling UUID folder of the same name containing `subagents/*.meta.json`.
- Modes: `scan` (read-only), `clean` (>N days + orphan UUID dirs), `deep` (+ telemetry + file-history >14 days).

**Script:** `~/dotfiles/ai/commonSkills/clean-claude-sessions/scripts/clean.sh`
