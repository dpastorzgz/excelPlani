# General Guidelines — Standalone Web

## Construction

- Keep dependencies one-way: configuration/source adapters → normalized domain → state/selectors → views/export.
- Prefer pure functions for date classification, filtering and metrics.
- Use `textContent`, DOM creation APIs and attribute setters for workbook-derived values; sanitize any unavoidable rich content.
- Vendor and pin browser dependencies; commit lockfile and dependency license notices.
- Use a localhost launcher with loopback-only binding, ephemeral/high configurable port and explicit shutdown behavior.
- Build a deterministic `dist/` directory and never make runtime behavior depend on source or test directories.

## Accessibility and UI

- Start with semantic HTML; use SVG ARIA/title/description only where native semantics are insufficient.
- Preserve logical keyboard order and visible focus. Do not trap focus in Gantt navigation.
- Encode status with text/symbol plus color. Respect `prefers-reduced-motion`.
- Virtualization must preserve accessible row identity and synchronization between task list and timeline.

## Quality

- ESLint, Vitest, Playwright and axe-core results are blocking according to `quality-gates.md`.
- Test dates with explicit local-calendar semantics; do not parse locale-formatted display strings as authoritative dates.
- Test empty, malformed, missing-formula-cache, duplicate header and maximum-volume inputs.
- Scan release files for unexpected `http://` or `https://` runtime references, allowing only documented text links that are never fetched.

## Forbidden Patterns

```text
❌ Runtime CDN scripts/styles/fonts
❌ innerHTML fed by workbook values
❌ Date logic based on implicit UTC conversion for date-only project values
❌ Silent catch blocks or fallback metrics that convert invalid data to zero
❌ Recalculation or execution of workbook macros in the browser
```
