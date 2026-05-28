# clean-claude-sessions

Dọn session rác của Claude Code khi máy bắt đầu phình to.

## Vấn đề

Claude Code lưu mỗi conversation thành 1 file `.jsonl` dưới
`~/.local/share/claude/projects/<encoded-project-path>/`. File **không bao giờ tự xoá** — chạy lâu sẽ tích từ vài chục MB → vài trăm MB.

Có 6 account dirs trong HOME: `~/.claude`, `~/.claude-account1..5`. **Tất cả đều symlink `projects/` về cùng một folder gốc** ở `~/.local/share/claude/projects`, nên dọn 1 lần là sạch cho cả 6 account, không bị duplicate.

```
~/.claude/projects           ─┐
~/.claude-account1/projects  ─┤
~/.claude-account2/projects  ─┼─►  ~/.local/share/claude/projects  ← dọn ở đây
~/.claude-account3/projects  ─┤
~/.claude-account4/projects  ─┤
~/.claude-account5/projects  ─┘
```

## Cấu trúc một project dir

```
-Users-maybe-Desktop-projects-mdotbot/
├── 97b80be1-…-ebfe2f10600d.jsonl          ← session file (giữ nếu mới)
├── 97b80be1-…-ebfe2f10600d/                ← subagent meta dir của session trên
│   └── subagents/agent-xxx.meta.json
└── …
```

Tên project là path đầy đủ với `/` và `-` đều được encode thành `-`, nên không thể recover path 1-1 (ví dụ `Desktop-shophelp-master` có thể là `Desktop/shophelp-master` hoặc `Desktop/shophelp/master`).

## Cách dùng

```bash
/clean-claude-sessions              # scan, 3 ngày (mặc định)
/clean-claude-sessions 7            # scan, 7 ngày
/clean-claude-sessions 3 clean      # xoá .jsonl >3 ngày + orphan UUID dirs
/clean-claude-sessions 3 deep       # clean + telemetry rác + file-history >14d
```

Hoặc gọi script trực tiếp:

```bash
bash ~/dotfiles/ai/commonSkills/clean-claude-sessions/scripts/clean.sh 3 scan
bash ~/dotfiles/ai/commonSkills/clean-claude-sessions/scripts/clean.sh 3 clean
bash ~/dotfiles/ai/commonSkills/clean-claude-sessions/scripts/clean.sh 3 deep
```

## Modes

| Mode | Hành động |
|---|---|
| `scan` | Read-only — in bảng per-project (số .jsonl >threshold / total / size) |
| `clean` | Xoá `.jsonl` >N ngày + orphan UUID subdirs (parent .jsonl đã gone) + empty dirs |
| `deep` | `clean` + xoá `~/.claude/telemetry/*` + `~/.claude*/file-history/` >14 ngày |

## Không bao giờ đụng tới

- Project dir mà folder gốc vẫn tồn tại trên disk và có session mới
- `~/.claude*/plugins/` (plugin code, không phải session)
- `~/.claude*/agents/`, `memory/`, `settings*.json`, `CLAUDE.md`, `.claude.json`
- File ngoài `~/.local/share/claude/projects` (trừ mode `deep` đụng tới telemetry + file-history)

## Tham khảo nhanh — chiến lợi phẩm lần đầu chạy

- Store sessions: 103M → 29M (~74M reclaimed)
- 189 → 11 session files
- 28 → 7 project dirs (nhiều project đã xoá khỏi Desktop, session vẫn còn mồ côi)
- Bonus mode `deep`: telemetry 22M + file-history 16M = thêm ~38M

## Khi nào nên chạy

- Khi `du -sh ~/.local/share/claude/projects` > 100M
- Trước khi backup/sync HOME
- Hàng tháng làm sạch

Không nên auto-cron — vì `clean` xoá cả session đang dùng nếu mtime >threshold (chỉ check mtime, không check "session đang mở"). Chạy thủ công khi bạn biết không có session quan trọng cần keep.
