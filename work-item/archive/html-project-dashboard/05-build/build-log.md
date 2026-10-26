# Build Log — Cuadro de mando HTML para planificación de proyectos

## 1. Build summary

- Date: 2026-10-25
- Implementer/agent: Codex
- Phase: 05-build
- Scope: `TASK-001` a `TASK-021`, todas completadas y reconciliadas con Specs/Diseño.
- Runtime: Node.js 24.18.1; npm 11.16.0; Edge/Chromium mediante Playwright. PowerShell 7 y Windows PowerShell 5.1 se usan únicamente como harnesses de prueba del servidor Node y alternativa opcional.
- Release: `dist/html-project-dashboard/`, 16 activos locales con `manifest.sha256`; el Excel no forma parte de la distribución.

## 2. Mandatory resolution

- project-slug: `html-project-dashboard`
- track: `new-feature`
- current_phase: `5`
- status / phase_status: `active` / `Phase 5 complete — 21/21 tasks closed; awaiting approval for Phase 6`.
- persisted Phase 5 artifacts: fuentes, tests, `work-item/html-project-dashboard/05-build/build-log.md`, estado de tareas y `work-item/html-project-dashboard/_evidence/phase-05/`.
- blocking gate: aprobación explícita del usuario para pasar a Phase 6.

## 3. Construction decisions

- Cada responsabilidad reside en un fichero independiente: shell HTML, CSS, configuración, gateway Excel, dominio, store, vista, exportador y composición.
- El Excel se obtiene únicamente por GET desde el servidor loopback y se procesa en memoria. No se ejecutan macros ni se escribe el libro.
- SheetJS CE 0.20.3 está vendorized con licencia y checksum; no existe dependencia CDN en runtime.
- Las fechas de negocio son date-only. Se soportan los sistemas Excel 1900 y 1904 sin inferir histórico a partir del estado actual.
- Todo texto del workbook se trata como no confiable y se inserta mediante `textContent` o escaping XML.
- La imagen para PowerPoint se compone como SVG autocontenido y se rasteriza a PNG 1920×1080; clipboard y descarga consumen el mismo Blob.
- El build usa allowlist y genera un manifiesto SHA-256 reproducible; nunca copia extensiones Excel.

## 4. Deviations and findings

- No hay descopes ni desviaciones funcionales.
- Hallazgo corregido: axe detectó `aria-label` sobre un `div` sin rol; se añadió `role="region"` y la repetición quedó sin violaciones serious/critical.
- Hallazgo corregido: la cobertura de ramas quedó inicialmente en 84,09 %; se añadieron casos de error/valores vacíos y el resultado final es 86,97 %.
- Los libros del directorio son datos editables del usuario; las pruebas no fijan su número de filas. El libro configurado contiene actualmente 13 tareas y los flujos deterministas adicionales usan un workbook generado en memoria e interceptado por Playwright.
- Corrección de compatibilidad: `Plani Ferrovial - Airports_v1.xlsm` omite `Fecha cierre real` e `Hito`. Ambas columnas pasan a ser recomendadas, no obligatorias; se emiten avisos trazables sin inventar datos.
- Corrección de runtime: el servidor usa lectura compartida y comprueba tamaño/mtime para poder leer el `.xlsm` mientras Excel está abierto sin escribirlo ni servir una copia durante un guardado.
- Corrección de arranque: `start-dashboard.cmd` ejecuta el servidor local `start-dashboard.mjs` con Node.js y ya no depende de que Windows permita scripts PowerShell. No se modifica ni se omite `ExecutionPolicy`; `start-dashboard.ps1` permanece como alternativa.
- Corrección de accesibilidad: los botones de tarea quedan envueltos en elementos `role=listitem` dentro de la lista Gantt.
- Configuración final: el libro activo vuelve a ser `diagramaGanttBase.xlsm`, que incluye las columnas opcionales `Fin linea base`, `Fecha cierre real`, `Nivel de riesgo`, `Bloqueada` e `Hito`. La prueba de release valida el fichero configurado sin fijar fechas ni recuentos editables del libro.
- Corrección de filtros: se añaden acciones independientes para mostrar todos los recursos y limpiar únicamente el intervalo planificado, preservando los demás controles.
- Corrección de Gantt: se elimina el botón inoperante `Ajustar a tareas`; filas HTML y marcas SVG comparten una geometría fija de 48 px, no hay scroll vertical independiente y carga, filtros y cambio de escala posicionan la vista en la primera tarea.
- Robustez de pruebas: el workbook editable contiene actualmente más de una hoja Gantt válida; la prueba de referencia valida por nombre sin imponer un único proyecto. La compatibilidad sin columnas recomendadas se cubre con un fixture determinista, no con un fichero de usuario opcional.
- Corrección multihoja: tras cargar el workbook se selecciona y prepara siempre la primera hoja Gantt; una recarga posterior conserva la hoja que el usuario estuviera consultando. `gantt2` queda renderizada desde la carga inicial.
- Interacción Gantt: el hover y el foco de teclado enlazan el nombre con una franja completa en el SVG, facilitando identificar su barra o hito.
- Corrección de scroll horizontal: se elimina la cuadrícula CSS fija del visor; queda una única cuadrícula SVG que se desplaza junto con las barras y etiquetas temporales.
- Cabecera temporal final: el Gantt incorpora una banda superior gris oscuro agrupada por año y una segunda banda gris claro para los periodos. Día y semana usan `DD/MM`; mes usa los nombres castellanos de enero a diciembre.
- Fecha de control: se representa mediante una línea vertical roja discontinua que recorre cabecera y tareas. La fecha permanece en su posición cronológica aunque quede fuera del intervalo de las tareas; la apertura sigue desplazándose a la primera tarea para evitar una vista vacía.
- Legibilidad por escala: la escala diaria reserva al menos 52 px por fecha y las bandas calculan anchos completos, incluidos meses naturales y cambios de año.

