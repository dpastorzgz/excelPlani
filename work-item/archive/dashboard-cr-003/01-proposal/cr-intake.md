---
template: cr-intake
version: 1.0.0
track: change-request
phase: "01"
---

# Change Request Intake — CR-003: Dashboard — Rediseño de KPIs v3

**Date**: 2026-10-26  
**Requestor**: Responsable del proyecto  
**Priority**: High  
**Target Release**: v0.4.0  

---

## 1. Current Behavior

El cuadro de mando v0.3.0 muestra dos filas de KPIs:

- **Fila 1** (4 cajas): Tareas del proyecto · Completadas a fecha · Porcentaje completado · Vencidas abiertas
- **Fila 2** (3 cajas): Cerradas a tiempo · Cerradas con retraso · En curso retrasadas

El usuario necesita un conjunto de indicadores diferente que refleje mejor el avance temporal del proyecto (cuánto tiempo ha transcurrido y cuánto queda) y una clasificación de tareas más orientada a la gestión operativa.

---

## 2. Requested Change

Sustituir el layout actual de KPIs por:

**Fila 1 (3 cajas — visión temporal del proyecto):**
| Caja | Métrica | Fórmula |
|---|---|---|
| 1 | Número de tareas | Total de tareas en el conjunto filtrado |
| 2 | % tiempo transcurrido | `(controlDate − projectStart) / (projectEnd − projectStart) × 100` |
| 3 | % tiempo restante + días restantes | `100 − % tiempo transcurrido` + `projectEnd − controlDate` en días |

**Fila 2 (4 cajas — clasificación de tareas):**
| Caja | Métrica | Criterio |
|---|---|---|
| 1 | Cerradas a tiempo | `actualClose ≤ fechaFinPlanificada` Y `actualClose ≤ controlDate` |
| 2 | Cerradas con retraso | `actualClose > fechaFinPlanificada` Y `actualClose ≤ controlDate` |
| 3 | Tareas en curso | Tareas sin `actualClose` o con `actualClose > controlDate`, sin importar retraso |
| 4 | En curso retrasadas | Tareas en curso con avance < avance esperado por tiempo transcurrido |

Las cajas "Completadas a fecha", "Porcentaje completado" y "Vencidas abiertas" **desaparecen del área de KPIs visual** (las métricas siguen existiendo internamente para el filtro de completitud y la lógica del Gantt).

---

## 3. Business Justification

- La **fila temporal** da una lectura inmediata de dónde está el proyecto en el calendario: ¿hemos consumido el 60 % del tiempo planificado? ¿Quedan 30 días?
- La **fila de tareas** separa claramente las situaciones que requieren acción (en curso retrasadas) de las informativas (cerradas con retraso, cerradas a tiempo) y da contexto general (tareas en curso).
- Simplificar de 7 cajas a 7 (3+4 en lugar de 4+3) manteniendo el número total pero mejorando la legibilidad.

---

## 4. Affected Systems / Components

| Componente | Tipo de cambio |
|---|---|
| `dashboard-assets/planning-domain.js` — `deriveDashboard()` | Añadir `timeElapsed`, `timeRemaining`, `daysRemaining`, `tasksInProgress` al objeto de métricas |
| `dashboard-assets/dashboard-state.js` | Añadir `projectStart` y `projectEnd` al estado; pasarlos a `deriveDashboard` |
| `dashboard.html` | Reemplazar 4+3 cajas KPI por 3+4; nuevos IDs |
| `dashboard-assets/dashboard-view.js` — `render()` | Actualizar elementos y formato de las 7 cajas |
| `dashboard-assets/dashboard.css` | Ajustar `.kpi-grid` principal a 3 columnas; secundaria a 4 |

---

## 5. Scope Constraints

- **In scope**: rediseño visual del área KPI, nuevas métricas temporales, `projectStart`/`projectEnd` en estado, tests actualizados.
- **Out of scope**: lógica del Gantt, filtros, servidor, clasificación de tareas (no cambia).

---

## 6. Architecture Impact

- [x] No — skip Phase 3, proceed to Phase 4
- [ ] Yes

**Justificación**: Los cambios son extensiones del estado y las métricas existentes. No se añaden nuevos módulos ni se modifican contratos entre módulos salvo la ampliación del objeto de métricas. ADR-0006 se mantiene.

---

## 7. Acceptance Criteria

1. **Fila 1 — Box 1**: Muestra el número total de tareas del conjunto filtrado.
2. **Fila 1 — Box 2**: Muestra el porcentaje de tiempo transcurrido desde `projectStart` hasta `controlDate` sobre la duración total (`projectEnd − projectStart`). Si no hay `projectStart`/`projectEnd` en el workbook, muestra `—`.
3. **Fila 1 — Box 3**: Muestra el porcentaje de tiempo restante (`100 − % tiempo transcurrido`) y, en la nota inferior, el número de días de calendario que quedan desde `controlDate` hasta `projectEnd`.
4. **Fila 2 — Box 1 (Cerradas a tiempo)**: Igual que CR-002 — `completedOnTime`.
5. **Fila 2 — Box 2 (Cerradas con retraso)**: Igual que CR-002 — `completedLate`.
6. **Fila 2 — Box 3 (Tareas en curso)**: Número de tareas abiertas = `total − completed`.
7. **Fila 2 — Box 4 (En curso retrasadas)**: Igual que CR-002 — `behindSchedule`.
8. Las cajas "Completadas a fecha", "Porcentaje completado" y "Vencidas abiertas" ya no aparecen en la UI.

---

## 8. Dependencies / Risks

| Riesgo | Mitigación |
|---|---|
| `projectStart`/`projectEnd` ausentes en el workbook | Mostrar `—` en las métricas temporales; el resto de KPIs siguen funcionando |
| `daysRemaining` negativo si el proyecto está vencido | Mostrar el número negativo o formatear como "−N días" para indicar retraso del proyecto |
| Tests de `dashboard-state` que verifican las métricas actuales | Actualizar para incluir las nuevas métricas; eliminar los KPIs retirados de la UI |

---

## 9. Open Questions

| ID | Question | Status | Resolution | Owner | Target phase |
|---|---|---|---|---|---|
| Q-001 | `daysRemaining` negativo: ¿mostrar valor negativo o etiqueta especial? | resolved | Mostrar el número tal cual (negativo indica retraso del proyecto en días) | User | Phase 1 |

---

## Approval

| Role | Name | Status | Date |
|---|---|---|---|
| Requestor | Responsable del proyecto | Approved | 2026-10-26 |
| Tech Lead | Axet Agent | Approved | 2026-10-26 |
