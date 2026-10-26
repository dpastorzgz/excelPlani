# Phase 8 Closeout — Commit & PR — Dashboard — Mejoras y correcciones v1

**Phase**: 8 — Commit & PR  
**Project**: dashboard-cr-001  
**Date**: 2026-10-26  

---

## Commit

- **Hash**: `868931f`
- **Branch**: `main`
- **Message**: `feat(dashboard): CR-001 mejoras y correcciones v1`
- **Files changed**: 8
- **Insertions**: 145 / **Deletions**: 46

### Commit body summary
- `fix(gateway)`: accept X/x as boolean true for Hito and Bloqueada columns
- `feat(gantt)`: show assignee below task name with smaller font (hidden when unassigned)
- `feat(gantt)`: show Avance XX% label to the right of each task bar
- `fix(filters)`: setDateValue skips update on focused date inputs (partial edit fix)
- `remove(ui)`: remove copy-to-clipboard button for PowerPoint
- `test`: add 6 new tests covering all CR-001 changes (67/67 green)

---

## PR / Review

- **Track**: `change-request` — all changes to `main` directly (no separate feature branch for this CR)
- **CI status**: N/A — committed directly to main; existing CI pipeline runs on push
- **Review**: Approved by user ("lo veo perfecto, puedes cerrar" — 2026-10-26)

---

## Quality Gates

- QG8.1 — Passed: commit follows Conventional Commits format (`feat(dashboard):` + `fix(gateway):` + `remove(ui):`)
- QG8.2 — Passed: commit message references CR-001 scope and lists all changes
- QG8.3 — N/A: direct commit to main; CI will run on push (existing GitHub Actions pipeline)
- QG8.4 — Passed: approved by user

---

## Approval

- **Status**: Approved
- **Approved by**: User — 2026-10-26
