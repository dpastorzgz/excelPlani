---
template_id: specs
version: "1.0"
track: "new-feature"
project_slug: "html-project-dashboard"
created: "2026-10-23"
updated: "2026-10-25"
---

# Specifications — Cuadro de mando HTML para planificación de proyectos

## 1. Overview

- **Goal**: Ofrecer una vista local y de solo lectura del plan Excel que calcule indicadores a una fecha de control, aplique filtros comunes y muestre un Gantt accesible y preparado para su uso en presentaciones.
- **Stakeholders / users**: Responsables de proyecto, PMO, responsables de equipo y personas que preparan seguimiento ejecutivo.
- **In scope**: Selección del libro y hoja de proyecto, validación de datos, fecha de control, indicadores de tareas, filtros por asignación/fecha/completitud, Gantt multi-escala con cabecera temporal, hitos, resaltado de filas y vista copiable para PowerPoint.
- **Out of scope**: Modificación del Excel, snapshots históricos, colaboración multiusuario, agregación automática de proyectos independientes y generación de un fichero PowerPoint.

### 1.1 Definitions and business rules

- **Tarea válida**: registro de una hoja Gantt compatible que contiene un nombre de tarea. Las filas vacías o auxiliares no cuentan como tareas.
- **Fecha objetivo**: fin de línea base cuando está informado; si no existe, fin planificado. Una tarea sin ninguna de estas fechas no puede clasificarse como retrasada y genera una advertencia de calidad.
- **Completada a fecha**: tarea cuya fecha de cierre real es igual o anterior a la fecha de control. El estado actual “Completo” o un 100 % sin fecha de cierre real no se utilizarán para inventar una fecha histórica y se mostrarán como inconsistencia.
- **No completada a fecha**: tarea válida que no cumple la regla de “Completada a fecha”.
- **Retrasada a fecha**: tarea cuya fecha objetivo es anterior a la fecha de control y que, a esa fecha, seguía abierta; o tarea cerrada como máximo en la fecha de control pero después de su fecha objetivo.
- **Porcentaje de completadas**: tareas completadas a fecha dividido por tareas totales del conjunto filtrado. Si el total es cero se mostrará “Sin tareas”, nunca un porcentaje engañoso.
- **Filtro de intervalo**: incluye tareas cuyo periodo planificado se solapa al menos un día con el intervalo elegido. Un hito se incluye cuando su fecha cae dentro del intervalo.
- **Estado visible del avance**: el porcentaje de avance mostrado será el valor actual del Excel; no se reconstruirá su valor histórico al mover la fecha de control.
- **Hoja activa**: al abrir un libro con varias hojas Gantt compatibles se prepara la primera hoja detectada; una recarga del mismo libro conserva la hoja elegida si continúa disponible.
- **Intervalo temporal visible**: comprende las tareas filtradas y la fecha de control. La apertura y los cambios de escala posicionan la vista sobre la primera tarea para evitar una zona inicial vacía.

## 2. Functional Requirements (FR)

### FR-01 — Configuración única del libro fuente

- **Priority**: P1
- **Description**: El sistema debe obtener el nombre del Excel fuente desde un único valor de configuración editable en el código y resolverlo en el mismo directorio operativo que el cuadro de mando.
- **Acceptance Criteria**: Dado un cuadro de mando configurado para un libro válido, cuando se cambia únicamente ese valor por el nombre de otro libro compatible del mismo directorio y se recarga, entonces el sistema analiza el nuevo libro sin requerir cambios adicionales.
- **Notes / Dependencies**: El flujo de apertura local soportado se concretará en Diseño respetando las restricciones del navegador.

### FR-02 — Carga local y de solo lectura

- **Priority**: P1
- **Description**: El sistema debe cargar el contenido del libro configurado localmente sin modificarlo ni enviar sus datos a servicios externos.
- **Acceptance Criteria**: Dado un libro compatible, cuando se inicia el flujo local soportado, entonces el navegador abre el cuadro de mando, sus datos quedan disponibles para el análisis y la fecha, tamaño y contenido del fichero fuente permanecen sin cambios; el arranque no exige publicar un servidor externo ni modificar las políticas de ejecución de PowerShell.
- **Notes / Dependencies**: Requiere un navegador compatible y acceso de lectura al directorio.

### FR-03 — Detección y selección de proyecto

