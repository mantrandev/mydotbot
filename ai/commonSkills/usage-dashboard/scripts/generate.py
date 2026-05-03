#!/usr/bin/env python3
"""
Generate a filtered Claude Code usage dashboard HTML.
Maintains a 30-day rolling cache so jsonl files are only re-parsed for
new/unknown days (today is always re-parsed as it may be incomplete).

Usage:
  python3 generate.py [--range 24h|7d|30d|all] [--stats-only] [--project-dir PATH] [--out PATH] [--cache PATH]

Modes:
  --stats-only   Refresh cache and print a summary table to stdout. Do NOT generate HTML.
  (default)      Refresh cache, generate all 4 HTML variants, print the target file path.

Defaults:
  --range       30d
  --project-dir auto-detected from cwd → ~/.claude/projects/<encoded-cwd>/
  --out         ~/.agent/usage-dashboard/<project>/usage-dashboard.html
  --cache       ~/.agent/usage-dashboard/<project>/usage-cache.json
"""

import argparse
import hashlib
import json
import os
import sys
from collections import OrderedDict
from datetime import datetime, timezone, timedelta
from pathlib import Path


MAX_CACHE_DAYS = 30


# ── arg parsing ──────────────────────────────────────────────────────────────

def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--range", default="30d",
                   choices=["24h", "7d", "30d", "all"])
    p.add_argument("--stats-only", action="store_true",
                   help="Print cache summary to stdout; do not generate HTML")
    p.add_argument("--project-dir", default=None)
    p.add_argument("--out", default=None)
    p.add_argument("--cache", default=None)
    return p.parse_args()


# ── locate project dir ────────────────────────────────────────────────────────

def find_project_dir(cwd: Path) -> Path:
    encoded = str(cwd).replace("/", "-")
    candidate = Path.home() / ".claude" / "projects" / encoded
    if candidate.exists():
        return candidate
    # try with leading dash
    candidate2 = Path.home() / ".claude" / "projects" / f"-{encoded.lstrip('-')}"
    if candidate2.exists():
        return candidate2
    raise FileNotFoundError(
        f"Cannot find project dir. Tried:\n  {candidate}\n  {candidate2}\n"
        "Pass --project-dir explicitly."
    )


def project_slug(cwd: Path) -> str:
    base = cwd.name or "project"
    safe = "".join(ch if ch.isalnum() or ch in "-._" else "-" for ch in base).strip("-._")
    safe = safe or "project"
    digest = hashlib.sha1(str(cwd).encode("utf-8")).hexdigest()[:8]
    return f"{safe}-{digest}"


def default_paths(cwd: Path) -> tuple[Path, Path]:
    root = Path.home() / ".agent" / "usage-dashboard" / project_slug(cwd)
    return (root / "usage-dashboard.html", root / "usage-cache.json")


# ── cache I/O ─────────────────────────────────────────────────────────────────
# Cache format:
# {
#   "version": 2,
#   "days": {                          <- OrderedDict sorted by date ascending
#     "2026-04-10": [ {...session...}, ... ],
#     "2026-04-11": [ ... ],
#     ...  (max MAX_CACHE_DAYS entries)
#   }
# }

def load_cache(cache_path: Path) -> OrderedDict:
    if not cache_path.exists():
        return OrderedDict()
    try:
        raw = json.loads(cache_path.read_text(encoding="utf-8"))
        if raw.get("version") != 2:
            return OrderedDict()
        days = raw.get("days", {})
        return OrderedDict(sorted(days.items()))
    except Exception as e:
        print(f"  warn: cache unreadable ({e}), starting fresh", file=sys.stderr)
        return OrderedDict()


def save_cache(cache_path: Path, days: OrderedDict):
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.write_text(
        json.dumps({"version": 2, "days": dict(days)}, ensure_ascii=False, indent=None),
        encoding="utf-8"
    )


