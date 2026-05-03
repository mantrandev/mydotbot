# Shared Agent Rules

Use this as the shared global operating guide for Codex, Claude, and Pi.
Repo-local instructions take priority when they are explicit and relevant.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## Source of Truth

- `~/dotfiles/ai/AGENTS.md` is the shared global rules source.
- `~/dotfiles/ai/commonSkills/` stores shared common skills and is default-loaded globally.
- `~/dotfiles/ai/iOS/` stores shared iOS skills and is default-loaded globally.
- `~/dotfiles/ai/web/` stores parked web skills that are not default-loaded globally.
- `~/dotfiles/ai/skills/` is the generated active global skills root built from `commonSkills` and `iOS`.
- Edit the dotfiles source, not mirrored agent files.
- When adding, editing, moving, or deleting a shared skill, change `~/dotfiles/ai/commonSkills/`, `~/dotfiles/ai/iOS/`, or `~/dotfiles/ai/web/` only.
- Do not edit `~/dotfiles/ai/skills/` directly.
- When updating shared global rules, change `~/dotfiles/ai/AGENTS.md` only.
- **MANDATORY: After ANY skill add, edit, move, or delete — run `~/dotfiles/ai/sync-agent-config.sh` immediately. This propagates changes to Claude, Codex, and Pi. Never skip this step.**
- If a mirrored agent path differs from dotfiles, dotfiles wins.

## Startup

- Read repo-local guidance first when present: `CLAUDE.md`, `AGENTS.md`, `README.md`, `docs/`, `gemini.md`.
- When repo-local instructions require reading `/docs` or `docs/`, resolve it as the current repository's `docs/` directory, not a desktop-level or sibling `docs` folder.
- Match the user's language and technical level.
- Keep progress updates concise and factual.

## Task Modes

- If the user asks for analysis, planning, or review, stay read-only unless they later ask for implementation.
- If the user asks for implementation, inspect the relevant context first, then execute.
- If ambiguity can be resolved from the codebase or local files, inspect before asking the user.

## Editing

- Inspect before editing.
- Prefer the smallest correct change with low churn.
- Follow the existing architecture, naming, and project conventions.
- Check for existing modules and patterns before creating new files or abstractions.
- Do not overwrite, revert, or clean up user changes unless explicitly requested.
- Avoid destructive file or git operations unless explicitly requested or clearly approved.

## Review Style

- Present findings first.
- Order findings by severity.
- Cite file and line when possible.
- Codex and Claude will pair review your output once you are done.
- Call out residual risk and testing gaps when verification is incomplete.

## Engineering Preferences

- Prefer clear boundaries, simple designs, and maintainable code.
- Separate hard constraints from heuristics.
- Avoid speculative explanations.
- Surface blockers early and narrowly.

## Verification

- Do not claim completion without verification evidence.
- Use proportional verification.
- Prefer targeted checks over expensive blanket commands.
- If a command, build, or test was not run, say so explicitly.

## Git

- Use Conventional Commits for commit messages unless repo-local rules override.
- Do not include `Co-Authored-By` or AI attribution in commit messages.
- Keep commits focused on the actual change.

## Skills

- Trigger a relevant skill when the task clearly matches it.
- Prefer reusable skill workflows and scripts over ad-hoc repetition.
- Keep default-loaded shared skills under `~/dotfiles/ai/commonSkills` or `~/dotfiles/ai/iOS`.
- Keep parked web skills under `~/dotfiles/ai/web` until they are needed in a project.
- **After creating, editing, moving, or deleting any skill file or directory, always run `~/dotfiles/ai/sync-agent-config.sh` as the final step. This is non-optional.**

## RTK

- If `rtk --version` works, prefer prefixing shell commands with `rtk`.
- Use direct `rtk` meta commands when needed:
  - `rtk gain`
  - `rtk gain --history`
  - `rtk discover`
  - `rtk proxy <cmd>`
- Verify RTK when behavior looks wrong:
  - `rtk --version`
  - `rtk gain`
  - `which rtk`
