#!/usr/bin/env bash
set -e

extensions=(
  anthropic.claude-code
  github.copilot-chat
  llvm-vs-code-extensions.lldb-dap
  mechatroner.rainbow-csv
  ms-python.debugpy
  ms-python.python
  ms-python.vscode-pylance
  ms-python.vscode-python-envs
  ms-toolsai.jupyter
  ms-toolsai.jupyter-keymap
  ms-toolsai.jupyter-renderers
  ms-toolsai.vscode-jupyter-cell-tags
  ms-toolsai.vscode-jupyter-slideshow
  openai.chatgpt
  pkief.material-icon-theme
  redhat.vscode-yaml
  swiftlang.swift-vscode
)

for ext in "${extensions[@]}"; do
  code --install-extension "$ext" --force
done
