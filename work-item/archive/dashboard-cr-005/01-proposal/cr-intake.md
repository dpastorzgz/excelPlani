---
template: cr-intake
version: 1.0.0
track: change-request
phase: "01"
---

# Change Request Intake — CR-005: Gantt — Vista completa expandida con ocultación de tareas

**Date**: 2026-10-26  
**Requestor**: Usuario / Producto  
**Priority**: Medium  
**Target Release**: siguiente versión estable

---

## 1. Current Behavior

El Gantt del cuadro de mando muestra las tareas, secciones e hitos en un panel scrollable con tres escalas (Día / Semana / Mes). No existe una vista de pantalla completa o "vista completa" que ajuste automáticamente toda la línea temporal al ancho disponible. El usuario no puede ocultar tareas individuales a demanda desde la interfaz.

## 2. Requested Change

1. **Botón "Vista completa"**: añadir un botón separado en la barra de herramientas del Gantt (arriba a la derecha) que abre/cierra una vista expandida del Gantt.
2. **Vista completa — contenido**: en la vista completa se muestran todas las tareas, secciones e hitos visibles actualmente (respetando los filtros activos y el estado de colapso de secciones) con la línea temporal completa ajustada al ancho disponible.
3. **Escala en vista completa**: dentro de la vista completa se ofrece un selector de escala independiente (Día / Mes / Año) para ajustar el nivel de detalle temporal.
4. **Ocultación de tareas a demanda**: en la vista completa, el usuario puede marcar/desmarcar tareas individuales para ocultarlas de la vista, sin afectar los KPIs ni el Gantt normal.

## 3. Business Justification

Los proyectos grandes son difíciles de leer en el panel Gantt integrado en la página. Una vista expandida permite al usuario revisar el plan completo de un vistazo, hacer presentaciones y centrarse en el subconjunto de tareas relevante ocultando las que no necesita ver en ese momento.

## 4. Affected Systems / Components

| Component | Type of Change |
| --------- | -------------- |
| `dashboard.html` | Añadir botón "Vista completa" y el contenedor modal/overlay |
| `dashboard-assets/dashboard-view.js` | Renderizado de la vista completa, escala propia y ocultación de tareas |
| `dashboard-assets/dashboard-state.js` | Gestionar estado `fullGanttOpen`, escala propia de la vista completa y set de tareas ocultas |
| `dashboard-assets/dashboard.css` | Estilos para el overlay/modal de vista completa y controles de ocultación |

## 5. Scope Constraints

- **In scope**:
  - Botón "Vista completa" en la barra del Gantt.
  - Vista completa como overlay/panel expandido que ocupa toda la pantalla o el contenedor principal.
  - Selector de escala propio (Día / Mes / Año) dentro de la vista completa.
  - Checkboxes o toggle por tarea para ocultar/mostrar tareas a demanda dentro de la vista completa.
  - El estado de ocultación es en memoria, no persistido, y no afecta los KPIs.
  - Las secciones y el estado de colapso del Gantt normal se respetan en la vista completa.
- **Out of scope**:
  - Persistencia de la ocultación de tareas entre sesiones.
  - Exportación de la vista completa (existe funcionalidad de exportación separada).
  - Edición de datos de tarea desde la vista completa.
  - La escala de la vista completa no afecta la escala del Gantt normal.

## 6. Architecture Impact

Does this CR require architecture or design changes?

- [x] Yes — Phase 3 (Design) is required

_Justificación_: se introduce un nuevo modo de UI (overlay de vista completa) con estado propio (escala + tareas ocultas), lo que requiere decisiones de diseño sobre cómo extender el store y el renderizador sin acoplar los dos modos de visualización.

## 7. Acceptance Criteria

1. El botón "Vista completa" es visible en la barra de herramientas del Gantt y abre/cierra la vista expandida.
2. La vista completa muestra todas las tareas, secciones e hitos actualmente visibles (respetando filtros y colapso de secciones).
3. La vista completa tiene su propio selector de escala (Día / Mes / Año) independiente del Gantt normal.
4. En la vista completa, cada tarea tiene un control para ocultarla a demanda.
5. Al ocultar una tarea en la vista completa, desaparece solo del Gantt de la vista completa; el Gantt normal y los KPIs no se ven afectados.
6. El estado de ocultación se reinicia al cerrar y volver a abrir la vista completa, o al cambiar de proyecto.
7. La vista completa es accesible: operable por teclado, con etiquetas ARIA correctas y foco gestionado (foco dentro del overlay mientras está abierto; retorno al botón de apertura al cerrar).
8. La vista completa funciona correctamente con el modo de presentación existente (ambos no activos simultáneamente o uno sobreescribe al otro de forma coherente).

## 8. Dependencies / Risks

| Risk | Mitigation |
| ---- | ---------- |
| El overlay de vista completa puede generar problemas de gestión de foco (accesibilidad) | Implementar `focus trap` dentro del overlay y retorno de foco al cerrar |
| El rendimiento del SVG con proyectos grandes en escala "Día" puede ser lento | Reutilizar `computeGanttLayout` existente; el SVG se regenera solo cuando cambia la escala o el contenido |
| La escala propia de la vista completa añade complejidad al estado | Usar un sub-estado aislado en el store (`fullGanttScale`, `hiddenTaskIds`) para no interferir con el estado normal |

---

## 9. Open Questions

| ID | Question | Status | Resolution | Owner | Target phase |
| --- | --- | --- | --- | --- | --- |
| Q-001 | ¿La vista completa debe ser un overlay modal que cubre toda la pantalla, o un panel que sustituye al layout de la página? | closed | Overlay modal que cubre toda la pantalla (100vw × 100vh), con fondo oscuro semitransparente y botón de cierre prominente. | Usuario | Phase 1 |
| Q-002 | ¿La escala "Año" debe mostrar una banda por año con totales, o simplemente escalar el SVG a nivel anual (pixeles/día más pequeños)? | closed | Simplemente escalar el SVG con píxeles/día reducidos para mostrar el intervalo completo en escala anual; sin agregación de datos. | Agente | Phase 1 |

---

## Approval

| Role      | Name | Status   | Date |
| --------- | ---- | -------- | ---- |
| Requestor | Usuario | Approved | 2026-10-26 |
| Tech Lead |      | Pending  |      |
