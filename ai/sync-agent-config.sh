#!/usr/bin/env bash
set -euo pipefail

AI_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOTFILES_DIR="$(cd "$AI_DIR/.." && pwd)"
COMMON_DIR="$AI_DIR/commonSkills"
IOS_DIR="$AI_DIR/iOS"
WEB_DIR="$AI_DIR/web"
ACTIVE_DIR="$AI_DIR/skills"
LOCAL_DIR="$HOME/.localskills"

mkdir -p "$COMMON_DIR" "$IOS_DIR" "$WEB_DIR" "$LOCAL_DIR"
rm -rf "$ACTIVE_DIR"
mkdir -p "$ACTIVE_DIR"

for SOURCE_DIR in "$COMMON_DIR" "$IOS_DIR"; do
  [ -d "$SOURCE_DIR" ] || continue
  while IFS= read -r -d '' SKILL_DIR; do
    SKILL_NAME="$(basename "$SKILL_DIR")"
    ln -s "../$(basename "$SOURCE_DIR")/$SKILL_NAME" "$ACTIVE_DIR/$SKILL_NAME"
  done < <(find "$SOURCE_DIR" -mindepth 1 -maxdepth 1 -type d ! -name '.*' -print0 | sort -z)
done

for SKILL_DIR in "$LOCAL_DIR"/*/; do
  [ -d "$SKILL_DIR" ] || continue
  SKILL_NAME="$(basename "$SKILL_DIR")"
  ln -s "$SKILL_DIR" "$ACTIVE_DIR/$SKILL_NAME"
done

python3 - <<'PY'
from pathlib import Path
import shutil

home = Path.home()
dotfiles = home / 'dotfiles'
ai = dotfiles / 'ai'
active = ai / 'skills'
active_skill_names = sorted(p.name for p in active.iterdir() if p.is_dir() and not p.name.startswith('.'))

shared_targets = {
    home / '.claude' / 'CLAUDE.md': ai / 'CLAUDE.md',
    home / '.claude' / 'skills': active,
    home / '.codex' / 'AGENTS.md': ai / 'CLAUDE.md',
    home / '.pi' / 'agent' / 'AGENTS.md': ai / 'CLAUDE.md',
    home / '.pi' / 'agent' / 'skills': active,
    home / '.agents_common' / 'AGENTS.md': ai / 'CLAUDE.md',
    home / '.agents_common' / 'skills': active,
}

for dest, src in shared_targets.items():
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.is_symlink() or dest.exists():
        if dest.is_dir() and not dest.is_symlink():
            shutil.rmtree(dest)
        else:
            dest.unlink()
    dest.symlink_to(src)

claude_dirs = [home / '.claude'] + sorted(home.glob('.claude-account*'))

claude_md_src = ai / 'CLAUDE.md'
for claude_dir in claude_dirs:
    claude_dir.mkdir(parents=True, exist_ok=True)
    claude_md_dest = claude_dir / 'CLAUDE.md'
    if claude_md_dest.is_symlink() or claude_md_dest.exists():
        claude_md_dest.unlink()
    claude_md_dest.symlink_to(claude_md_src)

for claude_dir in claude_dirs:
    skills_dest = claude_dir / 'skills'
    skills_dest.parent.mkdir(parents=True, exist_ok=True)
    if skills_dest.is_symlink() or (skills_dest.exists() and not skills_dest.is_dir()):
        skills_dest.unlink()
    elif skills_dest.is_dir() and not skills_dest.is_symlink():
        shutil.rmtree(skills_dest)
    if not skills_dest.exists():
        skills_dest.symlink_to(active)

agents_src = ai / 'agents'
if agents_src.is_dir():
    valid_agent_names = {p.name for p in agents_src.glob('*.md')}
    for claude_dir in claude_dirs:
        claude_agents_dir = claude_dir / 'agents'
        claude_agents_dir.mkdir(parents=True, exist_ok=True)
        for existing in claude_agents_dir.glob('*.md'):
            if existing.is_symlink() and existing.name not in valid_agent_names:
                existing.unlink()
        for agent_file in agents_src.glob('*.md'):
            dest = claude_agents_dir / agent_file.name
            if dest.is_symlink() or dest.exists():
                dest.unlink()
            dest.symlink_to(agent_file)

codex_skills_dir = home / '.codex' / 'skills'
codex_skills_dir.mkdir(parents=True, exist_ok=True)
managed_prefixes = [
    str((ai / 'skills').resolve()),
    str((ai / 'commonSkills').resolve()),
    str((ai / 'iOS').resolve()),
    str((ai / 'web').resolve()),
    str((home / '.localskills').resolve()),
]
for child in codex_skills_dir.iterdir():
    if not child.is_symlink():
        continue
    target = str(child.resolve())
    if any(target == prefix or target.startswith(prefix + '/') for prefix in managed_prefixes):
        child.unlink()

for name in active_skill_names:
    # Resolve to the real source dir (commonSkills or iOS) so edits propagate
    # to Codex immediately without needing another sync run.
    resolved = (active / name).resolve()
    link = codex_skills_dir / name
    if link.exists() or link.is_symlink():
        if link.is_dir() and not link.is_symlink():
            shutil.rmtree(link)
        else:
            link.unlink()
    link.symlink_to(resolved)

print(f'commonSkills={len([p for p in (ai / "commonSkills").iterdir() if p.is_dir() and not p.name.startswith(".")])}')
print(f'iOS={len([p for p in (ai / "iOS").iterdir() if p.is_dir() and not p.name.startswith(".")])}')
print(f'web={len([p for p in (ai / "web").iterdir() if p.is_dir() and not p.name.startswith(".")])}')
print(f'active={len(active_skill_names)}')
agents_count = len(list(agents_src.glob('*.md'))) if agents_src.is_dir() else 0
print(f'agents={agents_count}')
PY
