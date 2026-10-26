---
template: cr-intake
version: 1.0.0
track: change-request
phase: "01"
---

# Change Request Intake — CR-001: Dashboard — Mejoras y correcciones v1

**Date**: 2026-10-26  
**Requestor**: Responsable del proyecto  
**Priority**: Medium  
**Target Release**: v0.2.0  

---

## 1. Current Behavior

El cuadro de mando `html-project-dashboard` v0.1.0 presenta los siguientes comportamientos no deseados:

1. **Validación booleana estricta**: La columna "Hito" (y "Bloqueada") solo acepta `Si/No/True/False/1/0`. El valor `X` — convención habitual en Excel español — genera un aviso `INVALID_BOOLEAN` y el hito no se dibuja como rombo en el Gantt.
2. **Botón "Copiar imagen"**: Existe un botón para copiar la imagen del Gantt al portapapeles para PowerPoint. El usuario no necesita esta función y prefiere eliminarlo para simplificar la interfaz.
3. **Sin indicador de avance en el Gantt**: Las barras del Gantt no muestran el porcentaje de avance de cada tarea. El usuario necesita ver el progreso directamente en la barra.
4. **Sin nombre de asignado en el Gantt**: Las filas del Gantt no muestran la persona asignada a cada tarea. El usuario necesita ver este dato en la vista Gantt.
5. **Selector de fecha de control poco ergonómico**: Al cambiar solo el mes en la fecha de control (o en el intervalo planificado), el componente obliga a reintroducir el día y el año completos. El flujo de trabajo habitual es ajustar solo el mes.

---

## 2. Requested Change

| # | Cambio solicitado |
|---|---|
| CR-001-1 | Ampliar los valores booleanos aceptados en columnas Hito/Bloqueada: añadir `X`, `x` como sinónimo de `true`. Las celdas vacías o con `No`/`0`/`False` siguen siendo válidas sin aviso. |
| CR-001-2 | Eliminar el botón "Copiar imagen para PowerPoint" de la interfaz del dashboard. |
| CR-001-3 | Mostrar el porcentaje de avance a la derecha de cada barra de tarea en el Gantt, con formato `"Avance 55%"`. |
| CR-001-4 | Mostrar el nombre del asignado (`assignee`) a la derecha del nombre de la tarea en cada fila del Gantt. |
| CR-001-5 | Mejorar el componente de fecha de control y de intervalo planificado para permitir cambiar solo el mes sin necesidad de reintroducir día y año. |

---

## 3. Business Justification

- **CR-001-1**: Los Excel de planificación del usuario usan `X` como marcador estándar de hito. La validación actual genera 4 avisos que confunden al operador y los hitos no aparecen como rombos en el Gantt.
- **CR-001-2**: La función de copiar imagen requiere permisos de portapapeles y complejidad que el usuario no usa. Eliminarla reduce la superficie de permisos y simplifica la UI.
- **CR-001-3 y CR-001-4**: El Gantt es el artefacto principal de seguimiento en reuniones. Ver el avance y el asignado directamente en la barra evita consultar la tabla de KPIs para información contextual básica.
- **CR-001-5**: La fecha de control se ajusta frecuentemente (día a día o semana a semana). Tener que reescribir la fecha completa para cambiar solo el mes introduce fricción innecesaria.

---

## 4. Affected Systems / Components

| Componente | Tipo de cambio |
|---|---|
| `dashboard-assets/workbook-gateway.js` — `booleanValue()` | Ampliar tabla de valores aceptados |
| `dashboard-assets/dashboard-view.js` — renderizado Gantt | Añadir texto de avance y asignado; eliminar botón copiar |
| `dashboard-assets/presentation-exporter.js` | Evaluar si el botón copiar está aquí; eliminar entrada de UI |
| `dashboard.html` | Eliminar elemento HTML del botón copiar si existe en markup |
| `dashboard-assets/dashboard.css` | Ajustes de layout para nuevos textos en Gantt |
| Componente de fechas (inputs `<input type="date">` o custom) | Mejorar UX de edición parcial de fecha |

