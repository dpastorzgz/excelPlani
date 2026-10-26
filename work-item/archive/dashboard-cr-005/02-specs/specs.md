---
template_id: specs
version: "1.0"
track: change-request
project_slug: dashboard-cr-005
created: "2026-10-26"
updated: "2026-10-26"
---

# Specifications — CR-005: Gantt Vista Completa Expandida

## 1. Overview

- **Goal**: Proporcionar un modo de visualización expandida del Gantt que muestre el plan completo en pantalla, con escala ajustable y capacidad de ocultar tareas individuales a demanda, sin afectar los KPIs ni el Gantt normal.
- **Stakeholders / users**: Usuario final del cuadro de mando que necesita una vista de alto nivel del plan completo.
- **In scope**: botón de apertura, overlay modal, escala propia (Día/Mes/Año), ocultación de tareas individuales, respeto de filtros y colapso de secciones del Gantt normal.
- **Out of scope**: persistencia de ocultación, exportación desde la vista completa, edición de datos, impacto en KPIs.

---

## 2. Functional Requirements (FR)

### FR-01 (P1) — Botón de apertura de la vista completa
- **Description**: La barra de herramientas del Gantt incluye un botón "Vista completa" (separado de los controles de escala existentes, a la derecha) que abre el overlay de vista completa.
- **Acceptance Criteria**:
  - *Given* el Gantt está cargado con tareas, *When* el usuario pulsa "Vista completa", *Then* el overlay aparece ocupando toda la pantalla.
  - *Given* el overlay está abierto, *When* el usuario pulsa el botón de cierre o la tecla Escape, *Then* el overlay se cierra y el foco vuelve al botón de apertura.
- **Notes**: El botón es visible independientemente del estado de los filtros.

### FR-02 (P1) — Overlay de vista completa — contenido
- **Description**: El overlay muestra el Gantt con todas las tareas, secciones e hitos actualmente visibles según los filtros activos y el estado de colapso de secciones del Gantt normal.
- **Acceptance Criteria**:
  - *Given* el Gantt normal muestra N filas (tareas + secciones visibles), *When* se abre la vista completa, *Then* la vista completa muestra las mismas N filas en el mismo orden.
  - *Given* una sección está colapsada en el Gantt normal, *When* se abre la vista completa, *Then* la sección también aparece colapsada (con su barra resumen) en la vista completa.
  - *Given* un filtro de asignado activo en el Gantt normal, *When* se abre la vista completa, *Then* la vista completa respeta el mismo filtro.
- **Notes**: La vista completa es de solo lectura respecto a filtros y colapso de secciones; esos controles se gestionan en el Gantt normal.

### FR-03 (P1) — Escala propia de la vista completa
- **Description**: La vista completa tiene su propio selector de escala (Día / Mes / Año), independiente del selector de escala del Gantt normal. El estado inicial de la escala en la vista completa es "Mes".
- **Acceptance Criteria**:
  - *Given* la vista completa está abierta, *When* el usuario selecciona "Año", *Then* el SVG se recalcula con píxeles/día reducidos para mostrar el intervalo completo; el Gantt normal mantiene su escala sin cambios.
  - *Given* la vista completa está abierta en escala "Día", *When* se cierra y se vuelve a abrir, *Then* la escala se restablece a "Mes" (estado inicial).
- **Notes**: La escala "Año" usa el mismo mecanismo de `computeGanttLayout` con un valor de `pixelsPerDay` muy reducido; no agrega datos.

### FR-04 (P1) — Ocultación de tareas a demanda
- **Description**: En la vista completa, cada fila de tarea tiene un control (checkbox o botón toggle) que permite ocultarla de la vista. Las secciones no se pueden ocultar individualmente (solo colapsar desde el Gantt normal).
- **Acceptance Criteria**:
  - *Given* la vista completa está abierta, *When* el usuario oculta una tarea, *Then* la tarea desaparece de la lista y del SVG de la vista completa; la tarea permanece visible en el Gantt normal.
  - *Given* una tarea ocultada en la vista completa, *When* el usuario la vuelve a mostrar, *Then* reaparece en su posición original.
  - *Given* hay tareas ocultas en la vista completa, *When* se cierra y se vuelve a abrir, *Then* el estado de ocultación se reinicia (todas las tareas visibles).
  - *Given* hay tareas ocultas en la vista completa, *When* se cambia de proyecto, *Then* el estado de ocultación se reinicia.
- **Notes**: Los KPIs del cuadro de mando nunca se ven afectados por la ocultación.

### FR-05 (P1) — KPIs inalterados
- **Description**: Las métricas del cuadro de mando (KPIs) no se modifican por el estado de la vista completa, la escala propia ni la ocultación de tareas.
- **Acceptance Criteria**:
  - *Given* tareas ocultas en la vista completa, *When* se consultan los KPIs, *Then* los valores son idénticos a cuando no hay ocultación.

