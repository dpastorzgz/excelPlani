# Release Notes — Dashboard CR-002 — v0.3.0

**Date**: 2026-10-26 | **Commit**: `987417f` | **Base**: v0.2.0

## Changes

### Fixed
- **Hover de fila completa**: El resaltado al pasar el cursor cubre ahora los 60 px completos de cada fila del Gantt (nombre de tarea + asignado).
- **Hito centrado**: El rombo de hito aparece centrado sobre la columna exacta de su fecha en todas las escalas.
- **KPI "Retrasadas" corregido**: Renombrado a "Vencidas abiertas". Ya solo cuenta tareas SIN fecha de cierre real cuya fecha fin ha pasado — no incluye tareas ya cerradas.

### Added
- **Hito en amarillo**: Los rombos de hito son ahora de color amarillo brillante (`#f5c431`).
- **KPI "Cerradas a tiempo"**: Tareas cerradas antes de su fecha fin planificada/línea base.
- **KPI "Cerradas con retraso"**: Tareas cerradas después de su fecha fin planificada.
- **KPI "En curso retrasadas"**: Tareas abiertas cuyo avance real es inferior al esperado según el tiempo transcurrido.

## Quality Gates

- QG9.1-9.4 — All passed. Tag `v0.3.0` on commit `987417f`.

**Status**: Approved
