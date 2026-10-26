---
template: cr-intake
version: 1.0.0
track: change-request
phase: "01"
---

# Change Request Intake — CR-002: Dashboard — Correcciones visuales y nuevas métricas de seguimiento v2

**Date**: 2026-10-26  
**Requestor**: Responsable del proyecto  
**Priority**: High  
**Target Release**: v0.3.0  

---

## 1. Current Behavior

El cuadro de mando v0.2.0 presenta los siguientes comportamientos no deseados:

1. **Hover no cubre el texto del asignado**: Al pasar el cursor por una tarea en el panel izquierdo del Gantt, el fondo de resaltado solo cubre el botón con el nombre de la tarea, pero no la segunda línea con el nombre del asignado.

2. **Hito desalineado y color incorrecto**: El rombo de hito se posiciona en el borde izquierdo de su columna en lugar de estar centrado horizontalmente sobre la fecha del hito. Su color actual es ámbar oscuro en lugar de amarillo.

3. **KPIs de seguimiento insuficientes**: El contador "Retrasadas a fecha" mezcla tareas abiertas vencidas con tareas ya cerradas (aunque tardíamente). Faltan 3 indicadores diferenciados que el usuario necesita para el seguimiento: (a) tareas cerradas a tiempo, (b) tareas cerradas con retraso respecto a la planificación, y (c) tareas en curso cuyo avance real es inferior al avance esperado según el tiempo transcurrido.

---

## 2. Requested Change

| # | Cambio solicitado |
|---|---|
| CR-002-1 | Extender el resaltado de hover/foco al área completa de la fila del Gantt (nombre de tarea + asignado). |
| CR-002-2 | Centrar el rombo de hito horizontalmente sobre su columna de fecha y cambiar su color a amarillo brillante. |
| CR-002-3 | Añadir 3 nuevas tarjetas KPI y ajustar el KPI "Retrasadas": (a) Cerradas a tiempo, (b) Cerradas con retraso, (c) En curso retrasadas por avance. El KPI "Retrasadas a fecha" pasa a contar solo tareas abiertas vencidas. |

---

## 3. Business Justification

- **CR-002-1**: La fila de 60 px incluye el asignado, pero el hover solo cubre la parte superior. El usuario percibe incoherencia visual.
- **CR-002-2**: Los hitos son eventos puntuales; el rombo debe aparecer centrado en el día exacto. El amarillo es la convención visual esperada para distinguir hitos.
- **CR-002-3**: El usuario necesita distinguir tres situaciones operativamente distintas:
  - **Cerradas a tiempo**: éxito de planificación.
  - **Cerradas con retraso**: completadas pero fuera de plazo; información histórica de desviación.
  - **En curso retrasadas por avance**: tareas abiertas cuyo progreso actual es inferior al esperado según el tiempo transcurrido — estas son las que requieren acción inmediata.

---

## 4. Affected Systems / Components

| Componente | Tipo de cambio |
|---|---|
| `dashboard-assets/dashboard.css` | Extender hover/highlight al span de asignado (CR-002-1) |
| `dashboard-assets/dashboard-view.js` — SVG Gantt | Centrar hito; añadir `pixelsPerDay` al layout (CR-002-2) |
| `dashboard-assets/dashboard.css` — `.gantt-milestone` | Color amarillo (CR-002-2) |
| `dashboard-assets/planning-domain.js` — `classifyTaskAtDate()` | Añadir clasificaciones `completedOnTime`, `completedLate`, `behindSchedule`; cambiar `delayed` a solo `overdueWhileOpen` (CR-002-3) |
| `dashboard-assets/planning-domain.js` — `deriveDashboard()` | Añadir métricas `completedOnTime`, `completedLate`, `behindSchedule` al objeto de métricas (CR-002-3) |
| `dashboard-assets/dashboard-view.js` — `render()` | Renderizar las 3 nuevas tarjetas KPI (CR-002-3) |
| `dashboard.html` | Añadir 3 nuevos elementos KPI al HTML (CR-002-3) |
| `dashboard-assets/dashboard-state.js` | Verificar que las nuevas métricas se propagan correctamente |

