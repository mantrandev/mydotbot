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

DOTFILES_DIR="$DOTFILES_DIR" python3 - <<'PY'
import os
from pathlib import Path
import shutil

home = Path.home()
dotfiles = Path(os.environ['DOTFILES_DIR'])
ai = dotfiles / 'ai'
active = ai / 'skills'
active_skill_names = sorted(p.name for p in active.iterdir() if p.is_dir() and not p.name.startswith('.'))
codex_dirs = [home / '.codex'] + sorted(p for p in home.glob('.codex-*') if p.is_dir())

shared_targets = {
    home / '.pi' / 'agent' / 'AGENTS.md': ai / 'CLAUDE.md',
    home / '.agents_common' / 'AGENTS.md': ai / 'CLAUDE.md',
    home / '.agents_common' / 'skills': active,
}

for codex_dir in codex_dirs:
    shared_targets[codex_dir / 'AGENTS.md'] = ai / 'CLAUDE.md'

for dest, src in shared_targets.items():
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.is_symlink() or dest.exists():
        if dest.is_dir() and not dest.is_symlink():
            shutil.rmtree(dest)
        else:
            dest.unlink()
    dest.symlink_to(src)

profile_skills = {}
current = None
for line in (ai / 'skill-profiles.conf').read_text().splitlines():
    line = line.strip()
    if not line:
        continue
    if line.startswith('[') and line.endswith(']'):
        current = line[1:-1]
        profile_skills[current] = []
    else:
        profile_skills[current].append(line)

codex_excluded = set(profile_skills.pop('codex-exclude', []))

source_of = {}
for source_name in ('commonSkills', 'iOS'):
    source_dir = ai / source_name
    if not source_dir.is_dir():
        continue
    for skill_dir in source_dir.iterdir():
        if skill_dir.is_dir() and not skill_dir.name.startswith('.'):
            source_of[skill_dir.name] = f'../{source_name}/{skill_dir.name}'

for name in sorted(codex_excluded):
    if name not in active_skill_names:
        raise SystemExit(f'skill-profiles.conf: unknown skill {name!r} in [codex-exclude]')

for profile, names in profile_skills.items():
    root = ai / f'skills-{profile}'
    if root.is_symlink():
        root.unlink()
    elif root.is_dir():
        shutil.rmtree(root)
    root.mkdir(parents=True)
    for name in names:
        if name not in active_skill_names:
            raise SystemExit(f'skill-profiles.conf: unknown skill {name!r} in [{profile}]')
        (root / name).symlink_to(source_of.get(name) or str((active / name).resolve()))

claude_profiles = {
    home / '.claude': (ai / 'claude' / 'CLAUDE.md', ai / 'skills-claude'),
    home / '.claude-company': (ai / 'claude-company' / 'CLAUDE.md', ai / 'skills-company'),
}
claude_dirs = list(claude_profiles)

built_roots = {ai / f'skills-{profile}' for profile in profile_skills}
for _, skills_src in claude_profiles.values():
    if skills_src not in built_roots:
        raise SystemExit(f'skill-profiles.conf: no section builds {skills_src.name}')

for claude_dir, (rules_src, skills_src) in claude_profiles.items():
    claude_dir.mkdir(parents=True, exist_ok=True)
    rules_dest = claude_dir / 'CLAUDE.md'
    if rules_dest.is_symlink() or rules_dest.exists():
        rules_dest.unlink()
    rules_dest.symlink_to(rules_src)

    skills_dest = claude_dir / 'skills'
    if skills_dest.is_symlink() or (skills_dest.exists() and not skills_dest.is_dir()):
        skills_dest.unlink()
    elif skills_dest.is_dir() and not skills_dest.is_symlink():
        shutil.rmtree(skills_dest)
    if not skills_dest.exists():
        skills_dest.symlink_to(skills_src)

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

managed_prefixes = [
    str((ai / 'skills').resolve()),
    str((ai / 'commonSkills').resolve()),
    str((ai / 'iOS').resolve()),
    str((ai / 'web').resolve()),
    str((home / '.localskills').resolve()),
]
for codex_dir in codex_dirs:
    codex_skills_dir = codex_dir / 'skills'
    codex_skills_dir.mkdir(parents=True, exist_ok=True)
    for child in codex_skills_dir.iterdir():
        if not child.is_symlink():
            continue
        target = str(child.resolve())
        if any(target == prefix or target.startswith(prefix + '/') for prefix in managed_prefixes):
            child.unlink()

    for name in active_skill_names:
        if name in codex_excluded:
            continue
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
print(f'codex={len(active_skill_names) - len(codex_excluded)}')
for profile, names in profile_skills.items():
    print(f'{profile}={len(names)}')
agents_count = len(list(agents_src.glob('*.md'))) if agents_src.is_dir() else 0
print(f'agents={agents_count}')
PY
