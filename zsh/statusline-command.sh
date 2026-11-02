#!/usr/bin/env bash
input=$(cat)

if [ -x "$HOME/.orca/agent-hooks/claude-statusline.sh" ]; then
  (printf '%s' "$input" | /bin/sh "$HOME/.orca/agent-hooks/claude-statusline.sh" >/dev/null 2>&1 &)
fi

cwd=$(echo "$input" | jq -r '.workspace.current_dir // .cwd // ""')

case "${CLAUDE_CONFIG_DIR:-}" in
  *claude-company*) account="Company" ;;
  *)                 account="Personal" ;;
esac

branch=""
dirty=""
if git_branch=$(git -C "$cwd" symbolic-ref --short HEAD 2>/dev/null); then
  branch="$git_branch"
  if ! git -C "$cwd" diff --quiet 2>/dev/null || ! git -C "$cwd" diff --cached --quiet 2>/dev/null; then
    dirty="*"
  fi
fi

effort=$(echo "$input" | jq -r '.effort.level // ""')

model_full=$(echo "$input" | jq -r '.model.display_name // ""')
model_short=$(echo "$model_full" | sed 's/Claude //g' | awk '{print $1 " " $2}' | xargs)

used=$(echo "$input" | jq -r '.context_window.used_percentage // 0')
used_int=$(printf '%.0f' "$used")

cost=$(echo "$input" | jq -r '.cost.total_cost_usd // 0')
cost_fmt=$(printf '$%.2f' "$cost")

duration_ms=$(echo "$input" | jq -r '.cost.total_duration_ms // 0')
duration_s=$(( duration_ms / 1000 ))
duration_m=$(( duration_s / 60 ))
duration_rem=$(( duration_s % 60 ))
duration_fmt="${duration_m}m ${duration_rem}s"

_rl_config_dir="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
if [ -d "$_rl_config_dir" ]; then
  _rl_now=$(date +%s)
  echo "$input" | jq "{updated_at: $_rl_now, five_hour: .rate_limits.five_hour, seven_day: .rate_limits.seven_day}" > "$_rl_config_dir/rate-limits-cache.json" 2>/dev/null || true
fi

format_reset() {
  local left=$(( $1 - $2 ))
  if [ "$left" -lt 0 ]; then left=0; fi
  local minutes=$(( left / 60 ))
  local hours=$(( minutes / 60 ))
  local days=$(( hours / 24 ))
  if [ "$days" -gt 0 ]; then
    printf '%dd %dh' "$days" $(( hours % 24 ))
  elif [ "$hours" -gt 0 ]; then
    printf '%dh %dm' "$hours" $(( minutes % 60 ))
  else
    printf '%dm' "$minutes"
  fi
}

rate_info=""
now=$(date +%s)
while read -r key pct reset; do
  [ -z "$key" ] && continue
  case "$key" in
    five_hour) label="5h"; color="38;5;208" ;;
    seven_day) label="7d"; color="38;5;202" ;;
    *)         label="${key//_/ }"; color="38;5;202" ;;
  esac
  pct_int=$(printf '%.0f' "$pct")
  if [ "$pct_int" -ge 80 ]; then color="0;31"; fi
  window="${label}: ${pct_int}%"
  if [ "$reset" -gt 0 ] 2>/dev/null; then
    window="${window} ↺ $(format_reset "$reset" "$now")"
  fi
  rate_info="${rate_info}  |  \033[${color}m${window}\033[0m"
done < <(echo "$input" | jq -r '.rate_limits // {} | to_entries[] | select(.value != null and .value.used_percentage != null) | "\(.key) \(.value.used_percentage) \(.value.resets_at // 0 | floor)"')

# Line 1: [Model] account | 🌿 branch
line1="\033[0;33m[${model_short}]\033[0m  \033[0;35m${account}\033[0m"
if [ -n "$branch" ]; then
  line1="${line1}  |  🌿  \033[0;32m${branch}${dirty}\033[0m"
fi
if [ -n "$effort" ]; then
  line1="${line1}  \033[0;36m⚡ ${effort}\033[0m"
fi

# Line 2: wide progress bar + stats (20 blocks)
filled=$(( used_int * 20 / 100 ))
empty=$(( 20 - filled ))
bar=""
for i in $(seq 1 $filled); do bar="${bar}█"; done
for i in $(seq 1 $empty); do bar="${bar}░"; done

if [ "$used_int" -ge 80 ]; then
  bar_colored="\033[0;31m${bar}\033[0m"
elif [ "$used_int" -ge 50 ]; then
  bar_colored="\033[0;33m${bar}\033[0m"
else
  bar_colored="\033[0;32m${bar}\033[0m"
fi

line2="${bar_colored}  ${used_int}%${rate_info}"

printf '%b\n%b' "${line1}" "${line2}"