---

## 5. Scope Constraints

- **In scope**:
  - Cambios en `workbook-gateway.js`, `dashboard-view.js`, `dashboard.css`, `dashboard.html` y `presentation-exporter.js` limitados a los 5 puntos descritos.
  - Tests unitarios y de integración actualizados para cubrir los cambios.
- **Out of scope**:
  - Nuevas columnas de datos en el workbook.
  - Cambios en la lógica de dominio (`planning-domain.js`) salvo lo estrictamente necesario para CR-001-1.
  - Funcionalidad de exportación a PDF u otros formatos.
  - Cambios en el servidor local o en los launchers.

---

## 6. Architecture Impact

Does this CR require architecture or design changes?

- [x] No — skip Phase 3, proceed to Phase 4
- [ ] Yes — Phase 3 (Design) is required

**Justificación**: Los 5 cambios son modificaciones localizadas a componentes existentes. No se añaden nuevas dependencias, no se modifican interfaces entre módulos y no se alteran los contratos de `planning-domain.js`. La separación de responsabilidades definida en ADR-0006 (v0.1.0) se mantiene intacta.

---

## 7. Acceptance Criteria

1. **CR-001-1**: Al cargar un Excel con la columna Hito rellena con `X`, el dashboard no muestra ningún aviso `INVALID_BOOLEAN` y las filas marcadas con `X` aparecen como rombos ▲ en el Gantt.
2. **CR-001-2**: El botón "Copiar imagen" / "Copiar para PowerPoint" no aparece en la interfaz del dashboard en ningún estado.
3. **CR-001-3**: Cada barra de tarea en el Gantt muestra el texto `"Avance XX%"` a su derecha, donde `XX` es el valor `completionFraction` de la tarea. Los hitos (rombos) no muestran este texto.
4. **CR-001-4**: Cada fila del Gantt muestra el nombre del asignado **justo debajo del nombre de la tarea**, en un tamaño de fuente ligeramente menor. Si la tarea tiene asignado `"Sin asignar"` (valor por defecto cuando la columna está vacía), no se muestra el texto de asignado.
5. **CR-001-5**: El usuario puede cambiar solo el mes en la fecha de control sin perder el día ni el año ya introducidos. Lo mismo aplica al intervalo planificado (fecha inicio y fecha fin de filtro).

---

## 8. Dependencies / Risks

| Riesgo | Mitigación |
|---|---|
| CR-001-3/4: Textos adicionales en el Gantt pueden solaparse con barras cortas o en vistas de mes/semana con muchas columnas | Usar overflow hidden o truncar el texto con ellipsis; verificar en test E2E con workbook real |
| CR-001-5: Los `<input type="date">` nativos no tienen API para edición parcial en todos los navegadores | Usar el atributo `value` para rellenar el campo con el valor previo y permitir edición; si no es suficiente, evaluar inputs separados día/mes/año |
| CR-001-1: Aceptar `X` como `true` podría causar falsos positivos si el usuario usa `X` para indicar "bloqueada" en sentido negativo | Documentarlo en el README del dashboard; la columna `Bloqueada` también lo acepta como `true` |

---

## 9. Open Questions

| ID | Question | Status | Resolution | Owner | Target phase |
|---|---|---|---|---|---|
| Q-001 | CR-001-4: ¿Mostrar el asignado como texto adicional en la misma celda que el nombre, o en una columna separada a la izquierda del Gantt? | resolved | Justo debajo del nombre de la tarea, en fuente ligeramente más pequeña. Si el asignado es "Sin asignar", no se muestra. | Responsable del proyecto | Phase 1 |

---

## Approval

| Role | Name | Status | Date |
|---|---|---|---|
| Requestor | Responsable del proyecto | Approved | 2026-10-26 |
| Tech Lead | Axet Agent | Approved | 2026-10-26 |
