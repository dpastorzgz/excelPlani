#!/bin/bash
# validate-project-rules.sh — validate the optional project-rules/ overlay.
#
# Contract: `project-rules/project-config.yml` drives which project guidelines
# load per phase (mirror of technology-rules/[tech]/tech-config.yml:guidelines[]).
# If `project-rules/` does not exist the overlay is inactive (no-op, exit 0).
#
# Usage:
#   bash framework/scripts/validate-project-rules.sh
#   bash framework/scripts/validate-project-rules.sh --phase 5
#   bash framework/scripts/validate-project-rules.sh --phase 5 --manifest <path>
#
# Zero dependencies (bash + grep + awk + sed only).
set -euo pipefail
ROOT="${AXET_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$ROOT"

CFG="project-rules/project-config.yml"

# --- optional args -----------------------------------------------------------
PHASE=""
MANIFEST=""
while [ $# -gt 0 ]; do
  case "$1" in
    --phase) PHASE="${2:-}"; shift 2 ;;
    --manifest) MANIFEST="${2:-}"; shift 2 ;;
    -h|--help)
      echo "usage: validate-project-rules.sh [--phase N] [--manifest PATH]"
      exit 0 ;;
    *) echo "PROJECT-RULES: unknown argument '$1'"; exit 2 ;;
  esac
done

if [ ! -f "$CFG" ]; then
  echo "PROJECT-RULES: none (overlay inactive)"
  exit 0
fi

fail=0
report() {
  printf 'PROJECT-RULES %s: FAILED\n' "$1"
  fail=1
}

# yaml_val <file> <key>: first top-level `^key:` scalar, comment/quote stripped.
yaml_val() {
  grep -E "^$2:" "$1" 2>/dev/null | head -n 1 \
    | sed -E "s/^$2:[[:space:]]*//" \
    | sed -E 's/[[:space:]]*#.*$//' \
    | tr -d '"' | tr -d "'" \
    | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//' || true
}

project="$(yaml_val "$CFG" project)"
[ -n "$project" ] || report "project[empty]"

# Parse guidelines[] into TSV rows: file \t phases \t replaces.
# Constrained schema: `- file: "..."`, `phases: [03,04]` (inline), `replaces: "..."`.
rows="$(awk '
  function trim(s){ gsub(/^[ \t]+|[ \t]+$/, "", s); return s }
  function unq(s){ gsub(/"/, "", s); gsub(/\047/, "", s); return s }
  /^[[:space:]]*guidelines:/ { ing=1; next }
  ing && /^[^[:space:]#-]/ { if (file!="") print file "\t" phases "\t" replaces; file=""; ing=0 }
  ing && /^[[:space:]]*-[[:space:]]*file:/ {
    if (file!="") print file "\t" phases "\t" replaces;
    file=""; phases=""; replaces="";
    v=$0; sub(/^.*file:[[:space:]]*/, "", v); file=trim(unq(v)); next
  }
  ing && /^[[:space:]]+phases:/ {
    v=$0; sub(/^.*phases:[[:space:]]*/, "", v);
    gsub(/[\[\]]/, "", v); gsub(/[ \t]/, "", v); gsub(/"/, "", v); gsub(/\047/, "", v);
    phases=v; next
  }
  ing && /^[[:space:]]+replaces:/ {
    v=$0; sub(/^.*replaces:[[:space:]]*/, "", v); gsub(/[ \t]/, "", v);
    replaces=unq(v); next
  }
  END { if (file!="") print file "\t" phases "\t" replaces }
' "$CFG")"

if [ -z "$rows" ]; then
  report "guidelines[empty]"
fi

active_phase="$PHASE"
manifest_files=""
while IFS="$(printf '\t')" read -r file phases replaces; do
  [ -z "$file" ] && continue
  if [ ! -f "project-rules/$file" ]; then
    report "file-missing[$file]"
  fi
  if [ -z "$phases" ]; then
    report "phases-missing[$file]"
  else
    oldifs="$IFS"; IFS=','
    for p in $phases; do
      pn="$(printf '%s' "$p" | sed -E 's/^0+//')"
      case "$pn" in
        1|2|3|4|5|6|7|8|9|10) ;;
        *) report "phase-invalid[$file=$p]" ;;
      esac
      if [ -n "$active_phase" ] && [ "$pn" = "$active_phase" ]; then
        printf 'PROJECT-RULES ACTIVE-PHASE-%s project-rules/%s\n' "$active_phase" "$file"
        manifest_files="${manifest_files}project-rules/${file}
"
        if [ -n "$replaces" ]; then
          printf 'PROJECT-RULES REPLACES-PHASE-%s %s\n' "$active_phase" "$replaces"
          manifest_files="${manifest_files}# replaces (base excluded): ${replaces}
"
        fi
      fi
    done
    IFS="$oldifs"
  fi
  if [ -n "$replaces" ]; then
    case "$replaces" in
      *quality-gates.md)
        report "replaces-gates-forbidden[$file->$replaces]" ;;
      framework/*)
        report "replaces-framework-forbidden[$file->$replaces]" ;;
      technology-rules/*)
        [ -e "$replaces" ] || report "replaces-target-missing[$file->$replaces]" ;;
      *)
        report "replaces-outside-technology[$file->$replaces]" ;;
    esac
  fi
done <<EOF
$rows
EOF

# Project gates use the PRG<phase>.<n> namespace; they must not collide with any
# technology gate ID.
if [ -f "project-rules/quality-gates.md" ]; then
  ids="$(grep -oE 'PRG[0-9]+\.[0-9]+' project-rules/quality-gates.md 2>/dev/null | sort -u || true)"
  if [ -z "$ids" ]; then
    echo "PROJECT-RULES: quality-gates.md present with no PRG* IDs (info)"
  fi
  while IFS= read -r id; do
    [ -z "$id" ] && continue
    if grep -rqE "$id" technology-rules/ 2>/dev/null; then
      report "gate-id-collision[$id]"
    fi
  done <<EOF
$ids
EOF
fi

if [ -n "$MANIFEST" ] && [ -n "$active_phase" ]; then
  mkdir -p "$(dirname "$MANIFEST")"
  {
    printf '# Effective Project Context — Phase %s\n' "$active_phase"
    printf '# Source: project-rules/project-config.yml (guidelines[].phases)\n'
    [ -n "$manifest_files" ] && printf '%s' "$manifest_files"
  } > "$MANIFEST"
  printf 'PROJECT-RULES: manifest written to %s\n' "$MANIFEST"
fi

if [ "$fail" -eq 0 ]; then
  printf 'PROJECT-RULES: OK [%s]\n' "$project"
fi
exit "$fail"
