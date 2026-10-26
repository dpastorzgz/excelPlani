---
template_id: specs
version: "1.0"
track: "change-request"
project_slug: "dashboard-cr-001"
created: "2026-10-26"
updated: "2026-10-26"
---

# Specifications — Dashboard — Mejoras y correcciones v1

## 1. Overview

- **Goal**: Corregir 5 comportamientos no deseados del cuadro de mando v0.1.0 para mejorar la compatibilidad con libros Excel reales, simplificar la interfaz y enriquecer la información visible en el Gantt.
- **Stakeholders / users**: Responsable del proyecto (operador del dashboard local).
- **In scope**: Validación booleana de columnas Hito/Bloqueada; botón de copia de imagen; indicador de avance en Gantt; asignado en Gantt; ergonomía del selector de fechas.
- **Out of scope**: Nuevas columnas de datos, lógica de dominio de fechas, exportación a PDF, servidor local y launchers.

---

## 2. Functional Requirements (FR)

### FR-01 (P1) — Aceptar `X` como valor booleano verdadero en columnas Hito y Bloqueada

- **Description**: El sistema debe reconocer el valor `X` (mayúscula o minúscula) en las columnas Hito y Bloqueada como equivalente a `true` (sí es hito / sí está bloqueada), sin generar ningún aviso de calidad. Los valores `No`, `0`, `False` y celda vacía siguen siendo reconocidos como `false` sin aviso. Cualquier otro valor no reconocido sigue generando `INVALID_BOOLEAN`.
- **Acceptance Criteria**:
  - *Given* un libro Excel con la columna Hito rellena con `X` en 4 filas, *When* el dashboard carga el libro, *Then* no aparece ningún aviso `INVALID_BOOLEAN` y las 4 tareas se renderizan como rombos ▲ en el Gantt.
  - *Given* celdas de Hito vacías, *When* el dashboard carga el libro, *Then* esas tareas se renderizan como barras normales sin ningún aviso.
  - *Given* un valor `x` (minúscula) en la columna Hito, *When* el dashboard carga el libro, *Then* la tarea se renderiza como rombo sin aviso.
- **Notes / Dependencies**: Cambio en `booleanValue()` de `workbook-gateway.js`. El cambio aplica igualmente a la columna Bloqueada.

---

### FR-02 (P1) — Eliminar el botón "Copiar imagen para PowerPoint"

- **Description**: El botón que permite copiar la imagen del Gantt al portapapeles (para uso en PowerPoint) debe eliminarse completamente de la interfaz. No debe aparecer en ningún estado del dashboard (carga inicial, datos cargados, ninguna hoja seleccionada).
- **Acceptance Criteria**:
  - *Given* el dashboard abierto con un libro cargado, *When* el usuario examina la interfaz, *Then* no existe ningún botón con texto o icono relacionado con "copiar imagen", "PowerPoint" o "portapapeles".
  - *Given* el dashboard sin libro cargado, *When* el usuario examina la interfaz, *Then* tampoco existe dicho botón.
- **Notes / Dependencies**: Eliminar el elemento del HTML y el código JavaScript asociado en `dashboard-view.js` y/o `presentation-exporter.js`.

---

### FR-03 (P1) — Mostrar porcentaje de avance en las barras del Gantt

- **Description**: Cada barra de tarea en el Gantt debe mostrar el texto `"Avance XX%"` a la derecha de la barra, donde `XX` es el porcentaje de completitud de la tarea (0–100, entero). Los hitos (rombos ▲) no muestran este texto. Si el texto no cabe a la derecha de la barra por falta de espacio, se trunca con ellipsis o se oculta.
- **Acceptance Criteria**:
  - *Given* una tarea con 55 % de avance, *When* el Gantt se renderiza, *Then* aparece el texto `"Avance 55%"` a la derecha de la barra de esa tarea.
  - *Given* una tarea con 0 % de avance, *When* el Gantt se renderiza, *Then* aparece el texto `"Avance 0%"` a la derecha de la barra.
  - *Given* una tarea marcada como hito, *When* el Gantt se renderiza, *Then* no aparece ningún texto de avance junto al rombo.
  - *Given* una barra muy corta sin espacio a su derecha, *When* el Gantt se renderiza, *Then* el texto no se superpone a otras barras (se oculta o trunca).
