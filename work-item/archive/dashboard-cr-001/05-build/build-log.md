# Build Log — Dashboard — Mejoras y correcciones v1

**Phase**: 5 — Construction  
**Project**: dashboard-cr-001  
**Date**: 2026-10-26  
**Track**: change-request  

---

## Summary

All 6 atomic tasks completed. 67/67 tests green. Lint clean.

---

## Tasks Completed

### TASK-001 ✅ — Ampliar `booleanValue()` para aceptar `X`/`x` como `true`

- **File**: `dashboard-assets/workbook-gateway.js`
- **Change**: Added `"x"` to the truthy values array in `booleanValue()`: `["si", "yes", "true", "1", "x"]`
- **Evidence**: New unit test `treats X and x as boolean true for Hito and Bloqueada without INVALID_BOOLEAN warnings` — PASS

---

### TASK-002 ✅ — Eliminar botón "Copiar imagen para PowerPoint"

- **Files**: `dashboard.html`, `dashboard-assets/dashboard-view.js`, `dashboard-assets/app.js`
- **Changes**:
  - Removed `<button id="copy-dashboard-button">` from `dashboard.html`
  - Removed `byId("copy-dashboard-button").addEventListener(...)` from `dashboard-view.js`
  - Removed `import { exportDashboard }`, `exportCurrentSnapshot` function, and `export:` handler from `app.js`
  - Removed unused `announce()` function from `app.js`
- **Evidence**: Test `does not expose exportCurrentSnapshot and does not render the copy button` — PASS

---

### TASK-003 ✅ — Añadir etiqueta "Avance XX%" en barras SVG del Gantt

- **Files**: `dashboard-assets/dashboard-view.js`, `dashboard-assets/dashboard.css`
- **Changes**:
  - Added SVG `<text class="gantt-progress-label">` after each `gantt-progress` rect (non-milestone tasks only)
  - Position: `x = row.x + row.width + 6`, `y = row.y + 28`
  - Content: `` `Avance ${Math.round(progress * 100)}%` ``
  - Added `.gantt-progress-label` CSS rule
- **Evidence**: Test `renders Avance XX% labels on task bars and not on milestones` — PASS

---

### TASK-004 ✅ — Añadir nombre de asignado debajo del nombre de tarea

- **Files**: `dashboard-assets/dashboard-view.js`, `dashboard-assets/dashboard.css`
- **Changes**:
  - Added `<span class="gantt-task-assignee">` after the task button if `assignee !== "Sin asignar"`
  - Changed `ROW_HEIGHT` from `48` to `60` to accommodate the second line
  - Updated `.gantt-task-item` to `height: 60px` with flex column layout
  - Updated `.gantt-task-button` to `min-height: 0` (removes global 2.75rem override)
  - Added `.gantt-task-assignee` CSS rule (0.72em, ink-600, ellipsis)
- **Evidence**: Test `renders assignee below task name and hides it for unassigned tasks` — PASS

---

### TASK-005 ✅ — Corregir borrado de fecha al editar parcialmente un campo

- **File**: `dashboard-assets/dashboard-view.js`
- **Root cause**: `render()` was unconditionally overwriting `elements.controlDate.value`, `elements.dateFrom.value`, and `elements.dateTo.value` on every render, including while the user was mid-edit (partial date input emits `change` with empty string → state goes null → render clears input).
- **Fix**: Added `setDateValue(el, value)` helper that skips the update if `document.activeElement === el`.
- **Evidence**: Test `setDateValue does not overwrite a focused date input but updates an unfocused one` — PASS

---

### TASK-006 ✅ — Actualizar tests

- **Files**: `tests/unit/workbook-gateway.test.js`, `tests/integration/dashboard-view.test.js`, `tests/integration/app.test.js`
- **Changes**:
  - Added `booleanValue X/x` unit test in `workbook-gateway.test.js`
  - Updated `app.test.js`: replaced export test with "copy button absent" assertion
  - Added 3 new integration tests in `dashboard-view.test.js`: assignee rendering, Avance labels, setDateValue focus behavior

---

## Test Results

```
Test Files  8 passed (8)
     Tests  67 passed (67)
  Start at  2026-10-26
  Duration  2.34s
```

- Unit tests: all pass
- Integration tests: all pass
- Coverage: maintained above 80% threshold (no regressions)
- Lint: no new ESLint errors detected

---

## Quality Gates

- QG5.1 — Passed: all 6 tasks completed with verified deliverables
- QG5.2 — Passed: changes follow web-standalone technology rules and ADR-0006 file boundaries
- QG5.3 — Passed: no compilation / static analysis errors
- QG5.4 — Passed: code is self-documenting; `setDateValue` has inline comment on root cause
- QG5.5 — Passed: this build log generated at `work-item/dashboard-cr-001/05-build/build-log.md`
