# Release Notes — Dashboard — Mejoras y correcciones v1 — v0.2.0

## 1. Summary

- Release date: 2026-10-26
- Owner: Responsable del proyecto
- Target environment: local deployment (same as v0.1.0)
- Source commit: `868931f` on `main`
- Base release: v0.1.0 (`138b37bb`)

## 2. Changes

### Fixed

- **Hito/Bloqueada con valor "X"**: La columna Hito (y Bloqueada) ahora acepta `X` y `x` como valores válidos equivalentes a "Sí". Los libros Excel con hitos marcados con `X` ya no generan avisos `INVALID_BOOLEAN` y los hitos se renderizan correctamente como rombos ▲ en el Gantt.
- **Edición parcial de fecha de control**: Cambiar solo el mes (o el día) en el selector de fecha de control ya no borra el resto de la fecha. El campo conserva su valor mientras tiene el foco.

### Added

- **Asignado en el Gantt**: Cada fila del Gantt muestra el nombre del asignado justo debajo del nombre de la tarea, en fuente ligeramente más pequeña. Las tareas sin asignado explícito no muestran texto adicional.
- **Porcentaje de avance en las barras**: Las barras del Gantt muestran el texto `"Avance XX%"` a la derecha de cada barra de tarea. Los hitos no muestran este texto.

### Removed

- **Botón "Copiar imagen para PowerPoint"**: Eliminado de la cabecera del dashboard. La funcionalidad de exportación SVG → PNG sigue disponible en el módulo `presentation-exporter.js` pero ya no está expuesta en la interfaz de usuario.

## 3. Impact & Risk

- User impact: mejora visual directa en el Gantt; el Excel de planificación no requiere cambios si ya usa `X` para hitos.
- Data impact: ninguno. Los libros siguen siendo leídos en modo de solo lectura.
- Backward compatibility: libros con `Si`/`No`/`1`/`0`/`True`/`False` siguen funcionando exactamente igual.
- Risk level: Low.

## 4. Deployment

- Deployment method: same as v0.1.0 — replace files in the local deployment directory with the updated source files.
- Files changed: `dashboard.html`, `dashboard-assets/app.js`, `dashboard-assets/dashboard-view.js`, `dashboard-assets/dashboard.css`, `dashboard-assets/workbook-gateway.js`
- No new files required; no configuration changes needed.

## 5. Configuration and licenses

- No changes to `dashboard-config.js` or third-party licenses.
- `THIRD_PARTY_NOTICES.txt` unchanged.

## 6. Rollback plan

- Restore the previous versions of the 5 changed files from the v0.1.0 release ZIP or from git tag `v0.1.0`.

## 7. Post-deploy verification

- Load the dashboard with `diagramaGanttBase.xlsm`.
- Verify: 0 avisos `INVALID_BOOLEAN` if hitos use `X`.
- Verify: assignee names visible below task names in Gantt.
- Verify: `"Avance XX%"` labels visible on task bars.
- Verify: changing only the month in the control date does not clear the field.
- Verify: "Copiar imagen para PowerPoint" button is absent.

## 8. Quality Gates

- QG9.1 — Passed: changes, impact, configuration and rollback documented.
- QG9.2 — Passed: local deployment replaces 5 source files; same environment as v0.1.0.
- QG9.3 — Passed: post-deploy smoke performed (67/67 automated tests + manual verification criteria above).
- QG9.4 — Passed: tag `v0.2.0` created on commit `868931f`.

## 9. Version and tag

- Package version: `0.2.0`
- Repository tag: `v0.2.0`
- Tag commit: `868931f`

---

- **Status**: Approved
- **Approved by**: User ("lo veo perfecto, puedes cerrar" — 2026-10-26)
- **Date**: 2026-10-26
