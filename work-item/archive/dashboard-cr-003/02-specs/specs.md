---
template_id: specs
version: "1.0"
track: "change-request"
project_slug: "dashboard-cr-003"
created: "2026-10-26"
updated: "2026-10-26"
---

# Specifications — Dashboard — Rediseño de KPIs v3

## 1. Overview

- **Goal**: Sustituir el layout de KPIs de 4+3 cajas por 3+4 cajas con métricas temporales en la fila superior y clasificación operativa de tareas en la fila inferior.
- **Stakeholders**: Responsable del proyecto.
- **In scope**: rediseño HTML/CSS del área KPI, nuevas métricas temporales en el dominio y el estado, tests actualizados.
- **Out of scope**: lógica del Gantt, filtros, servidor, clasificación de tareas (sin cambios).

---

## 2. Functional Requirements (FR)

### FR-01 (P1) — Fila superior: 3 cajas de visión temporal

- **Description**: La fila superior del área de KPIs muestra exactamente 3 cajas en lugar de las 4 actuales:
  - **Caja 1 — Tareas del proyecto**: total de tareas en el conjunto filtrado (existente, sin cambios).
  - **Caja 2 — Tiempo transcurrido**: `round((controlDate − projectStart) / (projectEnd − projectStart) × 100)` %. Si `projectStart` o `projectEnd` no están disponibles en el workbook, muestra `—`.
  - **Caja 3 — Tiempo restante**: `100 − % tiempo transcurrido` % (valor KPI) + `projectEnd − controlDate` días (nota inferior). Puede ser negativo si el proyecto está vencido.

- **Acceptance Criteria**:
  - *Given* `projectStart = 2026-01-01`, `projectEnd = 2026-12-31`, `controlDate = 2026-07-02` (~182 días de 365), *When* se cargan los KPIs, *Then* "Tiempo transcurrido" muestra `50 %` (aprox) y "Tiempo restante" muestra `50 %` con nota `183 días`.
  - *Given* workbook sin metadatos de proyecto, *When* se cargan los KPIs, *Then* las cajas 2 y 3 muestran `—`.
  - *Given* `controlDate > projectEnd`, *When* se cargan los KPIs, *Then* "Tiempo restante" muestra un valor negativo de días.

### FR-02 (P1) — Fila inferior: 4 cajas de clasificación de tareas

- **Description**: La fila inferior del área de KPIs muestra 4 cajas:
  - **Caja 1 — Cerradas a tiempo**: `completedOnTime` (sin cambios respecto a CR-002).
  - **Caja 2 — Cerradas con retraso**: `completedLate` (sin cambios respecto a CR-002).
  - **Caja 3 — Tareas en curso**: `total − completed` — número de tareas abiertas independientemente de si están retrasadas o no.
  - **Caja 4 — En curso retrasadas**: `behindSchedule` (sin cambios respecto a CR-002).

- **Acceptance Criteria**:
  - *Given* 10 tareas totales, 3 completadas, 7 abiertas (2 behindSchedule), *Then*: en curso = 7, en curso retrasadas = 2.
  - *Given* 0 tareas abiertas, *Then* "Tareas en curso" muestra `0`.

### FR-03 (P1) — Eliminación de cajas obsoletas de la UI

- **Description**: Las siguientes cajas desaparecen del HTML y del `render()`:
  - "Completadas a fecha" (`#kpi-completed`)
  - "Porcentaje completado" (`#kpi-completion-ratio`)
  - "Vencidas abiertas" (`#kpi-delayed`)
  Las métricas internas correspondientes (`completed`, `completionRatio`, `delayed`) se mantienen en el objeto de métricas para el filtro de completitud y el Gantt; solo desaparecen de la UI.

- **Acceptance Criteria**:
  - *Given* el dashboard abierto, *When* el usuario examina el área de KPIs, *Then* no aparecen las cajas "Completadas a fecha", "Porcentaje completado" ni "Vencidas abiertas".

### FR-04 (P1) — Nuevas métricas en el dominio y el estado

- **Description**: Añadir al objeto de métricas de `deriveDashboard()`:
  - `timeElapsed`: porcentaje entero (0–100+) de tiempo transcurrido, o `null` si faltan fechas del proyecto.
  - `timeRemaining`: `100 − timeElapsed`, o `null`.
  - `daysRemaining`: `ordinal(projectEnd) − ordinal(controlDate)`, entero (puede ser negativo), o `null`.
  - `tasksInProgress`: `total − completed`.
  
  Añadir `projectStart` y `projectEnd` al estado del dashboard (propagados desde `plan`).

- **Acceptance Criteria**:
  - `metrics.timeElapsed` es un número entre −∞ y +∞ (puede superar 100 si la fecha de control es posterior a projectEnd).
  - `metrics.daysRemaining` es un entero.
  - Si `projectStart` o `projectEnd` son `null` (sin metadatos), `timeElapsed`, `timeRemaining` y `daysRemaining` son `null`.

---

## 3. Non-Functional Requirements

### NFR-01 — Rendimiento
El cálculo de las métricas temporales (`timeElapsed`, `daysRemaining`) es O(1) por project; no introduce degradación.

### NFR-02 — Compatibilidad
El objeto de métricas conserva todos los campos existentes (`delayed`, `completed`, `completionRatio`, etc.) para no romper el filtro de completitud ni la lógica del Gantt.

---

## 4. Use Cases

### UC-01 — Lectura rápida del estado temporal en una reunión
**Actor**: Responsable del proyecto.
**Flujo**: El usuario abre el dashboard y de un vistazo ve en la fila superior: "45 tareas · 60 % tiempo transcurrido · 40 % restante / 120 días". Inmediatamente sabe cuánto tiempo le queda.

### UC-02 — Gestión operativa de tareas en curso
**Actor**: Responsable del proyecto.
**Flujo**: El usuario ve en la fila inferior: "Cerradas a tiempo: 12 · Cerradas tarde: 2 · En curso: 8 · En curso retrasadas: 3". Enfoca la acción en las 3 tareas con avance insuficiente.

---

## 5. Integrations & Dependencies
Sin nuevas integraciones. `planning-domain.js` → `dashboard-state.js` → `dashboard-view.js`: ampliación del contrato de métricas; no se eliminan campos.

---

## 6. Security & Access Principles
Sin cambios.

---

## 7. Assumptions
- `projectStart`/`projectEnd` provienen de los metadatos del workbook (celdas "Fecha inicio proyecto" / "Fecha fin visible"). Si no existen, las métricas temporales muestran `—`.
- `daysRemaining` usa días de calendario (no laborables).

---

## 8. Open Questions

| ID | Question | Status | Resolution | Owner | Target phase |
|---|---|---|---|---|---|
| Q-000 | No open questions. | cancelled | Not applicable | Agent | Phase 2 |

---

## 9. Sizing & Split Decision

- Metrics: FRs=4, P1=4, UCs=2, domains=1
- Decision: monolith

---

## 10. Approval

- **Status**: Approved
- **Approved by**: User
- **Date**: 2026-10-26
