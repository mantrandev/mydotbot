#!/usr/bin/env bash
set -euo pipefail

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

if ! command -v npx >/dev/null 2>&1; then
  echo "npx not found — skipping Codex skill install"
  exit 0
fi

missing=()
installed=()

for skill in "${skills[@]}"; do
  if [ -f "$HOME/.agents/skills/$skill/SKILL.md" ] || [ -f "$HOME/.codex/skills/$skill/SKILL.md" ]; then
    installed+=("$skill")
  else
    missing+=("$skill")
  fi
done

if [ "${#missing[@]}" -gt 0 ]; then
  args=(skills@latest add mattpocock/skills -g -a codex -y)
  for skill in "${missing[@]}"; do
    args+=(--skill "$skill")
  done
  npx --yes "${args[@]}"
fi

if [ "${#installed[@]}" -gt 0 ]; then
  npx --yes skills@latest update -g -y "${installed[@]}"
fi

mkdir -p "$HOME/.codex/skills"

for skill in "${skills[@]}"; do
  canonical="$HOME/.agents/skills/$skill"
  target="$HOME/.codex/skills/$skill"
  if [ -f "$canonical/SKILL.md" ] && [ ! -e "$target" ]; then
    ln -s "$canonical" "$target"
  fi
  if [ ! -f "$target/SKILL.md" ]; then
    echo "Codex skill missing after install: $skill" >&2
    exit 1
  fi
done

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
"$repo_dir/ai/sync-agent-config.sh"

echo "Matt Pocock Codex skills synchronized"
