---
template_id: task-list
version: "1.1"
track: "new-feature"
project_slug: "html-project-dashboard"
created: "2026-10-23"
updated: "2026-10-25"
---

# Atomic Task List — Cuadro de mando HTML para planificación de proyectos

**Track**: new-feature | **Phase**: 4 — Atomic Tasks | **Project**: html-project-dashboard

## Legend

- **Status**: `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked
- **Complexity**: S (<30 min) · M (30–90 min) · L (90–120 min)
- **Priority**: P1 critical · P2 high · P3 normal
- **Evidence**: almacenada en `work-item/html-project-dashboard/_evidence/phase-05/`

## Summary Table

| Task | Title | Component | Complexity | Effort | Priority | Depends on | Status |
| --- | --- | --- | --- | ---: | --- | --- | --- |
| TASK-001 | Preparar toolchain y build reproducible | CMP-01–CMP-06 | M | 1.0 h | P1 | — | [x] |
| TASK-002 | Vendorizar SheetJS y avisos de licencia | CMP-02 | S | 0.5 h | P1 | TASK-001 | [x] |
| TASK-003 | Implementar launcher y servidor loopback | CMP-01 | L | 2.0 h | P1 | TASK-001 | [x] |
| TASK-004 | Implementar configuración única del workbook | CMP-01 | S | 0.5 h | P1 | TASK-001 | [x] |
| TASK-005 | Crear shell HTML semántico sin código inline | CMP-05 | M | 1.0 h | P1 | TASK-001 | [x] |
| TASK-006 | Crear sistema visual CSS responsive y accesible | CMP-05 | M | 1.25 h | P1 | TASK-005 | [x] |
| TASK-007 | Implementar lectura y detección de hojas Gantt | CMP-02 | L | 2.0 h | P1 | TASK-002, TASK-004 | [x] |
| TASK-008 | Implementar validación y avisos de calidad | CMP-02 | M | 1.25 h | P1 | TASK-007 | [x] |
| TASK-009 | Implementar normalización date-only y clasificación | CMP-03 | L | 2.0 h | P1 | TASK-007 | [x] |
| TASK-010 | Implementar filtros y métricas puras | CMP-03 | L | 2.0 h | P1 | TASK-009 | [x] |
| TASK-011 | Implementar store y selectores compartidos | CMP-04 | M | 1.5 h | P1 | TASK-010 | [x] |
| TASK-012 | Implementar controles, KPIs y estados de vista | CMP-05 | L | 2.0 h | P1 | TASK-006, TASK-011 | [x] |
| TASK-013 | Implementar layout y render SVG del Gantt | CMP-05 | M | 1.5 h | P1 | TASK-012 | [x] |
| TASK-014 | Implementar navegación, detalle y accesibilidad Gantt | CMP-05 | M | 1.5 h | P1 | TASK-013 | [x] |
| TASK-015 | Implementar composición SVG y rasterización PNG | CMP-06 | M | 1.5 h | P1 | TASK-006, TASK-011 | [x] |
| TASK-016 | Implementar modo presentación, clipboard y fallback | CMP-05, CMP-06 | M | 1.0 h | P1 | TASK-012, TASK-015 | [x] |
| TASK-017 | Integrar aplicación completa y flujos E2E | CMP-01–CMP-06 | M | 1.5 h | P1 | TASK-003, TASK-004, TASK-008, TASK-011, TASK-014, TASK-016 | [x] |
| TASK-018 | Validar release, rendimiento, offline e integridad | CMP-01–CMP-06 | M | 1.5 h | P1 | TASK-017 | [x] |
| TASK-019 | Sustituir el arranque principal por servidor Node | CMP-01 | M | 1.0 h | P1 | TASK-003 | [x] |
| TASK-020 | Robustecer selección de hoja y limpieza de filtros | CMP-04, CMP-05 | M | 1.25 h | P1 | TASK-011, TASK-012 | [x] |
| TASK-021 | Reconciliar interacción y cabecera temporal del Gantt | CMP-05 | M | 1.5 h | P1 | TASK-013, TASK-014 | [x] |

## Tasks

### TASK-001 — Preparar toolchain y build reproducible

- **Status**: [x]
- **Component(s)**: CMP-01–CMP-06 (cross-cutting build boundary)
- **Requirements**: NFR-06, NFR-08
- **Dependency layer**: Foundation / toolchain
- **Expected paths**: `package.json`, `package-lock.json`, `eslint.config.js`, `vitest.config.js`, `playwright.config.js`, `scripts/build.mjs`
- **Artifact impact**: Crea configuración de lint, test, coverage, E2E y build determinista; no crea lógica de producto.
- **Description**: Configurar Node >=22, scripts `lint`, `test`, `test:coverage`, `test:e2e`, `build` y `validate:release`; excluir vendor de lint/coverage y copiar solo activos autorizados a `dist/html-project-dashboard/`.
- **depends_on**: —
- **Complexity / effort**: M / 1.0 h
- **Priority**: P1
- **Verification**:
  - `npm pkg get scripts` contiene todos los comandos exigidos.
  - Un build vacío/controlado genera solo la estructura declarada y no copia el Excel.
  - Evidence: `_evidence/phase-05/TASK-001-toolchain.txt`

### TASK-002 — Vendorizar SheetJS y avisos de licencia

- **Status**: [x]
- **Component(s)**: CMP-02
- **Requirements**: FR-02, NFR-04
- **Dependency layer**: Infrastructure dependency
- **Expected paths**: `vendor/xlsx-0.20.3.tgz`, `dashboard-assets/vendor/xlsx-0.20.3.min.js`, `dashboard-assets/THIRD_PARTY_NOTICES.txt`, `package.json`, `package-lock.json`
- **Artifact impact**: Añade dependencia fijada y atribución; no usa CDN en runtime.
- **Description**: Obtener SheetJS CE 0.20.3 desde la distribución oficial, fijar checksum/versión, copiar el bundle local mediante build y registrar Apache 2.0 sin editar código vendor.
- **depends_on**: TASK-001
- **Complexity / effort**: S / 0.5 h
- **Priority**: P1
- **Verification**:
  - `XLSX.version` informa `0.20.3` en test.
  - La distribución no referencia `cdn.sheetjs.com` en scripts ejecutables.
  - Evidence: `_evidence/phase-05/TASK-002-sheetjs.txt`

### TASK-003 — Implementar launcher y servidor loopback

- **Status**: [x]
- **Component(s)**: CMP-01
- **Requirements**: FR-01, FR-02, NFR-04, NFR-05, NFR-06
- **Dependency layer**: Local runtime / infrastructure
- **Expected paths**: `start-dashboard.cmd`, `start-dashboard.mjs`, `start-dashboard.ps1`, `tests/integration/local-server.test.ps1`
- **Artifact impact**: Crea el único mecanismo soportado de arranque local.
- **Description**: Implementar servidor GET/HEAD vinculado a `127.0.0.1`, puerto libre, raíz fija, tipos MIME, CSP, protección traversal, sin listado/escrituras, apertura de navegador y cierre por Ctrl+C/inactividad. El CMD debe invocar el runtime Node como flujo principal y no depender de la política de PowerShell.
- **depends_on**: TASK-001
- **Complexity / effort**: L / 2.0 h
- **Priority**: P1
- **Verification**:
  - Tests prueban GET/HEAD, 404, método rechazado, traversal, binding loopback y cierre.
  - El hash del fixture servido coincide con el origen.
  - Evidence: `_evidence/phase-05/TASK-003-local-server.txt`

### TASK-004 — Implementar configuración única del workbook

- **Status**: [x]
- **Component(s)**: CMP-01
- **Requirements**: FR-01, NFR-08
- **Dependency layer**: Configuration
- **Expected paths**: `dashboard-config.js`, `tests/unit/dashboard-config.test.js`
- **Artifact impact**: Crea la única definición autorizada `WORKBOOK_FILE`.
- **Description**: Exportar configuración inmutable con `WORKBOOK_FILE: "diagramaGanttBase.xlsm"`, validar nombre relativo seguro y documentar el único punto de cambio.
- **depends_on**: TASK-001
- **Complexity / effort**: S / 0.5 h
- **Priority**: P1
- **Verification**:
  - Test positivo y nombres vacíos/absolutos/traversal negativos.
  - Búsqueda de fuente encuentra una sola definición autoritativa de `WORKBOOK_FILE`.
  - Evidence: `_evidence/phase-05/TASK-004-config.txt`

### TASK-005 — Crear shell HTML semántico sin código inline

- **Status**: [x]
- **Component(s)**: CMP-05
- **Requirements**: FR-05–FR-12, NFR-03, NFR-08, NFR-10
- **Dependency layer**: Presentation shell
- **Expected paths**: `dashboard.html`, `tests/e2e/dashboard-shell.spec.js`
- **Artifact impact**: Crea landmarks, regiones de estado, controles y contenedores; no contiene estilos ni lógica.
- **Description**: Crear HTML en español con skip link, header, filtros, KPIs, avisos `aria-live`, Gantt, detalle y controles de presentación; referenciar CSS, config, vendor y `app.js` como ficheros separados.
- **depends_on**: TASK-001
- **Complexity / effort**: M / 1.0 h
- **Priority**: P1
- **Verification**:
  - Parser confirma ausencia de `<style>`, handlers inline y scripts con lógica inline.
  - Axe sobre shell no devuelve violaciones critical/serious.
  - Evidence: `_evidence/phase-05/TASK-005-html-shell.txt`

### TASK-006 — Crear sistema visual CSS responsive y accesible

- **Status**: [x]
- **Component(s)**: CMP-05
- **Requirements**: FR-08–FR-12, NFR-03, NFR-09
- **Dependency layer**: Presentation styling
- **Expected paths**: `dashboard-assets/dashboard.css`, `tests/e2e/dashboard-layout.spec.js`
- **Artifact impact**: Define layout, temas de estado, foco, 200% zoom, reduced motion y modo presentación.
- **Description**: Implementar estilos modernos, contraste AA, foco visible, badges con texto/símbolo, Gantt alineado, responsive y reglas de 1920×1080 sin estilos inline.
- **depends_on**: TASK-005
- **Complexity / effort**: M / 1.25 h
- **Priority**: P1
- **Verification**:
  - Pruebas visuales a 100%/200%, viewport estrecho y `prefers-reduced-motion`.
  - Contrastes medidos cumplen 4.5:1 / 3:1.
  - Evidence: `_evidence/phase-05/TASK-006-css-layout/`

### TASK-007 — Implementar lectura y detección de hojas Gantt

- **Status**: [x]
- **Component(s)**: CMP-02
- **Requirements**: FR-02, FR-03, NFR-01
- **Dependency layer**: Source adapter
- **Expected paths**: `dashboard-assets/workbook-gateway.js`, `tests/unit/workbook-gateway.test.js`, `tests/fixtures/`
- **Artifact impact**: Implementa fetch/ArrayBuffer, lectura SheetJS, metadatos por etiqueta y detección por encabezados.
- **Description**: Leer `.xlsx/.xlsm`, escanear primeras 50 filas, normalizar diacríticos/alias, localizar hojas compatibles y mapear registros sin índices de columna fijos.
- **depends_on**: TASK-002, TASK-004
- **Complexity / effort**: L / 2.0 h
- **Priority**: P1
- **Verification**:
  - Fixtures con una/múltiples hojas, encabezados desplazados y variantes con/sin diacríticos.
  - Test contra copia del libro de referencia confirma campos esperados sin modificar el origen.
  - Evidence: `_evidence/phase-05/TASK-007-workbook-load.txt`

### TASK-008 — Implementar validación y avisos de calidad

- **Status**: [x]
- **Component(s)**: CMP-02
- **Requirements**: FR-04, FR-11
- **Dependency layer**: Source adapter validation
- **Expected paths**: `dashboard-assets/workbook-gateway.js`, `tests/unit/workbook-gateway.test.js`, `tests/fixtures/invalid-*`
- **Artifact impact**: Añade `QualityIssue` tipados y exclusión selectiva; no cambia el contrato de dominio.
- **Description**: Validar 404/formato/hoja/headers, fechas, rangos, porcentajes, booleanos, encabezados duplicados y fórmulas sin valor; separar errores globales y de fila.
- **depends_on**: TASK-007
- **Complexity / effort**: M / 1.25 h
- **Priority**: P1
- **Verification**:
  - Casos negativos producen código, severidad, fila y métrica afectada esperados.
  - Ningún dato inválido se convierte silenciosamente en cero.
  - Evidence: `_evidence/phase-05/TASK-008-quality-issues.txt`

### TASK-009 — Implementar normalización date-only y clasificación

- **Status**: [x]
- **Component(s)**: CMP-03
- **Requirements**: FR-05, FR-06, FR-11
- **Dependency layer**: Domain
- **Expected paths**: `dashboard-assets/planning-domain.js`, `tests/unit/planning-domain.test.js`
- **Artifact impact**: Crea tipos JSDoc y funciones puras de fecha objetivo, completitud y retraso.
- **Description**: Normalizar seriales/fechas a `YYYY-MM-DD`, respetar sistemas Excel, calcular `baselineEnd ?? plannedEnd`, completada a fecha y dos formas de retrasada a fecha sin UTC implícito.
- **depends_on**: TASK-007
- **Complexity / effort**: L / 2.0 h
- **Priority**: P1
- **Verification**:
  - Casos anterior/igual/posterior, cierre en plazo/tarde/ausente, leap day y sistemas 1900/1904.
  - Estado completo sin cierre genera inconsistencia, no completitud histórica.
  - Evidence: `_evidence/phase-05/TASK-009-domain-classification.txt`

### TASK-010 — Implementar filtros y métricas puras

- **Status**: [x]
- **Component(s)**: CMP-03
- **Requirements**: FR-06, FR-07, NFR-02
- **Dependency layer**: Domain
- **Expected paths**: `dashboard-assets/planning-domain.js`, `tests/unit/planning-domain.test.js`
- **Artifact impact**: Añade filtros por asignación/solapamiento/completitud y KPIs derivados.
- **Description**: Aplicar intersección de filtros y calcular total, completadas, ratio, retrasadas y excluidas; distinguir cero, null/no calculable y conjunto vacío.
- **depends_on**: TASK-009
- **Complexity / effort**: L / 2.0 h
- **Priority**: P1
- **Verification**:
  - Matriz de filtros combinados, hitos, “Sin asignar”, límites inclusivos y total cero.
  - Benchmark unitario de 1.000 tareas dentro del objetivo de 300 ms.
  - Evidence: `_evidence/phase-05/TASK-010-filters-metrics.txt`

### TASK-011 — Implementar store y selectores compartidos

- **Status**: [x]
- **Component(s)**: CMP-04
- **Requirements**: FR-03, FR-05–FR-07, FR-10, NFR-02
- **Dependency layer**: Application state
- **Expected paths**: `dashboard-assets/dashboard-state.js`, `tests/unit/dashboard-state.test.js`
- **Artifact impact**: Crea store in-memory, acciones, validación y snapshot único.
- **Description**: Implementar pipeline atómico `tasks → filters → derivedTasks → metrics`, selección de hoja, fecha, escala, viewport y estados loading/error/empty sin persistencia. Conservar la hoja seleccionada en una recarga cuando siga disponible y permitir limpiar asignados o intervalo sin alterar los demás filtros.
- **depends_on**: TASK-010
- **Complexity / effort**: M / 1.5 h
- **Priority**: P1
- **Verification**:
  - Secuencias de acciones mantienen inmutabilidad y snapshot coherente.
  - Error de selector no conserva KPIs anteriores.
  - Evidence: `_evidence/phase-05/TASK-011-state.txt`

### TASK-012 — Implementar controles, KPIs y estados de vista

- **Status**: [x]
- **Component(s)**: CMP-05
- **Requirements**: FR-03–FR-07, FR-11, NFR-03
- **Dependency layer**: Presentation
- **Expected paths**: `dashboard-assets/dashboard-view.js`, `tests/integration/dashboard-view.test.js`
- **Artifact impact**: Implementa binding accesible de selección, filtros, cajas, avisos y detalle; no implementa aún timeline.
- **Description**: Renderizar datos mediante DOM seguro/textContent, controles con labels, contexto de fecha/filtros, cero vs sin tareas, avisos trazables y restauración de foco.
- **depends_on**: TASK-006, TASK-011
- **Complexity / effort**: L / 2.0 h
- **Priority**: P1
- **Verification**:
  - Eventos actualizan store y las cajas coinciden con el mismo snapshot.
  - Tests de teclado, `aria-live`, foco y ausencia de `innerHTML` con datos.
  - Evidence: `_evidence/phase-05/TASK-012-dashboard-view.txt`

### TASK-013 — Implementar layout y render SVG del Gantt

- **Status**: [x]
- **Component(s)**: CMP-05
- **Requirements**: FR-08, FR-09, FR-10, NFR-07
- **Dependency layer**: Presentation visualization
- **Expected paths**: `dashboard-assets/dashboard-view.js`, `tests/integration/dashboard-view.test.js`
- **Artifact impact**: Añade filas sincronizadas, barras, progreso, hitos, línea de control, escalas y viewport.
- **Description**: Calcular layout por date-only, renderizar una superficie SVG única, alinear lista/SVG y soportar día/semana/mes para hasta 1.000 filas. Posicionar automáticamente la vista sobre la primera tarea sin acción separada «Ajustar a tareas».
- **depends_on**: TASK-012
- **Complexity / effort**: M / 1.5 h
- **Priority**: P1
- **Verification**:
  - Golden cases de posiciones/anchos/hitos/fecha de control en límites.
  - Test de 1.000 tareas mantiene alineación y render ≤1 s.
  - Evidence: `_evidence/phase-05/TASK-013-gantt-render.txt`

### TASK-014 — Implementar navegación, detalle y accesibilidad Gantt

- **Status**: [x]
- **Component(s)**: CMP-05
- **Requirements**: FR-08–FR-11, NFR-03, NFR-07
- **Dependency layer**: Presentation interaction
- **Expected paths**: `dashboard-assets/dashboard-view.js`, `tests/integration/dashboard-view.test.js`, `tests/e2e/dashboard-accessibility.spec.js`
- **Artifact impact**: Completa comportamiento de teclado, foco, scroll y textos no dependientes del color.
- **Description**: Hacer cada tarea alcanzable, desplazar barra al viewport al enfocar, abrir/cerrar detalle con retorno de foco, etiquetar hito/estado y evitar focus trap.
- **depends_on**: TASK-013
- **Complexity / effort**: M / 1.5 h
- **Priority**: P1
- **Verification**:
  - Recorrido completo solo teclado con foco visible y orden lógico.
  - Axe sin critical/serious; prueba manual 200% y reduced motion preparada.
  - Evidence: `_evidence/phase-05/TASK-014-gantt-accessibility/`

### TASK-015 — Implementar composición SVG y rasterización PNG

- **Status**: [x]
- **Component(s)**: CMP-06
- **Requirements**: FR-12, NFR-09
- **Dependency layer**: Presentation export
- **Expected paths**: `dashboard-assets/presentation-exporter.js`, `tests/unit/presentation-exporter.test.js`
- **Artifact impact**: Crea compositor 16:9 y conversión SVG→canvas→PNG; sin portapapeles todavía.
- **Description**: Componer contexto, KPIs, filtros, leyenda y filas visibles desde snapshot, escapar texto, rasterizar exactamente a 1920×1080 y gestionar URLs Blob.
- **depends_on**: TASK-006, TASK-011
- **Complexity / effort**: M / 1.5 h
- **Priority**: P1
- **Verification**:
  - PNG tiene dimensiones exactas y no contiene controles, recortes ni texto sin escapar.
  - Snapshots para cero tareas, hitos y ventana con varias filas.
  - Evidence: `_evidence/phase-05/TASK-015-png-render/`

### TASK-016 — Implementar modo presentación, clipboard y fallback

- **Status**: [x]
- **Component(s)**: CMP-05, CMP-06
- **Requirements**: FR-12, NFR-03, NFR-09
- **Dependency layer**: Presentation interaction/export adapter
- **Expected paths**: `dashboard-assets/dashboard-view.js`, `dashboard-assets/presentation-exporter.js`, `tests/integration/presentation-export.test.js`
- **Artifact impact**: Conecta acción explícita, vista limpia, ClipboardItem y descarga del mismo Blob.
- **Description**: Activar modo presentación, solicitar export tras gesto, copiar PNG cuando sea posible y descargar `dashboard-YYYY-MM-DD.png` ante ausencia/denegación, anunciando resultado accesiblemente.
- **depends_on**: TASK-012, TASK-015
- **Complexity / effort**: M / 1.0 h
- **Priority**: P1
- **Verification**:
  - Clipboard mock recibe `image/png`; rechazo genera descarga byte-equivalente.
  - No hay retry automático ni pérdida de filtros/viewport.
  - Evidence: `_evidence/phase-05/TASK-016-presentation-export.txt`

### TASK-017 — Integrar aplicación completa y flujos E2E

- **Status**: [x]
- **Component(s)**: CMP-01–CMP-06
- **Requirements**: FR-01–FR-12, UC-01–UC-04, NFR-08
- **Dependency layer**: Composition / end-to-end integration
- **Expected paths**: `dashboard-assets/app.js`, `tests/integration/app.test.js`, `tests/e2e/dashboard-workflows.spec.js`
- **Artifact impact**: Conecta módulos mediante exports públicos; `app.js` no absorbe lógica de componentes.
- **Description**: Orquestar arranque, carga, selección, store, vista y export; implementar mensajes globales y completar los cuatro casos de uso con el Excel de referencia y fixtures.
- **depends_on**: TASK-003, TASK-004, TASK-008, TASK-011, TASK-014, TASK-016
- **Complexity / effort**: M / 1.5 h
- **Priority**: P1
- **Verification**:
  - UC-01–UC-04 pasan de extremo a extremo.
  - Revisión estática confirma un módulo primario por CMP, cero imports circulares, cero inline CSS/JS y `app.js` solo composición.
  - Evidence: `_evidence/phase-05/TASK-017-e2e.txt`

### TASK-018 — Validar release, rendimiento, offline e integridad

- **Status**: [x]
- **Component(s)**: CMP-01–CMP-06
- **Requirements**: NFR-01–NFR-10
- **Dependency layer**: Release validation
- **Expected paths**: `scripts/validate-release.mjs`, `tests/e2e/dashboard-release.spec.js`, `dist/html-project-dashboard/`
- **Artifact impact**: Completa validadores y artifact manifest; no cambia comportamiento funcional salvo defectos hallados.
- **Description**: Validar build limpio, assets locales, ausencia de red pública, CSP, 85% coverage, 1.000 tareas, navegadores, offline, hash/mtime del workbook, PNG, licencias y manifest/checksum del release.
- **depends_on**: TASK-017
- **Complexity / effort**: M / 1.5 h
- **Priority**: P1
- **Verification**:
  - `npm run lint`, `npm test`, `npm run test:coverage`, `npm run build`, `npm run validate:release` y E2E pasan.
  - Release scan no encuentra CDN/analytics ni Excel copiado; hash y mtime del libro no cambian.
  - Evidence: `_evidence/phase-05/TASK-018-release-validation.txt`

### TASK-019 — Sustituir el arranque principal por servidor Node

- **Status**: [x]
- **Component(s)**: CMP-01
- **Requirements**: FR-02, NFR-04, NFR-06
- **Dependency layer**: Local runtime / infrastructure
- **Expected paths**: `start-dashboard.cmd`, `start-dashboard.mjs`, `start-dashboard.ps1`, `tests/integration/local-server.test.ps1`
- **Artifact impact**: Evita que el flujo principal quede bloqueado por la política de ejecución de PowerShell, manteniendo el servidor loopback de solo lectura.
- **Description**: Implementar `start-dashboard.mjs` con `node:http`, hacer que el CMD lo invoque directamente y conservar PowerShell solo como alternativa. Mantener GET/HEAD, CSP, protección de rutas, puerto efímero, apertura de navegador e inactividad.
- **depends_on**: TASK-003
- **Complexity / effort**: M / 1.0 h
- **Priority**: P1
- **Verification**:
  - El CMD no invoca PowerShell y muestra un mensaje accionable si Node no está disponible.
  - Las pruebas del servidor confirman GET/HEAD, solo loopback, traversal bloqueado y ausencia de escrituras.
  - Evidence: `_evidence/phase-05/TASK-019-node-launcher.txt`

### TASK-020 — Robustecer selección de hoja y limpieza de filtros

- **Status**: [x]
- **Component(s)**: CMP-04, CMP-05
- **Requirements**: FR-03, FR-07, NFR-02, NFR-03
- **Dependency layer**: Application state / presentation interaction
- **Expected paths**: `dashboard-assets/app.js`, `dashboard-assets/dashboard-state.js`, `dashboard-assets/dashboard-view.js`, `dashboard.html`, `tests/integration/app.test.js`, `tests/integration/dashboard-view.test.js`, `tests/e2e/dashboard-workflows.spec.js`
- **Artifact impact**: Elimina la carga inicial incompleta en libros multihoja y permite restablecer por separado recursos y fechas.
- **Description**: Seleccionar y renderizar automáticamente la primera hoja compatible, conservar la selección válida al recargar, añadir acciones independientes para limpiar asignados e intervalo y mantener intactos fecha de control, completitud y filtros no afectados.
- **depends_on**: TASK-011, TASK-012
- **Complexity / effort**: M / 1.25 h
- **Priority**: P1
- **Verification**:
  - Un libro multihoja muestra la primera hoja completa sin navegación intermedia y conserva la hoja activa al recargar.
  - Cada limpieza parcial restablece solo su filtro y el conjunto completo reaparece al limpiar todos.
  - Evidence: `_evidence/phase-05/TASK-020-sheet-filter-behavior.txt`

### TASK-021 — Reconciliar interacción y cabecera temporal del Gantt

- **Status**: [x]
- **Component(s)**: CMP-05
- **Requirements**: FR-08, FR-09, FR-10, NFR-03, NFR-07, NFR-09
- **Dependency layer**: Presentation visualization / interaction
- **Expected paths**: `dashboard-assets/dashboard-view.js`, `dashboard-assets/dashboard.css`, `dashboard.html`, `tests/integration/dashboard-view.test.js`, `tests/e2e/dashboard-layout.spec.js`, `tests/e2e/dashboard-workflows.spec.js`
- **Artifact impact**: Corrige alineación y artefactos de scroll, refuerza identificación de filas y congela la representación multi-escala de fechas.
- **Description**: Renderizar todas las tareas en filas de 48 px sin scroll vertical independiente, resaltar la fila completa con puntero o foco y unificar cuadrícula/cabecera/barras en el SVG desplazable. Mostrar línea de control roja discontinua, banda anual gris oscuro, periodos gris claro, `DD/MM` en día/semana, meses castellanos y mínimo de 52 px diarios. Eliminar «Ajustar a tareas» y posicionar automáticamente la primera tarea.
- **depends_on**: TASK-013, TASK-014
- **Complexity / effort**: M / 1.5 h
- **Priority**: P1
- **Verification**:
  - Lista y barras permanecen alineadas en todas las escalas y el desplazamiento horizontal no superpone líneas fijas.
  - Hover/foco resalta la fila completa; la fecha de control y las cabeceras cumplen color, formato e idioma definidos.
  - Evidence: `_evidence/phase-05/TASK-021-gantt-reconciliation.txt`

## Coverage & Dependency Reconciliation

### Design components → tasks

| Component | Tasks | Coverage |
| --- | --- | --- |
| CMP-01 Local Runtime & Config | TASK-001, TASK-003, TASK-004, TASK-017–TASK-019 | 100% |
| CMP-02 Workbook Gateway | TASK-002, TASK-007, TASK-008, TASK-017, TASK-018 | 100% |
| CMP-03 Planning Domain | TASK-009, TASK-010, TASK-017, TASK-018 | 100% |
| CMP-04 Dashboard State | TASK-011, TASK-017, TASK-018, TASK-020 | 100% |
| CMP-05 Accessible Dashboard View | TASK-005, TASK-006, TASK-012–TASK-014, TASK-016–TASK-018, TASK-020, TASK-021 | 100% |
| CMP-06 Presentation Exporter | TASK-015–TASK-018 | 100% |

### Requirements → tasks

| Requirements | Tasks |
| --- | --- |
| FR-01–FR-04 | TASK-003, TASK-004, TASK-007, TASK-008, TASK-017, TASK-019, TASK-020 |
| FR-05–FR-07 | TASK-009–TASK-012, TASK-017 |
| FR-08–FR-11 | TASK-012–TASK-014, TASK-017, TASK-021 |
| FR-12 | TASK-015–TASK-017 |
| NFR-01–NFR-02 | TASK-007, TASK-010–TASK-013, TASK-018 |
| NFR-03 | TASK-005, TASK-006, TASK-012, TASK-014, TASK-016, TASK-018 |
| NFR-04–NFR-05 | TASK-002–TASK-004, TASK-007, TASK-017, TASK-018 |
| NFR-06–NFR-07 | TASK-001, TASK-003, TASK-013, TASK-014, TASK-017–TASK-019, TASK-021 |
| NFR-08 | TASK-001, TASK-004, TASK-005, TASK-017, TASK-018 |
| NFR-09 | TASK-006, TASK-015, TASK-016, TASK-018, TASK-021 |
| NFR-10 | TASK-001, TASK-005, TASK-017, TASK-018, TASK-021 |

### WSG4 reconciliation

- **WSG4.1**: cada tarea declara paths, requisitos, capa, impacto, dependencias, prueba y evidencia.
- **WSG4.2**: launcher TASK-003; parser TASK-007/008; dominio TASK-009/010; accesibilidad TASK-005/006/012/014; export TASK-015/016; release TASK-018.
- **Dependency order**: foundation → infrastructure/config → adapter/domain → state → presentation/export → integration → release validation. No dependencia apunta a una tarea posterior.

## Open Questions / Pending Decisions

| ID | Question | Status | Resolution | Owner | Target phase |
| --- | --- | --- | --- | --- | --- |
| Q-000 | No hay preguntas abiertas ni decisiones de diseño pendientes. | cancelled | No aplica | Agent | Phase 4 |

## Sizing & Split Decision

- Metrics: tasks=21, effort_est=28.25h, L_tasks=5, domains=2
- Sizing gates triggered: QG4.8 (tasks > 20)
- Decision: monolith
- If epic-split → proposed epic slug + slicing strategy + estimated children: No aplica.
- Justification / override: Se mantiene un único feature porque solo se supera por una tarea el umbral orientativo de cantidad; el esfuerzo continúa por debajo de 40 horas y hay exactamente cinco tareas L. Las tres tareas de reconciliación comparten el mismo pipeline y separarlas en otro work-item duplicaría contratos, fixtures y validación integral. Todas conservan resultados binarios y duración máxima inferior a dos horas.

## Approval

- **Status**: Approved — reconciled after Phase 5 documentation rollback
- **Approved by**: User — explicit instruction to continue through end of construction
- **Date**: 2026-10-25
