#!/bin/bash
# test-project-rules.sh — black-box tests for validate-project-rules.sh.
# Copies each fixture into a temporary repo-root project-rules/ directory,
# runs the validator, checks the exit code, and always cleans up.
# Refuses to run if a real project-rules/ overlay already exists.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

FIX="$ROOT/framework/scripts/fixtures/project-rules"
pass=0
failn=0

if [ -e "project-rules" ]; then
  echo "TEST-PROJECT-RULES: refusing to run; project-rules/ already exists"
  exit 2
fi
cleanup() { rm -rf project-rules; }
trap cleanup EXIT

check() {
  # check <name> <expected: pass|fail> [<description>] -- runs with no extra args
  name="$1"; expect="$2"; desc="${3:-}"
  cp -r "$FIX/$name" project-rules
  set +e
  out="$(bash framework/scripts/validate-project-rules.sh 2>&1)"; rc=$?
  set -e
  rm -rf project-rules
  if { [ "$expect" = pass ] && [ "$rc" -eq 0 ]; } || { [ "$expect" = fail ] && [ "$rc" -ne 0 ]; }; then
    pass=$((pass + 1))
    printf 'PASS %-22s %s\n' "$name" "$desc"
  else
    failn=$((failn + 1))
    printf 'FAIL %-22s rc=%s expected=%s\n' "$name" "$rc" "$expect"
    printf '%s\n' "$out" | sed 's/^/    /'
  fi
}

# 1. Absent overlay -> no-op success.
set +e
out="$(bash framework/scripts/validate-project-rules.sh 2>&1)"; rc=$?
set -e
if [ "$rc" -eq 0 ]; then
  pass=$((pass + 1)); printf 'PASS %-22s %s\n' "absent" "no overlay is a no-op"
else
  failn=$((failn + 1)); printf 'FAIL %-22s rc=%s\n' "absent" "$rc"
fi

# 2. Fixture cases.
check valid            pass "valid overlay"
check missing-file     fail "referenced file missing"
check invalid-phase    fail "phase out of range"
check replaces-gates   fail "replaces quality-gates forbidden"
check replaces-missing fail "replaces target missing"

# 3. --phase + --manifest emits the effective project context.
cp -r "$FIX/valid" project-rules
manifest="$(mktemp)"
bash framework/scripts/validate-project-rules.sh --phase 5 --manifest "$manifest" >/dev/null
if grep -q "project-rules/rules.md" "$manifest" && grep -q "project-rules/quality-gates.md" "$manifest"; then
  pass=$((pass + 1)); printf 'PASS %-22s %s\n' "manifest" "phase 5 manifest lists active guidelines"
else
  failn=$((failn + 1)); printf 'FAIL %-22s manifest missing entries\n' "manifest"
  sed 's/^/    /' "$manifest"
fi
rm -f "$manifest"
rm -rf project-rules

# 4. --phase reports the base file excluded by a `replaces` guideline.
cp -r "$FIX/replaces-ok" project-rules
set +e
out="$(bash framework/scripts/validate-project-rules.sh --phase 5 2>&1)"; rc=$?
set -e
rm -rf project-rules
if [ "$rc" -eq 0 ] && printf '%s\n' "$out" | grep -q "REPLACES-PHASE-5 technology-rules/salesforce/NamingConventions.md"; then
  pass=$((pass + 1)); printf 'PASS %-22s %s\n' "replaces-ok" "base guideline reported as excluded"
else
  failn=$((failn + 1)); printf 'FAIL %-22s replaces not reported (rc=%s)\n' "replaces-ok" "$rc"
  printf '%s\n' "$out" | sed 's/^/    /'
fi

printf '\nTEST-PROJECT-RULES: %s passed, %s failed\n' "$pass" "$failn"
[ "$failn" -eq 0 ]
