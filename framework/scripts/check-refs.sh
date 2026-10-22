#!/bin/bash
# check-refs.sh — validate repo-relative file references in normative docs.
# Scans normative files for backtick-quoted paths ending .md/.yml containing
# at least one `/`, resolves them against repo root, reports missing targets.
# Zero dependencies (bash + grep + sed only).
set -euo pipefail
ROOT="${AXET_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$ROOT"
fail=0
# Normative scan set: framework/, docs/, .axetrules/, technology-rules/_template/,
# plus root AGENTS.md and README.md. EXCLUDES framework/improvements/ (historical)
# and work-item/ (active projects).
files="$(find framework docs .axetrules technology-rules/_template -type f \( -name '*.md' -o -name '*.yml' \) ! -path 'framework/improvements/*' 2>/dev/null || true)"
for extra in AGENTS.md README.md; do
  [ -f "$extra" ] && files="$files
$extra"
done
while IFS= read -r f; do
  [ -z "$f" ] && continue
  [ -f "$f" ] || continue
  # Extract backtick spans; process each span on its source line.
  # Use grep -n to keep file:line for reporting.
  while IFS= read -r gline; do
    # gline format: <lineno>:<line content>
    lineno="${gline%%:*}"
    line="${gline#*:}"
    case "$line" in
      *http://*|*https://*) continue ;;
      *'[technology]'*) continue ;;
    esac
    # Pull out each backtick-quoted span in the line.
    spans="$(printf '%s\n' "$line" | grep -oE '`[^`]*`' || true)"
    [ -z "$spans" ] && continue
    while IFS= read -r span; do
      [ -z "$span" ] && continue
      case "$span" in
        *http://*|*https://*) continue ;;
        *\[*|*\]*|*\{*|*\}*) continue ;;
        *\**) continue ;;
        *\<*|*\>*) continue ;;
        *\$*) continue ;;
      esac
      # Conservative path extraction: alnum/dot/dash/underscore segments
      # containing at least one `/`, ending .md/.yml. This strips trailing
      # `:NN`, `:NN-MM`, ` §...`, ` →...` suffixes automatically.
      # NOTE: `-` sits last in each bracket so BSD/macOS grep treats it
      # as a literal (avoid `.\-` range errors).
      refs="$(printf '%s\n' "$span" | grep -oE '[A-Za-z0-9_.-]+/[A-Za-z0-9_./-]*\.(md|yml)' || true)"
      [ -z "$refs" ] && continue
      while IFS= read -r ref; do
        [ -z "$ref" ] && continue
        # 0N/NN are phase-number placeholders (e.g. README §2.3
        # `framework/workflows/phase-0N.md`), not concrete files.
        case "$ref" in
          *0N*|*NN*) continue ;;
        esac
        # Only repo-root-relative refs are checked; bare relative fragments
        # (`01-proposal/proposal.md`, `templates/active.yml`, `salesforce/...`)
        # are work-item- or context-relative, not root-relative — skip.
        case "$ref" in
          framework/*|docs/*|technology-rules/*|.axetrules/*|work-item/*) ;;
          *) continue ;;
        esac
        # Placeholder/glob safety net on the extracted path itself.
        case "$ref" in
          *\[*|*\]*|*\{*|*\}*) continue ;;
        esac
        case "$ref" in
          *\**) continue ;;
        esac
        case "$ref" in
          *\<*|*\>*) continue ;;
        esac
        if [ ! -e "$ROOT/$ref" ]; then
          printf 'BROKEN-REF %s -> %s\n' "$f" "$ref"
          fail=1
        fi
      done <<EOF
$refs
EOF
    done <<EOF
$spans
EOF
  done <<EOF
$(grep -nE '`[^`]*\.(md|yml)[^`]*`' "$f" || true)
EOF
done <<EOF
$files
EOF
exit "$fail"
