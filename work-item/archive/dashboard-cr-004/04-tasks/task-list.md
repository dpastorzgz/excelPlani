---
template_id: task-list
version: "1.1"
track: change-request
project_slug: dashboard-cr-004
created: "2026-10-26"
updated: "2026-10-26"
---

# Atomic Task List — CR-004: Secciones colapsables en el Gantt

**Track**: change-request | **Phase**: 4 — Atomic Tasks | **Project**: dashboard-cr-004

---

## Legend

- **Status**: `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked
- **Complexity**: S (< 30 min) · M (30–90 min) · L (90–120 min, max 2h)
- **Priority**: P1 critical · P2 high · P3 normal
- **depends_on**: lista de TASK-IDs que deben completarse antes

---

## Summary Table

| Task     | Title | Component | Complexity | Priority | Depends on | Status |
| -------- | ----- | --------- | ---------- | -------- | ---------- | ------ |
| TASK-001 | Detección y lectura de secciones en workbook-gateway | CMP-01 | M | P1 | — | [x] |
| TASK-002 | Asignación de sectionId a tareas en createProjectPlan | CMP-01 | S | P1 | TASK-001 | [x] |
| TASK-003 | Extensión del estado: sections, collapsedSections, visibleDerivedTasks | CMP-03 | M | P1 | TASK-002 | [x] |
| TASK-004 | Acción SECTION_TOGGLED en dashboardReducer | CMP-03 | S | P1 | TASK-003 | [x] |
| TASK-005 | computeGanttLayout extendido para entradas mixtas (secciones + tareas) | CMP-04 | M | P1 | TASK-003 | [x] |
| TASK-006 | Renderizado de cabeceras de sección en panel HTML izquierdo | CMP-04 | M | P1 | TASK-004, TASK-005 | [x] |
| TASK-007 | Renderizado de bandas de sección en SVG del Gantt | CMP-04 | M | P1 | TASK-005 | [x] |
| TASK-008 | Estilos CSS para secciones y control de colapso | CMP-05 | M | P2 | TASK-006, TASK-007 | [x] |
| TASK-009 | Filtrado de cabecera de sección por filtros de completitud | CMP-04 | S | P2 | TASK-006 | [x] |
| TASK-010 | Tests unitarios: sectionFromRow y detección de secciones | CMP-01 | M | P1 | TASK-001, TASK-002 | [x] |
| TASK-011 | Tests unitarios: dashboardReducer con SECTION_TOGGLED y visibleDerivedTasks | CMP-03 | M | P1 | TASK-003, TASK-004 | [x] |
| TASK-012 | Tests unitarios: computeGanttLayout con entradas mixtas | CMP-04 | M | P1 | TASK-005 | [x] |

---

## Tasks

### TASK-001 — Detección y lectura de secciones en workbook-gateway

- **Status**: [ ]
- **Component(s)**: CMP-01 (`dashboard-assets/workbook-gateway.js`)
- **Requirements**: FR-01, FR-02
- **Description**: Añadir función `sectionFromRow(row, descriptor, sourceRow)` que construye un objeto `{ id, name, sourceRow }`. Añadir predicado interno `isSectionRow(row, headerMap)` que evalúa: `name` no vacío AND `assignee` en blanco AND `durationDays` en blanco AND `plannedStart` en blanco AND `plannedEnd` en blanco.
- **depends_on**: —
- **Complexity**: M
- **Priority**: P1
- **Verification**:
  - Evidence: función `sectionFromRow` exportada o disponible en `createProjectPlan`; predicado `isSectionRow` puro y testeable de forma aislada.
  - Command: `npm test -- --reporter=verbose` sin fallos en los tests de TASK-010.

---

### TASK-002 — Asignación de sectionId a tareas en createProjectPlan

- **Status**: [ ]
- **Component(s)**: CMP-01 (`dashboard-assets/workbook-gateway.js`)
- **Requirements**: FR-02
- **Description**: Modificar el bucle de `createProjectPlan` para: (1) cuando se detecta una fila de sección, crear la sección y actualizar `currentSectionId`; (2) cuando se detecta una tarea, añadir `sectionId: currentSectionId` al objeto de tarea retornado. El objeto plan retornado incluye `sections: Object.freeze(sections)`.
- **depends_on**: TASK-001
- **Complexity**: S
- **Priority**: P1
- **Verification**:
  - Evidence: `createProjectPlan(...)` retorna `{ tasks, sections, ... }` donde cada tarea tiene `sectionId`.
  - Command: `npm test` sin regresiones en los tests existentes de workbook-gateway.

---

### TASK-003 — Extensión del estado: sections, collapsedSections, visibleDerivedTasks

- **Status**: [ ]
- **Component(s)**: CMP-03 (`dashboard-assets/dashboard-state.js`)
- **Requirements**: FR-04, FR-05
- **Description**: Añadir a `createInitialState` y `recalculate` los nuevos campos `sections`, `collapsedSections` y `visibleDerivedTasks`. Añadir función pura `computeVisibleDerivedTasks(derivedTasks, collapsedSections)` que filtra las tareas cuyo `sectionId` está en `collapsedSections`. El campo `metrics` continúa calculándose desde `derivedTasks` completo (invariante ADR-0001). `PROJECT_SELECTED` y `WORKBOOK_LOADED` reinician `sections` y `collapsedSections` a vacío.
- **depends_on**: TASK-002
- **Complexity**: M
- **Priority**: P1
- **Verification**:
  - Evidence: `store.getState()` incluye `sections`, `collapsedSections`, `visibleDerivedTasks` tras `PROJECT_SELECTED`.
  - Command: `npm test` — tests de TASK-011 pasan; `state.metrics` no cambia al colapsar.

---

### TASK-004 — Acción SECTION_TOGGLED en dashboardReducer

- **Status**: [ ]
- **Component(s)**: CMP-03 (`dashboard-assets/dashboard-state.js`)
- **Requirements**: FR-04
- **Description**: Añadir case `SECTION_TOGGLED { sectionId }` al `dashboardReducer`. Alterna la presencia de `sectionId` en el array `collapsedSections` (añade si no está, quita si está) y recalcula `visibleDerivedTasks` via `computeVisibleDerivedTasks`.
- **depends_on**: TASK-003
- **Complexity**: S
- **Priority**: P1
- **Verification**:
  - Evidence: `store.dispatch({ type: "SECTION_TOGGLED", sectionId: "X" })` añade "X" a `collapsedSections`; una segunda llamada lo quita.
  - Command: `npm test` — tests de TASK-011 pasan.

---

### TASK-005 — computeGanttLayout extendido para entradas mixtas

- **Status**: [ ]
- **Component(s)**: CMP-04 (`dashboard-assets/dashboard-view.js`)
- **Requirements**: FR-03
- **Description**: Modificar `computeGanttLayout` para aceptar `entries: [{kind, data}]` en lugar de `tasks`. Las entradas de tipo `"task"` mantienen el cálculo actual (`x`, `width`). Las entradas de tipo `"section"` reciben `{ kind: "section", data, x: 0, y, width: 0, height: ROW_HEIGHT }` (width se resuelve a `layout.width` en el renderizador). El cálculo de `height` del SVG cuenta todas las entradas. El cálculo de `firstTaskX` y `controlX` solo considera entradas de tipo tarea con fechas.
- **depends_on**: TASK-003
- **Complexity**: M
- **Priority**: P1
- **Verification**:
  - Evidence: `computeGanttLayout([{kind:"section",data:{...}}, {kind:"task",data:{...}}], opts)` retorna `rows` con dos elementos, el primero con `kind:"section"`.
  - Command: `npm test` — tests de TASK-012 pasan; tests existentes de computeGanttLayout no regresionan.

---

### TASK-006 — Renderizado de cabeceras de sección en panel HTML izquierdo

- **Status**: [ ]
- **Component(s)**: CMP-04 (`dashboard-assets/dashboard-view.js`)
- **Requirements**: FR-03, FR-04, FR-06
- **Description**: En `renderGantt`, construir la lista de entradas ordenadas por `sourceRow` combinando `state.sections` (filtradas para incluir solo las que tienen al menos una tarea visible en `state.visibleDerivedTasks`) y `state.visibleDerivedTasks`. Renderizar el panel izquierdo: para secciones, `<div class="gantt-section-header" id="section-group-{id}">` con `<button class="gantt-section-toggle" aria-expanded="{bool}" aria-controls="section-group-{id}">` y el nombre de la sección. Para tareas, comportamiento actual. El botón despacha `SECTION_TOGGLED`.
- **depends_on**: TASK-004, TASK-005
- **Complexity**: M
- **Priority**: P1
- **Verification**:
  - Evidence: el DOM del panel izquierdo contiene `.gantt-section-header` con `button[aria-expanded]` para cada sección visible.
  - Command: inspección manual o test E2E básico de renderizado.

---

### TASK-007 — Renderizado de bandas de sección en SVG del Gantt

- **Status**: [ ]
- **Component(s)**: CMP-04 (`dashboard-assets/dashboard-view.js`)
- **Requirements**: FR-03
- **Description**: En el bucle de renderizado SVG de `renderGantt`, para entradas de tipo `"section"`: añadir un `<rect class="gantt-section-band">` de `x=0`, `y=row.y`, `width=layout.width`, `height=ROW_HEIGHT` y un `<text class="gantt-section-label">` con el nombre de la sección. Para entradas de tipo `"task"`: comportamiento actual sin cambios.
- **depends_on**: TASK-005
- **Complexity**: M
- **Priority**: P1
- **Verification**:
  - Evidence: el SVG contiene elementos `rect.gantt-section-band` con `width` igual al ancho total del Gantt para cada sección visible.
  - Command: inspección DOM en navegador o captura de pantalla.

---

### TASK-008 — Estilos CSS para secciones y control de colapso

- **Status**: [ ]
- **Component(s)**: CMP-05 (`dashboard-assets/dashboard.css`)
- **Requirements**: FR-03, FR-06
- **Description**: Añadir los estilos: `.gantt-section-header` (altura 60px, fondo sombreado con `var(--surface-muted)`, borde inferior, sin overflow); `.gantt-section-toggle` (botón sin borde, fondo transparente, chevron ▶/▼ mediante contenido CSS o texto); `.gantt-section-band` (fill `var(--canvas)`, stroke `var(--line)`); `.gantt-section-label` (font-size 12px, font-weight 800, fill `var(--ink-700)`). Animación de chevron reducida con `prefers-reduced-motion`.
- **depends_on**: TASK-006, TASK-007
- **Complexity**: M
- **Priority**: P2
- **Verification**:
  - Evidence: sección visualmente distinguible de tareas; chevron cambia de dirección al colapsar/expandir.
  - Command: inspección visual en navegador.

---

### TASK-009 — Filtrado de cabecera de sección por filtros de completitud

- **Status**: [ ]
- **Component(s)**: CMP-04 (`dashboard-assets/dashboard-view.js`)
- **Requirements**: FR-02 (§8 Q-001 de specs)
- **Description**: Al construir la lista de entradas para el Gantt, una sección solo se incluye si tiene al menos una tarea en `state.visibleDerivedTasks` con `sectionId` coincidente. Si ninguna tarea de la sección pasa el filtro activo (fecha, asignado, completitud), la cabecera de sección no aparece en el panel ni en el SVG.
- **depends_on**: TASK-006
- **Complexity**: S
- **Priority**: P2
- **Verification**:
  - Evidence: al filtrar por `completion: "completed"` con todas las tareas de una sección abiertas, la cabecera de esa sección desaparece del Gantt.
  - Command: prueba manual con filtro de completitud o test de integración.

---

### TASK-010 — Tests unitarios: sectionFromRow y detección de secciones

- **Status**: [ ]
- **Component(s)**: CMP-01 (`tests/unit/`)
- **Requirements**: FR-01, FR-02
- **Description**: Añadir tests en `tests/unit/` para: (a) `isSectionRow` — fila con nombre y sin campos → sección; fila con nombre y con fecha inicio → tarea; fila sin nombre → ignorada. (b) `sectionFromRow` — retorna `{id, name, sourceRow}` correcto. (c) `createProjectPlan` con fixture que incluye secciones: tareas tienen `sectionId` correcto; plan tiene `sections[]`.
- **depends_on**: TASK-001, TASK-002
- **Complexity**: M
- **Priority**: P1
- **Verification**:
  - Evidence: todos los tests de este módulo pasan; cobertura de las funciones nuevas ≥ 85%.
  - Command: `npm test -- --coverage`.

---

### TASK-011 — Tests unitarios: dashboardReducer con SECTION_TOGGLED y visibleDerivedTasks

- **Status**: [ ]
- **Component(s)**: CMP-03 (`tests/unit/`)
- **Requirements**: FR-04, FR-05
- **Description**: Añadir tests para: (a) `computeVisibleDerivedTasks` — array vacío de colapsadas → todas las tareas; una sección colapsada → sus tareas filtradas. (b) `SECTION_TOGGLED` — toggle añade/quita sectionId de `collapsedSections`. (c) `metrics` no cambia al colapsar (invariante ADR-0001). (d) `PROJECT_SELECTED` resetea `collapsedSections` a `[]`.
- **depends_on**: TASK-003, TASK-004
- **Complexity**: M
- **Priority**: P1
- **Verification**:
  - Evidence: todos los tests nuevos pasan; tests existentes de dashboardReducer no regresionan.
  - Command: `npm test -- --coverage`.

---

### TASK-012 — Tests unitarios: computeGanttLayout con entradas mixtas

- **Status**: [ ]
- **Component(s)**: CMP-04 (`tests/unit/`)
- **Requirements**: FR-03
- **Description**: Añadir tests para `computeGanttLayout` con `entries[]`: (a) entrada de tipo `section` genera row con `kind:"section"`, `x:0`, y correcto; (b) entrada de tipo `task` genera row igual que antes; (c) lista mixta produce rows en orden correcto; (d) `height` del SVG = `HEADER_HEIGHT + nEntradas * ROW_HEIGHT`; (e) `firstTaskX` y `controlX` solo dependen de tareas.
- **depends_on**: TASK-005
- **Complexity**: M
- **Priority**: P1
- **Verification**:
  - Evidence: todos los tests nuevos pasan; tests existentes de `computeGanttLayout` no regresionan.
  - Command: `npm test -- --coverage`.

---

## Open Questions / Pending Decisions

| ID | Question | Status | Resolution | Owner | Target phase |
| --- | --- | --- | --- | --- | --- |
| Q-001 | No hay preguntas abiertas. Todas las decisiones de diseño están cerradas en design.md. | cancelled | Not applicable | Agent | Phase 4 |

---

## Sizing & Split Decision

- Metrics: tasks=12, effort_est=~8h, L_tasks=0, domains=2 (lectura + presentación)
- Sizing gates triggered: none
- Decision: monolith
- Justification: 12 tareas atómicas dentro del límite; todas en el mismo repositorio y tecnología; dependencias lineales claras.
