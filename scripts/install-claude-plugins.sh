#!/usr/bin/env bash
set -euo pipefail

MARKETPLACE_SOURCE="nicobailon/visual-explainer"
MARKETPLACE_NAME="visual-explainer-marketplace"
PLUGIN="visual-explainer@${MARKETPLACE_NAME}"

if ! command -v claude >/dev/null 2>&1; then
  echo "claude CLI not found — skipping plugin install"
  exit 0
fi

config_dirs=(
  "$HOME/.claude"
  "$HOME/.claude-account1"
  "$HOME/.claude-account2"
  "$HOME/.claude-account3"
  "$HOME/.claude-account4"
  "$HOME/.claude-account5"
)

for dir in "${config_dirs[@]}"; do
  [ -d "$dir" ] || continue
  export CLAUDE_CONFIG_DIR="$dir"

  if ! claude plugin marketplace list 2>/dev/null | grep -q "$MARKETPLACE_NAME"; then
    claude plugin marketplace add "$MARKETPLACE_SOURCE"
  fi

  if ! claude plugin list 2>/dev/null | grep -q "^visual-explainer\|visual-explainer@"; then
    claude plugin install "$PLUGIN" --scope user
  fi

  echo "visual-explainer plugin ready in $dir"
done