- **Notes / Dependencies**: Cambio en el renderizado SVG/HTML del Gantt en `dashboard-view.js` y ajustes de `dashboard.css`.

---

### FR-04 (P1) — Mostrar nombre del asignado debajo del nombre de tarea en el Gantt

- **Description**: En la columna de nombres de tareas del Gantt (panel izquierdo), cada fila debe mostrar el nombre del asignado justo debajo del nombre de la tarea, en un tamaño de fuente ligeramente menor al del nombre de la tarea. Si el asignado es `"Sin asignar"` (valor por defecto cuando la columna del Excel está vacía), no se muestra texto de asignado. El texto del asignado se trunca con ellipsis si no cabe en el ancho disponible.
- **Acceptance Criteria**:
  - *Given* una tarea con asignado `"Juan García"`, *When* el Gantt se renderiza, *Then* la fila muestra `"Juan García"` debajo del nombre de la tarea con un tamaño de fuente visiblemente menor.
  - *Given* una tarea cuya columna Asignado está vacía en el Excel (asignado = `"Sin asignar"`), *When* el Gantt se renderiza, *Then* no aparece ningún texto de asignado bajo el nombre de la tarea.
  - *Given* un nombre de asignado muy largo, *When* el Gantt se renderiza, *Then* el texto se trunca con `…` sin desbordarse fuera de la celda.
- **Notes / Dependencies**: Cambio en el renderizado de la columna de nombres del Gantt en `dashboard-view.js` y `dashboard.css`. El valor del asignado viene del campo `assignee` del plan de proyecto.

---

### FR-05 (P1) — Selector de fecha con edición parcial (solo mes)

- **Description**: Los controles de fecha del dashboard (fecha de control y fechas del intervalo planificado) deben permitir al usuario cambiar únicamente el mes sin necesidad de reescribir el día y el año. El valor existente en el campo debe mantenerse como base al abrir el selector; solo el componente que el usuario modifica (mes, día o año) debe cambiar.
- **Acceptance Criteria**:
  - *Given* la fecha de control establecida en `2026-10-15`, *When* el usuario cambia el mes a noviembre, *Then* la fecha de control pasa a ser `2026-11-15` sin necesidad de reescribir el día ni el año.
  - *Given* la fecha de inicio del intervalo planificado en `2026-09-01`, *When* el usuario cambia el mes a octubre, *Then* la fecha pasa a `2026-10-01` manteniendo día y año.
  - *Given* el usuario cambia solo el año en la fecha de control, *When* confirma, *Then* el mes y el día se mantienen.
- **Notes / Dependencies**: Los inputs de tipo `date` nativos del navegador ya permiten editar campo a campo (mes, día, año) con teclado en Chromium/Edge. La mejora consiste en asegurar que el valor actual se pre-rellena correctamente en el input para que el usuario no encuentre el campo en blanco al interactuar. Evaluar si el comportamiento actual ya lo soporta o si requiere ajuste en el handler de eventos.

---

## 3. Non-Functional Requirements (NFR)

### NFR-01 — Rendimiento del Gantt

- **Category**: Performance
- **Requirement**: La adición de textos de avance (FR-03) y asignado (FR-04) no debe introducir una degradación perceptible en el tiempo de renderizado del Gantt para planes de hasta 200 tareas.
- **Metric / Acceptance Criteria**: El Gantt con 200 tareas se renderiza en menos de 1 segundo en un navegador moderno (Chrome/Edge) en hardware de escritorio estándar. Verificable observacionalmente con el workbook de prueba.

### NFR-02 — Mantenibilidad y separación de responsabilidades

- **Category**: Maintainability
- **Requirement**: Los cambios deben respetar la separación de responsabilidades por fichero definida en ADR-0006 del proyecto v0.1.0. No se mezclarán responsabilidades entre `workbook-gateway.js`, `planning-domain.js`, `dashboard-view.js` y `dashboard.css`.
- **Metric / Acceptance Criteria**: Revisión estática: ningún cambio en `workbook-gateway.js` referencia elementos del DOM; ningún cambio en `dashboard-view.js` contiene lógica de parseo de fechas o workbook.

---

## 4. User Stories / Use Cases

