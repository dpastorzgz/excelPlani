# Technology Rules — New Technology Template

This directory contains the template files for adding a new technology to the framework.

## How to add a new technology

1. Copy this entire `_template/` directory to `technology-rules/[your-technology-slug]/`
2. Fill in all `{{placeholder}}` values in every file
3. Add technology-specific guideline files as needed (see examples in `technology-rules/salesforce/`)
4. Validate with `bash framework/scripts/validate-new-tech.sh [your-technology-slug]`
5. Set `technology: [your-technology-slug]` in a project README or project `tech-config.yml`

## Files in this template

| File                   | Purpose                                                          | Required    |
| ---------------------- | ---------------------------------------------------------------- | ----------- |
| `rules.md`             | Phase-by-phase rules for this technology                         | Yes         |
| `tech-config.yml`      | Machine-readable configuration (canonical schema — single source of truth for `guidelines[]`, coverage, deploy commands) | Yes |
| `quality-gates.md`     | Blocking technology gates (`<PREFIX><phase>.<n>`, e.g. `SFG5.x`) | Yes         |
| `release-pipeline.yml` | Ordered environments, per-hop validation, evidence fields       | Yes         |
| `NamingConventions.md` | Naming standards                                                 | Yes         |
| `context.md`           | Background knowledge the agent loads before any task             | Recommended |
| `verification-overlay.md` | Deployment triage + verification overlay (complements framework skill) | Recommended |
| `GeneralGuidelines.md` | Non-overlapping coding standards (optional)                      | Recommended |
| `templates/build-log-overlay.md` | Technology provenance block (extends generic `build-log.md`) | Recommended |
| `skills/`              | Technology-specific skill modules, when needed (see `technology-rules/salesforce/skills/`) | Recommended |

Validate from the repo root with:

```bash
bash framework/scripts/validate-new-tech.sh [your-technology-slug]   # one technology
bash framework/scripts/validate-new-tech.sh                          # every technology
```

## Naming convention for the technology slug

- Use lowercase-kebab-case
- Examples: `salesforce`, `nodejs`, `react`, `python-django`, `java-spring`

## See also

- `technology-rules/salesforce/` — Complete reference implementation
- `AGENTS.md` — Agent entrypoint and source-of-truth map
- `framework/rules/core.md` — Rule precedence and technology resolution
- `framework/templates/project-rules/` — Optional per-repository overlay that may add/tighten (never relax) these rules and, with `replaces`, supersede a prose guideline
