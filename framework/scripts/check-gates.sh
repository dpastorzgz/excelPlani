#!/bin/bash
# check-gates.sh — every cited gate ID must be defined.
# Defined sources (single source of truth): framework/rules/quality-gates.md
# plus technology-rules/*/quality-gates.md (non-extended only; the
# *-quality-gates-extended.md pointers are historical and are NOT sources).
# Scanned for citations: framework/workflows/, framework/skills/,
# framework/templates/, docs/, README.md, AGENTS.md.
# Excludes framework/improvements/ (historical narrative cites gates in
# evidence context). Zero dependencies.
set -euo pipefail
ROOT="${AXET_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$ROOT"
GATE_RE='(QG[0-9]+\.[0-9]+|SFG[0-9.]+|DPPG[0-9.]+)'
fail=0
tmpdef="$(mktemp)"
tmpcited="$(mktemp)"
trap 'rm -f "$tmpdef" "$tmpcited"' EXIT
# Collect defined IDs, normalizing trailing dots (e.g. `SFG3.3.` from
# `SFG3.3.a` headings or `DPPG5.11.` at sentence end -> `SFG3.3`).
# `|| true` keeps `set -o pipefail` from aborting when a glob has no match
# (e.g. a repo with no technology overlays yet).
grep -rhoE "$GATE_RE" framework/rules/quality-gates.md technology-rules/*/quality-gates.md 2>/dev/null \
  | sed 's/\.*$//' | sort -u > "$tmpdef" || true
# Collect cited IDs with file context.
grep -rnEo "$GATE_RE" framework/workflows/ framework/skills/ framework/templates/ docs/ README.md AGENTS.md 2>/dev/null \
  --exclude-dir=improvements > "$tmpcited" || true
while IFS= read -r hit; do
  [ -z "$hit" ] && continue
  # hit format: <file>:<line>:<id> (file may contain colons only in theory;
  # repo paths never do, so last-field split is safe).
  id="${hit##*:}"
  file="${hit%%:*}"
  norm="$(printf '%s' "$id" | sed 's/\.*$//')"
  [ -z "$norm" ] && continue
  if ! grep -Fxq "$norm" "$tmpdef"; then
    printf 'UNDEFINED-GATE %s in %s\n' "$norm" "$file"
    fail=1
  fi
done < "$tmpcited"
exit "$fail"
