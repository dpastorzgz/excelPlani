# Release Notes — Dashboard CR-003 — v0.4.0

**Date**: 2026-10-26 | **Commit**: `8456b4e` | **Base**: v0.3.0

## Changes

### Added
- **KPI Tiempo transcurrido**: % del tiempo de proyecto consumido desde fecha inicio hasta fecha de control.
- **KPI Tiempo restante**: % de tiempo de proyecto restante + días hasta fecha fin.
- **KPI Tareas en curso**: número total de tareas abiertas independientemente del retraso.

### Changed
- Layout KPI: 4+3 cajas → 3+4 cajas. Fila 1 (visión temporal), fila 2 (clasificación de tareas).
- KPI "Retrasadas" renombrado a la fila 2 como "En curso retrasadas" (sin cambios en lógica).

### Removed
- KPI "Completadas a fecha" eliminado del área visual.
- KPI "Porcentaje completado" eliminado del área visual.
- KPI "Vencidas abiertas" eliminado del área visual.

QG9.1-9.4 — All passed. Tag `v0.4.0` on `8456b4e`.

**Status**: Approved
