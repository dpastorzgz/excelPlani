---
template_id: test-report
version: "1.0"
track: "new-feature"
project_slug: "html-project-dashboard"
created: "2026-10-25"
updated: "2026-10-25"
---

# Test Report — Cuadro de mando HTML para planificación de proyectos

## 1. Summary

- **Date**: 2026-10-25.
- **Runner/agent**: Codex.
- **Target environment**: Windows; Node.js 24.18.1; npm 11.16.0; Microsoft Edge 156.0.4314.42; Google Chrome 156.0.8078.47; localhost loopback.
- **Result**: PASS.
- **Distinct automated scenarios**: 78 — 63 Vitest, 14 Playwright E2E and one local-server integration scenario.
- **Executed checks**: 93 — the 14 E2E scenarios ran independently in both Edge and Chrome, and the server scenario ran through both PowerShell harnesses.
- **Failures**: 0.
- **Open questions**: none.

## 2. Commands executed

```text
npm run test:coverage                         PASS — 63/63
npm run test:e2e                              PASS — Edge 156, 14/14
PLAYWRIGHT_CHANNEL=chrome npm run test:e2e   PASS — Chrome 156, 14/14
npm run test:server                           PASS — pwsh harness
npm run test:server:windows                   PASS — Windows PowerShell harness
Git Bash framework/scripts/check-all.sh       PASS — ALL-CHECKS-PASS
```

The workbook hash and metadata were inspected again after the complete run.

## 3. Coverage

- **Minimum technology threshold**: 85% for lines, statements, functions and branches of executable first-party application modules.
- **Excluded by policy**: generated/vendor code and `app.js` composition-only root, as declared in `vitest.config.js`.

| Metric | Covered / total | Result | Threshold | Status |
| --- | ---: | ---: | ---: | --- |
| Statements | 601 / 622 | 96.62% | 85% | PASS |
| Branches | 484 / 550 | 88.00% | 85% | PASS |
| Functions | 124 / 128 | 96.87% | 85% | PASS |
| Lines | 575 / 591 | 97.29% | 85% | PASS |

- **QG7.1 applicability**: applicable; coverage-producing JavaScript runtime exists and all thresholds pass.
- **Coverage artifact**: `coverage/coverage-summary.json` and local HTML report under `coverage/`.

## 4. Use-case and acceptance mapping

| Use case / scope | Primary automated evidence | Result |
| --- | --- | --- |
| UC-01 — Open a local plan | `app.test.js`, `workbook-gateway.test.js`, `dashboard-release.spec.js`, server harness | PASS |
| UC-02 — Review status at a control date | `planning-domain.test.js`, `dashboard-state.test.js`, first `dashboard-workflows.spec.js` scenario | PASS |
| UC-03 — Filter and prepare presentation output | Filter/state/view tests and workflow PNG fallback E2E | PASS |
| UC-04 — Explore the Gantt accessibly | View integration, shell/layout E2E, keyboard/focus/zoom/reduced-motion/axe checks | PASS |
| FR-01–FR-04 | Config, server, gateway, application integration and release tests | PASS |
| FR-05–FR-07 | Date/domain/state/filter integration and E2E | PASS |
| FR-08–FR-11 | Gantt layout, row linking, temporal header, details and accessibility tests | PASS |
| FR-12 | Exporter unit tests and denied-clipboard download E2E | PASS |

All four Phase 2 use cases and all twelve functional requirements have automated evidence.

## 5. Scenario classes

### Positive

- Real XLSM read-only load, one/multiple Gantt sheets, header aliases and automatic first-sheet selection.
- Control-date metrics, combined filters, partial filter clearing and preserved selection on reload.
- Day/week/month Gantt rendering, milestones, Spanish headers, annual bands and red dashed control line.
- Accessible task detail, presentation mode and successful PNG generation.

### Negative / malformed input

- Corrupt workbook, unsupported extension, unavailable reader/fetch, 404, locked workbook and missing compatible sheet.
- Duplicate headers, invalid dates/ranges/percentages/booleans and formulas without cached values.
- Current completed state without actual-close date does not invent historical completion.
- Clipboard rejection produces the same PNG as a download; raster/image failures revoke temporary URLs.
- Untrusted workbook text is escaped and never interpreted as HTML.

### Boundary

- Empty task set versus zero completion ratio.
- Inclusive date boundaries, baseline fallback, leap/calendar conversion and Excel 1900/1904 date systems.
- Milestones with single dates, control date outside task dates, natural month/year transitions and minimum 52 px daily width.
- Narrow viewport, 200% text scale, reduced motion and visible high-contrast focus.

### Bulk / performance

- 1,000 rows map within the three-second load budget.
- 1,000 derived tasks filter/calculate within 300 ms.
- 1,000 Gantt rows and marks render/layout within one second.

## 6. Browser and accessibility matrix

| Channel | Version | E2E result | Notes |
| --- | --- | --- | --- |
| Microsoft Edge | 156.0.4314.42 | 14/14 PASS | Default Playwright channel `msedge` |
| Google Chrome | 156.0.8078.47 | 14/14 PASS | Explicit Playwright channel `chrome` |
| Previous stable Edge/Chrome | Not installed in the local runner | N/A | No previous-stable side-by-side channel is available to this local CI environment; no failure was hidden |

- Axe automated analysis: zero serious or critical violations.
- Keyboard: skip link, primary controls, task detail activation and focus restoration pass.
- Responsive/accessibility: 200% text scale, narrow viewport, reduced motion and focus visibility pass.
- **WSG7.2**: Passed for every Edge/Chromium-compatible channel available to this CI runner. The unavailable previous-stable channel is recorded as an environment limitation for any future external CI matrix.

## 7. Offline, export, performance and integrity

- **Offline/local-first**: `dashboard-release.spec.js` observed only `127.0.0.1`; all runtime dependencies are local and CSP restricts sources to same-origin. No public Internet request is required.
- **PNG fallback**: clipboard denial triggers a download named from the control date; unit tests verify the same Blob and exact 1920×1080 dimensions.
- **1,000-task boundaries**: gateway, domain and Gantt tests all pass their stated budgets.
- **Workbook immutability**: server and gateway tests compare hash/mtime; final SHA-256 remains `C9E8D01ABA136D71B84CCE27B93B9ADF1A8B6801DD77315E8BD49648000E59E7`, size 5,300,137 bytes and `LastWriteTimeUtc 2026-10-24T21:50:30`.
- **WSG7.3**: Passed.

## 8. Quality gates

- `QG7.1`: Passed — every configured coverage threshold exceeds 85%.
- `QG7.2`: Passed — UC-01 through UC-04 have associated passing tests.
- `QG7.3`: Passed — positive, negative, malformed, boundary and bulk cases are covered.
- `QG7.4`: Passed — zero failing tests.
- `QG7.5`: Passed — this report records commands, results, coverage and limitations.
- `WSG7.1`: Passed — coverage/input classes/boundaries pass.
- `WSG7.2`: Passed — all locally available Edge/Chromium-compatible channels pass; unavailable previous stable is documented.
- `WSG7.3`: Passed — 1,000-task performance, local-only operation, PNG fallback and workbook immutability pass.

## 9. Notes / known issues

- No product defect or failed acceptance criterion is open.
- Browser history coverage is limited to the two current installed channels. A future CI service may add previous-stable browser images without changing product code.

## 10. Manual attestations

- None. Results are based on reproducible automated tests and filesystem evidence.

## 11. Approval

- **Status**: Approved
- **Approved by**: User
- **Date**: 2026-10-25

