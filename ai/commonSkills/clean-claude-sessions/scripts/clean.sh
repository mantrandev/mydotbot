#!/usr/bin/env bash
set -euo pipefail

DAYS="${1:-3}"
MODE="${2:-scan}"
ROOT="$HOME/.local/share/claude/projects"

if [ ! -d "$ROOT" ]; then
  echo "Session store not found: $ROOT"
  exit 1
fi

case "$MODE" in
  scan|clean|deep) ;;
  *) echo "Invalid mode: $MODE (expected scan|clean|deep)"; exit 1 ;;
esac

human() {
  local b=$1
  if [ "$b" -lt 1024 ]; then echo "${b}B"
  elif [ "$b" -lt 1048576 ]; then awk -v b="$b" 'BEGIN{printf "%.0fK\n", b/1024}'
  elif [ "$b" -lt 1073741824 ]; then awk -v b="$b" 'BEGIN{printf "%.1fM\n", b/1048576}'
  else awk -v b="$b" 'BEGIN{printf "%.1fG\n", b/1073741824}'; fi
}

bytes_of() { du -sk "$@" 2>/dev/null | awk '{s+=$1} END{print s*1024+0}'; }

echo "=== Claude session store: $ROOT ==="
echo "Mode: $MODE   Age threshold: ${DAYS}d"
echo

total_before=$(bytes_of "$ROOT")
total_jsonl=$(find "$ROOT" -name '*.jsonl' 2>/dev/null | wc -l | tr -d ' ')
old_jsonl=$(find "$ROOT" -name '*.jsonl' -mtime +"$DAYS" 2>/dev/null | wc -l | tr -d ' ')

printf "%-50s %10s %10s %10s\n" "PROJECT" "OLD/TOTAL" "OLD_SIZE" "TOTAL_SIZE"
printf -- '%.0s-' {1..85}; echo
for d in "$ROOT"/*/; do
  [ -d "$d" ] || continue
  name=$(basename "$d")
  total=$(find "$d" -name '*.jsonl' 2>/dev/null | wc -l | tr -d ' ')
  old=$(find "$d" -name '*.jsonl' -mtime +"$DAYS" 2>/dev/null | wc -l | tr -d ' ')
  total_sz=$(bytes_of "$d")
  if [ "$old" -gt 0 ]; then
    old_sz=$(find "$d" -name '*.jsonl' -mtime +"$DAYS" -print0 2>/dev/null | xargs -0 du -sk 2>/dev/null | awk '{s+=$1} END{print s*1024+0}')
  else
    old_sz=0
  fi
  printf "%-50s %10s %10s %10s\n" "$name" "$old/$total" "$(human "$old_sz")" "$(human "$total_sz")"
done

echo
echo "TOTAL: $old_jsonl/$total_jsonl sessions are >${DAYS}d   store size: $(human "$total_before")"

if [ "$MODE" = "scan" ]; then
  echo
  echo "(scan mode — nothing deleted)"
  exit 0
fi

echo
echo "=== Deleting sessions >${DAYS}d ==="
find "$ROOT" -name '*.jsonl' -mtime +"$DAYS" -print0 | xargs -0 rm -f

echo "=== Removing orphan UUID subdirs ==="
orphans=0
for d in "$ROOT"/*/; do
  [ -d "$d" ] || continue
  for uuid_dir in "$d"*/; do
    [ -d "$uuid_dir" ] || continue
    uuid=$(basename "$uuid_dir")
    case "$uuid" in
      [0-9a-f]*-[0-9a-f]*-[0-9a-f]*-[0-9a-f]*-[0-9a-f]*)
        if [ ! -f "${d}${uuid}.jsonl" ]; then
          rm -rf "$uuid_dir"
          orphans=$((orphans+1))
        fi
        ;;
    esac
  done
done
echo "Removed $orphans orphan UUID dirs"

find "$ROOT" -type d -empty -delete 2>/dev/null || true

if [ "$MODE" = "deep" ]; then
  echo
  echo "=== Deep cleanup ==="
  if [ -d "$HOME/.claude/telemetry" ]; then
    tel_before=$(bytes_of "$HOME/.claude/telemetry")
    rm -rf "$HOME/.claude/telemetry"/* 2>/dev/null || true
    echo "telemetry: $(human "$tel_before") → 0"
  fi
  fh_before=0
  fh_after=0
  for fh in "$HOME"/.claude/file-history "$HOME"/.claude-account*/file-history; do
    [ -d "$fh" ] || continue
    b=$(bytes_of "$fh"); fh_before=$((fh_before+b))
    find "$fh" -type f -mtime +14 -delete 2>/dev/null || true
    find "$fh" -type d -empty -delete 2>/dev/null || true
    a=$(bytes_of "$fh"); fh_after=$((fh_after+a))
  done
  echo "file-history >14d: $(human "$fh_before") → $(human "$fh_after")"
fi

total_after=$(bytes_of "$ROOT")
freed=$((total_before - total_after))
remaining_jsonl=$(find "$ROOT" -name '*.jsonl' 2>/dev/null | wc -l | tr -d ' ')
remaining_dirs=$(find "$ROOT" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')

echo
echo "=== Done ==="
echo "Store: $(human "$total_before") → $(human "$total_after")   (freed $(human "$freed"))"
echo "Sessions: $total_jsonl → $remaining_jsonl"
echo "Project dirs: $remaining_dirs"