def evict_old_days(days: OrderedDict) -> OrderedDict:
    """Keep only the most recent MAX_CACHE_DAYS entries."""
    while len(days) > MAX_CACHE_DAYS:
        oldest = next(iter(days))
        del days[oldest]
        print(f"  cache: evicted day {oldest}", file=sys.stderr)
    return days


# ── parse sessions from jsonl files ──────────────────────────────────────────

def parse_sessions_from_files(project_dir: Path) -> dict[str, dict]:
    """Return {session_id: session_dict} for all jsonl files."""
    sessions = {}

    for jsonl_path in sorted(project_dir.glob("*.jsonl")):
        sid = jsonl_path.stem

        session = sessions.setdefault(sid, {
            "session_id": sid,
            "turns": 0,
            "input_tokens": 0,
            "output_tokens": 0,
            "cache_creation_tokens": 0,
            "cache_read_tokens": 0,
            "first_ts": None,
            "last_ts": None,
            "model": None,
            "branches": set(),
            "user_messages": 0,
        })

        try:
            with jsonl_path.open(encoding="utf-8") as f:
                for raw in f:
                    raw = raw.strip()
                    if not raw:
                        continue
                    try:
                        obj = json.loads(raw)
                    except json.JSONDecodeError:
                        continue

                    ts = obj.get("timestamp")
                    if ts:
                        if session["first_ts"] is None or ts < session["first_ts"]:
                            session["first_ts"] = ts
                        if session["last_ts"] is None or ts > session["last_ts"]:
                            session["last_ts"] = ts

                    typ = obj.get("type")

                    if typ == "user":
                        branch = obj.get("gitBranch")
                        if branch:
                            session["branches"].add(branch)
                        session["user_messages"] += 1

                    elif typ == "assistant":
                        session["turns"] += 1
                        msg = obj.get("message", {})
                        if msg.get("model") and session["model"] is None:
                            session["model"] = msg["model"]
                        usage = msg.get("usage", {})
                        session["input_tokens"] += usage.get("input_tokens", 0)
                        session["output_tokens"] += usage.get("output_tokens", 0)
                        session["cache_creation_tokens"] += usage.get(
                            "cache_creation_input_tokens", 0)
                        session["cache_read_tokens"] += usage.get(
                            "cache_read_input_tokens", 0)

        except Exception as e:
            print(f"  warn: skipping {jsonl_path.name}: {e}", file=sys.stderr)

    # Serialise set → list
    for s in sessions.values():
        s["branches"] = sorted(s["branches"])

    return sessions


# ── build/refresh cache ───────────────────────────────────────────────────────

def refresh_cache(cache: OrderedDict, project_dir: Path, today: str) -> OrderedDict:
    """
    Ensure cache is up to date:
    - today is always re-parsed (data may be incomplete)
    - any session whose first_ts day is not yet in cache gets added
    - sessions older than MAX_CACHE_DAYS days are dropped
    """
    # Parse all sessions from disk
    print("  Parsing sessions from disk...", file=sys.stderr)
    all_sessions = parse_sessions_from_files(project_dir)
    print(f"  Found {len(all_sessions)} sessions", file=sys.stderr)

    # Group sessions by their first_ts day
    day_map: dict[str, list] = {}
    for s in all_sessions.values():
        day = (s["first_ts"] or "")[:10]
        if not day:
            continue
        day_map.setdefault(day, []).append(s)

    # Determine which days need updating:
    # - today (always refresh)
    # - any day present in day_map but not yet in cache
    days_to_update = set()
    days_to_update.add(today)
    for day in day_map:
        if day not in cache:
            days_to_update.add(day)

    # Update cache for those days
    for day in days_to_update:
        sessions_for_day = day_map.get(day, [])
        if sessions_for_day:
            cache[day] = sessions_for_day
            print(f"  cache: updated {day} ({len(sessions_for_day)} sessions)", file=sys.stderr)
        elif day == today:
            # today has no sessions yet — store empty
            cache[day] = []

    # Re-sort by date
    cache = OrderedDict(sorted(cache.items()))

    # Evict days beyond MAX_CACHE_DAYS
    cache = evict_old_days(cache)

    return cache


