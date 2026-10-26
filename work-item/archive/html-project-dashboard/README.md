# Cuadro de mando HTML para planificación de proyectos

> Cuadro de mando local que transforma el Excel de planificación en indicadores y un Gantt interactivo para seguimiento y presentación.

---

## Project Info

| Field                 | Value                    |
| --------------------- | ------------------------ |
| **Slug**              | `html-project-dashboard` |
| **Technology**        | web-standalone           |
| **Team / Owner**      | Responsable del proyecto |
| **Status**            | 🏁 ARCHIVED              |
| **Current Phase**     | 10 — Archive             |
| **Started**           | 2026-10-23               |
| **Completed**         | 2026-10-26               |
| **Framework version** | 1.5.0                    |
| **Release**           | v0.1.0                   |

## Phase History

| Phase | Name         | Status      | Artifact                                       | Completed   |
| ----- | ------------ | ----------- | ---------------------------------------------- | ----------- |
| 01    | Proposal     | ✅ Done     | `01-proposal/proposal.md`                      | 2026-10-23  |
| 02    | Specs        | ✅ Done     | `02-specs/specs.md`                            | 2026-10-25  |
| 03    | Design       | ✅ Done     | `03-design/design.md`                          | 2026-10-25  |
| 04    | Tasks        | ✅ Done     | `04-tasks/task-list.md`                        | 2026-10-25  |
| 05    | Construction | ✅ Done     | `05-build/build-log.md`                        | 2026-10-25  |
| 06    | Verification | ✅ Done     | `06-verification/verification-report.md`       | 2026-10-25  |
| 07    | Testing      | ✅ Done     | `07-testing/test-report.md`                    | 2026-10-25  |
| 08    | Commit / PR  | ✅ Done     | `08-commit-pr/closeout.md`                     | 2026-10-26  |
| 09    | Release      | ✅ Done     | `09-release/release-notes.md`                  | 2026-10-26  |
| 10    | Archive      | ✅ Done     | `10-archive/retrospective.md`                  | 2026-10-26  |

## Key Decisions (ADRs)

| ID       | Title                                                      | Status   | Date       |
| -------- | ---------------------------------------------------------- | -------- | ---------- |
| ADR-0001 | Loopback local para acceso automático al libro             | Accepted | 2026-10-23 |
| ADR-0002 | SheetJS CE vendorizado y adaptación por encabezados        | Accepted | 2026-10-23 |
| ADR-0003 | Modelo de dominio date-only independiente del workbook     | Accepted | 2026-10-23 |
| ADR-0004 | Gantt accesible con HTML semántico y SVG                   | Accepted | 2026-10-23 |
| ADR-0005 | Exportación determinista SVG a PNG con fallback            | Accepted | 2026-10-23 |
| ADR-0006 | Separación obligatoria de componentes y activos por fichero| Accepted | 2026-10-23 |

## Traceability

- Traceability matrix: `02-specs/traceability-matrix.md`
- Evidence tracker: `_evidence/`

## Archive

- Archive location: `work-item/archive/html-project-dashboard/`
- Retrospective: `10-archive/retrospective.md`
- Release artifact: `09-release/html-project-dashboard-v0.1.0.zip`
- Release tag: `v0.1.0`

## Notes

- Reference workbook inspected in read-only mode: `diagramaGanttBase.xlsm`.
- The repository has no project-rules overlay.
- `technology-rules/web-standalone/` was created and validated before drafting Phase 3.
- Deployment environment: local-qa (standalone local dashboard; no cloud/production deployment required).
