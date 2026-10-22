# Model-Driven App Guidelines

## App Design

- Prefer model-driven apps for Dataverse-centric workflows with structured records, forms, views, dashboards, and role-based navigation.
- Keep each app focused on a persona or operational workflow.
- Include only required tables, pages, commands, and dashboards.
- Validate navigation, forms, and commands for each affected security role.

## Forms and Views

- Keep main forms task-oriented and avoid unnecessary tabs, subgrids, and hidden dependencies.
- Use business rules for simple UI behavior and validation.
- Use JavaScript only for supported client-side scenarios that cannot be achieved declaratively.
- Views must include only columns needed for decision-making and must use selective filtering for high-volume tables.

## Client Script

- Use supported Client API only.
- Do not use deprecated OData v2.0 endpoints.
- Do not manipulate the DOM directly.
- Do not use `window.top` or unsupported frame assumptions.
- Use asynchronous calls for HTTP/HTTPS and Web API operations.
- Keep libraries modular and solution-aware.

## Commands and Business Logic

- Commands must respect security roles and enable rules.
- Complex business logic belongs in plugins, custom APIs, cloud flows, or server-side services, not in client script.
- Command JavaScript must be covered by manual or automated evidence for enabled/disabled states.

## Checklist

- [ ] App scope matches a persona or workflow.
- [ ] Forms do not load unnecessary controls, scripts, or subgrids.
- [ ] Views are selective and useful for target users.
- [ ] Client script uses supported APIs only.
- [ ] Commands respect security and state.
- [ ] User role validation evidence exists.