- **Priority**: P1
- **Description**: El sistema debe identificar las hojas con estructura Gantt compatible, preparar automáticamente la primera disponible y permitir elegir otra cuando haya varias.
- **Acceptance Criteria**: Dado un libro con dos hojas compatibles, cuando termina la carga, entonces la primera aparece seleccionada con sus métricas y Gantt ya renderizados y ambas hojas están disponibles en el selector; cuando el usuario selecciona otra hoja y recarga el libro, esa selección se conserva si la hoja continúa disponible. Dado un libro con una sola hoja compatible, esta queda seleccionada sin intervención.
- **Notes / Dependencies**: No se agregarán hojas de proyectos diferentes en un mismo total.

### FR-04 — Validación y avisos de calidad

- **Priority**: P1
- **Description**: El sistema debe validar la presencia y coherencia mínima de los datos necesarios antes de calcular resultados.
- **Acceptance Criteria**: Dado un fichero inexistente, una hoja incompatible, una fecha inválida o una tarea completa sin cierre real, cuando se procesa el libro, entonces el sistema muestra un aviso específico, identifica la causa y no presenta como válido ningún indicador afectado.
- **Notes / Dependencies**: Los registros válidos podrán seguir mostrándose cuando el problema sea aislado y el aviso indique el número de registros excluidos.

### FR-05 — Fecha de control móvil

- **Priority**: P1
- **Description**: El sistema debe proporcionar una fecha de control editable que inicialmente use la fecha de estado del proyecto cuando sea válida y, en su defecto, la fecha local actual.
- **Acceptance Criteria**: Dado un plan cargado, cuando el usuario cambia la fecha de control, entonces los indicadores de completitud y retraso y la marca temporal del Gantt se recalculan para esa fecha sin recargar la página.
- **Notes / Dependencies**: El avance porcentual seguirá mostrando el valor actual del Excel.

### FR-06 — Indicadores de seguimiento

- **Priority**: P1
- **Description**: El sistema debe mostrar tareas totales, tareas completadas a fecha, porcentaje de completadas y tareas retrasadas a fecha para el conjunto filtrado.
- **Acceptance Criteria**: Dado un conjunto con tareas abiertas, cerradas en plazo, cerradas tarde y vencidas, cuando se fija una fecha de control, entonces cada caja coincide con las definiciones de la sección 1.1 y muestra tanto el valor como el contexto de fecha y filtros aplicados.
- **Notes / Dependencies**: Las cajas deben distinguir “0” de “Sin tareas” o “Dato no calculable”.

### FR-07 — Filtros combinables

- **Priority**: P1
- **Description**: El sistema debe permitir filtrar por una o varias personas asignadas, intervalo de fechas y completitud a la fecha de control, aplicando una intersección entre filtros activos.
- **Acceptance Criteria**: Dado un plan con varias personas, fechas y estados, cuando se combinan los tres filtros, entonces las cajas y el Gantt contienen exactamente las mismas tareas coincidentes; cuando se elige “Mostrar todos los recursos”, solo se elimina la selección de responsables; cuando se elige “Limpiar intervalo de fechas”, solo se borran las fechas desde/hasta; al limpiar todos los filtros se recupera el conjunto completo de la hoja seleccionada.
- **Notes / Dependencies**: El filtro de completitud ofrecerá como mínimo: todas, completadas a fecha, no completadas a fecha y retrasadas a fecha; “Sin asignar” será una opción explícita. Las limpiezas parciales deben conservar fecha de control, completitud y cualquier otro filtro no afectado.

### FR-08 — Gantt de tareas

- **Priority**: P1
- **Description**: El sistema debe representar todas las tareas filtradas en una línea temporal con nombre, persona asignada, inicio, fin, duración, estado actual y avance actual, manteniendo cada nombre alineado con su barra o hito.
- **Acceptance Criteria**: Dadas tareas con periodos distintos, cuando se muestra el Gantt, entonces cada barra ocupa su intervalo planificado, todas las filas permanecen visibles y alineadas y no existe un scroll vertical independiente que desincronice nombres y marcas; cuando el puntero pasa sobre un nombre o una marca, o la tarea recibe foco de teclado, se resalta la fila completa en ambos paneles.
- **Notes / Dependencies**: La escala temporal debe poder adaptarse a día, semana o mes sin alterar los datos.

### FR-09 — Hitos y fecha de control en el Gantt

