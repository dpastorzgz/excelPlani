---
template_id: task-list
version: "1.1"
track: change-request
project_slug: dashboard-cr-005
created: "2026-10-26"
updated: "2026-10-26"
---

# Atomic Task List — CR-005: Gantt Vista Completa Expandida

**Track**: change-request | **Phase**: 4 — Atomic Tasks | **Project**: dashboard-cr-005

---

## Legend

- **Status**: `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked
- **Complexity**: S (< 30 min) · M (30–90 min) · L (90–120 min, max 2h)
- **Priority**: P1 critical · P2 high · P3 normal
- **depends_on**: lista de TASK-IDs que deben completarse antes

---

## Summary Table

| Task | Title | Component | Complexity | Priority | Depends on | Status |
|---|---|---|---|---|---|---|
| TASK-001 | Añadir escala "year" a scalePixels | CMP-02 | S | P1 | — | [ ] |
| TASK-002 | Estructura HTML del dialog de vista completa | CMP-01 | M | P1 | — | [ ] |
| TASK-003 | Botón "Vista completa" en la toolbar del Gantt | CMP-01 | S | P1 | TASK-002 | [ ] |
| TASK-004 | Función openFullGantt / closeFullGantt con gestión de foco | CMP-02 | M | P1 | TASK-002, TASK-003 | [ ] |
| TASK-005 | renderFullGantt: layout + SVG usando estado local | CMP-02 | M | P1 | TASK-001, TASK-004 | [ ] |
| TASK-006 | Selector de escala propio en la vista completa | CMP-02 | S | P1 | TASK-005 | [ ] |
| TASK-007 | Toggle de ocultación de tarea por fila en la vista completa | CMP-02 | M | P1 | TASK-005 | [ ] |
| TASK-008 | Reinicio del estado de ocultación al abrir y al cambiar proyecto | CMP-02 | S | P1 | TASK-007 | [ ] |
| TASK-009 | Estilos CSS del dialog y controles de vista completa | CMP-03 | M | P2 | TASK-005, TASK-007 | [ ] |

---

## Tasks

### TASK-001 — Añadir escala "year" a scalePixels

- **Status**: [ ]
- **Component(s)**: CMP-02 (`dashboard-assets/dashboard-view.js`)
- **Requirements**: FR-03
- **Description**: En `scalePixels`, añadir `year: 1` a la tabla de escala. Esto permite pasar `scale: "year"` a `computeGanttLayout` y obtener 1 px/día, mostrando el proyecto completo en poco espacio horizontal.
- **depends_on**: —
- **Complexity**: S
- **Priority**: P1
- **Verification**:
  - Evidence: `computeGanttLayout([task], { scale: "year" })` retorna `pixelsPerDay` igual o próximo a 1.
  - Command: test unitario manual o inspección en navegador.

---

### TASK-002 — Estructura HTML del dialog de vista completa

- **Status**: [ ]
- **Component(s)**: CMP-01 (`dashboard.html`)
- **Requirements**: FR-01, FR-02, FR-06
- **Description**: Añadir `<dialog id="full-gantt-dialog" aria-label="Gantt completo del proyecto">` con la estructura interna: cabecera `.full-gantt-header` (título h2, segmented-control de escala con botones día/mes/año, botón cierre `id="full-gantt-close"`), shell `.full-gantt-shell` con panel izquierdo `id="full-gantt-task-list"` y área derecha con `svg id="full-gantt-chart"` dentro de un `div.full-gantt-timeline-pane id="full-gantt-scroll-region"`.
- **depends_on**: —
- **Complexity**: M
- **Priority**: P1
- **Verification**:
  - Evidence: el elemento `<dialog id="full-gantt-dialog">` existe en el DOM con la estructura correcta.
  - Command: inspección DOM.

---

### TASK-003 — Botón "Vista completa" en la toolbar del Gantt

- **Status**: [ ]
- **Component(s)**: CMP-01 (`dashboard.html`)
- **Requirements**: FR-01
- **Description**: Añadir `<button type="button" id="full-gantt-open-button" class="button button-secondary">Vista completa</button>` en `.gantt-toolbar`, a la derecha del segmented-control de escala existente.
- **depends_on**: TASK-002
- **Complexity**: S
- **Priority**: P1
- **Verification**:
  - Evidence: el botón aparece en la barra del Gantt; es visualmente distinguible del selector de escala.
  - Command: inspección visual en navegador.

---

### TASK-004 — Función openFullGantt / closeFullGantt con gestión de foco

- **Status**: [ ]
- **Component(s)**: CMP-02 (`dashboard-assets/dashboard-view.js`)
- **Requirements**: FR-01, FR-06
- **Description**: Dentro de `createDashboardView`, declarar variables de closure `let fullGanttScale = "month"` y `let hiddenTaskIds = new Set()`. Implementar `openFullGantt()`: reinicia `hiddenTaskIds`, restablece `fullGanttScale = "month"`, llama a `fullGanttDialog.showModal()` y mueve el foco a `#full-gantt-close`. Implementar `closeFullGantt()`: llama a `fullGanttDialog.close()` y devuelve el foco a `#full-gantt-open-button`. Conectar el botón de apertura, el botón de cierre y el evento `cancel` del dialog a estas funciones.
- **depends_on**: TASK-002, TASK-003
- **Complexity**: M
- **Priority**: P1
- **Verification**:
  - Evidence: al pulsar "Vista completa", el dialog se abre y el foco está en el botón de cierre; al pulsar Escape o el botón de cierre, el dialog se cierra y el foco vuelve al botón de apertura.
  - Command: prueba manual con teclado.

