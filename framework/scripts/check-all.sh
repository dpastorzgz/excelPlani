#!/bin/bash
# check-all.sh — run all P2 validators in order.
set -euo pipefail
ROOT="${AXET_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$ROOT"
bash framework/scripts/check-refs.sh
bash framework/scripts/check-gates.sh
bash framework/scripts/check-workitems.sh
bash framework/scripts/validate-project-rules.sh
echo "ALL-CHECKS-PASS"
