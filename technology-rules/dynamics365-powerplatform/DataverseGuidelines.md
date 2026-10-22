# Dataverse Guidelines

## Schema Design

- Model business concepts as Dataverse tables only when they need lifecycle, ownership, security, reporting, relationships, or automation.
- Reuse standard Dynamics 365 and Dataverse tables before adding custom tables.
- Keep table ownership explicit: user/team-owned for business records, organization-owned for reference/configuration data.
- Use choices for stable controlled values; use reference tables when values need ownership, metadata, or lifecycle.
- Do not create columns that duplicate standard fields unless a documented business meaning differs.

## Data Access

- Retrieve only required columns in plugins, integrations, and scripts.
- Avoid "all columns" query patterns.
- Use alternate keys for integration upserts where natural external identifiers exist.
- Design integrations for service protection limits, retries, idempotency, and duplicate handling.
- Use bulk APIs from external clients for intentional bulk operations; do not use batch request types inside synchronous plugin/workflow execution.

## Relationships and Cascading

- Document cascade behavior for every new relationship that can delete, assign, share, or reparent records.
- Avoid broad cascading delete unless business ownership and recovery are understood.
- Use many-to-many relationships only when neither side owns relationship attributes.

## Configuration and Reference Data

- Use environment variables for environment-specific values.
- Use configuration tables for business-managed settings that require history, ownership, or richer validation.
- Seed reference data through solutions, data migration scripts, or documented deployment steps.
- Never rely on GUIDs that differ by environment.

## Auditing and Compliance

- Enable auditing only for tables and columns with a clear compliance or operational need.
- Classify sensitive columns and protect them with field security when role-level table security is insufficient.
- Document retention, migration, and deletion requirements for regulated data.

## Checklist

- [ ] Standard tables were reused where appropriate.
- [ ] Ownership model is documented.
- [ ] Required columns only are retrieved in code/integrations.
- [ ] Relationship cascade behavior is documented.
- [ ] Environment-specific values are not hardcoded.
- [ ] Security and audit requirements are reflected in schema design.
