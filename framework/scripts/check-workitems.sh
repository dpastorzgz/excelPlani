#!/bin/bash
# check-workitems.sh — validate work-item/active.yml state files + registry.
# Zero dependencies (bash + grep + awk + sed only; no yq/jq).
set -euo pipefail
ROOT="${AXET_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$ROOT"
fail=0
# yaml_val <file> <key>: first `^key:` line, strip key, comments, quotes, trim.
yaml_val() {
  grep -E "^[[:space:]]*$2:" "$1" 2>/dev/null | head -n 1 \
    | sed -E "s/^[[:space:]]*$2:[[:space:]]*//" \
    | sed -E 's/[[:space:]]*#.*$//' \
    | tr -d '"' | tr -d "'" \
    | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//' || true
}
report() {
  printf 'WORKITEM %s: %s FAILED\n' "$1" "$2"
  fail=1
}
for dir in work-item/*/; do
  [ -d "$dir" ] || continue
  case "$dir" in
    work-item/archive/*|work-item/archive/) continue ;;
  esac
  slug="$(basename "$dir")"
  [ -f "$dir/active.yml" ] || continue
  ay="$dir/active.yml"
  status="$(yaml_val "$ay" status)"
  phase="$(yaml_val "$ay" current_phase)"
  track="$(yaml_val "$ay" track)"
  tech="$(yaml_val "$ay" technology)"
  wtype="$(yaml_val "$ay" type)"
  case "$status" in
    active|blocked|on-hold|closed|archived) ;;
    *) report "$slug" "status[$status]" ;;
  esac
  case "$phase" in
    1|2|3|4|5|6|7|8|9|10) ;;
    *) report "$slug" "current_phase[$phase]" ;;
  esac
  case "$track" in
    new-feature|change-request|hotfix) ;;
    *) report "$slug" "track[$track]" ;;
  esac
  if [ -z "$tech" ]; then
    report "$slug" "technology[empty]"
  elif [ "$tech" = "framework" ]; then
    # NOTE: special value `framework` allowed with no overlay dir under
    # technology-rules/ (framework change-requests run without a tech overlay;
    # technology-gated phases treat the overlay as N/A with reason recorded).
    :
  elif [ ! -d "technology-rules/$tech" ]; then
    report "$slug" "technology[$tech]-no-overlay"
  fi
  if ! grep -qF "$slug" work-item/README.md 2>/dev/null; then
    report "$slug" "registry-missing"
  fi
  # QG10.4-ready check: epic items should carry epic-map.yml (WARN only, non-blocking).
  if [ "$wtype" = "epic" ] && [ ! -f "$dir/epic-map.yml" ]; then
    printf 'WARN EPIC-NO-MAP %s: epic-map.yml missing (QG10.4-ready check)\n' "$slug"
  fi
  # Epic checks: only when type is epic and epic-map.yml exists.
  if [ "$wtype" = "epic" ] && [ -f "$dir/epic-map.yml" ]; then
    em="$dir/epic-map.yml"
    # Parse children rows with grep/awk (no yq/jq): slug, wave, depends_on, status.
    kids="$(awk '
      /-[[:space:]]+slug:/ {
        if (slug != "") print slug "\t" wave "\t" deps "\t" st;
        slug=""; wave=""; deps=""; st="";
        line=$0; sub(/^.*slug:[[:space:]]*/, "", line);
        gsub(/"/, "", line); gsub(/\047/, "", line);
        gsub(/^[ \t]+|[ \t]+$/, "", line); slug=line; next;
      }
      /^[[:space:]]+wave:/ && slug != "" {
        line=$0; sub(/^.*wave:[[:space:]]*/, "", line);
        gsub(/"/, "", line); gsub(/\047/, "", line); gsub(/#.*$/, "", line);
        gsub(/^[ \t]+|[ \t]+$/, "", line); wave=line; next;
      }
      /^[[:space:]]+depends_on:/ && slug != "" {
        line=$0; sub(/^.*depends_on:[[:space:]]*/, "", line);
        gsub(/#.*$/, "", line); gsub(/\[/, "", line); gsub(/\]/, "", line);
        gsub(/"/, "", line); gsub(/\047/, "", line); gsub(/[ \t]+/, "", line);
        deps=line; next;
      }
      /^[[:space:]]+status:/ && slug != "" {
        line=$0; sub(/^.*status:[[:space:]]*/, "", line);
        gsub(/"/, "", line); gsub(/\047/, "", line); gsub(/#.*$/, "", line);
        gsub(/^[ \t]+|[ \t]+$/, "", line); st=line; next;
      }
      END { if (slug != "") print slug "\t" wave "\t" deps "\t" st; }
    ' "$em")"
    # Build slug list for existence checks.
    allslugs="$(printf '%s\n' "$kids" | awk -F'\t' '{print $1}')"
    relaxed=0
    if grep -Eq '^[[:space:]]*wave_policy:[[:space:]]*relaxed' "$em" 2>/dev/null; then
      relaxed=1
    fi
    while IFS="$(printf '\t')" read -r cslug cwave cdeps cst; do
      [ -z "$cslug" ] && continue
      case "$cwave" in
        ''|*[!0-9]*) report "$slug" "wave[$cslug=$cwave]-not-int" ;;
        *) ;;
      esac
      # depends_on list is comma-separated (empty when `[]`).
      if [ -n "$cdeps" ]; then
        oldifs="$IFS"; IFS=','
        # shellcheck disable=SC2162
        for dep in $cdeps; do
          [ -z "$dep" ] && continue
          if [ "$dep" = "$cslug" ]; then
            report "$slug" "self-dependency[$cslug]"
          fi
          dep_exists=0
          if [ -f "work-item/$dep/active.yml" ]; then dep_exists=1; fi
          if printf '%s\n' "$allslugs" | grep -Fxq "$dep"; then dep_exists=1; fi
          if [ "$dep_exists" -ne 1 ]; then
            report "$slug" "depends_on[$cslug->$dep]-missing"
          fi
          # Wave order: a lower wave must not depend on a higher wave.
          depwave="$(printf '%s\n' "$kids" | awk -F'\t' -v d="$dep" '$1==d{print $2}')"
          if [ -n "$depwave" ] && [ -n "$cwave" ]; then
            case "$depwave" in *[!0-9]*) ;; *)
              case "$cwave" in *[!0-9]*) ;; *)
                if [ "$cwave" -lt "$depwave" ]; then
                  report "$slug" "wave-order[$cslug-w$cwave-depends-on-$dep-w$depwave]"
                fi ;;
              esac ;;
            esac
          fi
          # Wave entry rule: child phase>=5 with dep phase<7 is a violation
          # unless wave_policy: relaxed.
          if [ "$relaxed" -ne 1 ]; then
            if [ -f "work-item/$cslug/active.yml" ] && [ -f "work-item/$dep/active.yml" ]; then
              cph="$(yaml_val "work-item/$cslug/active.yml" current_phase)"
              dph="$(yaml_val "work-item/$dep/active.yml" current_phase)"
              case "$cph" in *[!0-9]*) ;; *)
                case "$dph" in *[!0-9]*) ;; *)
                  if [ "$cph" -ge 5 ] && [ "$dph" -lt 7 ]; then
                    report "$slug" "WAVE-VIOLATION[$cslug-ph$cph-depends-on-$dep-ph$dph]"
                  fi ;;
                esac ;;
              esac
            fi
          fi
        done
        IFS="$oldifs"
      fi
      # Epic-map status freshness: child active.yml vs epic-map row.
      if [ -f "work-item/$cslug/active.yml" ]; then
        chst="$(yaml_val "work-item/$cslug/active.yml" status)"
        expected="planned"
        case "$chst" in
          blocked|on-hold) expected="blocked" ;;
          closed|archived) expected="done" ;;
          active) expected="active" ;;
          *) expected="planned" ;;
        esac
        if [ -n "$cst" ] && [ "$cst" != "$expected" ]; then
          printf 'EPIC-MAP-STALE %s\n' "$cslug"
          report "$slug" "epic-map-stale[$cslug-map=$cst-expected=$expected]"
        fi
      fi
    done <<EOF
$kids
EOF
  fi
done
exit "$fail"
