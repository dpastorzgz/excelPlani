---
template_id: specs
version: "1.0"
track: "change-request"
project_slug: "dashboard-cr-002"
created: "2026-10-26"
updated: "2026-10-26"
---

# Specifications — Dashboard — Correcciones visuales y nuevas métricas de seguimiento v2

## 1. Overview

- **Goal**: Corregir 2 problemas visuales del Gantt y rediseñar los KPIs de seguimiento con 4 indicadores diferenciados.
- **Stakeholders / users**: Responsable del proyecto.
- **In scope**: hover del panel de tareas, alineación y color del hito, lógica de clasificación de tareas, métricas del dashboard, HTML y estado.
- **Out of scope**: modelo de datos del workbook, filtros, servidor, exportación.

---

## 2. Functional Requirements (FR)

### FR-01 (P1) — Hover de fila completa en el panel de tareas del Gantt

- **Description**: El fondo de resaltado al pasar el cursor (o al recibir el foco) sobre una fila del panel izquierdo del Gantt debe cubrir la fila completa de 60 px, incluyendo tanto el nombre de la tarea como el texto del asignado (cuando existe).
- **Acceptance Criteria**:
  - *Given* una fila con nombre de tarea y asignado, *When* el usuario mueve el cursor sobre ella, *Then* el fondo azul claro cubre los 60 px completos de la fila (botón + span del asignado).
  - *Given* una fila sin asignado (solo botón), *When* el cursor pasa sobre ella, *Then* el comportamiento de resaltado no cambia respecto a la versión anterior.
- **Notes**: Cambio CSS: extender la regla `.gantt-task-item.is-highlighted .gantt-task-button` para que el fondo se aplique al `.gantt-task-item` completo.

---

### FR-02 (P1) — Hito centrado y en color amarillo

- **Description**: El rombo de hito en el Gantt SVG debe estar centrado horizontalmente sobre la columna del día al que corresponde el hito, y su color debe ser amarillo brillante (`#f5c431`). En las tres escalas (día, semana, mes) el centro del rombo debe coincidir con el centro de la columna del día del hito.
- **Acceptance Criteria**:
  - *Given* un hito en fecha `2026-05-10` con escala semana, *When* el Gantt se renderiza, *Then* el centro del rombo está alineado horizontalmente con el centro de la columna del día `2026-05-10`.
  - *Given* un hito en cualquier escala, *When* el Gantt se renderiza, *Then* el color del rombo es amarillo brillante (no ámbar oscuro).
  - *Given* un hito retrasado (fecha < controlDate sin cierre real), *When* el Gantt se renderiza, *Then* el color del rombo es rojo (comportamiento `is-delayed` existente, no afectado por este FR).
- **Notes**: Requiere exponer `pixelsPerDay` en el objeto de retorno de `computeGanttLayout()`. El centro del hito debe ser `row.x + pixelsPerDay / 2`.

---

### FR-03 (P1) — Rediseño de clasificación: cuatro categorías diferenciadas

- **Description**: La función `classifyTaskAtDate()` debe producir una clasificación con cuatro categorías mutuamente excluyentes para tareas con `valid: true`:

  | Categoría | Condición |
  |---|---|
  | `completedOnTime` | `actualClose ≤ target` Y `actualClose ≤ controlDate` |
  | `completedLate` | `actualClose > target` Y `actualClose ≤ controlDate` |
  | `overdueWhileOpen` | Sin `actualClose`, sin completionUnknown, `target < controlDate` |
  | `behindSchedule` | Sin `actualClose`, sin completionUnknown, `completionFraction < expectedProgress` |

  Donde `expectedProgress = clamp((controlDate − plannedStart) / (plannedEnd − plannedStart), 0, 1)`.
  
  Una tarea puede ser simultáneamente `overdueWhileOpen` y `behindSchedule` (su fecha ya pasó Y su avance es bajo). El campo `delayed` pasa a ser solo `overdueWhileOpen` (sin `completedLate`).

- **Acceptance Criteria**:
  - *Given* tarea con `actualClose = "2026-06-01"`, `target = "2026-05-31"`, `controlDate = "2026-08-08"`, *Then* `completedLate = true`, `completedOnTime = false`, `delayed = false`.
  - *Given* tarea con `actualClose = "2026-05-30"`, `target = "2026-05-31"`, *Then* `completedOnTime = true`, `completedLate = false`.
  - *Given* tarea abierta, `target = "2026-07-01"`, `controlDate = "2026-08-08"`, `completionFraction = 0.3`, `plannedStart = "2026-01-01"`, `plannedEnd = "2026-12-31"`, *Then* `overdueWhileOpen = false` (target no ha pasado aún en el escenario), `behindSchedule = true` si el avance esperado > 0.3.
  - *Given* tarea abierta, `target = "2026-07-01" < controlDate`, `completionFraction = 0`, *Then* `overdueWhileOpen = true` Y `behindSchedule = true`.
  - *Given* tarea con `completionFraction = 1` sin `actualClose` (completionUnknown), *Then* `behindSchedule = false`, `overdueWhileOpen = false`.
- **Notes**: La división en `expectedProgress` debe evitar división por cero cuando `plannedEnd === plannedStart` (duración 0 → `expectedProgress = 1` si `controlDate ≥ plannedEnd`, else `0`).