# ── flatten cache → session list ──────────────────────────────────────────────

def sessions_from_cache(cache: OrderedDict) -> list[dict]:
    seen = set()
    result = []
    for day_sessions in cache.values():
        for s in day_sessions:
            sid = s["session_id"]
            if sid not in seen:
                seen.add(sid)
                result.append(s)
    return sorted(result, key=lambda s: s.get("first_ts") or "")


# ── time-range filter ─────────────────────────────────────────────────────────

def filter_by_range(sessions: list[dict], range_str: str) -> list[dict]:
    if range_str == "all":
        return sessions
    now = datetime.now(timezone.utc)
    delta = {"24h": timedelta(hours=24), "7d": timedelta(days=7),
             "30d": timedelta(days=30)}[range_str]
    cutoff = now - delta

    def in_range(s):
        ts = s.get("first_ts")
        if not ts:
            return False
        try:
            t = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            return t >= cutoff
        except Exception:
            return False

    return [s for s in sessions if in_range(s)]


def range_label(range_str: str, sessions: list[dict], all_sessions: list[dict]) -> tuple[str, str]:
    human = {"24h": "24-hour window", "7d": "7-day window",
             "30d": "30-day snapshot", "all": "all time"}[range_str]
    src = sessions if sessions else all_sessions
    if not src:
        return ("—", human)
    first = src[0].get("first_ts", "")[:10]
    last = src[-1].get("last_ts", "")[:10]
    return (f"{first} → {last}", human)


# ── HTML template ─────────────────────────────────────────────────────────────

