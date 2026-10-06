#!/usr/bin/env bash
set -euo pipefail

if ! command -v herdr >/dev/null 2>&1; then
  echo "herdr not found — skipping herdr integrations"
  exit 0
fi

claude_dirs=(
  "$HOME/.claude"
  "$HOME/.claude-company"
)

codex_dirs=(
  "$HOME/.codex"
  "$HOME/.codex-1"
)

codex_terminal_title='terminal_title = ["activity", "thread-title"]'

for dir in "${claude_dirs[@]}"; do
  [ -d "$dir" ] || continue
  CLAUDE_CONFIG_DIR="$dir" herdr integration install claude
done

for dir in "${codex_dirs[@]}"; do
  [ -d "$dir" ] || continue
  CODEX_HOME="$dir" herdr integration install codex
  config="$dir/config.toml"
  touch "$config"
  if grep -q '^terminal_title[[:space:]]*=' "$config"; then
    continue
  elif grep -q '^\[tui\]$' "$config"; then
    sed -i '' "/^\[tui\]\$/a\\
$codex_terminal_title
" "$config"
  else
    printf '\n[tui]\n%s\n' "$codex_terminal_title" >> "$config"
  fi
  echo "set codex terminal title in $config"
done
