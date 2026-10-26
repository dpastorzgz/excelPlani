# Retrospective — Cuadro de mando HTML para planificación de proyectos

## 1. Summary

- Date: 2026-10-26
- Participants: Responsable del proyecto, Axet Agent
- Project duration: 2026-10-23 → 2026-10-26 (4 days)
- Track: `new-feature`
- Technology: `web-standalone`
- Release: `v0.1.0` — tag on commit `138b37bb0d88175c81a9889acd8327bef9a7603d`
- Archive commit hash: `c270cbe718fdfceb18af1d8ce774543484cd1555`

---

## 2. What went well

- **Full lifecycle completed in 4 days**: all 10 phases executed end-to-end from proposal through archive without blocking issues.
- **Zero production incidents**: the local-first architecture (loopback-only server, read-only workbook access) eliminated all risk of data corruption or accidental exposure.
- **Clean separation of concerns**: the file-boundary ADR (ADR-0006) kept HTML, CSS, configuration, domain, state, view, and export logic in independent files, making each component independently testable and verifiable.
- **Accessible Gantt**: HTML semantic structure + SVG overlay (ADR-0004) provided a Gantt that passes automated accessibility checks without requiring a third-party charting library.
- **Deterministic PNG export**: the SVG → canvas → PNG pipeline (ADR-0005) produces a stable 1920×1080 image suitable for direct PowerPoint paste without additional software.
- **SheetJS CE vendored adapter** (ADR-0002): decoupling the workbook adapter from SheetJS internals insulated the domain logic from library churn and required no changes to domain or view code when test workbooks varied.
- **Automated quality pipeline**: lint + unit coverage + integration server + Playwright E2E + accessibility checks all ran in a single `npm test` invocation; CI passed on the first PR attempt.
- **Framework compliance**: all framework phase artifacts created, quality gates resolved, and evidence recorded consistently throughout the lifecycle.

---

## 3. What went poorly

- **Phase 9 deployment environment**: the project was validated in a local-qa clean directory rather than an operator-selected permanent deployment path. QG9.2 and QG9.3 were closed by user approval rather than a formal production deployment record. For a local-only tool this is acceptable, but the framework does not distinguish between local and cloud targets in QG9.2–9.3 wording.
- **PNG export fallback**: the `html2canvas` fallback path (ADR-0005) was documented but not exercised in automated tests due to the inability to suppress the native ClipboardAPI in a headless browser without additional polyfills. The fallback behavior was verified manually only.
- **Task-list sizing over-estimate**: several tasks (TASK-006, TASK-014, TASK-015) required more sub-iterations than their initial S/M estimates suggested due to cross-browser rendering differences in SVG overlay positioning.
- **README not updated during Phase 5–8**: the project README still showed Phase 5 as the current phase until Phase 10 cleanup; a mid-project README update cadence would reduce confusion if the project was paused between phases.

---

## 4. What we learned

- **Date-only domain** (ADR-0003) is the right default for planning tools: keeping `Date` objects out of the domain and using ISO `YYYY-MM-DD` strings throughout eliminated timezone edge cases entirely.
- **Loopback-first local server** (ADR-0001) is a robust pattern for local file access: it avoids `file://` CORS restrictions, works in all major browsers, and requires only Node.js — no additional runtime or tool installation.
- **SheetJS header-based adapter** is more resilient than column-index-based parsing: column renames in the workbook did not break the adapter, only a missing `REQUIRED` column produced a QA warning, not a silent data error.
- **Framework phase discipline** adds real value even for small projects: having a traceability matrix, ADRs, and a verification report meant that every scope question raised in Phase 7 testing could be immediately answered by referencing a specific FR or ADR.
- **Evidence-before-done principle**: recording evidence artifacts (`.txt` files under `_evidence/phase-05/`) as work was completed made the Phase 6 verification report straightforward to write and averted the need to re-run commands just to confirm outcomes.

---

## 5. Action items

- [ ] Operator: deploy `html-project-dashboard-v0.1.0.zip` to the permanent working directory beside `diagramaGanttBase.xlsm` when ready — Owner: Responsable del proyecto — Due: operator discretion
- [ ] Operator: run post-deploy smoke from the permanent deployment directory (open `dashboard.html` via launcher, verify KPIs load, Gantt renders, PNG export produces a file) — Owner: Responsable del proyecto — Due: after deployment
- [ ] Framework: consider adding a `local-tool` deployment sub-type to QG9.2/QG9.3 to handle local-only releases without requiring a cloud deployment record — Owner: framework maintainer — Due: next framework improvement cycle

---

## 6. Metrics

- Lead time: 4 calendar days (2026-10-23 → 2026-10-26)
- Phases completed: 10 / 10
- Tasks completed: 21 / 21 (all tasks in task-list.md)
- ADRs created: 6
- Defects found in testing (Phase 7): 0 blocking; minor Gantt alignment and filter reset issues found and resolved in Phase 5
- Production incidents: 0
- Test coverage (unit): 95.1 % statements (threshold: 80 %)
- E2E test suites: 4 suites, all passing
- Release ZIP size: 16 distribution entries; workbook excluded per policy

---

## 7. Framework Improvement Actions

| #  | Area                        | Observation                                                                                                                                    | Proposed Improvement                                                                                                                  | Priority | Status      |
|----|-----------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|----------|-------------|
| 1  | Quality gates — Phase 9     | QG9.2 and QG9.3 do not distinguish between cloud deployment and local-tool deployment. Local-only projects must perform an awkward mapping.       | Add a `local-tool` deployment sub-type (or a `N/A` exception path) to QG9.2–QG9.3, similar to how QG9.4 supports `N/A` with reason. | Medium   | ⬜ Pending  |
| 2  | Templates — README          | The project README template does not prompt for mid-project updates; it is typically written once and left stale until Phase 10.                   | Add a "Update README phase row" step to the Phase 5 and Phase 8 workflow checklists.                                                | Low      | ⬜ Pending  |
| 3  | Quality gates — Phase 7     | QG7.1 threshold compliance requires the agent to know the technology-specific threshold upfront; a missing tech-config threshold silently passes. | Add an explicit fallback threshold to the framework default (e.g. 80 %) when tech-config does not specify one.                     | Low      | ⬜ Pending  |

### Areas to Consider
- Workflow clarity (phases 1–10): Phase 9 deployment sub-types need clarification — see item 1 above.
- Template completeness: README mid-lifecycle updates — see item 2 above.
- Quality gate strictness: tech-config threshold defaults — see item 3 above.
- Technology rules gaps: none identified for web-standalone.
- Agent communication patterns: structured question protocol worked well; no gaps identified.

---

## 8. Phase 10 Quality Gates

- QG10.1 — Passed: this retrospective document created at `work-item/html-project-dashboard/10-archive/retrospective.md`.
- QG10.2 — Passed: all project artifacts present in their corresponding phase folders (01–09, _evidence, 03-design/adr).
- QG10.3 — Passed: project README updated with status `🏁 ARCHIVED` and all phases marked ✅ Done.
- QG10.4 — N/A: project type is `feature`, not `epic`.

---

## 9. Archive Movement Record

- Archive command: `git mv work-item/html-project-dashboard work-item/archive/html-project-dashboard`
- Archive commit message: `chore(archive): move html-project-dashboard to work-item/archive after Phase 10 closure`
- Archive commit hash: `c270cbe718fdfceb18af1d8ce774543484cd1555`
- Original path: `work-item/html-project-dashboard/`
- Archive path: `work-item/archive/html-project-dashboard/`
- Archived by: Axet Agent
- Archived at: 2026-10-26, Europe/Madrid
