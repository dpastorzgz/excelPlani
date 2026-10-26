---
template_id: task-list
version: "1.1"
track: "change-request"
project_slug: "dashboard-cr-001"
created: "2026-10-26"
updated: "2026-10-26"
---

# Atomic Task List — Dashboard — Mejoras y correcciones v1

> Each task must be independently verifiable and reference design components and requirements (FR/NFR) where applicable.

**Track**: change-request | **Phase**: 4 — Atomic Tasks | **Project**: dashboard-cr-001

---

## Legend

- **Status**: `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked
- **Complexity**: S (< 30 min) · M (30–90 min) · L (90–120 min, max 2h per atomic task)
- **Priority**: P1 critical · P2 high · P3 normal
- **depends_on**: list of TASK-IDs that must be completed before this task starts

---

## Summary Table

| Task     | Title                                                      | Component                    | Complexity | Priority | Depends on | Status |
| -------- | ---------------------------------------------------------- | ---------------------------- | ---------- | -------- | ---------- | ------ |
| TASK-001 | Ampliar `booleanValue()` para aceptar `X`/`x` como true   | workbook-gateway.js          | S          | P1       | —          | [ ]    |
| TASK-002 | Eliminar botón "Copiar imagen para PowerPoint"             | dashboard.html, dashboard-view.js, app.js | S | P1 | —       | [ ]    |
| TASK-003 | Añadir etiqueta "Avance XX%" en barras SVG del Gantt       | dashboard-view.js, dashboard.css | M       | P1       | —          | [ ]    |
| TASK-004 | Añadir nombre de asignado debajo del nombre de tarea       | dashboard-view.js, dashboard.css | M       | P1       | —          | [ ]    |
| TASK-005 | Corregir borrado de fecha al editar parcialmente un campo  | dashboard-assets/dashboard-view.js              | S  | P1 | —    | [ ]    |
| TASK-006 | Actualizar tests unitarios e integración para los cambios  | tests/unit/, tests/integration/ | M        | P1       | TASK-001 a TASK-005 | [ ] |

---

## Tasks

### TASK-001 — Ampliar `booleanValue()` para aceptar `X`/`x` como `true`

- **Status**: [ ]
- **Component(s)**: `dashboard-assets/workbook-gateway.js`
- **Requirements**: FR-01
- **Description**: En la función `booleanValue()`, añadir `"x"` al array de valores reconocidos como `true`: `["si", "yes", "true", "1", "x"]`. El cambio también aplica a la columna Bloqueada, ya que ambas usan la misma función. No se cambia ningún otro comportamiento.
- **depends_on**: —
- **Complexity**: S
- **Priority**: P1
- **Verification**:
  - `booleanValue("X")` devuelve `true`, `booleanValue("x")` devuelve `true`.
  - `booleanValue("No")` devuelve `false`, `booleanValue(null)` devuelve `null` (comportamiento previo preservado).
  - Al cargar `diagramaGanttBase.xlsm` con hitos marcados con `X`, el panel de calidad no muestra avisos `INVALID_BOOLEAN`.
  - Evidence: test unitario en `tests/unit/` + `npm test` sin errores.

---

### TASK-002 — Eliminar botón "Copiar imagen para PowerPoint"

- **Status**: [ ]
- **Component(s)**: `dashboard.html`, `dashboard-assets/dashboard-view.js`, `dashboard-assets/app.js`
- **Requirements**: FR-02
- **Description**:
  1. **`dashboard.html`**: Eliminar el elemento `<button class="button button-primary" id="copy-dashboard-button">Copiar imagen para PowerPoint</button>`.
  2. **`dashboard-view.js`**: Eliminar la línea `byId("copy-dashboard-button").addEventListener("click", () => handlers.export?.());`.
  3. **`app.js`**: Eliminar el import de `exportDashboard`, la función `exportCurrentSnapshot`, y el campo `export` del objeto `handlers`. El módulo `presentation-exporter.js` queda en el repositorio (contiene `composeDashboardSvg` y `escapeXml` usadas por tests) pero ya no se importa en `app.js`.
- **depends_on**: —
- **Complexity**: S
- **Priority**: P1
- **Verification**:
  - El dashboard abierto en el navegador no muestra el botón "Copiar imagen para PowerPoint" en ningún estado.
  - La consola del navegador no muestra errores de `null.addEventListener` al cargar.
  - `npm test` pasa sin errores.
  - Evidence: screenshot del header del dashboard + `npm test` green.

---

### TASK-003 — Añadir etiqueta "Avance XX%" en barras SVG del Gantt

- **Status**: [ ]
- **Component(s)**: `dashboard-assets/dashboard-view.js`, `dashboard-assets/dashboard.css`
- **Requirements**: FR-03, NFR-01, NFR-02
- **Description**:
  En `renderGantt()`, dentro del bucle de filas SVG, después de renderizar la barra de progreso (el `rect` con `class="gantt-progress"`), añadir un elemento `<text>` SVG con clase `gantt-progress-label`:
  - `x`: `row.x + row.width + 6` (6 px a la derecha del borde derecho de la barra)
  - `y`: `row.y + 28` (centrado verticalmente en la barra de 24 px de alto, que empieza en `row.y + 12`)
  - Contenido: `` `Avance ${Math.round(progress * 100)}%` ``
  - Solo para tareas que NO son hitos (`!row.task.milestone`).
  
  En `dashboard.css`, añadir:
  ```css
  .gantt-progress-label {
    font-size: 11px;
    fill: #486581;
    dominant-baseline: middle;
    pointer-events: none;
  }
  ```
- **depends_on**: —
- **Complexity**: M
- **Priority**: P1
- **Verification**:
  - En el Gantt, cada barra de tarea muestra el texto "Avance XX%" a su derecha.
  - Una tarea al 55 % muestra "Avance 55%"; al 0 % muestra "Avance 0%"; al 100 % muestra "Avance 100%".
  - Los hitos (rombos) no muestran ningún texto de avance.
  - El texto no se superpone visualmente a otras barras en ninguna escala (día/semana/mes).
  - Evidence: screenshot del Gantt con labels visibles + `npm test` green.

---

### TASK-004 — Añadir nombre de asignado debajo del nombre de tarea en el panel izquierdo

- **Status**: [ ]
- **Component(s)**: `dashboard-assets/dashboard-view.js`, `dashboard-assets/dashboard.css`
- **Requirements**: FR-04, NFR-01, NFR-02
- **Description**:
  En `renderGantt()`, dentro de la creación del `taskItem` (elemento `div.gantt-task-item`), después de `item.append(button)`, añadir un `<span>` con el nombre del asignado si no es `"Sin asignar"`:
  ```js
  if (task.assignee && task.assignee !== "Sin asignar") {
    const assigneeSpan = document.createElement("span");
    assigneeSpan.className = "gantt-task-assignee";
    assigneeSpan.textContent = task.assignee;
    item.append(assigneeSpan);
  }
  ```
  
  En `dashboard.css`, añadir:
  ```css
  .gantt-task-assignee {
    display: block;
    font-size: 0.75em;
    color: #486581;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-inline: 8px;
    margin-top: 2px;
    line-height: 1.2;
  }
  ```
  
  Ajustar `ROW_HEIGHT` en `dashboard-view.js` de `48` a `60` para acomodar la segunda línea de texto (o verificar que el layout existente lo absorbe sin necesidad de cambiar la constante).
- **depends_on**: —
- **Complexity**: M
- **Priority**: P1
- **Verification**:
  - En el panel izquierdo del Gantt, cada tarea con asignado muestra el nombre debajo del nombre de tarea en fuente más pequeña.
  - Las tareas sin asignado (valor `"Sin asignar"`) no muestran texto adicional.
  - El texto del asignado no desborda el contenedor (ellipsis visible si el nombre es largo).
  - La alineación vertical entre el panel de nombres y las barras SVG se mantiene correcta.
  - Evidence: screenshot del panel izquierdo del Gantt + `npm test` green.

---

### TASK-005 — Corregir borrado de fecha al editar parcialmente un campo

- **Status**: [ ]
- **Component(s)**: `dashboard-assets/dashboard-view.js`
- **Requirements**: FR-05
- **Description**:
  **Causa raíz**: En `render()`, los inputs de fecha se sobreescriben en cada render con el valor del estado:
  ```js
  elements.controlDate.value = state.filters.controlDate ?? "";
  elements.dateFrom.value   = state.filters.dateFrom   ?? "";
  elements.dateTo.value     = state.filters.dateTo     ?? "";
  ```
  Cuando el usuario edita parcialmente una fecha (p. ej. cambia solo el mes), el navegador emite `change` con un `value` vacío (fecha incompleta/inválida). `dispatchFilters()` almacena `controlDate: null` en el estado, y el siguiente `render()` sobreescribe el input con `""`, borrando lo que el usuario estaba escribiendo.

  **Fix**: Envolver cada asignación de valor de fecha en una comprobación de foco. Si el input tiene el foco activo (`document.activeElement === el`), no sobreescribir su valor durante el render:
  ```js
  function setDateValue(el, value) {
    if (document.activeElement !== el) {
      el.value = value ?? "";
    }
  }
  // En render():
  setDateValue(elements.controlDate, state.filters.controlDate);
  setDateValue(elements.dateFrom,    state.filters.dateFrom);
  setDateValue(elements.dateTo,      state.filters.dateTo);
  ```
  Con este cambio, mientras el usuario está editando el campo (tiene el foco), el render no interrumpe su edición. Al salir del campo (`blur`), `dispatchFilters()` se habrá disparado con el valor completo y el siguiente render sincronizará correctamente.

  No se requieren cambios en `dashboard.html` ni en `dashboard.css`.
- **depends_on**: —
- **Complexity**: S
- **Priority**: P1
- **Verification**:
  - Con la fecha de control en `2026-04-27`, hacer clic en el campo y cambiar el día a `28` → la fecha pasa a `2026-04-28` sin perder mes ni año.
  - Con la fecha de control en `2026-04-27`, cambiar el mes a `05` → la fecha pasa a `2026-05-27` sin perder día ni año.
  - Con la fecha de inicio del intervalo planificado rellena, cambiar solo el mes → el día y el año se conservan.
  - Evidence: prueba manual en el navegador + `npm test` green.

---

### TASK-006 — Actualizar tests unitarios e integración para los cambios

- **Status**: [ ]
- **Component(s)**: `tests/unit/`, `tests/integration/`, `tests/e2e/`
- **Requirements**: FR-01 a FR-05, QG7.1, QG7.4
- **Description**:
  1. **TASK-001**: Añadir casos de test en `tests/unit/` para `booleanValue("X")` → `true`, `booleanValue("x")` → `true`, y confirmar que los casos previos siguen pasando.
  2. **TASK-002**: Actualizar cualquier test E2E o de integración que haga referencia a `#copy-dashboard-button` para eliminar esa referencia o marcarla como `removed`.
  3. **TASK-003**: Añadir test de integración que verifique que el DOM del Gantt contiene elementos con clase `gantt-progress-label` y texto `"Avance XX%"` para una tarea con avance conocido.
  4. **TASK-004**: Añadir test de integración que verifique que el DOM del Gantt contiene elementos con clase `gantt-task-assignee` con el nombre del asignado, y que NO aparecen para tareas con asignado `"Sin asignar"`.
  5. **TASK-005**: Añadir test unitario para la función `setDateValue` — verificar que no sobreescribe el input cuando tiene el foco activo, y que sí lo actualiza cuando no tiene foco.
  6. Ejecutar `npm test` y verificar que la cobertura no baja del umbral del 80 %.
- **depends_on**: TASK-001, TASK-002, TASK-003, TASK-004, TASK-005
- **Complexity**: M
- **Priority**: P1
- **Verification**:
  - `npm test` ejecuta lint + unit + integration sin errores.
  - Cobertura de statements ≥ 80 %.
  - Evidence: salida de `npm test` con todas las suites en verde.

---

## Open Questions / Pending Decisions

| ID | Question | Status | Resolution | Owner | Target phase |
|---|---|---|---|---|---|
| Q-000 | No open questions. | cancelled | Not applicable | Agent | Phase 4 |

---

## Sizing & Split Decision

- Metrics: tasks=6, effort_est=~3h (3×S + 3×M), L_tasks=0, domains=1
- Sizing gates triggered: ninguno (≤20 tasks, ≤40h, 0 L tasks)
- Decision: **monolith** — 6 tareas todas S/M en un único componente web-standalone.
- Justification: todos los cambios son locales a ficheros existentes; no hay nueva deuda técnica
