#!/usr/bin/env bash
set -euo pipefail

marketplaces=(
  "anthropics/claude-plugins-official|claude-plugins-official"
  "anthropics/skills|anthropic-agent-skills"
  "warpdotdev/claude-code-warp|claude-code-warp"
  "nicobailon/visual-explainer|visual-explainer-marketplace"
)

plugins=(
  "clangd-lsp@claude-plugins-official"
  "frontend-design@claude-plugins-official"
  "mattpocock-skills@claude-plugins-official"
  "posthog@claude-plugins-official"
  "rust-analyzer-lsp@claude-plugins-official"
  "swift-lsp@claude-plugins-official"
  "visual-explainer@visual-explainer-marketplace"
  "warp@claude-code-warp"
)

removed_plugins=(
  "code-review@claude-plugins-official"
)

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
  marketplaces_file="$dir/plugins/known_marketplaces.json"
  installed_file="$dir/plugins/installed_plugins.json"
  settings_file="$dir/settings.json"

  for marketplace in "${marketplaces[@]}"; do
    IFS='|' read -r source name <<< "$marketplace"
    if [ ! -f "$marketplaces_file" ] || ! jq -e --arg name "$name" 'has($name)' "$marketplaces_file" >/dev/null; then
      CLAUDE_CONFIG_DIR="$dir" claude plugin marketplace add "$source"
    fi
  done

  CLAUDE_CONFIG_DIR="$dir" claude plugin marketplace update

  for plugin in "${removed_plugins[@]}"; do
    if [ -f "$installed_file" ] && jq -e --arg plugin "$plugin" '.plugins[$plugin] // [] | any(.scope == "user")' "$installed_file" >/dev/null; then
      CLAUDE_CONFIG_DIR="$dir" claude plugin uninstall "$plugin" --scope user --keep-data
    fi
  done

  for plugin in "${plugins[@]}"; do
    if [ -f "$installed_file" ] && jq -e --arg plugin "$plugin" '.plugins[$plugin] // [] | any(.scope == "user")' "$installed_file" >/dev/null; then
      CLAUDE_CONFIG_DIR="$dir" claude plugin update "$plugin" --scope user
    else
      CLAUDE_CONFIG_DIR="$dir" claude plugin install "$plugin" --scope user
    fi
    if [ ! -f "$settings_file" ] || ! jq -e --arg plugin "$plugin" '.enabledPlugins[$plugin] == true' "$settings_file" >/dev/null; then
      CLAUDE_CONFIG_DIR="$dir" claude plugin enable "$plugin" --scope user
    fi
  done

  echo "Claude plugins synchronized in $dir"
done
