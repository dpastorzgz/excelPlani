# Axet framework — mechanical checks
# Usage: `make check` (all validators) or `make check-tech` (technology scaffolds).

.PHONY: check check-tech

check:
	bash framework/scripts/check-all.sh

check-tech:
	bash framework/scripts/validate-new-tech.sh