HTML_TEMPLATE = r"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ShopHelp Claude — Usage Dashboard</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
  <style>
    :root {
      --bg:           #0d1117;
      --surface:      #161b22;
      --surface-2:    #1c2128;
      --border:       rgba(255,255,255,0.08);
      --border-mid:   rgba(255,255,255,0.12);
      --text:         #e6edf3;
      --text-dim:     #8b949e;
      --text-faint:   #484f58;
      --blue:         #58a6ff;
      --blue-dim:     rgba(88,166,255,0.12);
      --green:        #3fb950;
      --green-dim:    rgba(63,185,80,0.12);
      --orange:       #f0883e;
      --orange-dim:   rgba(240,136,62,0.12);
      --purple:       #bc8cff;
      --purple-dim:   rgba(188,140,255,0.12);
      --red:          #f85149;
      --font-body:    'IBM Plex Sans', system-ui, sans-serif;
      --font-mono:    'IBM Plex Mono', 'Courier New', monospace;
      --radius:       8px;
      --radius-lg:    12px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-body);
      background: var(--bg);
      color: var(--text);
      font-size: 14px;
      line-height: 1.6;
      min-height: 100vh;
      background-image: radial-gradient(ellipse 80% 40% at 50% -10%, rgba(88,166,255,0.06) 0%, transparent 70%);
    }
    .shell { max-width: 1280px; margin: 0 auto; padding: 32px 24px 64px; }
    .header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 36px; padding-bottom: 24px; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
    .header-left { display: flex; flex-direction: column; gap: 6px; }
    .header-eyebrow { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--blue); opacity: 0.8; }
    h1 { font-size: 24px; font-weight: 600; letter-spacing: -0.02em; color: var(--text); }
    .header-sub { font-size: 13px; color: var(--text-dim); display: flex; align-items: center; gap: 8px; }
    .header-sub .range { font-family: var(--font-mono); font-size: 12px; background: var(--surface-2); border: 1px solid var(--border); padding: 2px 8px; border-radius: 4px; color: var(--text); }
    .last-updated { font-family: var(--font-mono); font-size: 11px; color: var(--text-faint); }
    .range-tabs { display: flex; gap: 6px; align-items: center; }
    .range-tab { font-family: var(--font-mono); font-size: 11px; padding: 4px 10px; border: 1px solid var(--border); border-radius: 4px; background: var(--surface); color: var(--text-dim); cursor: pointer; text-decoration: none; transition: background 0.15s, color 0.15s, border-color 0.15s; }
    .range-tab:hover { color: var(--text); border-color: var(--border-mid); }
    .range-tab.active { background: var(--blue-dim); border-color: var(--blue); color: var(--blue); }
    .header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
    .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
    @media (max-width: 900px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px) { .kpi-row { grid-template-columns: 1fr; } }
    .kpi { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; position: relative; overflow: hidden; opacity: 0; transform: translateY(12px); animation: fadeUp 0.4s ease forwards; }
    .kpi::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
    .kpi--blue::before  { background: var(--blue); }
    .kpi--green::before { background: var(--green); }
    .kpi--orange::before { background: var(--orange); }
    .kpi--purple::before { background: var(--purple); }
    .kpi__label { font-size: 11px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-dim); margin-bottom: 10px; }
    .kpi__value { font-family: var(--font-mono); font-size: 28px; font-weight: 500; letter-spacing: -0.02em; line-height: 1; }
    .kpi--blue  .kpi__value { color: var(--blue); }
    .kpi--green .kpi__value { color: var(--green); }
    .kpi--orange .kpi__value { color: var(--orange); }
    .kpi--purple .kpi__value { color: var(--purple); }
    .kpi__sub { font-size: 11px; color: var(--text-faint); margin-top: 6px; font-family: var(--font-mono); }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .grid-3 { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 16px; }
    @media (max-width: 900px) { .grid-2, .grid-3 { grid-template-columns: 1fr; } }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; opacity: 0; transform: translateY(10px); animation: fadeUp 0.45s ease forwards; }
    .card--full { margin-bottom: 16px; }
    .card__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .card__title { font-size: 12px; font-weight: 500; letter-spacing: 0.07em; text-transform: uppercase; color: var(--text-dim); }
    .card__badge { font-family: var(--font-mono); font-size: 11px; color: var(--text-faint); background: var(--surface-2); border: 1px solid var(--border); padding: 2px 7px; border-radius: 4px; }
    .chart-wrap { position: relative; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead th { font-size: 10px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: var(--text-faint); padding: 8px 12px; text-align: left; border-bottom: 1px solid var(--border-mid); white-space: nowrap; }
    thead th:last-child { text-align: right; }
    tbody tr { border-bottom: 1px solid var(--border); transition: background 0.1s; }
    tbody tr:last-child { border-bottom: none; }
    tbody tr:hover { background: var(--surface-2); }
    tbody td { padding: 10px 12px; color: var(--text); vertical-align: middle; }
    tbody td:last-child { text-align: right; }
    .td-mono { font-family: var(--font-mono); font-size: 12px; }
    .td-dim { color: var(--text-dim); }
    .branch-pill { display: inline-block; font-family: var(--font-mono); font-size: 10px; background: var(--surface-2); border: 1px solid var(--border); padding: 2px 7px; border-radius: 3px; color: var(--blue); max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align: middle; }
    .token-bar-wrap { display: flex; align-items: center; gap: 8px; justify-content: flex-end; }
    .token-num { font-family: var(--font-mono); font-size: 12px; color: var(--green); min-width: 64px; text-align: right; }
    .mini-bar { height: 6px; border-radius: 3px; background: var(--green); display: inline-block; }
    @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
    .kpi:nth-child(1) { animation-delay: 0.05s; }
    .kpi:nth-child(2) { animation-delay: 0.10s; }
    .kpi:nth-child(3) { animation-delay: 0.15s; }
    .kpi:nth-child(4) { animation-delay: 0.20s; }
    .card--full { animation-delay: 0.25s; }
    .grid-3 .card:nth-child(1) { animation-delay: 0.28s; }
    .grid-3 .card:nth-child(2) { animation-delay: 0.34s; }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation: none !important; transition: none !important; opacity: 1 !important; transform: none !important; }
    }
    .section-label { display: flex; align-items: center; gap: 10px; margin: 28px 0 14px; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-faint); }
    .section-label::before { content: ''; width: 4px; height: 4px; border-radius: 50%; background: var(--blue); flex-shrink: 0; }
    .section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  </style>
