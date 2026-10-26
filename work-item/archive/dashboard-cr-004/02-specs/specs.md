---
template_id: specs
version: "1.0"
track: change-request
project_slug: dashboard-cr-004
created: "2026-10-26"
updated: "2026-10-26"
---

# Specifications — CR-004: Secciones colapsables en el Gantt

## 1. Overview

- **Goal**: Leer las filas de sección del Excel y representarlas en el Gantt como cabeceras agrupadores colapsables, manteniendo la estructura de agrupación ya existente en el libro sin modificar los KPIs ni las reglas de clasificación de tareas.
- **Stakeholders / users**: Usuario final del cuadro de mando que carga un libro Excel con secciones de agrupación.
- **In scope**:
  - Detección de filas de sección en el Excel.
  - Inclusión de secciones en el modelo del plan de proyecto.
  - Renderizado de cabeceras de sección en el panel de tareas y en el área SVG del Gantt.
  - Control de colapso/expansión de secciones con estado en memoria.
  - Accesibilidad del control de colapso por teclado.
- **Out of scope**:
  - Persistencia del estado colapsado entre sesiones o recargas.
  - Secciones anidadas (jerarquía mayor de un nivel).
  - Impacto en los KPIs (las métricas se calculan sobre tareas, no sobre secciones ni estado de colapso).
  - Edición o modificación de secciones desde el cuadro de mando.

---

## 2. Functional Requirements (FR)

### FR-01 (P1) — Detección de filas de sección
- **Description**: El sistema detecta como sección cualquier fila del Excel que tenga un nombre de tarea no vacío y carezca simultáneamente de asignado, duración, fecha de inicio planificada y fecha de fin planificada.
- **Acceptance Criteria**:
  - *Given* una fila con nombre "Fase 1" y sin asignado, duración, inicio ni fin, *When* se carga el libro, *Then* la fila se incluye en el plan como entidad de tipo sección, no como tarea.
  - *Given* una fila con nombre, asignado y fechas, *When* se carga el libro, *Then* la fila se procesa como tarea normal (sin cambio respecto al comportamiento actual).
  - *Given* una fila sin nombre, *When* se carga el libro, *Then* la fila se ignora (comportamiento actual sin cambio).
- **Notes / Dependencies**: La detección se aplica a todas las filas situadas después de la fila de encabezado de la hoja Gantt. Una fila solo puede ser sección o tarea, nunca ambas.

### FR-02 (P1) — Modelo de sección en el plan de proyecto
- **Description**: El plan de proyecto resultante de la carga del libro incluye tanto tareas como secciones, en el orden original del Excel. Cada tarea conoce a qué sección pertenece (la sección más reciente anterior a ella en el listado); las tareas anteriores a cualquier sección no tienen sección asignada.
- **Acceptance Criteria**:
  - *Given* un libro con las filas [Sección A, Tarea 1, Tarea 2, Sección B, Tarea 3], *When* se carga el plan, *Then* Tarea 1 y Tarea 2 pertenecen a Sección A, y Tarea 3 pertenece a Sección B.
  - *Given* un libro con tareas antes de cualquier sección, *When* se carga el plan, *Then* esas tareas tienen sección `null`.
  - *Given* un libro sin ninguna fila de sección, *When* se carga el plan, *Then* el comportamiento es idéntico al actual (ninguna tarea tiene sección).
- **Notes / Dependencies**: Las secciones no participan en `deriveDashboard` ni en los filtros de completitud.

### FR-03 (P1) — Visualización de secciones en el Gantt
- **Description**: Cada sección se muestra como una cabecera sombreada de ancho completo en el panel de tareas (izquierda) y en el área temporal del Gantt (SVG). La cabecera de sección es visualmente distinguible de las filas de tarea normales.
- **Acceptance Criteria**:
  - *Given* un plan con secciones, *When* se renderiza el Gantt, *Then* cada sección aparece como una fila sombreada que ocupa el ancho total del área temporal.
  - *Given* una sección en el panel izquierdo, *When* el usuario la visualiza, *Then* su nombre es visible y está visualmente diferenciada de las tareas.
  - *Given* una sección en el SVG, *When* el usuario la visualiza, *Then* la banda sombreada se extiende desde el borde izquierdo hasta el borde derecho del área temporal, independientemente de la escala.
