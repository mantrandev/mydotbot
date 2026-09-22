#!/usr/bin/env bash
set -e

packages=(
  "@aliou/pi-guardrails"
  "@ifi/pi-plan"
  "@mariozechner/pi-coding-agent"
  "@openai/codex"
  "pnpm"
  "pyright"
  "yarn"
  "pi-rewind-hook"
  "pi-subagents"
  "serve-sim"
)

npm install -g "${packages[@]}"
