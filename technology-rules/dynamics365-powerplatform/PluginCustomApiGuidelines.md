# Plugin and Custom API Guidelines

## When to Use

- Use plugins for Dataverse event logic that must run close to the transaction.
- Use custom APIs for explicit server-side operations called from apps, flows, integrations, or commands.
- Prefer declarative platform features when they meet the requirement without compromising supportability.
- Use Power Automate or asynchronous processing for long-running orchestration.

## Plugin Registration

- Register steps only for required messages, tables, stages, and filtering attributes.
- Avoid broad synchronous registration on `Retrieve` and `RetrieveMultiple`.
- Use pre/post images with explicit columns instead of retrieving extra data when appropriate.
- Do not use all-column images.
- Keep depth/recursion protections explicit.

## Code Standards

- Keep plugin classes small and delegate business logic to testable services.
- Use dependency injection or thin adapters where practical for unit testing.
- Validate inputs early and fail with meaningful user-safe messages.
- Avoid batch request types inside synchronous plugin or workflow execution.
- Trace diagnostic context, not sensitive data.
- Do not catch and swallow exceptions that should fail the transaction.

## Custom APIs

- Define clear request and response contracts.
- Keep names stable and publisher-prefixed.
- Document whether the API is private, internal, or intended for external use.
- Validate caller privileges and input values.
- Version breaking changes with a new API or documented compatibility strategy.

## Testing

- Unit test business services.
- Cover positive, negative, permission, recursion/depth, and bulk scenarios.
- Build and test projects before packaging solution artifacts.

## Checklist

- [ ] Declarative alternatives were considered.
- [ ] Step registration is narrow and includes filtering attributes where applicable.
- [ ] Images include explicit required columns only.
- [ ] No long-running synchronous work is introduced.
- [ ] Unit tests cover core logic and failure paths.
- [ ] Trace output avoids sensitive data.
