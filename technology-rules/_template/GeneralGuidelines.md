# General Guidelines — {{Technology Name}} (Template)

> Non-overlapping coding standards for this stack. Must not duplicate `framework/` process rules;
> stack tools, commands, and thresholds live here and in `tech-config.yml`.

## Construction

- One task = one independently buildable/verifiable unit (class, component, flow, migration).
- Follow the deployment strategy in `tech-config.yml:deployment` and the canonical protocol file (if any).
- Record every deploy/import command, output, and result in `05-build/build-log.md`.

## Quality

- Static analysis per `tech-config.yml:linting` must pass before Phase 6 closes.
- Tests per `tech-config.yml:testing` (positive/negative/boundary; bulk where applicable).
- No secrets, tokens, or environment-specific values in source control.

## Forbidden Patterns

```
❌ {{Pattern 1}} — Reason
❌ {{Pattern 2}} — Reason
```