- **Notes / Dependencies**: Las secciones no tienen barra de progreso ni indicadores de retraso.

### FR-04 (P1) — Control de colapso/expansión
- **Description**: Cada sección dispone de un control visible que permite colapsar (ocultar) o expandir (mostrar) las tareas que le pertenecen. El estado inicial es expandido.
- **Acceptance Criteria**:
  - *Given* una sección expandida, *When* el usuario activa el control de colapso, *Then* todas las tareas de esa sección desaparecen del panel izquierdo y del área SVG, y el control refleja el estado colapsado.
  - *Given* una sección colapsada, *When* el usuario activa el control de expansión, *Then* las tareas de esa sección vuelven a ser visibles, y el control refleja el estado expandido.
  - *Given* el Gantt acaba de cargarse, *When* el usuario lo visualiza, *Then* todas las secciones están expandidas.
  - *Given* el usuario colapsa una sección, *When* recarga el libro o navega a otro proyecto, *Then* el estado colapsado se restablece (todas las secciones expandidas).
- **Notes / Dependencies**: El estado de colapso es en memoria y no se persiste.

### FR-05 (P1) — Las métricas (KPIs) no se ven afectadas
- **Description**: Los KPIs del cuadro de mando se calculan exclusivamente sobre tareas. Las secciones y el estado de colapso no alteran ningún contador ni ratio.
- **Acceptance Criteria**:
  - *Given* un plan con secciones y tareas, *When* el usuario colapsa cualquier sección, *Then* los valores de los KPIs (total, completadas, retrasadas, etc.) no cambian.
  - *Given* un plan sin secciones, *When* se carga, *Then* los KPIs son idénticos al comportamiento actual.
- **Notes / Dependencies**: `deriveDashboard` opera exclusivamente sobre el array de tareas, sin conocimiento de secciones.

### FR-06 (P1) — Accesibilidad del control de colapso
- **Description**: El control de colapso/expansión es operable por teclado y tiene etiqueta ARIA que describe su acción y el nombre de la sección a la que pertenece.
- **Acceptance Criteria**:
  - *Given* un control de colapso, *When* el usuario navega por teclado (Tab/Enter/Space), *Then* puede activar el control sin necesidad de ratón.
  - *Given* un control de colapso, *When* una herramienta de accesibilidad lo lee, *Then* la etiqueta indica el nombre de la sección y el estado (expandido/colapsado).
- **Notes / Dependencies**: El control se implementa en el panel HTML izquierdo, no dentro del SVG, para garantizar compatibilidad con tecnologías de apoyo.

---

## 3. Non-Functional Requirements (NFR)

- **NFR-01**:
  - Category: Performance
  - Requirement: El renderizado del Gantt con secciones no debe introducir una demora perceptible respecto al renderizado actual.
  - Metric / Acceptance Criteria: El tiempo de renderizado con un plan de hasta 200 filas (tareas + secciones) no supera 300 ms en un navegador de referencia.

- **NFR-02**:
  - Category: Maintainability
  - Requirement: La lógica de detección de secciones debe estar encapsulada y ser independiente de la lógica de clasificación de tareas.
  - Metric / Acceptance Criteria: Un cambio en el criterio de detección de secciones no requiere modificar `classifyTaskAtDate` ni `deriveDashboard`.

- **NFR-03**:
  - Category: Accessibility
  - Requirement: El control de colapso debe cumplir WCAG 2.1 nivel AA.
  - Metric / Acceptance Criteria: El control tiene rol semántico correcto (`button`), etiqueta ARIA y estado ARIA (`aria-expanded`).

