#!/usr/bin/env bash
# Normalises CRLF → LF on files that must have LF endings for bash / psql / kong
# to parse them correctly. Safe to run multiple times on LF-only files.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$HERE"

echo "Normalising line endings..."

strip_cr() {
  local f="$1"
  [ -f "$f" ] || return 0
  if grep -q $'\r' "$f" 2>/dev/null; then
    echo "  → $f"
    tr -d '\r' < "$f" > "$f.tmp" && mv "$f.tmp" "$f"
  fi
}

# Everything that a container or shell needs to parse as LF.
while IFS= read -r -d '' f; do
  strip_cr "$f"
done < <(find volumes scripts supabase/migrations \
  -type f \
  \( -name '*.sh' -o -name '*.sql' -o -name '*.yml' -o -name '*.yaml' -o -name '*.conf' \) \
  -print0)

# Also fix the root-level .env if present (env-file parsers tolerate both but
# bash `eval` in init.sh is happier with LF).
[ -f .env ] && strip_cr .env

echo "✓ Line endings normalised."
