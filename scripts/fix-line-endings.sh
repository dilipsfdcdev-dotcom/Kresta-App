#!/usr/bin/env bash
# Normalises CRLF → LF on files that must have LF endings for bash / psql / kong
# to parse them correctly. Safe to run multiple times.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$HERE"

echo "Normalising line endings..."

# Portable CRLF → LF (works on Git Bash, macOS, Linux).
strip_cr() {
  local f="$1"
  if [ -f "$f" ] && file "$f" 2>/dev/null | grep -q CRLF; then
    echo "  → $f"
    # Use tr to strip \r; write to temp then move for atomicity.
    tr -d '\r' < "$f" > "$f.tmp" && mv "$f.tmp" "$f"
  fi
}

# Everything under volumes/ (kong.yml, all db/*.sql), scripts, sql migrations.
while IFS= read -r -d '' f; do
  strip_cr "$f"
done < <(find volumes scripts supabase/migrations -type f \( -name '*.sh' -o -name '*.sql' -o -name '*.yml' -o -name '*.yaml' -o -name '*.conf' \) -print0)

echo "✓ Line endings normalised."