---

## 5. Scope Constraints

- **In scope**: CSS hover, centrado y color de hito, nuevas clasificaciones en domain, nuevas tarjetas KPI, HTML + estado, tests.
- **Out of scope**: cambio del modelo de datos del workbook, filtros, servidor, exportación.

---

## 6. Architecture Impact

Does this CR require architecture or design changes?

- [x] No — skip Phase 3, proceed to Phase 4
- [ ] Yes — Phase 3 (Design) is required

**Justificación**: Los cambios son extensiones localizadas de módulos existentes. Se añaden campos al objeto de clasificación y al objeto de métricas — ambos son DTOs inmutables sin interfaces formales. La separación de responsabilidades (ADR-0006) se mantiene: la lógica de clasificación permanece en `planning-domain.js`, la renderización en `dashboard-view.js`.

---

## 7. Acceptance Criteria

1. **CR-002-1**: Al pasar el cursor por cualquier fila del Gantt (con o sin asignado), el fondo de resaltado cubre la fila entera (60 px de alto), incluyendo el nombre del asignado cuando está presente.

2. **CR-002-2**: El rombo de hito está centrado horizontalmente sobre la columna del día del hito en las tres escalas (día, semana, mes). El color del rombo es amarillo brillante (`#f5c431` o similar) en estado normal.

3. **CR-002-3a — KPI "Vencidas abiertas"** (renombrado desde "Retrasadas"): Solo cuenta tareas SIN `fechaCierreReal` cuya fecha fin planificada/línea base ya pasó respecto a la fecha de control. Las tareas con `fechaCierreReal` NO aparecen en este contador.

4. **CR-002-3b — KPI "Cerradas a tiempo"** (nuevo): Cuenta tareas con `fechaCierreReal ≤ fechaFinPlanificada` (o línea base) Y `fechaCierreReal ≤ fechaControl`.

5. **CR-002-3c — KPI "Cerradas con retraso"** (nuevo): Cuenta tareas con `fechaCierreReal > fechaFinPlanificada` Y `fechaCierreReal ≤ fechaControl`.

6. **CR-002-3d — KPI "En curso retrasadas"** (nuevo): Cuenta tareas abiertas (`sin fechaCierreReal`, no completedUnknown) donde `completionFraction < clamp((controlDate − plannedStart) / (plannedEnd − plannedStart), 0, 1)`. Las tareas que aún no han empezado (`controlDate < plannedStart`) no se cuentan.

---

## 8. Dependencies / Risks

| Riesgo | Mitigación |
|---|---|
| CR-002-3: Cambiar el campo `delayed` en `classifyTaskAtDate` romperá tests de planning-domain que prueban `completedLate → delayed` | Actualizar tests; el nuevo comportamiento es intencional y documentado |
| CR-002-3: Cambiar el campo `delayed` puede afectar el filtro de completitud "Retrasadas" en el selector de filtros | Verificar que el filtro `completion === "delayed"` sigue funcionando con el nuevo significado |
| CR-002-3d: División por cero si `plannedEnd === plannedStart` (tarea de 0 días) | Tratar como 0 % esperado cuando duración es 0 |
| CR-002-2: Centrado requiere `pixelsPerDay` en el layout; actualizar tests de layout | Añadir `pixelsPerDay` a los tests del objeto layout |

---

## 9. Open Questions

| ID | Question | Status | Resolution | Owner | Target phase |
|---|---|---|---|---|---|
| Q-001 | CR-002-3: ¿Se desea mantener algún indicador visual para tareas cerradas tardíamente? | resolved | El usuario solicita nuevas métricas diferenciadas: Cerradas a tiempo, Cerradas con retraso, En curso retrasadas. No se requiere indicador visual adicional en la barra. | Responsable del proyecto | Phase 1 |

---

## Approval

| Role | Name | Status | Date |
|---|---|---|---|
| Requestor | Responsable del proyecto | Approved | 2026-10-26 |
| Tech Lead | Axet Agent | Approved | 2026-10-26 |