---

### TASK-005 — renderFullGantt: layout + SVG usando estado local

- **Status**: [ ]
- **Component(s)**: CMP-02 (`dashboard-assets/dashboard-view.js`)
- **Requirements**: FR-02, FR-03
- **Description**: Implementar `renderFullGantt(state)`. Filtrar `state.visibleDerivedTasks` excluyendo `hiddenTaskIds` → `fullVisibleTasks`. Llamar a `buildGanttEntries(state.sections, fullVisibleTasks, state.derivedTasks, state.collapsedSections)`. Llamar a `computeGanttLayout(entries, { controlDate: state.filters.controlDate, scale: fullGanttScale, viewport: {} })`. Renderizar la lista HTML en `#full-gantt-task-list` (secciones + tareas, sin toggle de ocultación aún). Renderizar el SVG en `#full-gantt-chart`. Llamar a `renderFullGantt(state)` desde `render(state)` solo si `fullGanttDialog.open === true`.
- **depends_on**: TASK-001, TASK-004
- **Complexity**: M
- **Priority**: P1
- **Verification**:
  - Evidence: al abrir la vista completa, el SVG muestra todas las filas visibles con la escala "Mes" por defecto.
  - Command: inspección visual en navegador.

---

### TASK-006 — Selector de escala propio en la vista completa

- **Status**: [ ]
- **Component(s)**: CMP-02 (`dashboard-assets/dashboard-view.js`)
- **Requirements**: FR-03
- **Description**: Conectar los botones `[data-full-scale]` dentro del dialog a un handler que actualice `fullGanttScale` y llame a `renderFullGantt(store.getState())`. El botón activo se marca con `aria-pressed="true"`.
- **depends_on**: TASK-005
- **Complexity**: S
- **Priority**: P1
- **Verification**:
  - Evidence: al pulsar "Año" en la vista completa, el SVG se recalcula; el Gantt normal no cambia de escala.
  - Command: prueba manual.

---

### TASK-007 — Toggle de ocultación de tarea por fila en la vista completa

- **Status**: [ ]
- **Component(s)**: CMP-02 (`dashboard-assets/dashboard-view.js`)
- **Requirements**: FR-04
- **Description**: Para cada fila de tarea renderizada en `#full-gantt-task-list`, añadir un `<button class="full-gantt-hide-toggle" aria-label="Ocultar tarea [nombre]">` (icono de ojo o "×"). Al pulsar: si el task.id no está en `hiddenTaskIds` → añadir y rellamar `renderFullGantt`; si está → quitar y rellamar. Las tareas ocultas desaparecen tanto del panel izquierdo como del SVG. Las secciones no tienen este control.
- **depends_on**: TASK-005
- **Complexity**: M
- **Priority**: P1
- **Verification**:
  - Evidence: al ocultar una tarea, desaparece del panel y del SVG de la vista completa; el Gantt normal no cambia.
  - Command: prueba manual + inspección DOM.

---

### TASK-008 — Reinicio del estado de ocultación al abrir y al cambiar proyecto

- **Status**: [ ]
- **Component(s)**: CMP-02 (`dashboard-assets/dashboard-view.js`)
- **Requirements**: FR-04 (AC 3 y 4)
- **Description**: En `openFullGantt()`, reiniciar `hiddenTaskIds = new Set()` antes de abrir el dialog (ya incluido en TASK-004 pero se documenta explícitamente). Adicionalmente, suscribir un handler al evento `PROJECT_SELECTED` en el store que llame a `closeFullGantt()` si el dialog está abierto, para garantizar que al cambiar de proyecto la vista completa se cierra y el estado se reinicia.
- **depends_on**: TASK-007
- **Complexity**: S
- **Priority**: P1
- **Verification**:
  - Evidence: al cerrar y reabrir la vista completa, las tareas antes ocultas vuelven a aparecer; al cambiar de proyecto con el dialog abierto, el dialog se cierra.
  - Command: prueba manual.

---

### TASK-009 — Estilos CSS del dialog y controles de vista completa

- **Status**: [ ]
- **Component(s)**: CMP-03 (`dashboard-assets/dashboard.css`)
- **Requirements**: FR-01, FR-06
- **Description**: Añadir estilos: `#full-gantt-dialog` (100vw × 100vh, padding 0, max-width/height 100%); `#full-gantt-dialog::backdrop` (fondo oscuro semitransparente); `.full-gantt-header` (flex, justify-content space-between, padding, border-bottom); `.full-gantt-shell` (grid 2 col, altura `calc(100dvh - cabecera)`); `.full-gantt-task-pane` (mismo estilo que `.gantt-task-pane`); `.full-gantt-timeline-pane` (overflow-x auto); `.full-gantt-hide-toggle` (botón pequeño, transparente, sin borde, color ink-400, hover red).
- **depends_on**: TASK-005, TASK-007
- **Complexity**: M
- **Priority**: P2
- **Verification**:
  - Evidence: el dialog ocupa toda la pantalla, el backdrop oscurece el fondo, los toggles de ocultación son visibles pero discretos.
  - Command: inspección visual en navegador.

---

## Open Questions / Pending Decisions

| ID | Question | Status | Resolution | Owner | Target phase |
|---|---|---|---|---|---|
| Q-001 | Sin preguntas abiertas. | cancelled | Not applicable | Agent | Phase 4 |

---

## Sizing & Split Decision

- Metrics: tasks=9, effort_est=~6h, L_tasks=0, domains=1 (presentación)
- Sizing gates triggered: none
- Decision: monolith
