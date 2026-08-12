#!/usr/bin/env bash
set -euo pipefail

marketplace_name="mantrandev-mattpocock"
marketplace_source="mantrandev/mattpocock-skills"
plugin_selector="mattpocock-skills@$marketplace_name"
skills=(
  "ask-matt"
  "diagnosing-bugs"
  "grill-with-docs"
  "triage"
  "improve-codebase-architecture"
  "setup-matt-pocock-skills"
  "tdd"
  "to-spec"
  "to-tickets"
  "wayfinder"
  "implement"
  "prototype"
  "research"
  "domain-modeling"
  "codebase-design"
  "code-review"
  "resolving-merge-conflicts"
  "wizard"
  "grill-me"
  "grilling"
  "handoff"
  "teach"
  "to-questionnaire"
  "wait-what"
  "writing-for-agents"
)

if ! command -v codex >/dev/null 2>&1; then
  echo "codex CLI not found — skipping Codex plugin install"
  exit 0
fi

codex_dirs=("$HOME/.codex")
for codex_dir in "$HOME"/.codex-*; do
  [ -d "$codex_dir" ] && codex_dirs+=("$codex_dir")
done

for codex_dir in "${codex_dirs[@]}"; do
  if CODEX_HOME="$codex_dir" codex plugin marketplace list | awk -v name="$marketplace_name" '$1 == name { found = 1 } END { exit !found }'; then
    CODEX_HOME="$codex_dir" codex plugin marketplace upgrade "$marketplace_name"
  else
    CODEX_HOME="$codex_dir" codex plugin marketplace add "$marketplace_source" --ref main
  fi
  CODEX_HOME="$codex_dir" codex plugin add "$plugin_selector"
done

for skill in "${skills[@]}"; do
  canonical="$HOME/.agents/skills/$skill"
  for codex_dir in "${codex_dirs[@]}"; do
    target="$codex_dir/skills/$skill"
    if [ -L "$target" ] && [ "$(readlink "$target")" = "$canonical" ]; then
      rm -f "$target"
    fi
  done
  if [ -e "$canonical" ] || [ -L "$canonical" ]; then
    rm -rf "$canonical"
  fi
done

lock_file="$HOME/.agents/.skill-lock.json"
if [ -f "$lock_file" ]; then
  temp_lock="$(mktemp)"
  jq '.skills |= with_entries(select(.value.source != "mattpocock/skills"))' "$lock_file" > "$temp_lock"
  mv "$temp_lock" "$lock_file"
fi

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
"$repo_dir/ai/sync-agent-config.sh"

for codex_dir in "${codex_dirs[@]}"; do
  if ! CODEX_HOME="$codex_dir" codex plugin list | awk -v selector="$plugin_selector" '$1 == selector && $2 == "installed," && $3 == "enabled" { found = 1 } END { exit !found }'; then
    echo "Codex plugin is not installed and enabled in $codex_dir: $plugin_selector" >&2
    exit 1
  fi
done

for skill in "${skills[@]}"; do
  if [ -e "$HOME/.agents/skills/$skill" ] || [ -L "$HOME/.agents/skills/$skill" ]; then
    echo "Standalone Matt Pocock skill remains: $skill" >&2
    exit 1
  fi
done

echo "Matt Pocock Codex plugin synchronized"
