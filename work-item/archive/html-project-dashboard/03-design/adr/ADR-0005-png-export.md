# ADR-0005 — Exportación determinista SVG a PNG con fallback

- **Status**: Accepted
- **Date**: 2026-10-23
- **Deciders**: User, Agent
- **Context**: Cuadro de mando HTML para planificación de proyectos

## 1. Problem

Copiar una captura del DOM puede producir diferencias por viewport, controles visibles, scroll o fuentes. El portapapeles de imágenes además depende de permisos y soporte del navegador.

## 2. Decision drivers

- Resultado fijo 1920×1080 y legible en PowerPoint 16:9.
- Misma fecha, filtros, KPIs y viewport que la pantalla.
- Funcionamiento sin librería de captura ni servicio externo.
- Fallback observable ante denegación del portapapeles.

## 3. Considered options

1. Instruir al usuario para usar captura de pantalla.
2. Capturar el DOM con una librería adicional.
3. Componer SVG desde el snapshot, rasterizar a PNG y copiar/descargar.

## 4. Decision

CMP-06 genera un SVG de presentación desde `DashboardSnapshot`, lo dibuja en canvas 1920×1080 y obtiene un Blob PNG. Tras gesto de usuario intenta `ClipboardItem`; si no es posible, descarga el mismo Blob.

## 5. Consequences

### Positive

- Salida reproducible, sin controles ni recortes accidentales.
- Fallback conserva exactamente la misma imagen.
- No se añade dependencia de screenshot.

### Negative

- El compositor de presentación debe mantenerse alineado con el tema visual.
- Solo se exporta la ventana de tareas visible; planes extensos requieren filtrar o ajustar.

## 6. Links / Evidence

- Design: §§3 CMP-06, 5 INT-02, 6 FL-04.
- Clipboard API: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
- Canvas PNG: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
