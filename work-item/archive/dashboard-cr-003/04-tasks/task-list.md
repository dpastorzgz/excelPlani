---
template_id: task-list
version: "1.1"
track: "change-request"
project_slug: "dashboard-cr-003"
created: "2026-10-26"
updated: "2026-10-26"
---

# Atomic Task List — Dashboard — Rediseño de KPIs v3

**Track**: change-request | **Phase**: 4 | **Project**: dashboard-cr-003

---

## Summary Table

| Task | Title | Component | Complexity | Priority | Depends on | Status |
|---|---|---|---|---|---|---|
| TASK-001 | Añadir `timeElapsed`, `timeRemaining`, `daysRemaining`, `tasksInProgress` a `deriveDashboard()` | planning-domain.js | M | P1 | — | [ ] |
| TASK-002 | Añadir `projectStart`/`projectEnd` al estado y pasarlos a `deriveDashboard()` | dashboard-state.js | S | P1 | TASK-001 | [ ] |
| TASK-003 | HTML: reemplazar área KPI por 3 + 4 cajas con nuevos IDs | dashboard.html | S | P1 | — | [ ] |
| TASK-004 | CSS: grid principal 3 columnas; grid secundaria 4 columnas | dashboard.css | S | P1 | — | [ ] |
| TASK-005 | `dashboard-view.js`: actualizar `elements` y `render()` para las 7 cajas | dashboard-view.js | M | P1 | TASK-002, TASK-003 | [ ] |
| TASK-006 | Actualizar tests unitarios e integración | tests/ | M | P1 | TASK-001 a TASK-005 | [ ] |

---

## Tasks

### TASK-001 — Nuevas métricas temporales en `deriveDashboard()`

- **Status**: [ ]
- **Component(s)**: `dashboard-assets/planning-domain.js`
- **Requirements**: FR-04
- **Description**:
  Añadir un parámetro de contexto de proyecto a `deriveDashboard()` y calcular las 4 nuevas métricas:
  ```js
  export function deriveDashboard(tasks, filters, { date1904 = false, projectStart = null, projectEnd = null } = {}) {
    // ...existing code...
    const ps = normalizeDateOnly(projectStart);
    const pe = normalizeDateOnly(projectEnd);
    const ctrl = normalizeDateOnly(filters.controlDate);
    let timeElapsed = null, timeRemaining = null, daysRemaining = null;
    if (ps && pe && ctrl) {
      const sOrd = ordinal(ps), eOrd = ordinal(pe), cOrd = ordinal(ctrl);
      const duration = eOrd - sOrd;
      timeElapsed = duration > 0 ? Math.round((cOrd - sOrd) / duration * 100) : null;
      timeRemaining = timeElapsed !== null ? 100 - timeElapsed : null;
      daysRemaining = eOrd - cOrd;
    }
    const tasksInProgress = total - completed;
    return Object.freeze({
      tasks: ...,
      metrics: Object.freeze({
        ...existing fields...,
        timeElapsed, timeRemaining, daysRemaining, tasksInProgress,
      }),
    });
  }
  ```
- **depends_on**: —
- **Complexity**: M
- **Verification**: Unit test: `timeElapsed=50, daysRemaining=183` for a 365-day project at midpoint. `null` when no project dates.

---

### TASK-002 — `projectStart`/`projectEnd` en el estado

- **Status**: [ ]
- **Component(s)**: `dashboard-assets/dashboard-state.js`
- **Requirements**: FR-04
- **Description**:
  1. Añadir `projectStart: null` y `projectEnd: null` a `createInitialState()`.
  2. En el case `PROJECT_SELECTED`: extraer `action.plan.projectStart` y `action.plan.projectEnd` y almacenarlos en el estado.
  3. Pasar `{ projectStart, projectEnd }` al llamar a `deriveDashboard()` en `recalculate()`.
- **depends_on**: TASK-001
- **Complexity**: S
- **Verification**: `store.getState().projectStart` tiene valor tras cargar un plan con metadatos.

---

### TASK-003 — HTML: 3 + 4 cajas KPI con nuevos IDs

