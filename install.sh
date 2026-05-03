#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$DIR/dotbot/bin/dotbot" -d "$DIR" -c "$DIR/install.conf.yaml" "$@"
