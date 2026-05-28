---
name: reference-clean-claude-sessions
description: Skill /clean-claude-sessions dọn session rác Claude Code từ shared store; README có chi tiết về layout symlink của 6 account
metadata:
  type: reference
---

Khi user phàn nàn về dung lượng Claude lớn ("session rác", "nhiều session không dùng", máy chậm vì `.local/share/claude` phình), dùng `/clean-claude-sessions`.

**Chi tiết:** `~/dotfiles/ai/commonSkills/clean-claude-sessions/README.md`

**Key facts cần biết:**
- 6 account dirs (`~/.claude`, `~/.claude-account1..5`) đều symlink `projects/` về `~/.local/share/claude/projects` → dọn 1 lần là sạch cho cả 6.
- Tên project dir encode `/` và `-` đều thành `-`, không decode 1-1 được.
- Mỗi session là 1 `.jsonl`; cạnh đó có thể có folder UUID cùng tên chứa `subagents/*.meta.json`.
- Modes: `scan` (read-only), `clean` (>N ngày + orphan UUID dirs), `deep` (+ telemetry + file-history >14d).

**Script:** `~/dotfiles/ai/commonSkills/clean-claude-sessions/scripts/clean.sh`
