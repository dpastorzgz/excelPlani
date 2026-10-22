# Security Guidelines

## Security Model

- Define personas before designing roles.
- Use least privilege for table, task, and app access.
- Prefer security teams or Microsoft Entra groups for scalable assignment.
- Use field security profiles for sensitive columns when table-level privileges are too broad.
- Document business unit, owner team, access team, hierarchy, and sharing implications.

## Apps, Flows, and Connections

- Share apps and flows with groups, not individual users, where possible.
- Confirm connection ownership and service account policy for production flows.
- Use service principals or approved service accounts for automation.
- Apply DLP policies for connector combinations before production.
- Avoid personal user connections for production-critical flows.

## Secrets and Configuration

- Do not store secrets in source control, app formulas, flow definitions, plugin configuration text, or plain environment variables.
- Use secure platform features, Azure Key Vault, managed identity, or approved secret stores.
- Treat exported solution files as sensitive when they include configuration references.

## Auditing and Monitoring

- Enable auditing where required by compliance or supportability.
- Monitor critical flows, integrations, and plugin failures.
- Define alert ownership for production automation.
- Mask sensitive data in logs, telemetry, screenshots, and test evidence.

## Validation

- Verify access with representative users for each affected persona.
- Test denied access paths, not only happy paths.
- Confirm users cannot access tables, apps, commands, flows, or columns outside their role.

## Checklist

- [ ] Personas are documented.
- [ ] Roles apply least privilege.
- [ ] Field security is used for sensitive columns when needed.
- [ ] Production flows avoid personal connections.
- [ ] DLP impact is checked.
- [ ] Persona-based access evidence exists.
