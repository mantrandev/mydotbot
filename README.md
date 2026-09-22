# mydotbot

Dotbot-managed dotfiles for shell, agents (Claude, Codex, Pi), and skills.

**This repo is public.** Nothing company-specific belongs in it — no internal
project paths, colleague identifiers, Slack or GitLab IDs, team IDs, or work
email addresses. Those live in device-only locations listed under
[Device-only files](#device-only-files).

## Structure

```
ai/
├── CLAUDE.md              Shared rules for Codex, Pi, ~/.agents_common
├── claude/CLAUDE.md       Rules for the personal Claude profile
├── claude-company/…       Rules for the company Claude profile
├── agents/                Claude Code subagent definitions
├── commonSkills/          Source skills, cross-agent          (9)
├── iOS/                   Source skills, iOS-specific         (7)
├── web/                   Parked skills, not loaded          (65)
├── memory/                Memory store, personal profile
├── memory-company/        Memory store, company profile
├── skill-profiles.conf    Which skills each Claude profile gets
├── skills/                GENERATED — Codex, Pi, agents_common (21)
├── skills-claude/         GENERATED — personal profile          (5)
├── skills-company/        GENERATED — company profile          (12)
└── sync-agent-config.sh   Rebuilds the three generated roots
scripts/
├── install-claude-plugins.sh   User-scope Claude plugins, both profiles
├── install-codex-plugins.sh    Native Codex plugins
├── install-npm-globals.sh
└── install-vscode-extensions.sh
zsh/
├── .zshrc                 Zsh config, oh-my-zsh, nvm, aliases
├── .zprofile              Homebrew shellenv
├── jira.zsh               Jira helpers via acli
└── statusline-command.sh  Claude Code statusline, labels the profile
pi/
├── extensions/            Pi extensions
└── themes/                Pi themes
```

Never edit `ai/skills/`, `ai/skills-claude/` or `ai/skills-company/` — the sync
script deletes and rebuilds them.

## New device setup

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

git clone https://github.com/mantrandev/mydotbot.git ~/mydotbot
cd ~/mydotbot
git submodule update --init
./install.sh
```

`./install.sh` installs apps via `brew bundle`, VS Code extensions, npm globals,
Claude Code plugins and native Codex plugins, then applies every symlink.

Device-only files are not in this repo and have to be recreated by hand — see
[Device-only files](#device-only-files).

## Manual installs

Not on Homebrew:

| App | Link |
|---|---|
| Xcode | [Mac App Store](https://apps.apple.com/app/xcode/id497799835) |
| TestFlight | [Mac App Store](https://apps.apple.com/app/testflight/id899247664) |
| Keynote | [Mac App Store](https://apps.apple.com/app/keynote/id409183694) |
| RocketSim | [Mac App Store](https://apps.apple.com/app/rocketsim-for-xcode-simulator/id1504940162) |
| Zalo | [zalo.me](https://zalo.me/pc) |
| SF Symbols | [developer.apple.com](https://developer.apple.com/sf-symbols/) |

## Claude profiles

Two profiles, fully separate. They share only the subagents and the
statusline script.

| | `~/.claude` — personal | `~/.claude-company` — company |
|---|---|---|
| alias | `claude-mine` | `claude-company` |
| rules | `ai/claude/CLAUDE.md` | `ai/claude-company/CLAUDE.md` |
| skills | `ai/skills-claude` (5) | `ai/skills-company` (12) |
| memory | `ai/memory` | `ai/memory-company` |
| plugins | marketplace set | marketplace set + `delivery` |
| history, projects, sessions | own, local | own, local |
| commits as | GitHub identity | GitLab identity |

`ai/agents/` is linked into both by `sync-agent-config.sh`, not by
`install.conf.yaml` — the script creates the symlinks Dotbot does not.
`zsh/statusline-command.sh` reads `CLAUDE_CONFIG_DIR` and labels the statusline
`Personal` or `Company`.

## Skills

Three sources merge into the generated roots:

| Source | In git | Purpose |
|---|---|---|
| `ai/commonSkills/` | yes | cross-agent skills |
| `ai/iOS/` | yes | iOS skills |
| `~/.localskills/` | no, device-only | skills holding internal identifiers |

```
ai/commonSkills/  ─┐
ai/iOS/           ─┼─►  ai/skills/ (21)  ─►  ~/.agents_common/skills   whole dir
~/.localskills/   ─┘           │         ─►  ~/.codex/skills/<name>    per skill
                               │         ─►  ~/.pi/agent/skills/<name> per skill
                               │
                               │   skill-profiles.conf selects per profile
                               ├─►  ai/skills-claude/  (5)  ─►  ~/.claude/skills
                               └─►  ai/skills-company/ (12) ─►  ~/.claude-company/skills
```

`ai/skills/` takes every source unconditionally, all 21. Who sees how many
differs by consumer:

| Consumer | Gets | Declared in |
|---|---|---|
| `~/.agents_common/` | all 21, whole directory | `sync-agent-config.sh` |
| Codex | one entry per skill, hand-maintained | `install.conf.yaml` |
| Pi | `blueprint-html` only | `install.conf.yaml` |
| Claude, per profile | what `skill-profiles.conf` lists | `install.conf.yaml` |

The Codex and Pi entries are hand-maintained, so they drift. Adding a skill means
adding its line; deleting one means removing it, or `install.sh` tries to link a
source that is gone.

Matt Pocock skills are handled per agent: Claude uses the official plugin, Codex
uses `scripts/install-codex-plugins.sh` against the `mantrandev/mattpocock-skills`
fork. The fork is refreshed manually from `mattpocock/skills`:

```bash
gh workflow run sync-upstream.yml --repo mantrandev/mattpocock-skills
```

### Adding a skill

1. Create the directory under `ai/commonSkills/` or `ai/iOS/`, with `SKILL.md`.
2. Add its name to `ai/skill-profiles.conf` under `[claude]`, `[company]`, or both.
   A skill in neither reaches Codex and Pi only.
3. Add `~/.codex/skills/<name>` and, if Pi needs it, `~/.pi/agent/skills/<name>`
   to `install.conf.yaml` by hand.
4. `./ai/sync-agent-config.sh && ./install.sh`
5. Commit the source directory and the generated symlinks.

### Editing a skill

Edit the source, then `./ai/sync-agent-config.sh`. Device-only skills live in
`~/.localskills/<name>/SKILL.md` and need no commit.

## Plugins

Two kinds, installed differently.

**Marketplace plugins** — `scripts/install-claude-plugins.sh` is the source of
truth. It runs on `./install.sh` and drives both Claude config dirs:

```
clangd-lsp@claude-plugins-official
clean-architecture-ios@clean-architecture-ios
frontend-design@claude-plugins-official
mattpocock-skills@claude-plugins-official
posthog@claude-plugins-official
rust-analyzer-lsp@claude-plugins-official
swift-lsp@claude-plugins-official
visual-explainer@visual-explainer-marketplace
warp@claude-code-warp
```

It registers the marketplaces, installs what is missing, updates what is
installed, enables the declared set, and removes superseded plugins while keeping
their data. Project-scope and local-scope plugins are untouched. Add or remove
entries by editing the arrays in the script.

**Local plugins** — `claude plugin marketplace add` also accepts a filesystem
path, so a plugin can exist only on this device. `~/.localplugins/delivery` is
installed that way, into the company profile only, because it holds internal
identifiers that must not reach this repo:

```bash
CLAUDE_CONFIG_DIR=~/.claude-company claude plugin marketplace add ~/.localplugins/delivery
CLAUDE_CONFIG_DIR=~/.claude-company claude plugin install delivery@delivery --scope user
```

`claude plugin install` does not follow symlinks — a symlinked skill directory is
dropped silently. Copy the directory instead, and bump the version in
`.claude-plugin/plugin.json`, since `plugin update` compares versions, not files.

**Codex** — `scripts/install-codex-plugins.sh` registers the Matt Pocock fork as
a Codex marketplace and installs the native plugin. Without this repo:

```bash
codex plugin marketplace add mantrandev/mattpocock-skills --ref main
codex plugin add mattpocock-skills@mantrandev-mattpocock
```

## Cloud-synced skills

Claude Code also pulls skills and plugins down from the claude.ai account, into
`<profile>/skills/synced/<org>_<account>/` and
`<profile>/plugins/synced/<org>_<account>/`. Their `manifest.json` marks each one
`anthropic`, `anthropic-example`, or `custom` for ones uploaded from the account.

Three consequences:

- The two profiles are two accounts, so their synced sets differ.
- Deleting a synced skill locally does nothing; it returns on the next sync.
  Remove it in `/skills` on claude.ai instead.
- `~/.claude/skills` is a symlink into this repo, so the synced directory lands
  inside it. `.gitignore` excludes `ai/skills-*/synced/`.

A name collision between a local skill and a synced one leaves two entries with
the same name in the listing. The local `html-template` was renamed
`blueprint-html` for that reason.

## Device-only files

Not in this repo. Recreate on a new device.

| Path | Holds |
|---|---|
| `~/.localskills/` | skills with internal identifiers |
| `~/.localplugins/` | local plugins, e.g. `delivery` |
| `~/.zsh/jira.local.zsh` | `JIRA_SITE`, `JIRA_PROJECT` |
| `~/.gitconfig`, `~/.gitconfig-github` | commit identities |

`zsh/jira.zsh` sources `~/.zsh/jira.local.zsh` before setting its defaults, so
the site and project stay out of git:

```bash
JIRA_SITE=your-site.atlassian.net
JIRA_PROJECT=PROJ
```

## Agents

Four Claude Code subagents in `ai/agents/`, all on Haiku. Symlinked into both
profiles. Edit the source, never `~/.claude/agents/`.

| Agent | Description |
|---|---|
| branch-cleaner | Find and delete merged feature branches |
| find-ticket | Search a ticket ID across code, commits, branches |
| validate-di | Validate Swinject DI registrations |
| web-simulator | Stream the iOS Simulator to a browser via serve-sim |

## Codex multi-account

`codex-mine` and `codex-1` keep separate credentials and config while sharing
conversation history, sessions, the session index, memories, goals, attachments,
generated images and thread state through `~/.local/share/codex`. The symlinks
are declared in `install.conf.yaml`; no Codex process needs to be closed.
Adding an account means adding its link entries to `install.conf.yaml`.

## Submodules

| Submodule | Source |
|---|---|
| `dotbot` | https://github.com/anishathalye/dotbot |
