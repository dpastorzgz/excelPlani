# Axet Agent Rules Pointer

The authoritative agent entrypoint is `AGENTS.md`.

Operational rules are defined in:

- `framework/rules/core.md`
- `framework/config/context-routing.yml`
- `framework/config/phase-approval.yml`
- `framework/config/phase-skips.yml`
- `project-rules/project-config.yml` (optional project overlay, when present)

This file is kept only for tools that still look for `.axetrules/rules.md`.
Do not add separate framework rules here.
