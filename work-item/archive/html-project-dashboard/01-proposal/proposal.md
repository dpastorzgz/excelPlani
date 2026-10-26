---
template_id: proposal
version: "1.0"
track: new-feature
project_slug: "html-project-dashboard"
created: "2026-10-23"
updated: "2026-10-23"
---

# Project Proposal — Cuadro de mando HTML para planificación de proyectos

## 1. Summary

- **Problem / Opportunity**: El plan de proyecto reside en un Excel que contiene tareas, responsables, fechas, avance, línea base, cierre real, riesgos, bloqueos e hitos. Falta una vista ejecutiva, interactiva y reutilizable que permita entender la situación del proyecto a una fecha de control y preparar material visual para presentaciones.
- **Proposed solution (high level)**: Crear un cuadro de mando HTML que se mantenga en el mismo directorio que el Excel, permita indicar el nombre del fichero fuente en un único punto de configuración y muestre indicadores y un Gantt interactivo a partir del estado actual del libro.
- **Stakeholder / affected user(s)**: Responsables de proyecto, PMO, responsables de equipo y personas que preparan el seguimiento ejecutivo.
- **Business value**: Reducir el trabajo manual de seguimiento, unificar el cálculo de indicadores, facilitar el análisis por responsable y fecha, y generar una vista clara que pueda reutilizarse en presentaciones.

## 2. Context

- **Current state / existing system**: El libro de referencia `diagramaGanttBase.xlsm` contiene una hoja Gantt con los campos necesarios para el seguimiento, así como hojas de recursos, ausencias e informes. El modelo admite fechas de proyecto y de estado, asignación, duración, inicio, fin, fin de línea base, cierre real, porcentaje completado, estado, riesgo, bloqueo e hitos.
- **Pain points**: Los indicadores y la planificación no están reunidos en una vista HTML moderna; analizar una fecha de corte o un responsable exige manipulación manual; y la salida actual no está optimizada para copiarla a una presentación.
- **Assumptions**:
  - El HTML y el Excel estarán en el mismo directorio operativo.
  - El libro seguirá la estructura funcional de las hojas Gantt del fichero de referencia.
  - El libro puede tener más de una hoja de gantt, pero todas normalizadas con el mismo formato, los nombre de las pestañas del gantt pueden variar
  - Si el libro contiene varias hojas de proyecto con estructura Gantt, el usuario podrá elegir cuál analizar; no se mezclarán proyectos independientes en un total único por defecto.
  - Los cálculos para fechas pasadas se derivarán de los valores que existan actualmente en el Excel. No se reconstruirá un estado histórico que no esté representado por sus fechas y valores actuales.
  - El cuadro de mando será de solo lectura y no modificará el Excel.

## 3. Scope

### In scope

- Configurar en un único punto del código el nombre del Excel fuente situado junto al HTML.
- Cargar y validar el plan seleccionado, mostrando un aviso comprensible cuando falten el fichero, la hoja o datos imprescindibles.
- Seleccionar una fecha de control móvil y recalcular los indicadores con el estado actual del Excel.
- Mostrar cajas de seguimiento con, al menos, tareas totales, tareas completadas a la fecha de control, proporción completadas/total y tareas con retraso a esa fecha.
- Aplicar filtros combinables por persona asignada, intervalo de fechas y estado de completitud; todos los indicadores y el Gantt responderán a los mismos filtros.
- Mostrar un Gantt moderno, legible y accesible con tareas, duración, avance e hitos, conservando una identificación clara de los estados relevantes.
- Permitir elegir la hoja/proyecto cuando exista más de una hoja compatible en el libro.
- Preparar una composición visual que pueda copiarse o capturarse con facilidad para incluirla en PowerPoint, con una vista limpia de presentación.

### Out of scope

- Guardar snapshots, versiones históricas o un registro de cambios del plan.
- Inferir retrospectivamente valores que no puedan derivarse del contenido actual del Excel.
- Editar tareas, recursos o fechas del Excel desde el cuadro de mando.
- Sustituir el Excel como herramienta de planificación o introducir colaboración multiusuario.
- Crear automáticamente un fichero PowerPoint o sincronizarlo con una presentación.

