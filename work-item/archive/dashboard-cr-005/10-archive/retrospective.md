---
template_id: retrospective
project_slug: dashboard-cr-005
phase: "10"
created: "2026-10-26"
updated: "2026-10-26"
---

# Retrospective — CR-005: Gantt Vista Completa Expandida

## Summary

| Item | Value |
|---|---|
| Track | change-request |
| Phases completed | 1–9 |
| Start date | 2026-10-26 |
| End date | 2026-10-26 |
| Tests delivered | 88/88 passing |
| Regressions | 0 |

---

## What went well

- **Diseño incremental**: el uso de `fitWidth` en `computeGanttLayout` resultó en una solución limpia y reutilizable para el auto-fit de la vista completa, sin duplicar lógica.
- **CSS `zoom` + estado de closure**: mantener el estado de zoom y ocultación en variables de closure (no en el store global) garantizó aislamiento total de los KPIs con mínima complejidad.
- **`<dialog>` nativo**: el elemento `<dialog>` con `showModal()` proporcionó focus trap, Escape-to-close y semántica ARIA de forma gratuita.
- **Reutilización de `buildGanttEntries`**: la vista completa reutiliza exactamente las mismas funciones de layout que el Gantt normal, sin duplicación.

## What could be improved

- **Truncamiento de archivos durante la construcción**: el editor truncó el archivo JS varias veces al escribir bloques largos; sería útil un helper para ficheros grandes.
- **Zoom con CSS `zoom`**: la interacción entre `zoom` y `clientWidth` para `fitWidth` fue ambigua inicialmente; documentarlo mejor en el diseño hubiera ahorrado iteraciones.

## Decisions made during construction

| Decision | Rationale |
|---|---|
| `fitWidth = clientWidth` (natural, pre-zoom) | CSS `zoom` no afecta `clientWidth`; el SVG se renderiza a ancho natural y el zoom lo comprime visualmente |
| Zoom default 70% | Permite ver ~40% más filas que al 100%, equilibrio entre densidad y legibilidad |
| Header spacer 72px en task list | Los 72px del header SVG (año + periodo) necesitan espacio equivalente en el panel HTML para alinear filas |

## Archive commit hash

`647c361` — chore(archive): move dashboard-cr-005 to work-item/archive after Phase 10 closure

---

## Approval

- **Status**: Approved
- **Approved by**: Usuario
- **Date**: 2026-10-26
