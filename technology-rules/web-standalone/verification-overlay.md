# Standalone Web Verification Overlay

## A. Build-claim verification

1. Re-run recorded lint, test, coverage and build commands from a clean install.
2. Reconcile every Phase 4 deliverable against the `dist/` manifest and source.
3. Verify the recorded archive checksum and environment.
4. Scan runtime files for public network dependencies and unsafe workbook rendering sinks.
5. Compare workbook hash and modification metadata before and after smoke workflows.

## B. Design self-consistency

| Check ID | Required check |
| --- | --- |
| B.1 | Every meaningful diagram component exists in the component inventory. |
| B.2 | Component behavior agrees with ADR guardrails and out-of-scope decisions. |
| B.3 | ADR registry titles literally match ADR front matter/headings. |
| B.4 | Every requirement maps to an existing in-scope task before construction. |
| B.5 | Data mappings reference only attributes defined in the normalized model. |

Record per-check artifacts, evidence, PASS/FAIL and remediation. A single global pass is insufficient.

## C. Browser-specific verification

- Serve the release on loopback from a clean directory and confirm direct `file://` is not documented as supported.
- Verify no unexpected request leaves loopback during load, filtering, Gantt use or export.
- Verify keyboard sequence, focus visibility, 200% zoom, reduced motion and status cues without color.
- Verify clipboard PNG when supported and download fallback when permission/support is absent.
- Verify formula-cache warnings and malformed workbook behavior do not produce healthy-looking zero metrics.
