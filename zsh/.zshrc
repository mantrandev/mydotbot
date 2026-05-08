export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="robbyrussell"
plugins=(git)
source $ZSH/oh-my-zsh.sh

# aliases
alias claude-mine='CLAUDE_CONFIG_DIR=~/.claude claude'
alias claude-g='CLAUDE_CONFIG_DIR=~/.claude-account1 claude'
alias claude-h='CLAUDE_CONFIG_DIR=~/.claude-account3 claude'
alias claude-t='CLAUDE_CONFIG_DIR=~/.claude-account4 claude'
alias claude-crossian='CLAUDE_CONFIG_DIR=~/.claude-account2 claude'

[[ -f "$HOME/.zsh/jira.zsh" ]] && source "$HOME/.zsh/jira.zsh"

# nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

autoload -U add-zsh-hook
load-nvmrc() {
  local nvmrc_path
  nvmrc_path="$(nvm_find_nvmrc)"

  if [ -n "$nvmrc_path" ]; then
    local nvmrc_node_version
    nvmrc_node_version="$(nvm version "$(cat "$nvmrc_path")")"

    if [ "$nvmrc_node_version" = "N/A" ]; then
      nvm install
    elif [ "$nvmrc_node_version" != "$(nvm version)" ]; then
      nvm use --silent
    fi
  elif [ "$(nvm version)" != "$(nvm version default)" ]; then
    nvm use --silent default
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc

export PATH="$HOME/.local/bin:$PATH"
export PATH="/Users/maybe/.antigravity/antigravity/bin:$PATH"
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
export PATH="$HOME/Library/Python/3.14/bin:$PATH"