</head>
<body>
<div class="shell">

  <header class="header">
    <div class="header-left">
      <span class="header-eyebrow">Claude Code · shophelp-claude</span>
      <h1>Usage Dashboard</h1>
      <div class="header-sub">
        <span class="range">{{DATE_RANGE}}</span>
        <span>{{RANGE_HUMAN}}</span>
      </div>
    </div>
    <div class="header-right">
      <div class="range-tabs">
        <a class="range-tab {{ACTIVE_24H}}" href="usage-dashboard-24h.html">24h</a>
        <a class="range-tab {{ACTIVE_7D}}"  href="usage-dashboard-7d.html">7d</a>
        <a class="range-tab {{ACTIVE_30D}}" href="usage-dashboard-30d.html">30d</a>
        <a class="range-tab {{ACTIVE_ALL}}" href="usage-dashboard-all.html">all</a>
      </div>
      <div class="last-updated" id="updated"></div>
    </div>
  </header>

  <div class="kpi-row">
    <div class="kpi kpi--blue">
      <div class="kpi__label">Sessions</div>
      <div class="kpi__value" id="kpi-sessions">—</div>
      <div class="kpi__sub">conversations</div>
    </div>
    <div class="kpi kpi--green">
      <div class="kpi__label">Output Tokens</div>
      <div class="kpi__value" id="kpi-output">—</div>
      <div class="kpi__sub">generated tokens</div>
    </div>
    <div class="kpi kpi--orange">
      <div class="kpi__label">Cache Read</div>
      <div class="kpi__value" id="kpi-cache-read">—</div>
      <div class="kpi__sub">served from cache</div>
    </div>
    <div class="kpi kpi--purple">
      <div class="kpi__label">Cache Written</div>
      <div class="kpi__value" id="kpi-cache-write">—</div>
      <div class="kpi__sub">tokens cached</div>
    </div>
  </div>

  <div class="section-label">Activity over time</div>
  <div class="card card--full">
    <div class="card__header">
      <span class="card__title">Daily output tokens</span>
      <span class="card__badge">{{RANGE_HUMAN}}</span>
    </div>
    <div class="chart-wrap" style="height:200px">
      <canvas id="timelineChart"></canvas>
    </div>
  </div>

  <div class="grid-3">
    <div class="card">
      <div class="card__header">
        <span class="card__title">Branch activity</span>
        <span class="card__badge">output tokens</span>
      </div>
      <div class="chart-wrap" style="height:280px">
        <canvas id="branchChart"></canvas>
      </div>
    </div>
    <div class="card">
      <div class="card__header">
        <span class="card__title">Model split</span>
        <span class="card__badge">sessions</span>
      </div>
      <div class="chart-wrap" style="height:280px;display:flex;align-items:center;justify-content:center">
        <canvas id="modelChart" style="max-width:220px;max-height:220px"></canvas>
      </div>
    </div>
  </div>

  <div class="section-label">Top sessions by output</div>
  <div class="card card--full">
    <div class="card__header">
      <span class="card__title">Sessions</span>
      <span class="card__badge" id="session-count"></span>
    </div>
    <div class="table-wrap">
      <table id="sessionTable">
        <thead>
          <tr>
            <th>Session ID</th>
            <th>Date</th>
            <th>Branch</th>
            <th>Turns</th>
            <th>User msgs</th>
            <th style="text-align:right">Output tokens</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  </div>

</div>
<script>
const SESSIONS = {{SESSIONS_JSON}};

