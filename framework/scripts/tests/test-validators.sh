#!/bin/bash
# test-validators.sh — black-box tests for check-refs.sh, check-gates.sh,
# check-workitems.sh and validate-new-tech.sh.
#
# Each case builds a disposable repository tree in a temp dir, points the
# validator at it via AXET_ROOT, asserts the exit code, and always cleans up.
# It never mutates the real repository.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
REAL_ROOT="$(cd "$HERE/../../.." && pwd)"
pass=0
failn=0

run_case() {
  # run_case <name> <expected: pass|fail> <script-rel-path> <setup-fn>
  name="$1"; expect="$2"; script="$3"; setup="$4"
  tmp="$(mktemp -d)"
  "$setup" "$tmp"
  set +e
  out="$(AXET_ROOT="$tmp" bash "$REAL_ROOT/$script" 2>&1)"; rc=$?
  set -e
  rm -rf "$tmp"
  if { [ "$expect" = pass ] && [ "$rc" -eq 0 ]; } || { [ "$expect" = fail ] && [ "$rc" -ne 0 ]; }; then
    pass=$((pass + 1))
    printf 'PASS %-26s %s\n' "$name" "$expect"
  else
    failn=$((failn + 1))
    printf 'FAIL %-26s rc=%s expected=%s\n' "$name" "$rc" "$expect"
    printf '%s\n' "$out" | sed 's/^/    /'
  fi
}

# --- fixtures -----------------------------------------------------------------

setup_refs_pass() {
  mkdir -p "$1/framework/rules"
  printf '# Core\n' > "$1/framework/rules/core.md"
  printf 'See `framework/rules/core.md`.\n' > "$1/AGENTS.md"
}
setup_refs_fail() {
  setup_refs_pass "$1"
  printf 'See `framework/rules/does-not-exist.md`.\n' >> "$1/AGENTS.md"
}

setup_gates_pass() {
  mkdir -p "$1/framework/rules" "$1/framework/workflows"
  printf '## QG1.1 — x\n' > "$1/framework/rules/quality-gates.md"
  printf 'Gate `QG1.1` applies.\n' > "$1/framework/workflows/phase-01.md"
}
setup_gates_fail() {
  setup_gates_pass "$1"
  printf 'Gate `QG99.9` applies.\n' > "$1/framework/workflows/phase-01.md"
}

setup_workitems_pass() {
  mkdir -p "$1/work-item/demo"
  cat > "$1/work-item/demo/active.yml" <<'YML'
status: active
current_phase: 1
track: new-feature
technology: framework
type: feature
YML
  printf 'demo\n' > "$1/work-item/README.md"
}
setup_workitems_fail() {
  setup_workitems_pass "$1"
  cat > "$1/work-item/demo/active.yml" <<'YML'
status: bogus
current_phase: 1
track: new-feature
technology: framework
type: feature
YML
}

setup_tech_pass() {
  mkdir -p "$1/technology-rules/demo"
  printf '# Rules\n' > "$1/technology-rules/demo/rules.md"
  printf '# Gates\n' > "$1/technology-rules/demo/quality-gates.md"
  printf 'version: 1\n' > "$1/technology-rules/demo/release-pipeline.yml"
  printf '# Naming\n' > "$1/technology-rules/demo/NamingConventions.md"
  cat > "$1/technology-rules/demo/tech-config.yml" <<'YML'
technology: "demo"
guidelines:
  - file: "NamingConventions.md"
    phases: [03, 04, 05]
YML
}
setup_tech_fail() {
  setup_tech_pass "$1"
  rm -f "$1/technology-rules/demo/quality-gates.md"
}

# --- cases --------------------------------------------------------------------

run_case "refs-pass"           pass framework/scripts/check-refs.sh setup_refs_pass
run_case "refs-broken"         fail framework/scripts/check-refs.sh setup_refs_fail
run_case "gates-pass"          pass framework/scripts/check-gates.sh setup_gates_pass
run_case "gates-undefined"     fail framework/scripts/check-gates.sh setup_gates_fail
run_case "workitems-pass"      pass framework/scripts/check-workitems.sh setup_workitems_pass
run_case "workitems-bad-status" fail framework/scripts/check-workitems.sh setup_workitems_fail
run_case "new-tech-pass"       pass framework/scripts/validate-new-tech.sh setup_tech_pass
run_case "new-tech-missing"    fail framework/scripts/validate-new-tech.sh setup_tech_fail

printf '\nTEST-VALIDATORS: %s passed, %s failed\n' "$pass" "$failn"
[ "$failn" -eq 0 ]