### FR-06 (P1) — Accesibilidad del overlay
- **Description**: El overlay de vista completa es accesible: gestiona el foco correctamente (foco atrapado dentro del overlay mientras está abierto), tiene rol ARIA de diálogo, etiqueta y botón de cierre operable por teclado con Escape.
- **Acceptance Criteria**:
  - *Given* el overlay está abierto, *When* el usuario navega con Tab, *Then* el foco no sale del overlay.
  - *Given* el overlay está abierto, *When* el usuario pulsa Escape, *Then* el overlay se cierra y el foco vuelve al botón de apertura.
  - *Given* el overlay se abre, *When* se renderiza, *Then* el foco se mueve automáticamente al primer elemento interactivo del overlay (botón de cierre o control de escala).

---

## 3. Non-Functional Requirements (NFR)

- **NFR-01**:
  - Category: Performance
  - Requirement: El SVG de la vista completa debe renderizarse en menos de 500 ms para planes de hasta 200 filas en escala "Mes".
  - Metric: tiempo desde apertura hasta SVG renderizado < 500 ms.

- **NFR-02**:
  - Category: Accessibility
  - Requirement: El overlay cumple WCAG 2.1 AA: `role="dialog"`, `aria-modal="true"`, `aria-label` descriptivo, foco gestionado.
  - Metric: inspección de atributos ARIA y prueba de navegación por teclado.

- **NFR-03**:
  - Category: Maintainability
  - Requirement: El renderizado de la vista completa reutiliza `computeGanttLayout` y `buildGanttEntries` sin duplicar lógica.
  - Metric: ninguna función de cálculo de layout duplicada.

---

## 4. User Stories / Use Cases

### UC-01 — Ver el plan completo en pantalla

- **Actor**: Usuario del cuadro de mando.
- **Preconditions**: El libro está cargado, hay tareas visibles.
- **Main flow**:
  1. El usuario pulsa "Vista completa" en la barra del Gantt.
  2. El overlay cubre toda la pantalla mostrando el plan completo.
  3. El usuario cambia la escala a "Año" para ver el proyecto entero de un vistazo.
  4. El usuario cierra el overlay.
- **Acceptance Criteria**: el overlay muestra todas las filas visibles con la escala seleccionada.

### UC-02 — Focalizar la vista en un subconjunto de tareas

- **Actor**: Usuario del cuadro de mando.
- **Preconditions**: La vista completa está abierta con múltiples tareas.
- **Main flow**:
  1. El usuario oculta tareas que no son relevantes para la revisión actual.
  2. La vista completa se actualiza mostrando solo las tareas no ocultadas.
  3. Al cerrar y volver a abrir, las tareas ocultas vuelven a ser visibles.
- **Acceptance Criteria**: ocultación instantánea, sin impacto en KPIs, estado reseteado al cerrar.

---

## 5. Integrations & Dependencies

- Systems involved: estado del store (filtros, secciones colapsadas, tareas derivadas) → vista completa.
- Data that flows: `visibleDerivedTasks` + `sections` + `collapsedSections` del store principal → vista completa.
- Constraints: la vista completa no modifica el store principal; lee del store y gestiona su propio estado local (escala, tareas ocultas).

---

## 6. Security & Access Principles

- Sin cambios respecto al comportamiento actual. El nombre de tarea se renderiza con `textContent` (seguro).

---

## 7. Assumptions

- La escala "Año" usa el mismo `computeGanttLayout` con un `scalePixels("year")` muy reducido (ej. 1–2 px/día).
- El estado de la vista completa (escala propia, tareas ocultas) se gestiona fuera del store Redux-like principal, como estado local del componente de vista, para no contaminar el estado global.
- El overlay no duplica los controles de filtro del panel izquierdo; el usuario aplica filtros desde el Gantt normal antes de abrir la vista completa.

---

## 8. Open Questions

| ID | Question | Status | Resolution | Owner | Target phase |
| --- | --- | --- | --- | --- | --- |
| Q-001 | ¿El estado de ocultación de tareas debe gestionarse en el store global o en estado local del componente vista? | closed | Estado local del componente vista (no en el store), para mantener el store global limpio y no afectar los KPIs bajo ninguna circunstancia. | Agente | Phase 2 |

---

## 9. Sizing & Split Decision

- Metrics: FRs=6, P1=6, UCs=2, domains=2 (estado local + renderizado overlay)
- Sizing gates triggered: none
- Decision: monolith
- Justification: todos los cambios son en el mismo repositorio, tecnología y capa UI; el dominio no se modifica.

---

## 10. Approval

- **Status**: Draft
- **Approved by**: —
- **Date**: —