function fmt(n) {
  if (n >= 1e9) return (n/1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n/1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n/1e3).toFixed(1) + 'K';
  return n.toString();
}
function fmtFull(n) { return n.toLocaleString(); }
function dateStr(ts) { return ts ? ts.slice(0,10) : '—'; }
function shortBranch(b) {
  return b.replace('feature/', '').replace('infra/', '📦 ').replace('SHOPHELP-', '#');
}

document.getElementById('updated').textContent =
  'Generated ' + new Date().toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'});

function countUp(el, target, fmtFn) {
  const duration = 900;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = fmtFn(Math.round(ease * target));
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

if (SESSIONS.length === 0) {
  ['kpi-sessions','kpi-output','kpi-cache-read','kpi-cache-write'].forEach(id => {
    document.getElementById(id).textContent = '0';
  });
  document.getElementById('session-count').textContent = '0 sessions';
} else {
  const totalSessions    = SESSIONS.length;
  const totalOutput      = SESSIONS.reduce((a,s) => a + s.output_tokens, 0);
  const totalCacheRead   = SESSIONS.reduce((a,s) => a + s.cache_read_tokens, 0);
  const totalCacheCreate = SESSIONS.reduce((a,s) => a + s.cache_creation_tokens, 0);

  document.getElementById('session-count').textContent = totalSessions + ' sessions';

  const byDay = {};
  for (const s of SESSIONS) {
    if (!s.first_ts) continue;
    const day = s.first_ts.slice(0,10);
    byDay[day] = (byDay[day] || 0) + s.output_tokens;
  }
  const allDays = Object.keys(byDay).sort();
  const timelineLabels = [], timelineValues = [];
  if (allDays.length) {
    let cur = new Date(allDays[0]);
    const end = new Date(allDays[allDays.length-1]);
    while (cur <= end) {
      const key = cur.toISOString().slice(0,10);
      timelineLabels.push(key.slice(5));
      timelineValues.push(byDay[key] || 0);
      cur.setDate(cur.getDate() + 1);
    }
  }

  const branchMap = {};
  for (const s of SESSIONS) {
    for (const b of (s.branches || [])) {
      branchMap[b] = (branchMap[b] || 0) + s.output_tokens;
    }
  }
  const branchEntries = Object.entries(branchMap).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
  const branchLabels = branchEntries.map(([k])=>shortBranch(k));
  const branchValues = branchEntries.map(([,v])=>v);

  const modelMap = {};
  for (const s of SESSIONS) {
    const m = s.model || 'unknown';
    const label = m.includes('opus') ? 'Opus 4.6' : m.includes('sonnet') ? 'Sonnet 4.6' : m === '<synthetic>' ? 'Synthetic' : 'Unknown';
    modelMap[label] = (modelMap[label] || 0) + 1;
  }

  const GRID = 'rgba(255,255,255,0.06)', LABEL = '#8b949e';
  Chart.defaults.font.family = "'IBM Plex Sans', system-ui, sans-serif";
  Chart.defaults.color = LABEL;

  new Chart(document.getElementById('timelineChart'), {
    type: 'bar',
    data: { labels: timelineLabels, datasets: [{ label: 'Output tokens', data: timelineValues, backgroundColor: 'rgba(63,185,80,0.55)', borderColor: '#3fb950', borderWidth: 1, borderRadius: 3 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ' ' + fmtFull(ctx.raw) + ' tokens', title: ctx => '20' + ctx[0].label.replace('-','/') } } }, scales: { x: { grid: { color: GRID }, ticks: { maxTicksLimit: 14, font: { family: "'IBM Plex Mono',monospace", size: 10 } } }, y: { grid: { color: GRID }, ticks: { callback: v => fmt(v), font: { family: "'IBM Plex Mono',monospace", size: 10 } } } } }
  });

  const palette = ['rgba(88,166,255,0.65)','rgba(63,185,80,0.65)','rgba(240,136,62,0.65)','rgba(188,140,255,0.65)','rgba(248,81,73,0.65)','rgba(88,166,255,0.45)','rgba(63,185,80,0.45)','rgba(240,136,62,0.45)','rgba(188,140,255,0.45)','rgba(248,81,73,0.45)','rgba(88,166,255,0.30)'];
  new Chart(document.getElementById('branchChart'), {
    type: 'bar',
    data: { labels: branchLabels, datasets: [{ label: 'Output tokens', data: branchValues, backgroundColor: branchValues.map((_,i)=>palette[i%palette.length]), borderRadius: 3 }] },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ' ' + fmtFull(ctx.raw) + ' tokens' } } }, scales: { x: { grid: { color: GRID }, ticks: { callback: v => fmt(v), font: { family: "'IBM Plex Mono',monospace", size: 10 } } }, y: { grid: { display: false }, ticks: { font: { family: "'IBM Plex Mono',monospace", size: 10 } } } } }
  });

  new Chart(document.getElementById('modelChart'), {
    type: 'doughnut',
    data: { labels: Object.keys(modelMap), datasets: [{ data: Object.values(modelMap), backgroundColor: ['rgba(88,166,255,0.8)','rgba(240,136,62,0.8)','rgba(63,185,80,0.8)','rgba(188,140,255,0.8)'], borderColor: '#161b22', borderWidth: 3, hoverOffset: 6 }] },
    options: { responsive: true, maintainAspectRatio: true, cutout: '62%', plugins: { legend: { position: 'bottom', labels: { padding: 12, font: { family: "'IBM Plex Mono',monospace", size: 11 }, boxWidth: 10, boxHeight: 10, borderRadius: 2 } }, tooltip: { callbacks: { label: ctx => ' ' + ctx.label + ': ' + ctx.raw + ' sessions' } } } }
  });

  const sorted = [...SESSIONS].sort((a,b) => b.output_tokens - a.output_tokens);
  const maxOut = sorted[0]?.output_tokens || 1;
  const tbody = document.querySelector('#sessionTable tbody');
  for (const s of sorted) {
    if (s.output_tokens === 0) continue;
    const tr = document.createElement('tr');
    const pct = Math.max(2, Math.round((s.output_tokens / maxOut) * 80));
    const branch = (s.branches || []).map(b => `<span class="branch-pill" title="${b}">${shortBranch(b)}</span>`).join(' ');
    tr.innerHTML = `
      <td class="td-mono td-dim">${s.session_id.slice(0,8)}</td>
      <td class="td-mono td-dim">${dateStr(s.first_ts)}</td>
      <td>${branch || '<span class="td-dim">—</span>'}</td>
      <td class="td-mono" style="color:var(--blue)">${s.turns}</td>
      <td class="td-mono td-dim">${s.user_messages}</td>
      <td><div class="token-bar-wrap"><span class="mini-bar" style="width:${pct}px"></span><span class="token-num">${fmt(s.output_tokens)}</span></div></td>`;
    tbody.appendChild(tr);
  }

  setTimeout(() => {
    countUp(document.getElementById('kpi-sessions'), totalSessions, n => n.toString());
    countUp(document.getElementById('kpi-output'), totalOutput, fmt);
    countUp(document.getElementById('kpi-cache-read'), totalCacheRead, fmt);
    countUp(document.getElementById('kpi-cache-write'), totalCacheCreate, fmt);
  }, 200);
}
</script>
</body>
</html>
"""


# ── stats printer ────────────────────────────────────────────────────────────

def print_stats(cache: OrderedDict, range_str: str):
    """Print a concise summary table to stdout."""
    all_sessions = sessions_from_cache(cache)
    windows = {
        "24h": filter_by_range(all_sessions, "24h"),
        "7d":  filter_by_range(all_sessions, "7d"),
        "30d": filter_by_range(all_sessions, "30d"),
        "all": all_sessions,
    }

    def fmt(n):
        if n >= 1_000_000: return f"{n/1_000_000:.2f}M"
        if n >= 1_000:     return f"{n/1_000:.1f}K"
        return str(n)

    lines = []
    lines.append("")
    lines.append("  ┌─────────────────────────────────────────────────────────────────┐")
    lines.append("  │  Claude Code · shophelp-claude · Usage Summary (from cache)     │")
    lines.append("  ├──────────┬────────────┬─────────────┬──────────────┬────────────┤")
    lines.append("  │  Range   │  Sessions  │  Output     │  Cache Read  │  Cache Wrt │")
    lines.append("  ├──────────┼────────────┼─────────────┼──────────────┼────────────┤")
    for r, sessions in windows.items():
        out    = sum(s["output_tokens"]          for s in sessions)
        cr     = sum(s["cache_read_tokens"]      for s in sessions)
        cw     = sum(s["cache_creation_tokens"]  for s in sessions)
        active = " ◀" if r == range_str else ""
        lines.append(
            f"  │  {r:<6}  │  {len(sessions):<8}  │  {fmt(out):<9}  │  {fmt(cr):<10}  │  {fmt(cw):<8}  │{active}"
        )
    lines.append("  └──────────┴────────────┴─────────────┴──────────────┴────────────┘")
    lines.append(f"  Cache: {len(cache)} days stored  (max {MAX_CACHE_DAYS})  · today always re-parsed")
    lines.append("")

    print("\n".join(lines))


# ── main ──────────────────────────────────────────────────────────────────────

def main():
    args = parse_args()
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    cwd = Path.cwd()

    if args.project_dir:
        project_dir = Path(args.project_dir)
    else:
        project_dir = find_project_dir(cwd)

    print(f"Project dir: {project_dir}", file=sys.stderr)

    default_out, default_cache = default_paths(cwd)
    out_base = Path(args.out).expanduser() if args.out else default_out
    cache_path = Path(args.cache).expanduser() if args.cache else default_cache
    cache = load_cache(cache_path)
    print(f"Cache: {len(cache)} days cached", file=sys.stderr)

    cache = refresh_cache(cache, project_dir, today)
    save_cache(cache_path, cache)
    print(f"Cache saved: {len(cache)} days", file=sys.stderr)

    # ── stats-only mode ────────────────────────────────────────────────────
    if args.stats_only:
        print_stats(cache, args.range)
        return

    # ── HTML generation ────────────────────────────────────────────────────
    all_sessions = sessions_from_cache(cache)

    out_dir = out_base.parent
    out_dir.mkdir(parents=True, exist_ok=True)

    # Always generate all 4 range variants so the nav tabs work
    ranges = ["24h", "7d", "30d", "all"]
    generated = []

    for r in ranges:
        sessions = filter_by_range(all_sessions, r)
        date_range, human = range_label(r, sessions, all_sessions)

        active = {rr: ("active" if rr == r else "") for rr in ranges}

        sessions_json = json.dumps(sessions, ensure_ascii=False, default=str)

        html = HTML_TEMPLATE \
            .replace("{{DATE_RANGE}}", date_range) \
            .replace("{{RANGE_HUMAN}}", human) \
            .replace("{{ACTIVE_24H}}", active["24h"]) \
            .replace("{{ACTIVE_7D}}", active["7d"]) \
            .replace("{{ACTIVE_30D}}", active["30d"]) \
            .replace("{{ACTIVE_ALL}}", active["all"]) \
            .replace("{{SESSIONS_JSON}}", sessions_json)

        stem = out_base.stem
        suffix = out_base.suffix
        out_path = out_dir / f"{stem}-{r}{suffix}"
        out_path.write_text(html, encoding="utf-8")
        print(f"  [{r}] {len(sessions)} sessions → {out_path}", file=sys.stderr)
        generated.append(str(out_path))

    # Print target file path for caller to open
    range_file = out_dir / f"{out_base.stem}-{args.range}{out_base.suffix}"
    print(str(range_file))


if __name__ == "__main__":
    main()
