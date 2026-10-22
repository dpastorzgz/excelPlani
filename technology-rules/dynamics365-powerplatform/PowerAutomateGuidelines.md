# Power Automate Guidelines

## Flow Selection

- Use cloud flows for orchestration, approvals, notifications, connector actions, and human-readable business automation.
- Use Dataverse plugins/custom APIs for transactional low-latency logic that must complete inside the Dataverse operation.
- Use child flows for reusable orchestration units.
- Avoid using flows as hidden substitutes for core transaction validation.

## Design Standards

- Every production flow must be solution-aware.
- Use connection references and environment variables.
- Name triggers, scopes, and key actions by business purpose.
- Group related actions into scopes: `Validate`, `Process`, `Notify`, `Handle Failure`.
- Document trigger conditions and concurrency settings when they matter.

## Error Handling

- Flows that write data, integrate systems, send approvals, or notify users must include failure handling.
- Use configured run-after paths for expected failure branches.
- Record correlation identifiers where available.
- Avoid infinite loops by using trigger conditions, change checks, or dedicated status fields.

## Performance and Limits

- Filter at the trigger or query level where possible.
- Avoid broad list rows actions without filters, pagination control, and limits.
- Use retry policies intentionally and document non-default settings.
- Avoid unnecessary apply-to-each loops over large datasets.

## Testing Evidence

- Capture run history for changed success and failure paths.
- Include trigger input summary, important action outputs, and final outcome.
- Mask or omit sensitive data in evidence.

## Checklist

- [ ] Flow is solution-aware.
- [ ] Connection references and environment variables are used.
- [ ] Trigger conditions and concurrency settings are documented when relevant.
- [ ] Failure handling exists for critical paths.
- [ ] Run evidence covers changed success and failure paths.
- [ ] Sensitive data is not exposed in logs or evidence.
