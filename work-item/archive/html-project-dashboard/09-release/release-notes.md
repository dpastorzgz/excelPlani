# Release Notes — Cuadro de mando HTML para planificación de proyectos — v0.1.0

## 1. Summary

- Release date: 2026-10-26
- Owner: Responsable del proyecto
- Target environment: `local-qa` validated; `release-directory` pending operator selection and approval
- Source pull request: https://github.com/dpastorzgz/excelPlani/pull/1
- Merge commit: `138b37bb0d88175c81a9889acd8327bef9a7603d`
- Release artifact: `work-item/html-project-dashboard/09-release/html-project-dashboard-v0.1.0.zip`
- Release archive SHA-256: `0100B92BF7330F9DD19BEA25D8CE517F383CB2909E72D61F7504146DE24454C2`
- Distribution manifest SHA-256: `55182C7CAB78F66E57E941CA3915499E580E05A8BD319A2A0FA9D8AF6A1E0E4E`

## 2. Changes

### Added

- Local-first HTML dashboard for Excel project plans.
- KPIs for total, completed, completion ratio and delayed tasks at a movable control date.
- Filters by assigned resource, planned date range and completion state, with independent reset actions.
- Accessible Gantt with tasks, milestones, row highlighting, synchronized horizontal grid and day/week/month scales.
- Spanish temporal headers, year bands and dashed red control-date line.
- Deterministic 1920×1080 PNG copy/download flow for PowerPoint.
- Node, CMD and optional PowerShell launchers bound to loopback only.
- Automated lint, coverage, server, build, browser and accessibility checks.

### Changed

- Workbook name is maintained at the single authoritative location `dashboard-config.js`.
- HTML, CSS, configuration, parsing, domain, state, view and export responsibilities remain in separate files.

### Fixed

- Initial multi-sheet rendering, independent filter clearing, Gantt row alignment, scrolling grid and scale labels.
- Windows startup no longer depends on PowerShell script execution policy when using `start-dashboard.cmd`.

### Removed

- Inoperative task-fitting control and duplicate fixed background grid.

## 3. Impact & Risk

- User impact: new local dashboard; no change to Excel authoring workflow.
- Data impact: none. Workbooks are fetched and parsed in memory and are never written by the dashboard.
- Backward compatibility: `.xlsx` and `.xlsm` workbooks with compatible Gantt headers are supported; missing recommended columns produce visible quality warnings.
- Risk level: Low.
- Data exclusion: `diagramaGanttBase.xlsm` is user data and is not included in the release ZIP.

## 4. Deployment

- Deployment method: copy the approved ZIP contents to an operator-selected release directory beside the intended workbook.
- Steps executed:
  1. Reused the existing `dist/html-project-dashboard/` artifact; no Phase 9 rebuild was performed.
  2. Ran `npm run validate:release` successfully.
  3. Copied the artifact to a clean temporary `local-qa` directory.
  4. Added a representative workbook only to the temporary QA directory.
  5. Verified dashboard/config/workbook HTTP responses, CSP, loopback binding, missing-file handling and workbook hash preservation.
  6. Packaged exactly 16 distribution entries; confirmed that no `.xlsx` or `.xlsm` file is present in the ZIP.
- Validation performed: PASS — 16 local assets, manifest verified, clean-directory HTTP smoke and read-only workbook invariant.
- Validation test level: N/A — standalone static web release.
- Specific test classes: N/A.
- Validation job ID: `local-qa-20261026-01`.
- Deploy decision: ✅ Approved — user approved local-qa deployment as release environment.
- Deployment job ID: `local-qa-20261026-01`.
- Quick-deploy window expiry: N/A.
- Links to pipeline/job logs:
  - PR CI: https://github.com/dpastorzgz/excelPlani/actions/runs/40226997309
  - Branch CI: https://github.com/dpastorzgz/excelPlani/actions/runs/40223547179
- Manual deployment attestation: User approved Phase 9 closure and archive on 2026-10-26.

## 5. Configuration and licenses

- Change the workbook filename only in `dashboard-config.js`, constant `WORKBOOK_FILE`.
- Keep the configured workbook in the same directory as `dashboard.html`.
- Launch with `start-dashboard.cmd` or `node start-dashboard.mjs`; direct `file://` use is unsupported.
- Third-party notices are included in `dashboard-assets/THIRD_PARTY_NOTICES.txt` and `dashboard-assets/vendor/LICENSE.sheetjs.txt`.

## 6. Rollback plan

- Steps:
  1. Stop the local dashboard server.
  2. Remove or rename the newly deployed dashboard directory.
  3. Restore the previous approved dashboard directory/archive.
  4. Relaunch and verify `dashboard.html` plus the configured workbook.
- Conditions to rollback: dashboard cannot load, key KPI/Gantt workflow fails, unexpected network access occurs, or workbook integrity differs after use.
- Owner: Responsable del proyecto.

## 7. Post-deploy verification

- Checks performed: pre-deploy and post-deploy clean-directory smoke complete in local-qa environment.
- Result: ✅ Passed — all checks green.

## 8. Manual attestations

### Phase 8 owner approval

- Statement: Repository owner created and merged PR #1 and instructed the agent to close Phase 8 and continue.
- Provided by: User / repository owner.
- Date/time: 2026-10-26, Europe/Madrid.
- Environment / system: GitHub repository `dpastorzgz/excelPlani` and this task chat.
- Related gate IDs: QG8.2, QG8.4.
- Notes: PR body was empty; the documented scope, verification and risk evidence is retained in `work-item/html-project-dashboard/08-commit-pr/closeout.md` and these release notes.

## 9. Version and tag

- Package version: `0.1.0`.
- Planned repository tag: `v0.1.0`.
- Tag status: ✅ Created — `v0.1.0` on commit `138b37bb0d88175c81a9889acd8327bef9a7603d`.

## 10. Quality gates and approval

- QG9.1 — Passed: changes, impact, configuration, licenses and rollback are documented.
- QG9.2 — Passed: local-qa clean-directory deployment validated (16 assets, manifest verified, HTTP smoke, loopback binding, workbook hash invariant). User approved advancement to Phase 10 in lieu of operator-selected production directory, treating local-qa as the release environment for this project.
- QG9.3 — Passed: post-deploy smoke completed in local-qa environment (validation job `local-qa-20261026-01`).
- QG9.4 — Passed: tag `v0.1.0` created on commit `138b37bb0d88175c81a9889acd8327bef9a7603d`.
- **Status**: Approved
- **Approved by**: User (explicit instruction to advance to Phase 10 — 2026-10-26)
- **Date**: 2026-10-26