---

### FR-04 (P1) — Cuatro KPIs de seguimiento en el dashboard

- **Description**: Los indicadores del dashboard deben mostrar 4 tarjetas en la fila superior (existente) y 3 tarjetas adicionales en una segunda fila:

  **Fila superior (sin cambios de label salvo card 4):**
  1. Tareas del proyecto (total)
  2. Completadas a fecha (todas con `actualClose ≤ controlDate`)
  3. Porcentaje completado (ratio completadas/total)
  4. **"Vencidas abiertas"** (renombrado desde "Retrasadas"): cuenta `overdueWhileOpen`

  **Segunda fila (nueva):**
  5. Cerradas a tiempo (`completedOnTime`)
  6. Cerradas con retraso (`completedLate`)
  7. En curso retrasadas (`behindSchedule`, incluye las que también son `overdueWhileOpen`)

- **Acceptance Criteria**:
  - *Given* 2 tareas completadas a tiempo, 1 completada tarde, 3 abiertas (1 vencida, 2 retrasadas por avance), *When* el dashboard muestra los KPIs, *Then*: Total=6, Completadas=3, Vencidas abiertas=1, Cerradas a tiempo=2, Cerradas con retraso=1, En curso retrasadas=2.
  - *Given* ninguna tarea retrasada, *Then* todos los contadores muestran 0 correctamente (no `—` ni `undefined`).
- **Notes**: La segunda fila de KPIs usa el mismo estilo visual que la primera (`.kpi-card`). Los IDs HTML: `#kpi-closed-on-time`, `#kpi-closed-late`, `#kpi-behind-schedule`. Las métricas `completedOnTime`, `completedLate`, `behindSchedule` se añaden al objeto de métricas de `deriveDashboard()`.

---

## 3. Non-Functional Requirements (NFR)

### NFR-01 — Rendimiento

- **Category**: Performance
- **Requirement**: Los cálculos adicionales de `behindSchedule` y `expectedProgress` no deben introducir degradación perceptible para planes de hasta 200 tareas.
- **Metric**: El Gantt y los KPIs con 200 tareas se renderizan en menos de 1 segundo.

### NFR-02 — Compatibilidad semántica con el filtro "Retrasadas"

- **Category**: Maintainability
- **Requirement**: El filtro de completitud `completion === "delayed"` en `deriveDashboard()` sigue mostrando únicamente las tareas `overdueWhileOpen` (nuevo significado de `delayed`). Los tests del filtro deben actualizarse para reflejar que `completedLate` ya no activa este filtro.

---

## 4. User Stories / Use Cases

### UC-01 — Seguimiento semanal del proyecto

- **Actor**: Responsable del proyecto
- **Preconditions**: Dashboard cargado con `diagramaGanttBase.xlsm`, fecha de control `2026-08-08`.
- **Main flow**:
  1. El usuario ve la segunda fila de KPIs: cerradas a tiempo, cerradas tarde, en curso retrasadas.
  2. Identifica que 2 tareas se cerraron tarde y 1 está en curso con avance insuficiente.
  3. Las 2 tareas que antes aparecían erróneamente como "retrasadas" ya no aparecen en "Vencidas abiertas".
- **Acceptance Criteria**: KPI "Vencidas abiertas" no incluye tareas con `actualClose` informado.

### UC-02 — Lectura visual de hitos en el Gantt

- **Actor**: Responsable del proyecto
- **Preconditions**: Plan con 4 hitos marcados con `X`.
- **Main flow**: El usuario abre el Gantt y ve los rombos amarillos centrados sobre sus fechas exactas.
- **Acceptance Criteria**: 4 rombos amarillos, centrados, sin avisos `INVALID_BOOLEAN`.

---

## 5. Integrations & Dependencies

- Sin nuevas integraciones externas.
- `planning-domain.js` → `dashboard-state.js` → `dashboard-view.js`: el contrato de métricas se amplía con 3 nuevos campos; no se eliminan campos existentes.

---

## 6. Security & Access Principles

- Sin cambios de seguridad. Dashboard sigue siendo local y sin acceso a red exterior.

---

## 7. Assumptions

- `pixelsPerDay` es el mismo para todas las filas del layout en un render dado; añadirlo al objeto de retorno de `computeGanttLayout` es suficiente.
- Una tarea con `plannedEnd === plannedStart` y `controlDate ≥ plannedEnd` sin cierre real se considera con `expectedProgress = 1.0`.
- El texto de los nuevos KPIs ("Cerradas a tiempo", "Cerradas con retraso", "En curso retrasadas") usa el mismo estilo visual que las tarjetas existentes.

---

## 8. Open Questions

| ID | Question | Status | Resolution | Owner | Target phase |
|---|---|---|---|---|---|
| Q-000 | No open questions. | cancelled | Not applicable | Agent | Phase 2 |

---

## 9. Sizing & Split Decision

- Metrics: FRs=4, P1=4, UCs=2, domains=1
- Sizing gates triggered: ninguno
- Decision: **monolith** — todos los cambios en un único repositorio web-standalone.

---

## 10. Approval

- **Status**: Approved
- **Approved by**: User
- **Date**: 2026-10-26
