# PCF Guidelines

## Use Cases

- Use PCF when platform controls cannot meet user experience, visualization, input, or integration requirements.
- Do not build PCF controls for simple formatting or behavior available through standard controls, business rules, or form configuration.

## Architecture

- Keep the control contract explicit in `ControlManifest.Input.xml`.
- Minimize dependencies and bundle size.
- Keep rendering deterministic and responsive.
- Separate Dataverse/Web API access from presentation logic where practical.
- Handle offline, loading, empty, and error states.

## Security and Data

- Request only required properties and datasets.
- Do not store secrets in control code, manifest, or resources.
- Respect user privileges and Dataverse errors.
- Sanitize any HTML or user-provided content rendered by the control.

## Accessibility and UX

- Support keyboard navigation for interactive controls.
- Provide labels, ARIA attributes, and focus behavior where needed.
- Preserve model-driven app styling conventions unless the design intentionally requires otherwise.
- Test in the target model-driven app or canvas app host.

## Build and Packaging

- Run npm build/lint/test commands defined by the project.
- Include the PCF project in the solution.
- Package via the project solution process, not ad hoc files.

## Checklist

- [ ] Standard controls were insufficient.
- [ ] Manifest contract is explicit and minimal.
- [ ] Build/lint/test evidence exists.
- [ ] Accessibility behavior is verified.
- [ ] Control is included in the target solution.
- [ ] No secrets or unsupported host assumptions are present.
