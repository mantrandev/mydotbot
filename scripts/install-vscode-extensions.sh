#!/usr/bin/env bash
set -e

extensions=(
  anthropic.claude-code
  davidanson.vscode-markdownlint
  eamodio.gitlens
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
  pkief.material-icon-theme
  redhat.vscode-yaml
  swiftlang.swift-vscode
  tomoki1207.pdf
  vadimcn.vscode-lldb
)

for ext in "${extensions[@]}"; do
  code --install-extension "$ext" --force
done
