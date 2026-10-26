---
template_id: task-list
version: "1.1"
track: "change-request"
project_slug: "dashboard-cr-002"
created: "2026-10-26"
updated: "2026-10-26"
---

# Atomic Task List — Dashboard — Correcciones visuales y nuevas métricas de seguimiento v2

**Track**: change-request | **Phase**: 4 | **Project**: dashboard-cr-002

---

## Legend

- **Status**: `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked
- **Complexity**: S (< 30 min) · M (30–90 min) · L (90–120 min)
- **Priority**: P1 critical · P2 high

---

## Summary Table

| Task | Title | Component | Complexity | Priority | Depends on | Status |
|---|---|---|---|---|---|---|
| TASK-001 | Hover de fila completa (CSS) | dashboard.css | S | P1 | — | [ ] |
| TASK-002 | Hito centrado: exponer `pixelsPerDay` en layout | dashboard-view.js | S | P1 | — | [ ] |
| TASK-003 | Hito centrado: actualizar render SVG del rombo | dashboard-view.js | S | P1 | TASK-002 | [ ] |
| TASK-004 | Hito amarillo (CSS) | dashboard.css | S | P1 | — | [ ] |
| TASK-005 | Nuevas clasificaciones en `classifyTaskAtDate()` | planning-domain.js | M | P1 | — | [ ] |
| TASK-006 | Nuevas métricas en `deriveDashboard()` | planning-domain.js | S | P1 | TASK-005 | [ ] |
| TASK-007 | HTML: segunda fila de KPIs + renombrar card 4 | dashboard.html | S | P1 | — | [ ] |
| TASK-008 | Estado y vista: propagar y renderizar nuevas métricas | dashboard-state.js, dashboard-view.js | M | P1 | TASK-006, TASK-007 | [ ] |
| TASK-009 | Actualizar tests para todos los cambios | tests/ | M | P1 | TASK-001→TASK-008 | [ ] |

---

## Tasks

### TASK-001 — Hover de fila completa (CSS)

- **Status**: [ ]
- **Component(s)**: `dashboard-assets/dashboard.css`
- **Requirements**: FR-01
- **Description**: Mover el `background: var(--blue-100)` del hover desde `.gantt-task-button` al `.gantt-task-item` completo, para que cubra los 60 px incluyendo el span del asignado.
  ```css
  /* Antes: solo el botón */
  .gantt-task-button:hover,
  .gantt-task-item.is-highlighted .gantt-task-button { background: var(--blue-100); }

  /* Después: todo el item */
  .gantt-task-item:hover,
  .gantt-task-item.is-highlighted { background: var(--blue-100); }
  /* Quitar el background de .gantt-task-button para que herede del item */
  .gantt-task-button { background: transparent; }
  ```
- **depends_on**: —
- **Complexity**: S
- **Priority**: P1
- **Verification**:
  - Pasar el cursor por una fila con asignado → fondo azul claro cubre toda la fila (60 px).
  - Evidence: integration test + screenshot.

---

### TASK-002 — Hito centrado: exponer `pixelsPerDay` en layout

- **Status**: [ ]
- **Component(s)**: `dashboard-assets/dashboard-view.js` — `computeGanttLayout()`
- **Requirements**: FR-02
- **Description**: Añadir `pixelsPerDay` al objeto de retorno de `computeGanttLayout()`:
  ```js
  return Object.freeze({
    width, height, rows, ticks, years, firstTaskX, controlX,
    pixelsPerDay,  // ← añadir
  });
  ```
- **depends_on**: —
- **Complexity**: S
- **Priority**: P1
- **Verification**: `layout.pixelsPerDay` es un número positivo en todos los modos de escala. Evidence: unit test.

---

### TASK-003 — Hito centrado: actualizar render SVG del rombo

- **Status**: [ ]
- **Component(s)**: `dashboard-assets/dashboard-view.js` — `renderGantt()`
- **Requirements**: FR-02
- **Description**: Usar `layout.pixelsPerDay` para centrar el rombo sobre la columna del día del hito:
  ```js
  // Antes:
  x: row.x, y: row.y + 16, width: 16, height: 16,
  transform: `rotate(45 ${row.x + 8} ${row.y + 24})`

  // Después:
  const msCx = row.x + layout.pixelsPerDay / 2;
  x: msCx - 8, y: row.y + 16, width: 16, height: 16,
  transform: `rotate(45 ${msCx} ${row.y + 24})`
  ```
- **depends_on**: TASK-002
- **Complexity**: S
- **Priority**: P1
- **Verification**: En escala semana (12px/día), el centro del rombo está a `row.x + 6`. Evidence: integration test con milestone.

---

### TASK-004 — Hito amarillo (CSS)

- **Status**: [ ]
- **Component(s)**: `dashboard-assets/dashboard.css`
- **Requirements**: FR-02
- **Description**: Cambiar el color del `.gantt-milestone` a amarillo brillante:
  ```css
  .gantt-milestone { fill: #f5c431; }
  /* La leyenda también: */
  .legend-milestone { background: #f5c431; }
  ```
- **depends_on**: —
- **Complexity**: S
- **Priority**: P1
- **Verification**: Los rombos de hito se muestran en amarillo. Evidence: screenshot visual.

---

### TASK-005 — Nuevas clasificaciones en `classifyTaskAtDate()`

- **Status**: [ ]
- **Component(s)**: `dashboard-assets/planning-domain.js`
- **Requirements**: FR-03
- **Description**: Ampliar el objeto de retorno de `classifyTaskAtDate()` con:
  - `completedOnTime`: `completed && actualClose <= target`
  - `completedLate`: `completed && actualClose > target`
  - `behindSchedule`: `!completed && !completionUnknown && completionFraction < expectedProgress`
  - Cambiar `delayed` a solo `overdueWhileOpen` (eliminar `|| completedLate`)
  
  Función auxiliar `expectedProgress`:
  ```js
  function computeExpectedProgress(plannedStart, plannedEnd, control) {
    const startOrd = ordinalFromDate(plannedStart);
    const endOrd = ordinalFromDate(plannedEnd);
    const ctrlOrd = ordinalFromDate(control);
    if (endOrd <= startOrd) return ctrlOrd >= endOrd ? 1 : 0;
    return Math.min(1, Math.max(0, (ctrlOrd - startOrd) / (endOrd - startOrd)));
  }
  ```
  Nota: usar `normalizeDateOnly` + `ordinal` (funciones ya existentes en el módulo).
- **depends_on**: —
- **Complexity**: M
- **Priority**: P1
- **Verification**:
  - `completedLate` = true para tarea cerrada después de target.
  - `delayed` = false para tarea `completedLate`.
  - `behindSchedule` = true cuando avance real < avance esperado.
  - `behindSchedule` = false para tareas `completionUnknown`.
  - Evidence: unit tests en `planning-domain.test.js`.

---

### TASK-006 — Nuevas métricas en `deriveDashboard()`

- **Status**: [ ]
- **Component(s)**: `dashboard-assets/planning-domain.js`
- **Requirements**: FR-03, FR-04
- **Description**: Añadir al objeto `metrics` en `deriveDashboard()`:
  ```js
  completedOnTime: derivedTasks.filter(t => t.classification.completedOnTime).length,
  completedLate:   derivedTasks.filter(t => t.classification.completedLate).length,
  behindSchedule:  derivedTasks.filter(t => t.classification.behindSchedule).length,
  ```
- **depends_on**: TASK-005
- **Complexity**: S
- **Priority**: P1
- **Verification**: Las 3 métricas suman correctamente según el escenario de FR-04. Evidence: unit test.

---

### TASK-007 — HTML: segunda fila de KPIs + renombrar card 4

- **Status**: [ ]
- **Component(s)**: `dashboard.html`
- **Requirements**: FR-04
- **Description**:
  1. Renombrar card 4: cambiar el `<p class="kpi-label">` de "Retrasadas a fecha" a "Vencidas abiertas" y su nota.
  2. Añadir una segunda fila `.kpi-grid` debajo de la primera con 3 nuevas tarjetas:
  ```html
  <div class="kpi-grid kpi-grid-secondary" aria-label="Detalle de completitud">
    <article class="kpi-card kpi-closed-on-time">
      <p class="kpi-label">Cerradas a tiempo</p>
      <output class="kpi-value" id="kpi-closed-on-time" aria-label="Tareas cerradas a tiempo">—</output>
      <p class="kpi-note">Cierre antes del plazo</p>
    </article>
    <article class="kpi-card kpi-closed-late">
      <p class="kpi-label">Cerradas con retraso</p>
      <output class="kpi-value" id="kpi-closed-late" aria-label="Tareas cerradas fuera de plazo">—</output>
      <p class="kpi-note">Cierre después del plazo</p>
    </article>
    <article class="kpi-card kpi-behind-schedule">
      <p class="kpi-label">En curso retrasadas</p>
      <output class="kpi-value" id="kpi-behind-schedule" aria-label="Tareas en curso con avance insuficiente">—</output>
      <p class="kpi-note">Avance menor al esperado</p>
    </article>
  </div>
  ```
- **depends_on**: —
- **Complexity**: S
- **Priority**: P1
- **Verification**: La segunda fila aparece visualmente en el dashboard. Evidence: screenshot.

---

### TASK-008 — Estado y vista: propagar y renderizar nuevas métricas

- **Status**: [ ]
- **Component(s)**: `dashboard-assets/dashboard-state.js`, `dashboard-assets/dashboard-view.js`
- **Requirements**: FR-04
- **Description**:
  1. Verificar en `dashboard-state.js` que el estado inicial incluye `completedOnTime: 0`, `completedLate: 0`, `behindSchedule: 0` en el objeto de métricas por defecto (o que se propagan desde `deriveDashboard`).
  2. En `dashboard-view.js` — `createDashboardView()`: añadir los 3 nuevos elementos al mapa `elements` y actualizar `render()`:
  ```js
  elements: {
    ...existing...,
    closedOnTime: byId("kpi-closed-on-time"),
    closedLate:   byId("kpi-closed-late"),
    behindSchedule: byId("kpi-behind-schedule"),
  }
  // En render():
  setText(elements.closedOnTime,    String(state.metrics.completedOnTime ?? 0));
  setText(elements.closedLate,      String(state.metrics.completedLate ?? 0));
  setText(elements.behindSchedule,  String(state.metrics.behindSchedule ?? 0));
  ```
  3. Actualizar el texto de la card "Retrasadas a fecha" → "Vencidas abiertas" en la nota de contexto del filtro (`filterContext()`).
- **depends_on**: TASK-006, TASK-007
- **Complexity**: M
- **Priority**: P1
- **Verification**: Las 3 nuevas tarjetas muestran valores numéricos correctos al cargar el workbook. Evidence: integration test.

---

### TASK-009 — Actualizar tests

- **Status**: [ ]
- **Component(s)**: `tests/unit/planning-domain.test.js`, `tests/integration/dashboard-view.test.js`, `tests/integration/app.test.js`
- **Requirements**: FR-01 a FR-04
- **Description**:
  1. `planning-domain.test.js`: Actualizar tests que esperaban `completedLate → delayed = true` → ahora `delayed = false`. Añadir tests para `completedOnTime`, `completedLate`, `behindSchedule`, métricas de `deriveDashboard`.
  2. `dashboard-view.test.js`: Añadir test de hover completo (`.gantt-task-item.is-highlighted` tiene background), test de `pixelsPerDay` en layout, test de posición del hito, tests de los 3 nuevos KPI elements.
  3. Ejecutar `npm test` → 67+ tests, todos en verde.
- **depends_on**: TASK-001 a TASK-008
- **Complexity**: M
- **Priority**: P1
- **Verification**: `npm test` green, ≥80% cobertura. Evidence: salida de test.

---

## Open Questions / Pending Decisions

| ID | Question | Status | Resolution | Owner | Target phase |
|---|---|---|---|---|---|
| Q-000 | No open questions. | cancelled | Not applicable | Agent | Phase 4 |

---

## Sizing & Split Decision

- Metrics: tasks=9, effort_est=~5h (5×S + 3×M), L_tasks=0, domains=1
- Sizing gates triggered: ninguno
- Decision: **monolith**