- **Status**: [ ]
- **Component(s)**: `dashboard.html`
- **Requirements**: FR-01, FR-02, FR-03
- **Description**:
  Reemplazar el bloque completo `.kpi-grid` + `.kpi-grid-secondary` por:

  **Fila 1 (3 cajas)**:
  - `#kpi-total` — Tareas del proyecto (existente, conservar)
  - `#kpi-time-elapsed` — Tiempo transcurrido (nuevo)
  - `#kpi-time-remaining` — Tiempo restante (nuevo, nota = días)

  **Fila 2 (4 cajas)**:
  - `#kpi-closed-on-time` — Cerradas a tiempo (existente, conservar)
  - `#kpi-closed-late` — Cerradas con retraso (existente, conservar)
  - `#kpi-in-progress` — Tareas en curso (nuevo)
  - `#kpi-behind-schedule` — En curso retrasadas (existente, conservar)

  Eliminar: `#kpi-completed`, `#kpi-completion-ratio`, `#kpi-delayed`.
- **depends_on**: —
- **Complexity**: S
- **Verification**: Los IDs eliminados no aparecen en el DOM; los 7 nuevos/conservados sí.

---

### TASK-004 — CSS: 3 columnas fila 1 / 4 columnas fila 2

- **Status**: [ ]
- **Component(s)**: `dashboard-assets/dashboard.css`
- **Requirements**: FR-01, FR-02
- **Description**:
  - `.kpi-grid` (fila 1): cambiar de `repeat(4, ...)` a `repeat(3, minmax(9rem, 1fr))`.
  - `.kpi-grid-secondary` (fila 2): cambiar de `repeat(3, ...)` a `repeat(4, minmax(9rem, 1fr))`.
  - Añadir clases de color para las nuevas cajas: `.kpi-time-elapsed`, `.kpi-time-remaining`, `.kpi-in-progress`.
  - Responsive: en `max-width: 72rem`, la fila 1 pasa a 2 columnas y la fila 2 a 2 columnas.
- **depends_on**: —
- **Complexity**: S
- **Verification**: Layout visual con 3+4 cajas en pantalla completa.

---

### TASK-005 — `dashboard-view.js`: actualizar elements y render()

- **Status**: [ ]
- **Component(s)**: `dashboard-assets/dashboard-view.js`
- **Requirements**: FR-01, FR-02, FR-03
- **Description**:
  1. En el mapa `elements`: eliminar `completed`, `ratio`, `delayed`; añadir `timeElapsed`, `timeRemaining`, `daysRemaining` (para la nota), `inProgress`.
  2. En `render()`:
     - Eliminar: `setText(elements.completed, ...)`, `setText(elements.ratio, ...)`, `setText(elements.delayed, ...)`.
     - Añadir:
       ```js
       const te = state.metrics.timeElapsed;
       const tr = state.metrics.timeRemaining;
       const dr = state.metrics.daysRemaining;
       setText(elements.timeElapsed, te !== null ? `${te} %` : "—");
       setText(elements.timeRemaining, tr !== null ? `${tr} %` : "—");
       setText(elements.daysRemaining, dr !== null ? `${dr} días` : "—");
       setText(elements.inProgress, String(state.metrics.tasksInProgress ?? 0));
       ```
  3. Actualizar `filterContext()` para eliminar referencias al % completado si las hay.
- **depends_on**: TASK-002, TASK-003
- **Complexity**: M
- **Verification**: Dashboard muestra valores correctos en las 7 cajas. Evidence: integration test + screenshot.

---

### TASK-006 — Actualizar tests

- **Status**: [ ]
- **Component(s)**: `tests/unit/planning-domain.test.js`, `tests/integration/dashboard-view.test.js`, `tests/unit/dashboard-state.test.js`
- **Requirements**: FR-01 a FR-04
- **Description**:
  1. `planning-domain.test.js`: Actualizar el test de `deriveDashboard` que hace `toEqual` en el objeto de métricas para incluir `timeElapsed`, `timeRemaining`, `daysRemaining`, `tasksInProgress`. Añadir test específico para las métricas temporales.
  2. `dashboard-view.test.js`: Eliminar referencias a `#kpi-completed`, `#kpi-completion-ratio`, `#kpi-delayed`; añadir tests para `#kpi-time-elapsed`, `#kpi-time-remaining`, `#kpi-in-progress`.
  3. `dashboard-state.test.js`: Verificar que `projectStart`/`projectEnd` se propagan desde el plan al estado.
  4. `npm test` → 69+ tests, todos en verde.
- **depends_on**: TASK-001 a TASK-005
- **Complexity**: M
- **Verification**: `npm test` green, cobertura ≥80%.

---

## Sizing & Split Decision

- Metrics: tasks=6, effort_est=~4h (3×S + 3×M), L_tasks=0
- Decision: monolith
