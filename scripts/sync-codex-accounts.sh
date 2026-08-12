set -euo pipefail

primary="$HOME/.codex"
shared="$HOME/.local/share/codex"
backup_root="$HOME/.local/share/codex-account-backups/$(date +%Y%m%d-%H%M%S)"
shared_dirs=(sessions archived_sessions shell_snapshots thread-writer-locks memories attachments generated_images visualizations dictation-history ambient-suggestions pets)
shared_jsonl=(history.jsonl session_index.jsonl transcription-history.jsonl)
shared_databases=(state_5.sqlite thread_history_1.sqlite goals_1.sqlite memories_1.sqlite)
accounts=("$primary")

for account in "$HOME"/.codex-*; do
  [ -d "$account" ] && accounts+=("$account")
done

all_shared=("${shared_dirs[@]}" "${shared_jsonl[@]}" "${shared_databases[@]}")
synced=true

for account in "${accounts[@]}"; do
  for item in "${all_shared[@]}"; do
    if [ ! -L "$account/$item" ] || [ "$(readlink "$account/$item")" != "$shared/$item" ]; then
      synced=false
      break
    fi
  done
done

if [ "$synced" = true ]; then
  echo "Codex account data already synchronized"
  exit 0
fi

for account in "${accounts[@]}"; do
  active_processes="$(lsof -t +D "$account" 2>/dev/null || true)"
  if [ -n "$active_processes" ] && [ "${CODEX_FORCE_MERGE:-0}" != 1 ]; then
    echo "Close every Codex CLI and Codex app process, then run this command again" >&2
    exit 2
  fi
done

mkdir -p "$shared" "$backup_root"

for account in "${accounts[@]}"; do
  for database in "${shared_databases[@]}"; do
    if [ -f "$account/$database" ] && [ "${CODEX_FORCE_MERGE:-0}" != 1 ]; then
      sqlite3 "$account/$database" 'PRAGMA wal_checkpoint(TRUNCATE);' >/dev/null
    fi
  done
done

if [ ! -L "$primary/sessions" ]; then
  for item in "${shared_dirs[@]}"; do
    [ ! -d "$primary/$item" ] || rsync -a "$primary/$item/" "$shared/$item/"
  done
  for item in "${shared_jsonl[@]}" "${shared_databases[@]}"; do
    [ ! -f "$primary/$item" ] || cp -p "$primary/$item" "$shared/$item"
  done
fi

for item in "${shared_dirs[@]}"; do
  mkdir -p "$shared/$item"
done

for item in "${shared_jsonl[@]}"; do
  touch "$shared/$item"
done

merge_database() {
  local target_db="$1"
  local source_db="$2"
  local statements="$3"
  [ ! -f "$target_db" ] || [ ! -f "$source_db" ] || sqlite3 "$target_db" "ATTACH DATABASE '$source_db' AS account_db; $statements DETACH DATABASE account_db;"
}

for ((index=1; index<${#accounts[@]}; index++)); do
  account="${accounts[$index]}"

  for item in "${shared_dirs[@]}"; do
    [ ! -d "$account/$item" ] || rsync -a --ignore-existing --exclude .git/ "$account/$item/" "$shared/$item/"
  done

  if [ -s "$account/history.jsonl" ]; then
    merged="$(mktemp)"
    jq -sc 'unique_by([.session_id, .ts, .text]) | sort_by(.ts) | .[]' "$shared/history.jsonl" "$account/history.jsonl" > "$merged"
    mv "$merged" "$shared/history.jsonl"
  fi

  if [ -s "$account/session_index.jsonl" ]; then
    merged="$(mktemp)"
    jq -sc 'group_by(.id) | map(max_by(.updated_at)) | sort_by(.updated_at) | .[]' "$shared/session_index.jsonl" "$account/session_index.jsonl" > "$merged"
    mv "$merged" "$shared/session_index.jsonl"
  fi

  if [ -s "$account/transcription-history.jsonl" ]; then
    merged="$(mktemp)"
    awk '!seen[$0]++' "$shared/transcription-history.jsonl" "$account/transcription-history.jsonl" > "$merged"
    mv "$merged" "$shared/transcription-history.jsonl"
  fi

  state_sql="UPDATE account_db.threads SET rollout_path = replace(rollout_path, '$account/', '$primary/'); INSERT OR IGNORE INTO thread_sections SELECT * FROM account_db.thread_sections; INSERT OR IGNORE INTO threads SELECT * FROM account_db.threads; INSERT OR IGNORE INTO thread_spawn_edges SELECT * FROM account_db.thread_spawn_edges; INSERT OR IGNORE INTO thread_dynamic_tools SELECT * FROM account_db.thread_dynamic_tools;"
  history_sql="INSERT OR IGNORE INTO thread_turns SELECT * FROM account_db.thread_turns; INSERT OR IGNORE INTO thread_items SELECT * FROM account_db.thread_items; INSERT OR IGNORE INTO thread_history_projection_state SELECT * FROM account_db.thread_history_projection_state;"
  goals_sql="INSERT OR IGNORE INTO thread_goals SELECT * FROM account_db.thread_goals; INSERT OR IGNORE INTO thread_goal_continuation_deferrals SELECT * FROM account_db.thread_goal_continuation_deferrals;"
  memories_sql="INSERT OR IGNORE INTO stage1_outputs SELECT * FROM account_db.stage1_outputs;"
  merge_database "$shared/state_5.sqlite" "$account/state_5.sqlite" "$state_sql"
  merge_database "$shared/thread_history_1.sqlite" "$account/thread_history_1.sqlite" "$history_sql"
  merge_database "$shared/goals_1.sqlite" "$account/goals_1.sqlite" "$goals_sql"
  merge_database "$shared/memories_1.sqlite" "$account/memories_1.sqlite" "$memories_sql"
done

for account in "${accounts[@]}"; do
  account_backup="$backup_root/$(basename "$account")"
  mkdir -p "$account_backup"
  for item in "${all_shared[@]}"; do
    if [ -e "$account/$item" ] || [ -L "$account/$item" ]; then
      mv "$account/$item" "$account_backup/$item"
    fi
    for suffix in -shm -wal; do
      if [ -e "$account/$item$suffix" ] || [ -L "$account/$item$suffix" ]; then
        mv "$account/$item$suffix" "$account_backup/$item$suffix"
      fi
    done
    ln -s "$shared/$item" "$account/$item"
  done
done

echo "Codex account data synchronized"
echo "Backup: $backup_root"
