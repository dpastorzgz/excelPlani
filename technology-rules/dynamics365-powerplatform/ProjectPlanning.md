# Project Planning Guidelines

## Purpose

Use this guide during proposal and specification phases to estimate and plan
Dynamics 365 / Power Platform work with enough ALM, security, testing, and
release effort included.

## Planning Inputs

- Target Dynamics 365 app or Power Platform workload.
- Personas, roles, business units, and access model.
- Dataverse table, column, relationship, and data migration impact.
- App type: model-driven, canvas, or both.
- Automation type: flow, plugin, custom API, PCF, or external integration.
- Connector, licensing, DLP, and tenant policy constraints.
- Environment strategy and release pipeline.
- Reporting, audit, monitoring, and operational support requirements.

## Estimation Buckets

| Bucket | Include |
| ------ | ------- |
| Discovery | process, users, data, security, integration, licensing |
| Design | solution architecture, schema, UX, automation, ALM, security |
| Build | Dataverse, apps, flows, plugins, PCF, configuration |
| ALM | solution packaging, checker, pipelines, deployment settings |
| Test | persona tests, flow runs, plugin tests, PCF tests, regression |
| Release | managed imports, smoke tests, rollback planning, evidence |
| Support | monitoring, runbooks, hypercare, defect triage |

## Risk Factors

- Existing unmanaged layers in non-development environments.
- Multiple teams customizing the same solution layers.
- Complex security model or business unit structure.
- Premium/custom connectors or DLP restrictions.
- High-volume Dataverse tables or integrations.
- Synchronous plugins on common operations.
- Critical flows with weak failure handling.
- Data migration or historical audit requirements.

## Required Planning Outputs

- Solution boundary and component inventory.
- Environment and ALM plan.
- Security/persona matrix.
- Test evidence plan.
- Release and rollback plan.
- Open risks and assumptions.