### UC-01 — Cargar libro con hitos marcados con "X"

- **Actor**: Responsable del proyecto
- **Preconditions**: El dashboard está en ejecución. El libro Excel tiene la columna "Hito" con valor `X` en las filas de hito.
- **Main flow**:
  1. El usuario lanza el dashboard y el libro se carga automáticamente.
  2. El dashboard procesa las columnas del libro sin generar avisos `INVALID_BOOLEAN`.
  3. Las filas con `X` en la columna Hito se muestran como rombos ▲ en el Gantt.
- **Alternative flows**: Si el valor es `x` (minúscula), el comportamiento es idéntico.
- **Acceptance Criteria**: 0 avisos de calidad de tipo `INVALID_BOOLEAN` para celdas con `X`. Hitos visibles como rombos.

### UC-02 — Revisar avance y asignados en el Gantt en una reunión de seguimiento

- **Actor**: Responsable del proyecto
- **Preconditions**: El dashboard está cargado con un libro con tareas con avance y asignados informados.
- **Main flow**:
  1. El usuario abre el Gantt.
  2. En cada barra de tarea ve el texto `"Avance XX%"` a su derecha.
  3. En el panel de nombres, debajo de cada nombre de tarea, ve el nombre del asignado en letra más pequeña.
  4. Las tareas sin asignado explícito no muestran el texto de asignado.
- **Alternative flows**: Si la barra es muy corta, el texto de avance se oculta sin romper el layout.
- **Acceptance Criteria**: Texto de avance y asignado visibles en todas las tareas con datos; ausentes donde no corresponde.

### UC-03 — Ajustar la fecha de control al mes siguiente

- **Actor**: Responsable del proyecto
- **Preconditions**: La fecha de control está establecida en un día concreto (p. ej. `2026-10-15`).
- **Main flow**:
  1. El usuario hace clic en el control de fecha de control.
  2. Modifica únicamente el mes (de octubre a noviembre).
  3. Los KPIs e indicadores del Gantt se recalculan con la nueva fecha `2026-11-15`.
- **Alternative flows**: El usuario puede también modificar solo el día o solo el año; los otros componentes no cambian.
- **Acceptance Criteria**: El día y el año se conservan al cambiar solo el mes.

---

## 5. Integrations & Dependencies

- No hay nuevas integraciones con sistemas externos.
- Dependencia interna: `workbook-gateway.js` → `planning-domain.js` → `dashboard-view.js` (cadena de datos existente; no se modifica el contrato entre módulos).

---

## 6. Security & Access Principles

- **CR-001-2**: Al eliminar el botón de copia de imagen, se elimina el uso de la Clipboard API del navegador, reduciendo la superficie de permisos solicitados.
- No hay nuevos accesos a datos del usuario ni nuevas APIs del navegador requeridas.
- El dashboard sigue siendo local y sin acceso a red exterior.

---

## 7. Assumptions

- El comportamiento de `<input type="date">` en Chrome/Edge (edición campo a campo con teclado) es el que el usuario experimenta. FR-05 asume este entorno.
- Los textos de avance y asignado en el Gantt se renderizan con el mismo mecanismo (SVG `<text>` o elemento HTML) que el nombre de la tarea; no se requiere un nuevo motor de renderizado.
- `"Sin asignar"` es el único valor considerado "sin asignado explícito"; cualquier otro valor en la columna se muestra como asignado real.

---

## 8. Open Questions

| ID | Question | Status | Resolution | Owner | Target phase |
|---|---|---|---|---|---|
| Q-000 | No open questions. | cancelled | Not applicable | Agent | Phase 2 |

---

## 9. Sizing & Split Decision

- Metrics: FRs=5, P1=5, UCs=3, domains=1 (web-standalone UI + gateway)
- Sizing gates triggered: ninguno (≤12 FRs, ≤5 P1 exacto — umbral no superado, ≤4 UCs)
- Decision: **monolith** — todos los cambios afectan a un único repositorio y tecnología; no hay dominio independiente que justifique split.
- Justification: 5 FRs todos P1, cambios localizados en componentes existentes, sin nuevas dependencias externas.

---

## 10. Approval

- **Status**: Approved
- **Approved by**: User
- **Date**: 2026-10-26