## 5. Commands and results

```text
npm run lint                         PASS
npm test                             PASS — 8 files / 63 tests
npm run test:coverage                PASS — statements 96.62 %, branches 88.00 %, functions 96.87 %, lines 97.29 %
npm run test:e2e                     PASS — 14/14 Edge tests, axe serious/critical 0
npm run test:server                  PASS — PowerShell 7
npm run test:server:windows          PASS — Windows PowerShell 5.1
npm run build                        PASS — 16 local assets
npm run validate:release             PASS — manifest, local assets and workbook integrity
Git Bash framework/scripts/check-all.sh PASS — PROJECT-RULES none; ALL-CHECKS-PASS
server integration smoke             PASS — GET/HEAD/404/405/traversal/shutdown; workbook hash verified
```

Performance evidence:

- Mapping 1,000 workbook rows: below 3 s budget.
- Filtering/metrics for 1,000 tasks: below 300 ms budget.
- DOM + SVG render for 1,000 tasks: 142 ms in the integration environment, below 1 s budget.

## 6. Deployment / build provenance

| Deploy/Import ID | Target | Dry-run? | Result | Components | Notes |
| --- | --- | --- | --- | --- | --- |
| build-20261025-01 | `dist/html-project-dashboard/` | true | PASS | 16 runtime assets | `manifest.sha256` verified; Node launcher; no workbook copied. |

## 7. Group deliverable reconciliation

| Tasks | Deliverable group | Status | Evidence |
| --- | --- | --- | --- |
| TASK-001–TASK-004 | Toolchain, dependency, loopback server and single workbook config | delivered | `work-item/html-project-dashboard/_evidence/phase-05/TASK-001-toolchain.txt` to `TASK-004-config.txt` |
| TASK-005–TASK-006 | Semantic shell and responsive accessible design | delivered | `work-item/html-project-dashboard/_evidence/phase-05/TASK-005-html-shell.txt`; `TASK-006-css-layout/` |
| TASK-007–TASK-008 | Workbook detection, mapping and quality issues | delivered | `work-item/html-project-dashboard/_evidence/phase-05/TASK-007-workbook-load.txt`; `TASK-008-quality-issues.txt` |
| TASK-009–TASK-011 | Date-only domain, metrics and immutable store | delivered | `work-item/html-project-dashboard/_evidence/phase-05/TASK-009-domain-classification.txt` to `TASK-011-state.txt` |
| TASK-012–TASK-014 | KPIs, SVG Gantt, detail and accessibility | delivered | `work-item/html-project-dashboard/_evidence/phase-05/TASK-012-dashboard-view.txt` to `TASK-014-gantt-accessibility/` |
| TASK-015–TASK-016 | 1920×1080 PNG, presentation, clipboard and fallback | delivered | `work-item/html-project-dashboard/_evidence/phase-05/TASK-015-png-render/`; `TASK-016-presentation-export.txt` |
| TASK-017–TASK-018 | Full integration and release validation | delivered | `work-item/html-project-dashboard/_evidence/phase-05/TASK-017-e2e.txt`; `TASK-018-release-validation.txt` |
| TASK-019 | Node launcher independent of PowerShell policy | delivered | `work-item/html-project-dashboard/_evidence/phase-05/TASK-019-node-launcher.txt` |
| TASK-020 | Automatic/preserved sheet selection and independent filter clearing | delivered | `work-item/html-project-dashboard/_evidence/phase-05/TASK-020-sheet-filter-behavior.txt` |
| TASK-021 | Aligned/highlighted Gantt rows, unified grid, temporal headers and control line | delivered | `work-item/html-project-dashboard/_evidence/phase-05/TASK-021-gantt-reconciliation.txt` |

