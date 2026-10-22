# Naming Conventions — {{Technology Name}} (Template)

> Technology-specific naming standards. Loaded via `tech-config.yml:guidelines[]`
> (never hardcoded in `framework/config/context-routing.yml`).

## General rules

- Use lowercase-kebab-case for slugs, `UPPER_SNAKE` for constants — adapt to your stack.
- Every API-visible name must derive from `03-design/design.md` (§3 Components, §4 Data Model).
- Do not invent API names in Phase 5; missing names go to `build-log.md` as clarification notes.

## By artifact type

| Artifact | Pattern | Example |
| --- | --- | --- |
| Component | `{{prefix}}<Name>` | `{{example}}` |
| Test | `<Name>{{suffix}}` | `{{example}}Test` |

## Forbidden

- ❌ Environment-specific values in names (IDs, org names, URLs)
- ❌ Ambiguous abbreviations without a glossary entry
