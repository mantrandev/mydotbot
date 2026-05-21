#!/usr/bin/env bash
# Run claude sequentially through accounts 1-5, auto-advancing on rate limit.
# Usage: ccs [claude args...]

ACCOUNTS=(
  "$HOME/.claude-account1"
  "$HOME/.claude-account2"
  "$HOME/.claude-account3"
  "$HOME/.claude-account4"
  "$HOME/.claude-account5"
)

LIMIT_THRESHOLD=90
current=0
continue_flag=""

_is_rate_limited() {
  local cache="$1/rate-limits-cache.json"
  [ -f "$cache" ] || return 1
  local five_h seven_d
  five_h=$(jq -r '.five_hour.used_percentage // 0' "$cache" 2>/dev/null)
  seven_d=$(jq -r '.seven_day.used_percentage // 0' "$cache" 2>/dev/null)
  local fh_int sd_int
  fh_int=$(printf '%.0f' "$five_h")
  sd_int=$(printf '%.0f' "$seven_d")
  [ "$fh_int" -ge "$LIMIT_THRESHOLD" ] || [ "$sd_int" -ge "$LIMIT_THRESHOLD" ]
}

while [ "$current" -lt "${#ACCOUNTS[@]}" ]; do
  config="${ACCOUNTS[$current]}"
  account_num=$((current + 1))

  if _is_rate_limited "$config"; then
    echo "⏭  Account $account_num already at limit — skipping"
    current=$((current + 1))
    continue_flag="-c"
    continue
  fi

  echo "▶  Account $account_num"
  CLAUDE_CONFIG_DIR="$config" claude $continue_flag "$@"

  if _is_rate_limited "$config"; then
    current=$((current + 1))
    continue_flag="-c"
    if [ "$current" -lt "${#ACCOUNTS[@]}" ]; then
      echo ""
      echo "⚠️  Account $account_num hit limit — switching to account $((current + 1))"
    else
      echo ""
      echo "✗  All accounts exhausted"
    fi
  else
    break
  fi
done
