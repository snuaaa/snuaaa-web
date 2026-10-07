#!/usr/bin/env bash
# Dumps the schema of an existing database into drizzle/0000_baseline.sql.
#
# Usage: scripts/dump-baseline.sh <database-url> [output-file]
#   e.g. scripts/dump-baseline.sh postgres://user:pass@host:5432/snuaaa
#
# pg_dump's session settings (SET ..., set_config('search_path', ...), \restrict)
# and the CREATE SCHEMA for public, which always exists, are stripped so that
# the file can be run by the drizzle migrator, and a statement breakpoint is
# added after every statement.
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <database-url> [output-file]" >&2
  exit 1
fi

DATABASE_URL="$1"
OUT="${2:-$(dirname "$0")/../drizzle/0000_baseline.sql}"

pg_dump "$DATABASE_URL" \
  --schema-only \
  --schema=public \
  --no-owner \
  --no-privileges \
  --no-comments |
  grep -vE '^(--|SET |SELECT pg_catalog\.set_config|\\(un)?restrict |CREATE SCHEMA public;)' |
  sed -e 's/;$/;\n--> statement-breakpoint/' |
  cat -s >"$OUT.tmp"

# Drop leading blank lines, and trailing blank lines and breakpoint.
sed -i -e '/./,$!d' "$OUT.tmp"
while [ "$(tail -n 1 "$OUT.tmp")" = "" ] || [ "$(tail -n 1 "$OUT.tmp")" = "--> statement-breakpoint" ]; do
  sed -i '$d' "$OUT.tmp"
done
mv "$OUT.tmp" "$OUT"
echo "Wrote $OUT"
