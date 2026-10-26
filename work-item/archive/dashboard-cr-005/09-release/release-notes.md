---
template_id: release-notes
project_slug: dashboard-cr-005
phase: "09"
created: "2026-10-26"
updated: "2026-10-26"
---

# Release Notes — CR-005: Gantt Vista Completa Expandida

**Versión**: dashboard-cr-005  
**Fecha de release**: 2026-10-26  
**Track**: change-request  

---

## Nuevas funcionalidades

### Vista completa del Gantt
- Nuevo botón **"Vista completa"** en la barra del Gantt (arriba a la derecha).
- Abre un overlay modal a pantalla completa con todas las tareas, secciones e hitos visibles (respeta los filtros activos y el estado de colapso de secciones).

### Escala propia (Día / Mes / Año)
- La vista completa tiene su propio selector de escala independiente del Gantt normal.
- Modo **auto-fit**: el SVG siempre se ajusta al ancho disponible sin scroll horizontal.
- Escala inicial: Mes.

### Control de zoom (−/+)
- Botones `−` y `+` en la cabecera de la vista completa para reducir o aumentar el zoom (30%–200%, paso 10%).
- Zoom inicial: **70%** — más filas visibles de una vez.
- El zoom escala todo el contenido proporcionalmente sin rehacer el layout.

### Ocultación de tareas a demanda
- Cada fila de tarea en la vista completa tiene un toggle 🙈/👁 para ocultarla.
- Las tareas ocultas desaparecen solo de la vista completa; el Gantt normal y los KPIs no se ven afectados.
- El estado de ocultación se reinicia al cerrar y reabrir la vista completa.

### Secciones colapsables en la vista completa
- Las secciones son colapsables/expandibles en la vista completa (igual que en el Gantt normal).
- Cuando una sección está colapsada, muestra una barra resumen que abarca todo su rango de fechas (gris si hay tareas en curso, verde si todas están completadas).

### Mejoras adicionales
- **Hover highlight**: al pasar el cursor sobre una tarea, se resaltan simultáneamente el nombre en el panel izquierdo y la barra correspondiente en el SVG.
- **Labels verticales en escala Día**: las etiquetas de fecha se rotan 90° para ser legibles en columnas estrechas.

---

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `dashboard.html` | Nuevo `<dialog id="full-gantt-dialog">` + botón "Vista completa" |
| `dashboard-assets/dashboard-view.js` | `renderFullGantt`, `openFullGantt`, `closeFullGantt`, zoom, hover, auto-fit |
| `dashboard-assets/dashboard.css` | Estilos del dialog, zoom control, hide toggle, section summary bar |

---

## Notas de instalación / configuración

No se requiere configuración adicional. El servidor local existente (`start-dashboard.cmd` / `start-dashboard.mjs`) sirve los archivos modificados sin cambios.

---

## Rollback

Para revertir: restaurar los tres archivos modificados a la versión anterior del commit que precedió a esta rama.

---

## Aprobación

- **Status**: Approved
- **Approved by**: Usuario
- **Date**: 2026-10-26
