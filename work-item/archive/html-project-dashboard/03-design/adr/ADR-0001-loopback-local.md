# ADR-0001 — Loopback local para acceso automático al libro

- **Status**: Accepted
- **Date**: 2026-10-25
- **Deciders**: User, Agent
- **Context**: Cuadro de mando HTML para planificación de proyectos

## 1. Problem

El dashboard debe cargar por nombre un Excel vecino, pero los navegadores modernos suelen tratar `file://` como origen opaco y bloquean la lectura automática. Un selector manual incumpliría la carga controlada por una única configuración.

## 2. Decision drivers

- Carga automática usando `WORKBOOK_FILE`.
- Datos exclusivamente locales y sin instalación de backend.
- Compatibilidad con Edge y Chrome en Windows.
- Mínima fricción de uso y superficie de ataque.

## 3. Considered options

1. Abrir directamente `dashboard.html` con `file://`.
2. Solicitar el Excel con un selector en cada uso.
3. Servir el directorio mediante un launcher loopback local.

## 4. Decision

Usar `start-dashboard.cmd` para invocar `start-dashboard.mjs`, un servidor Node.js efímero vinculado solo a `127.0.0.1`, que elige un puerto libre, sirve únicamente GET/HEAD desde la raíz validada y abre el dashboard. `start-dashboard.ps1` queda como alternativa opcional; `file://` no será un modo soportado.

## 5. Consequences

### Positive

- Carga automática same-origin por nombre.
- Clipboard API disponible en un origen local confiable.
- Sin transmisión pública ni backend persistente.

### Negative

- Requiere iniciar mediante launcher y mantener una consola mientras se usa.
- Requiere Node.js 22 o superior; el CMD detecta su ausencia y muestra un error accionable, mientras `package.json` fija la versión mínima compatible.
- El flujo principal evita depender de políticas corporativas de ejecución de PowerShell.

## 6. Links / Evidence

- Design: §§2, 3 CMP-01, 11.1.
- MDN: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS/Errors/CORSRequestNotHttp
- Proof: GET loopback con hash idéntico documentado en `design.md` §11.1.
