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

lines = []
lines.append('- defaults:')
lines.append('    link:')
lines.append('      relink: true')
lines.append('      force: true')
lines.append('')
lines.append('- create:')
lines.append('    - ~/.claude')
lines.append('    - ~/.codex')
lines.append('    - ~/.codex/skills')
lines.append('    - ~/.pi/agent')
lines.append('    - ~/.agents')
lines.append('')
lines.append('- link:')
lines.append('    ~/.claude/CLAUDE.md: ai/AGENTS.md')
lines.append('    ~/.claude/skills: ai/skills')
lines.append('    ~/.codex/AGENTS.md: ai/AGENTS.md')
for name in active_skill_names:
    lines.append(f'    ~/.codex/skills/{name}: ai/skills/{name}')
lines.append('    ~/.pi/agent/AGENTS.md: ai/AGENTS.md')
lines.append('    ~/.pi/agent/skills: ai/skills')
lines.append('    ~/.agents/AGENTS.md: ai/AGENTS.md')
lines.append('    ~/.agents/skills: ai/skills')
(dotfiles / 'install.conf.yaml').write_text('\n'.join(lines) + '\n')

shared_targets = {
    home / '.claude' / 'CLAUDE.md': ai / 'AGENTS.md',
    home / '.claude' / 'skills': active,
    home / '.codex' / 'AGENTS.md': ai / 'AGENTS.md',
    home / '.pi' / 'agent' / 'AGENTS.md': ai / 'AGENTS.md',
    home / '.pi' / 'agent' / 'skills': active,
    home / '.agents' / 'AGENTS.md': ai / 'AGENTS.md',
    home / '.agents' / 'skills': active,
}

for dest, src in shared_targets.items():
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.is_symlink() or dest.exists():
        if dest.is_dir() and not dest.is_symlink():
            shutil.rmtree(dest)
        else:
            dest.unlink()
    dest.symlink_to(src)

agents_src = ai / 'agents'
if agents_src.is_dir():
    claude_dirs = [home / '.claude'] + sorted(home.glob('.claude-account*'))
    for claude_dir in claude_dirs:
        claude_agents_dir = claude_dir / 'agents'
        claude_agents_dir.mkdir(parents=True, exist_ok=True)
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
print(f'install_conf={dotfiles / "install.conf.yaml"}')
PY
