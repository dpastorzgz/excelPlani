# Canvas App Guidelines

## Architecture

- Use canvas apps for tailored task experiences, mobile-first interactions, or composite workflows.
- Keep screens focused and minimize cross-screen dependencies.
- Use components for repeated UI and behavior.
- Store reusable formulas in named formulas where available.
- Prefer Dataverse as the data source for business applications that need security, relationships, and lifecycle.

## Power Fx and Data

- Design for delegation from the first draft.
- Avoid copying large server-side datasets into collections.
- Use collections for small local state, temporary calculations, and offline-oriented scenarios only when justified.
- Retrieve and display only the data required by the current screen or task.
- Avoid formulas that create hidden dependencies across many screens.

## Performance

- Keep the start screen lightweight.
- Avoid heavy `OnStart` logic; defer work until needed.
- Remove unused screens, controls, media, and connectors.
- Use Monitor and performance tools when load time or connector usage is risky.

## Security and Connectors

- Ensure the app is shared only with intended users or groups.
- Confirm connector use complies with DLP policy.
- Do not store secrets in variables, collections, labels, or formulas.
- Use connection references and environment variables through solutions where applicable.

## Testing

- Test with target roles, realistic data volume, and target devices.
- Cover delegation boundaries, empty states, validation errors, connector failures, and security-denied scenarios.

## Checklist

- [ ] Delegation impact is understood and documented.
- [ ] Start screen is lightweight.
- [ ] Large collections are avoided or justified.
- [ ] Connector and DLP impact is verified.
- [ ] Security sharing is validated.
- [ ] Monitor or manual performance evidence exists for risky apps.