## 4. Constraints

- **Time**: No se ha definido una fecha límite. Se priorizará una primera versión funcional completa frente a extensiones no solicitadas.
- **Budget**: No se ha indicado presupuesto; se evitarán dependencias que requieran licencias de pago.
- **Technology / platform**: Solución web autónoma orientada a navegadores modernos. El HTML deberá convivir con el Excel y el nombre de este se cambiará en un único punto del código. Antes de Diseño se deberá crear el conjunto de reglas `web-standalone` requerido por el framework.
- **Compliance / security**: El procesamiento deberá realizarse localmente y no enviará el contenido del libro a servicios externos.
- **Dependencies**: Disponibilidad de un navegador compatible y de un Excel con la estructura funcional esperada. El flujo de apertura deberá respetar las restricciones de seguridad del navegador sobre ficheros locales.

## 5. Risks

| Risk | Likelihood | Impact | Mitigation |
| ---- | ---------- | ------ | ---------- |
| El navegador impide leer automáticamente un Excel vecino cuando el HTML se abre directamente como fichero local. | Alta | Alta | Definir en Especificaciones y Diseño un flujo local soportado que mantenga el nombre del Excel centralizado y sea sencillo para el usuario. |
| Diferencias entre hojas Gantt o cambios futuros de columnas producen lecturas incorrectas. | Media | Alta | Validar la estructura antes de calcular y mostrar mensajes específicos ante incompatibilidades. |
| La interpretación de “completada a fecha” o “retrasada a fecha” no coincide con el criterio de negocio esperado. | Media | Alta | Formalizar las reglas verificables en Phase 2 usando línea base, cierre real, estado y fecha de control disponibles. |
| Un Gantt con muchas tareas pierde legibilidad al copiarlo a una presentación. | Media | Media | Ofrecer filtros, escala temporal y una vista de presentación que priorice la información visible. |
| Algunos datos actuales carecen de fechas o valores consistentes. | Media | Media | Separar datos válidos de advertencias y evitar que registros incompletos falseen silenciosamente los indicadores. |

## 6. Success criteria

- Una persona puede cambiar el Excel fuente modificando un único valor de configuración y sin buscar referencias adicionales en el código.
- La fecha de control actualiza de forma coherente todas las cajas de seguimiento y el Gantt sin usar snapshots históricos.
- Los indicadores muestran de forma trazable el total de tareas, las completadas a fecha, su proporción y las retrasadas a fecha.
- Los filtros por asignado, fechas y completitud pueden combinarse y afectan de forma consistente a indicadores y Gantt.
- Los hitos se distinguen claramente y el Gantt sigue siendo navegable mediante teclado y comprensible sin depender únicamente del color.
- La vista de presentación puede copiarse o capturarse sin controles innecesarios y conserva textos y cifras legibles al incluirla en PowerPoint.
- El cuadro de mando detecta un Excel u hoja incompatible y explica el problema sin mostrar métricas engañosas.
- Ninguna operación del cuadro de mando modifica el libro fuente ni envía sus datos fuera del equipo.

## 7. Open questions

| ID | Question | Status | Resolution | Owner | Target phase |
| --- | --- | --- | --- | --- | --- |
| Q-000 | No hay preguntas abiertas en la propuesta. Las reglas de cálculo detalladas se formalizarán como requisitos verificables en Phase 2. | cancelled | No aplica | Agent | Phase 1 |

## 8. Sizing & Split Decision

- Metrics: capabilities_in_scope=5, domains=2
- Sizing gates triggered: none
- Decision: monolith
- If epic-split → proposed epic slug + slicing strategy (domain | risk | tech-layer) + estimated children: N/A
- Justification / override: Las capacidades forman un único flujo de lectura, filtrado, cálculo y visualización; no superan el umbral de QG1.8 ni requieren dominios independientes.

## 9. Approval

- **Status**: Approved
- **Approved by**: User
- **Date**: 2026-10-23
