---
name: usage-dashboard
description: Show Claude Code usage stats from cache, then optionally build the HTML dashboard (24h / 7d / 30d / all)
args: [range]
---

Show usage stats from the rolling cache, then ask before generating HTML.
Generated files live under `~/.agent/usage-dashboard/<project>/` by default, not the repo worktree.

**`range`** — one of `24h`, `7d`, `30d` (default), `all`

## Steps

1. Set the script path:
   ```
   SCRIPT=~/dotfiles/ai/commonSkills/usage-dashboard/scripts/generate.py
   RANGE=${range:-30d}
   ```

2. Refresh the cache and print stats (no HTML yet):
   ```bash
   python3 "$SCRIPT" --range "$RANGE" --stats-only 2>/dev/null
   ```
   This prints a summary table to the terminal showing sessions, output tokens, cache read, and cache written for all four windows (24h / 7d / 30d / all). The requested range is marked with ◀.

3. Ask the user: **"Build HTML dashboard? (y/n)"**
   - Wait for explicit answer.
   - If `n` or anything other than `y` / `yes` → stop here.

4. If confirmed, generate all 4 HTML variants and open the target range:
   ```bash
   OUT=$(python3 "$SCRIPT" --range "$RANGE" 2>/dev/null)
   open "$OUT"
   ```

## Cache behaviour

- Sessions are grouped by start date and stored in `~/.agent/usage-dashboard/<project>/usage-cache.json`
- Max **30 day entries** — inserting day 31 drops day 1 (FIFO)
- **Today is always re-parsed** (in-progress sessions may be incomplete)
- Completed past days are read from cache without re-scanning jsonl

## Example invocations

```
/usage-dashboard          → 30d view (default)
/usage-dashboard 24h      → last 24 hours
/usage-dashboard 7d       → last 7 days
/usage-dashboard all      → all cached data
```
