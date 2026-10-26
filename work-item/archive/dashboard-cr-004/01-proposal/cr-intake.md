---
template: cr-intake
version: 1.0.0
track: change-request
phase: "01"
---

# Change Request Intake — CR-004: Secciones colapsables en el Gantt

**Date**: 2026-10-26  
**Requestor**: Usuario / Producto  
**Priority**: Medium  
**Target Release**: siguiente versión estable

---

## 1. Current Behavior

El Gantt del cuadro de mando lee tareas del libro Excel y las muestra como filas en la línea temporal. No se hace distinción entre tareas normales y filas de sección (agrupadores). Las filas de sección existen en el Excel pero son ignoradas o tratadas como tareas inválidas (sin fecha de inicio, fin, duración ni asignado), por lo que quedan excluidas del diagrama y no aportan contexto de agrupación.

## 2. Requested Change

1. **Lectura de secciones**: identificar en el Excel las filas que actúan como agrupadores de sección (sin asignado, sin duración, sin fecha de inicio ni fin) y leerlas como entidades de tipo `section`.
2. **Visualización en el Gantt**: representar cada sección como una cabecera sombreada que ocupa el ancho completo del diagrama, visualmente diferenciada de las tareas normales.
3. **Colapsar / expandir**: cada sección tiene un control (botón/icono) que permite ocultar o mostrar las tareas que pertenecen a ella. Las tareas de una sección son las filas que la siguen hasta la siguiente sección o el final del listado.

## 3. Business Justification

Los proyectos con muchas tareas agrupadas en fases o módulos son difíciles de leer en un Gantt plano. Las secciones colapsables permiten al usuario centrarse en el área de interés y mantener la misma estructura de agrupación que ya existe en el Excel, sin tener que reorganizar el libro.

## 4. Affected Systems / Components

| Component | Type of Change |
| --------- | -------------- |
| `dashboard-assets/workbook-gateway.js` | Añadir detección y lectura de filas de sección |
| `dashboard-assets/planning-domain.js` | Extender el modelo de tarea para soportar `type: section` y jerarquía |
| `dashboard-assets/dashboard-view.js` | Renderizar cabeceras de sección en el Gantt y gestionar colapso/expansión |
| `dashboard-assets/dashboard-state.js` | Gestionar estado de secciones colapsadas |
| `dashboard-assets/dashboard.css` | Estilos para la cabecera de sección y estado colapsado |

## 5. Scope Constraints

- **In scope**:
  - Detección de filas de sección en el Excel (sin asignado, sin duración, sin fecha inicio/fin).
  - Renderizado de sección como cabecera sombreada en el Gantt (panel izquierdo y área SVG).
  - Control de colapsar/expandir por sección (estado en memoria, no persistido).
  - El estado colapsado filtra las tareas del panel izquierdo y sus barras SVG.
- **Out of scope**:
  - Persistencia del estado colapsado entre sesiones.
  - Secciones anidadas (más de un nivel de jerarquía).
  - Modificación de la lógica de KPIs (las métricas se calculan sobre tareas, no sobre secciones).

## 6. Architecture Impact

Does this CR require architecture or design changes?

- [ ] No — skip Phase 3, proceed to Phase 4
- [x] Yes — Phase 3 (Design) is required

_Justificación_: se introduce un nuevo tipo de entidad (`section`) en el modelo de datos, se modifica el pipeline de lectura del workbook, se añade estado de UI (colapso) al store, y se cambia el renderizado del Gantt. El impacto es suficiente para requerir una decisión de diseño documentada.

## 7. Acceptance Criteria

1. Las filas de sección del Excel (sin asignado, sin duración, sin fecha inicio ni fin) son leídas y representadas como secciones en el Gantt.
2. Cada sección aparece como una cabecera sombreada que abarca el ancho completo del diagrama Gantt.
3. Un control visible en la cabecera de sección permite colapsar y expandir las tareas de esa sección.
4. Al colapsar una sección, sus tareas desaparecen del panel izquierdo y del área SVG del Gantt.
5. Al expandir una sección, las tareas vuelven a ser visibles.
6. Las métricas del cuadro de mando (KPIs) no se ven afectadas por el estado colapsado.
7. El comportamiento es accesible: el control de colapso es operable por teclado y tiene etiqueta ARIA adecuada.

## 8. Dependencies / Risks

| Risk | Mitigation |
| ---- | ---------- |
| La detección de secciones puede variar según el libro Excel del usuario | Definir criterio estricto y documentarlo; añadir aviso de calidad si una fila queda sin clasificar |
| El colapso cambia la altura total del SVG dinámicamente | Recalcular el layout del Gantt al cambiar el estado de colapso |
| Accesibilidad del control de colapso en SVG | Implementar el control en el panel HTML izquierdo, no dentro del SVG |

---

## 9. Open Questions

| ID | Question | Status | Resolution | Owner | Target phase |
| --- | --- | --- | --- | --- | --- |
| Q-001 | ¿El criterio de detección de sección es exclusivamente "sin asignado + sin duración + sin fecha inicio + sin fecha fin"? ¿O hay algún campo adicional (p.ej. columna de tipo) que pudiera existir en el Excel? | closed | Confirmado por el usuario: el criterio es "sin asignado, sin duración, sin fecha inicio ni fin". | Usuario | Phase 1 |

---

## Approval

| Role      | Name | Status   | Date |
| --------- | ---- | -------- | ---- |
| Requestor | Usuario | Approved | 2026-10-26 |
| Tech Lead |      | Pending  |      |
