#!/bin/bash
# validate-new-tech.sh — validate technology-rules/[slug]/ scaffolds.
# Canonical location: framework/scripts/validate-new-tech.sh
# Usage:
#   bash framework/scripts/validate-new-tech.sh [technology-slug]
#   bash framework/scripts/validate-new-tech.sh            # validate every technology
set -euo pipefail
ROOT="${AXET_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$ROOT"

fail=0

need() { [ -e "$1/$2" ] || { echo "MISSING: $1/$2"; return 1; }; }
warn() { [ -e "$1/$2" ] || echo "RECOMMENDED (missing): $1/$2"; }

validate_tech() {
  local tech="$1"
  local dir="technology-rules/$tech"
  local f=0
  # Required scaffold files.
  need "$dir" rules.md || f=1
  need "$dir" tech-config.yml || f=1
  need "$dir" quality-gates.md || f=1
  need "$dir" release-pipeline.yml || f=1
  need "$dir" NamingConventions.md || f=1
  # Recommended (non-blocking).
  warn "$dir" context.md
  warn "$dir" verification-overlay.md
  warn "$dir" GeneralGuidelines.md
  # every file listed in tech-config.yml:guidelines[] must exist
  # (match only list entries `- file: "..."`, not keys like `config_file:`)
  if command -v python3 >/dev/null 2>&1 && [ -f "$dir/tech-config.yml" ]; then
    if ! python3 - "$dir/tech-config.yml" <<'EOF'
import re, sys, pathlib
p = pathlib.Path(sys.argv[1])
text = p.read_text()
for m in re.finditer(r'(?m)^\s*-\s*file:\s*"([^"]+)"', text):
    f = m.group(1)
    if not (p.parent / f).exists():
        print(f"MISSING guideline: {f}")
        sys.exit(1)
print("guidelines[] OK")
EOF
    then
      f=1
    fi
  fi
  if [ "$f" -eq 0 ]; then
    echo "PASS: $tech scaffold valid"
  else
    echo "FAIL: $tech scaffold invalid"
  fi
  return "$f"
}

# No technology-specific requirements may leak into framework/ structural files.
# (framework/improvements/ holds historical reviews and is excluded.
# Boundary "DO NOT" illustrations naming a technology as an example of what belongs
# in Design are allowed in specs/proposal skills+templates and are excluded here;
# what must never leak are gates, commands, tools, thresholds, and checklists.)
agnostic_check() {
  if grep -rEi "apex|lwc|soql|package\.xml|scratch-org|governor|pac solution|dataverse|solution checker" \
    framework/rules framework/config framework/templates/build-log.md framework/templates/verification-report.md \
    framework/templates/test-report.md framework/templates/design.md framework/workflows/phase-05-build.md \
    framework/workflows/phase-03-design.md framework/skills/verification framework/skills/architecture-design \
    --include='*.md' --include='*.yml' -q; then
    echo "LEAK: technology-specific requirements found in framework/ structural files"
    return 1
  fi
  echo "framework/ agnostic OK"
  return 0
}

if [ -n "${1:-}" ]; then
  techs="$1"
else
  techs="$(for d in technology-rules/*/; do
    [ -d "$d" ] || continue
    slug="$(basename "$d")"
    [ "$slug" = "_template" ] && continue
    printf '%s\n' "$slug"
  done)"
fi

while IFS= read -r tech; do
  [ -z "$tech" ] && continue
  validate_tech "$tech" || fail=1
done <<EOF
$techs
EOF

agnostic_check || fail=1

if [ "$fail" -eq 0 ]; then
  echo "PASS: all requested scaffolds valid"
else
  echo "FAIL: scaffold validation failed"
  exit 1
fi
