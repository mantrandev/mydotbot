#!/usr/bin/env bash
input=$(cat)

cwd=$(echo "$input" | jq -r '.workspace.current_dir // .cwd // ""')

case "${CLAUDE_CONFIG_DIR:-}" in
  *claude-account1*) account="Jang" ;;
  *claude-account2*) account="Man" ;;
  *claude-account3*) account="Hao" ;;
  *claude-account4*) account="Tan" ;;
  *)                 account="personal" ;;
esac

branch=""
dirty=""
if git_branch=$(git -C "$cwd" symbolic-ref --short HEAD 2>/dev/null); then
  branch="$git_branch"
  if ! git -C "$cwd" diff --quiet 2>/dev/null || ! git -C "$cwd" diff --cached --quiet 2>/dev/null; then
    dirty="*"
  fi
fi

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

five_h_pct=$(echo "$input" | jq -r '.rate_limits.five_hour.used_percentage // 0')
five_h_pct_int=$(printf '%.0f' "$five_h_pct")
five_h_reset=$(echo "$input" | jq -r '.rate_limits.five_hour.resets_at // 0')

seven_d_pct=$(echo "$input" | jq -r '.rate_limits.seven_day.used_percentage // 0')
seven_d_pct_int=$(printf '%.0f' "$seven_d_pct")
seven_d_reset=$(echo "$input" | jq -r '.rate_limits.seven_day.resets_at // 0')

rate_info=""
if [ "$five_h_reset" -gt 0 ]; then
  now=$(date +%s)
  diff_s=$(( five_h_reset - now ))
  if [ "$diff_s" -lt 0 ]; then diff_s=0; fi
  diff_m=$(( diff_s / 60 ))
  diff_h=$(( diff_m / 60 ))
  diff_rem=$(( diff_m % 60 ))
  if [ "$diff_h" -gt 0 ]; then
    reset_in="${diff_h}h ${diff_rem}m"
  else
    reset_in="${diff_m}m"
  fi

  sd_reset_str=""
  if [ "$seven_d_reset" -gt 0 ]; then
    sd_diff_s=$(( seven_d_reset - now ))
    if [ "$sd_diff_s" -lt 0 ]; then sd_diff_s=0; fi
    sd_diff_m=$(( sd_diff_s / 60 ))
    sd_diff_h=$(( sd_diff_m / 60 ))
    sd_diff_rem=$(( sd_diff_m % 60 ))
    sd_diff_d=$(( sd_diff_h / 24 ))
    sd_diff_h_rem=$(( sd_diff_h % 24 ))
    if [ "$sd_diff_d" -gt 0 ]; then
      sd_reset_str=" ↺ ${sd_diff_d}d ${sd_diff_h_rem}h"
    elif [ "$sd_diff_h" -gt 0 ]; then
      sd_reset_str=" ↺ ${sd_diff_h}h ${sd_diff_rem}m"
    else
      sd_reset_str=" ↺ ${sd_diff_m}m"
    fi
  fi

  if [ "$seven_d_pct_int" -ge 80 ]; then
    sd_colored="\033[0;31m7d: ${seven_d_pct_int}%${sd_reset_str}\033[0m"
  else
    sd_colored="\033[38;5;202m7d: ${seven_d_pct_int}%${sd_reset_str}\033[0m"
  fi

  if [ "$five_h_pct_int" -ge 80 ]; then
    fh_colored="\033[0;31m5h: ${five_h_pct_int}% ↺ ${reset_in}\033[0m"
  else
    fh_colored="\033[38;5;208m5h: ${five_h_pct_int}% ↺ ${reset_in}\033[0m"
  fi
  rate_info="  |  ${fh_colored}  |  ${sd_colored}"
fi

# Line 1: [Model] account | 🌿 branch
line1="\033[0;33m[${model_short}]\033[0m  \033[0;35m${account}\033[0m"
if [ -n "$branch" ]; then
  line1="${line1}  |  🌿  \033[0;32m${branch}${dirty}\033[0m"
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