- **Priority**: P1
- **Description**: El sistema debe representar los registros marcados como hito con una forma diferenciada y mostrar la fecha de control mediante una línea vertical roja discontinua.
- **Acceptance Criteria**: Dado un hito dentro del intervalo visible, cuando se renderiza el Gantt, entonces aparece en su fecha y se identifica como “Hito” mediante texto accesible y no solo por color; la fecha de control ocupa su posición cronológica, atraviesa cabecera y filas mediante una línea roja discontinua y su significado figura en la leyenda.
- **Notes / Dependencies**: Los hitos fuera de los filtros activos no se muestran.

### FR-10 — Navegación y gestión de escalas

- **Priority**: P2
- **Description**: El sistema debe permitir desplazarse horizontalmente por el Gantt y cambiar entre escalas de día, semana y mes conservando una cabecera temporal legible.
- **Acceptance Criteria**: Dado un proyecto mayor que el área visible, cuando el usuario desplaza o cambia la escala, entonces puede acceder a cualquier tarea filtrada sin perder filtros, fecha de control ni correspondencia entre filas y barras; la cuadrícula, barras y cabeceras se desplazan como una única superficie sin líneas fijas superpuestas. En día y semana las etiquetas usan `DD/MM`; en mes usan nombres castellanos; todas las escalas muestran una banda superior gris oscuro por año y cajas de periodo gris claro.
- **Notes / Dependencies**: La escala diaria debe reservar al menos 52 píxeles por fecha. No se requiere una acción separada “Ajustar a tareas”; la vista se posiciona automáticamente en la primera tarea después de carga, filtrado o cambio de escala.

### FR-11 — Detalle trazable de tareas

- **Priority**: P2
- **Description**: El sistema debe permitir consultar para cada tarea los datos que justifican su clasificación, incluida su fecha objetivo, cierre real y motivo de retraso o inconsistencia.
- **Acceptance Criteria**: Dada una tarea clasificada como retrasada o excluida de un indicador, cuando el usuario abre su detalle, entonces ve las fechas y la regla aplicada que explican el resultado.
- **Notes / Dependencies**: No se mostrarán datos auxiliares que no aporten trazabilidad al seguimiento.

### FR-12 — Vista para PowerPoint

- **Priority**: P1
- **Description**: El sistema debe ofrecer una vista de presentación limpia del estado filtrado y una acción para copiarla como imagen o descargarla como PNG cuando el navegador no permita copiarla.
- **Acceptance Criteria**: Dado un conjunto filtrado, cuando se activa la vista de presentación, entonces se ocultan controles no necesarios, se conservan fecha y filtros como contexto y se obtiene una imagen de 1920 × 1080 píxeles con textos, indicadores, leyenda, hitos y Gantt legibles.
- **Notes / Dependencies**: La imagen representa únicamente la ventana visible; para planes extensos el usuario debe filtrar o ajustar la escala antes de capturar.

## 3. Non-Functional Requirements (NFR)

### NFR-01 — Rendimiento de carga

- **Category**: Performance
- **Requirement**: El sistema debe validar y preparar un plan de hasta 1.000 tareas en un tiempo adecuado para uso interactivo.
- **Metric / Acceptance Criteria**: En un equipo de escritorio con navegador soportado, la carga inicial de un libro local de hasta 1.000 tareas debe completar en 3 segundos o menos, excluyendo el tiempo de selección manual de fichero si el navegador lo exige.

### NFR-02 — Rendimiento de interacción

- **Category**: Performance
- **Requirement**: Los cambios de filtros, fecha de control y escala deben responder sin bloquear la interacción.
- **Metric / Acceptance Criteria**: Con 1.000 tareas cargadas, el resultado filtrado y las cajas se actualizan en 300 ms o menos; el Gantt visible termina de actualizarse en 1 segundo o menos.

### NFR-03 — Accesibilidad

- **Category**: Usability / Accessibility
- **Requirement**: Las funciones principales deben cumplir WCAG 2.2 nivel AA aplicable y no depender exclusivamente del color.
- **Metric / Acceptance Criteria**: Operación completa por teclado; foco visible; nombres accesibles para controles, indicadores, tareas e hitos; contraste mínimo 4.5:1 para texto normal y 3:1 para texto grande y elementos gráficos; contenido utilizable con zoom del 200 %.

### NFR-04 — Privacidad y procesamiento local

- **Category**: Security / Compliance
- **Requirement**: El contenido del Excel debe permanecer en el equipo del usuario.
- **Metric / Acceptance Criteria**: Durante carga, filtrado, visualización y exportación no se realizan solicitudes de red con datos del libro; la solución funciona sin conexión una vez disponibles sus ficheros locales.

