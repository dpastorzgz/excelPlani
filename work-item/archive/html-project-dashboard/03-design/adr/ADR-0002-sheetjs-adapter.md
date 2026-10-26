# ADR-0002 — SheetJS CE vendorizado y adaptación por encabezados

- **Status**: Accepted
- **Date**: 2026-10-23
- **Deciders**: User, Agent
- **Context**: Cuadro de mando HTML para planificación de proyectos

## 1. Problem

La aplicación debe leer `.xlsx` y `.xlsm` en el navegador, tolerar hojas Gantt en posiciones variables y funcionar offline sin ejecutar macros ni escribir el libro.

## 2. Decision drivers

- Compatibilidad XLSX/XLSM probada en browser.
- Distribución local y licencia permisiva.
- Validación por concepto de negocio, no por columna fija.
- Mensajes explícitos para valores inválidos o fórmulas sin cache.

## 3. Considered options

1. Automatización de Microsoft Excel/ActiveX.
2. Parser propio de ZIP/XML.
3. SheetJS CE vendorizado y adaptador propio por encabezados.

## 4. Decision

Vendorizar SheetJS CE 0.20.3 y su atribución Apache 2.0. CMP-02 obtiene un `ArrayBuffer`, identifica encabezados en las primeras 50 filas, normaliza alias y crea el modelo de §4. No se ejecuta VBA ni se recalculan fórmulas.

## 5. Consequences

### Positive

- Soporte documentado de XLSX/XLSM con menor riesgo que un parser propio.
- Offline y sin dependencia CDN en runtime.
- El resto de la aplicación queda desacoplado de SheetJS y coordenadas.

### Negative

- Se debe conservar licencia, versión y avisos de terceros.
- El dashboard depende de valores de fórmula guardados al guardar el libro.

## 6. Links / Evidence

- Design: §§3 CMP-02, 4, 7, 11.1.
- SheetJS formats: https://docs.sheetjs.com/docs/miscellany/formats/
- SheetJS license: https://docs.sheetjs.com/docs/miscellany/license/
