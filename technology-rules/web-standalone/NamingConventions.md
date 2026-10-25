# Naming Conventions — Standalone Web

## General rules

- Use lowercase-kebab-case for file names and CSS classes.
- Use `camelCase` for functions and variables, `PascalCase` for domain types/classes and `UPPER_SNAKE_CASE` for immutable configuration keys.
- Use `CMP-##`, `FR-##`, `NFR-##`, `UC-##` and `ADR-####` identifiers exactly as defined in phase artifacts.
- Public labels use clear Spanish business language; internal names use concise English technical language.

## By artifact type

| Artifact | Pattern | Example |
| --- | --- | --- |
| JavaScript module | `<responsibility>.js` | `task-metrics.js` |
| Test | `<module>.test.js` | `task-metrics.test.js` |
| E2E spec | `<journey>.spec.js` | `dashboard-offline.spec.js` |
| CSS class | `<block>__<element>--<modifier>` when structure needs it | `gantt__bar--late` |
| Configuration constant | `UPPER_SNAKE_CASE` | `WORKBOOK_FILE` |

## Forbidden

- Environment-specific absolute paths, machine names, ports or user names in source.
- Ambiguous abbreviations without a glossary entry.
- Workbook cell coordinates embedded in domain/UI modules; mappings belong to the source adapter.