---

## 4. User Stories / Use Cases

### UC-01 — Visualizar el Gantt con secciones agrupadas

- **Actor**: Usuario del cuadro de mando.
- **Preconditions**: El libro Excel contiene filas de sección (sin asignado/duración/fechas).
- **Main flow**:
  1. El usuario carga el libro Excel.
  2. El sistema detecta las filas de sección e incluye secciones y tareas en el plan.
  3. El Gantt se renderiza mostrando las cabeceras de sección sombreadas con las tareas agrupadas debajo.
- **Alternative flows**:
  - Si el libro no tiene filas de sección, el Gantt se muestra exactamente como antes (sin cambio de comportamiento).
- **Acceptance Criteria**: Las secciones son visibles como cabeceras sombreadas; las tareas aparecen bajo su sección correspondiente.

### UC-02 — Colapsar una sección para focalizarse

- **Actor**: Usuario del cuadro de mando.
- **Preconditions**: El Gantt está cargado con al menos una sección.
- **Main flow**:
  1. El usuario localiza una sección que no necesita visualizar.
  2. El usuario activa el control de colapso de esa sección.
  3. Las tareas de esa sección desaparecen del panel y del SVG.
  4. El Gantt se reajusta para reflejar las filas visibles restantes.
- **Alternative flows**:
  - El usuario vuelve a activar el control para expandir la sección y las tareas vuelven a aparecer.
- **Acceptance Criteria**: El colapso/expansión es instantáneo; los KPIs no cambian.

---

## 5. Integrations & Dependencies

- Systems involved: Libro Excel (.xlsx/.xlsm) → workbook-gateway → planning-domain → dashboard-state → dashboard-view.
- Data that flows: Las filas de sección fluyen desde la lectura del workbook hasta el modelo del plan y de ahí al renderizado del Gantt.
- Constraints: El sistema solo lee el libro (modo solo lectura); las secciones son entidades derivadas de la lectura, no requieren columnas nuevas ni modificación del Excel.

---

## 6. Security & Access Principles

- Access rules: El acceso al cuadro de mando no cambia. Las secciones son datos presentacionales derivados del libro ya cargado.
- Data sensitivity: Sin cambios respecto al comportamiento actual.
- Audit requirements: Sin nuevos requisitos de auditoría.

---

## 7. Assumptions

- El criterio de detección de sección (sin asignado + sin duración + sin fecha inicio + sin fecha fin) es suficiente y estable; no requiere una columna explícita de tipo en el Excel.
- Las secciones no tienen fechas ni duración, por lo que no participan en el cálculo del layout del Gantt (no generan barra temporal).
- La banda sombreada de una sección en el SVG ocupa el ancho total del área temporal visible, sin relacionarse con ninguna coordenada temporal.
- No se requieren secciones anidadas en este CR.

---

## 8. Open Questions

| ID | Question | Status | Resolution | Owner | Target phase |
| --- | --- | --- | --- | --- | --- |
| Q-001 | ¿Cómo debe comportarse el filtro de completitud (`open`, `completed`, `delayed`) cuando una sección tiene todas sus tareas ocultas por el filtro? ¿La cabecera de sección se oculta también o permanece visible? | closed | La cabecera de sección se oculta si ninguna de sus tareas pasa el filtro activo. Si al menos una tarea de la sección pasa el filtro, la cabecera permanece visible. | Agente/Usuario | Phase 2 |

---

## 9. Sizing & Split Decision

- Metrics: FRs=6, P1=6, UCs=2, domains=2 (lectura + presentación)
- Sizing gates triggered: none
- Decision: monolith
- Justification: El alcance es acotado (un nuevo tipo de entidad + estado de UI), todos los cambios están en el mismo repositorio y tecnología, y los dominios afectados son cohesionados.

---

## 10. Approval

- **Status**: Draft
- **Approved by**: —
- **Date**: —
