---
template_id: retrospective
project_slug: dashboard-cr-004
phase: "10"
created: "2026-10-26"
updated: "2026-10-26"
---

# Retrospective — CR-004: Secciones colapsables en el Gantt

## Summary

| Item | Value |
|---|---|
| Track | change-request |
| Phases completed | 1–9 |
| Start / End | 2026-10-26 |
| Tests | 88/88 passing, 19 nuevos |
| Regressions | 0 |

## What went well

- **ADR-0001 clara**: la separación `derivedTasks` (métricas) / `visibleDerivedTasks` (vista) garantizó KPIs inmunes al colapso desde el diseño.
- **Reutilización de `computeGanttLayout`**: la extensión con `entries[]` fue retrocompatible (plain tasks array sigue funcionando).
- **Tests cubren el invariante**: los tests de `dashboard-state` verifican explícitamente que `metrics` no cambia al colapsar.

## What could be improved

- El criterio de detección de sección (sin asignado + sin duración + sin fechas) puede dar falsos positivos si el usuario deja campos en blanco accidentalmente.

## Archive commit hash

`8609e47` — chore(archive): move dashboard-cr-004 to work-item/archive after Phase 10 closure

## Approval

- **Status**: Approved
- **Approved by**: Usuario
- **Date**: 2026-10-26
