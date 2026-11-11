#!/usr/bin/env bash
set -e

packages=(
  "@aliou/pi-guardrails"
  "@ifi/pi-plan"
  "@earendil-works/pi-coding-agent"
  "@openai/codex"
  "pnpm"
  "pyright"
  "pi-rewind-hook"
  "pi-subagents"
  "vercel"
)

npm install -g "${packages[@]}"