No task is partial, absent or descoped. `work-item/html-project-dashboard/04-tasks/task-list.md` records all 21 tasks as `[x]`.

### 7.1 Task completion integrity

| Tasks | All deliverables delivered? | Status task-list / active.yml / build log | Pending split |
| --- | --- | --- | --- |
| TASK-001–TASK-018 | Yes | `[x]` / Phase 5 complete / complete | None |
| TASK-019–TASK-021 | Yes | `[x]` / Phase 5 complete / complete | None |

## 8. Quality gates

- `QG5.1`: PASS — las 21 tareas están completas y consistentes entre task-list, active.yml y este build log.
- `QG5.2`: PASS — se cumplen las reglas `web-standalone`: módulos separados, runtime local, accesibilidad y seguridad de datos.
- `QG5.3`: PASS — lint, 63 tests, cobertura, build, release validator, ambos harnesses de servidor y 14 E2E sin errores.
- `QG5.4`: PASS — contratos JSDoc y comentarios explican fechas, gateway, store y ramas complejas de exportación.
- `QG5.5`: PASS — build log presente en `work-item/html-project-dashboard/05-build/build-log.md`.
- `WSG5.1`: PASS — `npm run lint`, `npm test` y `npm run build` superados sobre la implementación reconciliada.
- `WSG5.2`: PASS — dependencia/runtime local, licencia y avisos de terceros incluidos.
- `WSG5.3`: PASS — hash, tamaño y mtime del workbook intactos.

### 8.1 Construction self-review

- Correctness: PASS — FR-01–FR-12 y UC-01–UC-04 están cubiertos por unitarias, integración y E2E; las regresiones multihoja, filtros y Gantt tienen pruebas explícitas.
- Security: PASS — nombres de fichero validados, servidor limitado a loopback/GET/HEAD, traversal rechazado, CSP activa y datos Excel insertados mediante APIs de texto/escaping.
- Performance: PASS — los límites de 1.000 tareas permanecen dentro de los presupuestos documentados.
- Maintainability: PASS — HTML, CSS, configuración, gateway, dominio, estado, vista, exportación y composición permanecen en ficheros independientes; una única definición autoritativa de `WORKBOOK_FILE`.
- Design adherence: PASS — seis componentes implementados sin imports circulares ni dependencia runtime externa.
- Findings: 0 blocking, 0 major, 0 minor abiertos.

Configured workbook invariant:

- File: `diagramaGanttBase.xlsm`
- SHA256: `C9E8D01ABA136D71B84CCE27B93B9ADF1A8B6801DD77315E8BD49648000E59E7`
- Size: `5300137`
- LastWriteTimeUtc: `2026-10-24T21:50:30`

## 9. Open questions and phase gate

- Open questions: none.
- Phase 5 is complete.
- Approval: granted by User on 2026-10-25.
- Transition: Phase 6 verification authorized.

## 10. Documentation reconciliation rollback

- Date: 2026-10-25
- Requested by: User
- Reason: sincronizar especificaciones, diseño y tareas con los cambios funcionales aprobados durante construcción: multihoja, launcher Node, limpieza independiente de filtros, Gantt alineado y completo, hover de fila, cuadrícula única, cabecera temporal por año/periodo y línea de control roja.
- Action: rollback documentado Phase 5 → Phase 3 → Phase 2. Se actualiza primero `work-item/html-project-dashboard/02-specs/specs.md`; diseño y tareas quedan bloqueados hasta las aprobaciones secuenciales requeridas.
- Result: Specs, Diseño y Tareas reconciliados y aprobados el 2026-10-25; construcción revalidada con 21/21 tareas completas y sin desviaciones abiertas.
