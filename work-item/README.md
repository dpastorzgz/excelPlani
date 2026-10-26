# Project Registry

This file is the single source of truth for all projects in this framework.  
Update the table whenever a project is created, advances a phase, changes status, or is archived.

## Status Legend

| Icon | Meaning |
|------|---------|
| 🔵 | Planned — not yet started |
| 🟡 | In Progress |
| 🟠 | Blocked |
| ✅ | Completed |
| ❌ | Cancelled |
| 📦 | Archived |

> Archived projects are physically moved to `work-item/archive/[project-slug]/`
> and must no longer appear in this active registry table.
> Logical status `closed` (Phase 10, post-move) maps to ✅; physical relocation maps to 📦.

## Project Registry

| Slug | Name | Technology | Type | Parent | Wave | Current Phase | Status | Last Updated |
|------|------|------------|------|--------|------|---------------|--------|--------------|
| framework-v15-corrections | Framework v1.5 Corrections (P1–P4 + docs sync) | framework | feature | — | 0 | 8 | 🟡 | 2026-09-11 |
| project-rules-overlay | Project Rules Overlay (`project-rules/` capa aditiva + contexto efectivo) | framework | feature | — | 0 | 8 | 🟡 | 2026-09-18 |
| dashboard-cr-004 | Gantt — Secciones colapsables desde Excel | web-standalone | feature | — | 0 | 5 | 🟡 | 2026-10-26 |
| dashboard-cr-005 | Gantt — Vista completa expandida con ocultación de tareas | web-standalone | feature | — | 0 | 1 | 🟡 | 2026-10-26 |


---

## How to Register a New Project

1. Create the project folder: `work-item/[your-project-slug]/`
2. Copy `framework/templates/project-readme.md` → `work-item/[your-project-slug]/README.md` and fill it in
3. Add a row to the table above
4. Begin Phase 1 following `framework/workflows/phase-01-proposal.md`
5. For epics: copy `framework/templates/epic-map.yml` → `work-item/[epic-slug]/epic-map.yml`, set `type: epic` in `active.yml`, and record each child row (slug, wave, depends_on). For children: set `type: feature`, `parent_epic`, `depends_on` and `wave` in `active.yml`.

## Folder Structure per Project

```
work-item/
  [project-slug]/
    README.md                        ← Project home page (this template)
    01-intake/                       ← hotfix-only: bug-report.md
    _evidence/phase-01/ … phase-10/  ← Phase evidence (see framework/rules/evidence.md)
    01-proposal/
      proposal.md
    02-specs/
      specs.md
    03-design/
      design.md
      adr/
        ADR-001-[title].md
        adr-registry.md
    04-tasks/
      task-list.md
    05-build/
      build-log.md
    06-verification/
      verification-report.md
    07-testing/
      test-report.md
    08-commit-pr/
      (PR link recorded in build-log or verification-report)
    09-release/
      release-notes.md
    10-archive/
      retrospective.md
