# Jira ACLI configuration

Use this reference when the user needs setup help, project-specific defaults, or examples.

## Environment variables

Set these in the shell profile used to launch Codex:

```bash
export JIRA_SITE="your-company.atlassian.net"
export JIRA_PROJECT="ABC"
export JIRA_TODO_STATUS="To Do"
export JIRA_WORKFLOW_STATUSES='["To Do","In Progress","In Review","Done"]'
```

Behavior:

- `JIRA_SITE`: used for Jira browse URLs and auth guidance.
- `JIRA_PROJECT`: lets bare numbers like `1234` normalize to `ABC-1234`.
- `JIRA_TODO_STATUS`: optional project-specific todo label.
- `JIRA_WORKFLOW_STATUSES`: JSON array used by `forward` and `backward`.

If `JIRA_PROJECT` is unset, require full issue keys like `ABC-123`.
If `JIRA_WORKFLOW_STATUSES` is unset, use explicit transitions instead of forward/backward.

## ShopHelp example

```bash
export JIRA_SITE="crossian.atlassian.net"
export JIRA_PROJECT="SHOPHELP"
export JIRA_TODO_STATUS="TO DO"
export JIRA_WORKFLOW_STATUSES='["TO DO","In Progress","Testing","Block","Review","Wait to build PROD","DONE"]'
```

With that setup:

- `3642` resolves to `SHOPHELP-3642`
- branch names like `feature/SHOPHELP-3642-fix-login` work with current-branch flows
- `forward` / `backward` use the ShopHelp workflow order

## One-time Jira auth

```bash
acli jira auth login --web --site "$JIRA_SITE"
```

Useful follow-ups:

```bash
acli jira auth status
acli jira auth switch --site "$JIRA_SITE"
```

## Helper examples

```bash
python3 ~/.dotfiles/setup/codex/skills/jira-acli/scripts/jira_helper.py normalize-key 3642
python3 ~/.dotfiles/setup/codex/skills/jira-acli/scripts/jira_helper.py branch-key
python3 ~/.dotfiles/setup/codex/skills/jira-acli/scripts/jira_helper.py current-status --current-branch
python3 ~/.dotfiles/setup/codex/skills/jira-acli/scripts/jira_helper.py move 3642 --status "Review"
python3 ~/.dotfiles/setup/codex/skills/jira-acli/scripts/jira_helper.py forward --current-branch
python3 ~/.dotfiles/setup/codex/skills/jira-acli/scripts/jira_helper.py comment 3642 --text "QA ready"
python3 ~/.dotfiles/setup/codex/skills/jira-acli/scripts/jira_helper.py desc-file 3642 --file /tmp/desc.md
python3 ~/.dotfiles/setup/codex/skills/jira-acli/scripts/jira_helper.py subtask 3642 --summary "Add analytics logging"
python3 ~/.dotfiles/setup/codex/skills/jira-acli/scripts/jira_helper.py mine --open-sprint --paginate
```

## Natural-language examples

Good prompts for this skill:

- "View Jira 3642"
- "Open Jira ABC-123 in browser"
- "Move current branch ticket to Review"
- "Advance this ticket one step"
- "Assign SHOPHELP-3642 to me"
- "Comment on 3642: QA ready"
- "Replace the description of the current branch ticket from /tmp/desc.md"
- "Show my sprint issues"