### NFR-05 — Integridad del origen

- **Category**: Security / Reliability
- **Requirement**: El cuadro de mando debe operar en modo de solo lectura sobre el libro.
- **Metric / Acceptance Criteria**: Una ejecución completa y la exportación de la vista no cambian hash, tamaño ni fecha de modificación del Excel fuente.

### NFR-06 — Compatibilidad

- **Category**: Portability
- **Requirement**: El cuadro de mando debe funcionar en versiones estables actuales y anteriores de Microsoft Edge y Google Chrome en Windows.
- **Metric / Acceptance Criteria**: Los casos de uso UC-01 a UC-04 pasan en las dos versiones indicadas de ambos navegadores.

### NFR-07 — Escalabilidad visual

- **Category**: Scalability / Usability
- **Requirement**: El sistema debe conservar navegación correcta con hasta 1.000 tareas, 50 personas asignadas y un horizonte de cinco años.
- **Metric / Acceptance Criteria**: Ninguna tarea queda inaccesible; filas y barras permanecen alineadas; filtros y escalas siguen operativos dentro de los límites de NFR-02.

### NFR-08 — Configurabilidad verificable

- **Category**: Maintainability
- **Requirement**: El nombre del Excel fuente debe estar definido una sola vez como valor configurable y documentado para la persona mantenedora.
- **Metric / Acceptance Criteria**: Una búsqueda en los ficheros fuente encuentra una única definición autoritativa del nombre; cambiarla y recargar satisface FR-01.

### NFR-09 — Legibilidad de la salida

- **Category**: Usability
- **Requirement**: La vista de pantalla y la imagen de presentación deben mantener legibles los elementos de seguimiento.
- **Metric / Acceptance Criteria**: En la imagen de 1920 × 1080 no hay textos cortados, solapamientos, cifras truncadas ni controles de edición; títulos y cifras principales son legibles al insertar la imagen a ancho completo en una diapositiva 16:9.

### NFR-10 — Mantenibilidad modular

- **Category**: Maintainability
- **Requirement**: La solución debe mantener separadas la estructura HTML, los estilos, la configuración, la carga del workbook, las reglas de dominio, el estado, la vista y la exportación.
- **Metric / Acceptance Criteria**: No existe CSS ni lógica JavaScript inline en el HTML; cada responsabilidad principal reside en un fichero independiente; la composición no duplica reglas de negocio y el nombre del workbook continúa definido en un único punto.

## 4. User Stories / Use Cases

### UC-01 — Abrir un plan local

- **Actor**: Responsable de proyecto.
- **Preconditions**: El cuadro de mando y el Excel configurado están en el directorio operativo; el libro contiene al menos una hoja Gantt compatible.
- **Main flow**:
  1. El actor abre el cuadro de mando mediante el flujo local soportado.
  2. El sistema carga y valida el libro configurado.
  3. El sistema prepara la primera hoja compatible y permite elegir otro proyecto cuando exista más de uno.
  4. El sistema muestra indicadores y Gantt.
- **Alternative flows**: Si falta el libro, no existe hoja compatible o hay registros incoherentes, se muestra el aviso correspondiente y no se presentan resultados afectados como válidos.
- **Acceptance Criteria**: FR-01, FR-02, FR-03 y FR-04 satisfechos.

### UC-02 — Revisar el estado a una fecha

- **Actor**: Responsable de proyecto o PMO.
- **Preconditions**: Existe un plan válido cargado.
- **Main flow**:
  1. El actor cambia la fecha de control.
  2. El sistema recalcula completadas y retrasadas a fecha.
  3. El sistema actualiza cajas y línea de control del Gantt.
- **Alternative flows**: Si una tarea no dispone de fechas suficientes, el sistema la excluye solo del indicador afectado y muestra la advertencia trazable.
- **Acceptance Criteria**: FR-05, FR-06 y FR-11 satisfechos.

### UC-03 — Analizar y presentar un subconjunto

- **Actor**: Responsable de equipo o persona que prepara seguimiento ejecutivo.
- **Preconditions**: Existe un plan válido cargado.
- **Main flow**:
  1. El actor filtra por asignado, fechas y completitud.
  2. El sistema aplica la intersección a métricas y Gantt.
  3. El actor cambia la escala y activa la vista de presentación.
  4. El actor copia la imagen o descarga el PNG alternativo.
- **Alternative flows**: Si no quedan tareas, la vista muestra “Sin tareas” y permite limpiar filtros; si el portapapeles no está disponible, ofrece descarga PNG.
- **Acceptance Criteria**: FR-07, FR-10 y FR-12 satisfechos.

### UC-04 — Explorar el Gantt accesiblemente

- **Actor**: Cualquier usuario, incluida una persona que use solo teclado o tecnología de asistencia.
- **Preconditions**: Existe un conjunto de tareas visible.
- **Main flow**:
  1. El actor recorre controles y tareas con el teclado.
  2. El sistema anuncia nombre, fechas, responsable, estado e indicación de hito y resalta la fila completa asociada al foco o al puntero.
  3. El actor cambia escala, interpreta año y periodo en la cabecera, abre detalles y vuelve al Gantt sin perder el foco lógico.
- **Alternative flows**: A 200 % de zoom, el contenido se redistribuye o permite desplazamiento sin ocultar funciones.
- **Acceptance Criteria**: FR-08, FR-09, FR-10, FR-11 y NFR-03 satisfechos.

## 5. Integrations & Dependencies

- **Systems involved**: Navegador web local, sistema de ficheros accesible mediante el flujo permitido por el navegador y libro Microsoft Excel compatible (`.xlsx` o `.xlsm`).
- **Data that flows (business description)**: Del libro al cuadro de mando fluyen la identificación del proyecto, fecha de estado y registros de tareas con su EDT, descripción, asignación, duración, fechas, avance, estado, riesgo, bloqueo e indicador de hito. No existe flujo de vuelta al Excel.
- **Constraints**:
  - Integración de solo lectura y sin sincronización en tiempo real.
  - Los valores del libro se vuelven a leer al recargar; no se mantiene una copia histórica.
  - No se requiere conexión a Internet ni servicio externo.
  - Las fórmulas deben disponer de valores guardados utilizables en el libro; el cuadro de mando no está obligado a ejecutar macros ni a recalcular Excel.

## 6. Security & Access Principles

- **Access rules**: Cualquier persona con acceso local al HTML y al Excel puede visualizar los datos; el cuadro de mando no añade autenticación propia ni concede acceso a ficheros que el sistema operativo deniegue.
- **Data sensitivity / classification**: Los nombres, alias, correos, asignaciones y comentarios del proyecto deben tratarse como información interna del proyecto.
- **Audit requirements**: No se requiere registro de uso ni histórico de cambios. La ausencia de escritura sobre el libro se verificará mediante evidencia reproducible.

## 7. Assumptions

- Las hojas de proyecto conservan los conceptos de negocio presentes en el libro de referencia aunque su nombre visible pueda variar.
- La fecha de cierre real es la fuente autorizada para saber si una tarea estaba completada en una fecha pasada.
- La línea base, cuando existe, tiene prioridad sobre el fin planificado para medir retraso.
- Los responsables se filtran por su valor de asignación actual; no se reconstruyen reasignaciones históricas.
- Los registros marcados expresamente como hito son la fuente autorizada de hitos.
- El libro ha sido guardado después de su última actualización para que los valores actuales estén disponibles para lectura.
- La persona usuaria guarda los cambios del Excel antes de pulsar “Recargar libro”; no necesita reiniciar el flujo local mientras este continúe abierto.

## 8. Open Questions

| ID | Question | Status | Resolution | Owner | Target phase |
| --- | --- | --- | --- | --- | --- |
| Q-000 | No hay preguntas abiertas. Las decisiones sobre el flujo local soportado y los componentes concretos pertenecen a Diseño. | cancelled | No aplica | Agent | Phase 2 |

## 9. Sizing & Split Decision

- Metrics: FRs=12, P1=10, UCs=4, NFRs=10, domains=2
- Sizing gates triggered: QG2.9 (P1 count > 5)
- Decision: monolith
- If epic-split → proposed epic slug + slicing strategy (domain | risk | tech-layer) + estimated children: No aplica.
- Justification / override: Se mantiene un único feature porque los doce requisitos forman un solo flujo de datos local y comparten selección de proyecto, fecha de control, filtros y conjunto de tareas. Separar indicadores, Gantt o salida de presentación obligaría a duplicar contratos y pruebas. Los otros indicadores de tamaño permanecen dentro de umbral: 12 FR, 4 casos de uso y 2 dominios.

## 10. Approval

- **Status**: Approved — reconciled after Phase 5 documentation rollback
- **Approved by**: User
- **Date**: 2026-10-25
