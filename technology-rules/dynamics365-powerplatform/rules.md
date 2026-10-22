# Technology Rules - Dynamics 365 / Power Platform

**Technology**: Dynamics 365 Customer Engagement + Power Platform  
**Applicable layers**: Dataverse, model-driven apps, canvas apps, Power Automate, plugins, custom APIs, PCF, security, solutions, ALM  
**Out of scope**: Dynamics 365 Finance and Operations, Business Central

**Reference files**:

- `NamingConventions.md` - Naming standards for Dataverse and Power Platform artifacts
- `DataverseGuidelines.md` - Dataverse table, column, relationship, data, and API rules
- `ModelDrivenAppGuidelines.md` - Model-driven app, form, view, command, and client script rules
- `CanvasAppGuidelines.md` - Canvas app architecture, Power Fx, delegation, and performance rules
- `PowerAutomateGuidelines.md` - Cloud flow design, error handling, and run evidence rules
- `PluginCustomApiGuidelines.md` - Dataverse plugin, custom API, and custom workflow activity rules
- `PCFGuidelines.md` - Power Apps component framework rules
- `SecurityGuidelines.md` - Role, privilege, sharing, DLP, identity, and secret handling rules
- `ALMDeploymentGuidelines.md` - Solution, `pac`, Azure DevOps, checker, and release rules
- `ProjectPlanning.md` - Project planning and estimation guidance
- `quality-gates.md` - Blocking Dynamics 365 / Power Platform quality gates

---

## Overview

These rules govern projects built on Dynamics 365 Customer Engagement apps and
Power Platform components that run on Dataverse. They apply to all agents and
all framework phases when the target technology is `dynamics365-powerplatform`.

Official Microsoft Learn documentation is the authoritative baseline:

- Dynamics 365 implementation guide: https://learn.microsoft.com/en-us/dynamics365/guidance/implementation-guide/introduction
- Power Platform ALM: https://learn.microsoft.com/en-us/power-platform/alm/
- ALM basics: https://learn.microsoft.com/en-us/power-platform/alm/basics-alm
- Power Platform Build Tools: https://learn.microsoft.com/en-us/power-platform/alm/devops-build-tools
- Solution Checker: https://learn.microsoft.com/en-us/power-apps/maker/data-platform/use-powerapps-checker
- Power Platform Well-Architected: https://learn.microsoft.com/en-us/power-platform/well-architected/
- Dataverse developer best practices: https://learn.microsoft.com/en-us/power-apps/developer/data-platform/best-practices/

---

## Authoritative Baseline

### Role and Mission

Act as a Senior Dynamics 365 / Power Platform Architect. Deliver production-ready,
secure, supportable, maintainable solutions for Dataverse and Dynamics 365 CE
apps using Microsoft-supported ALM practices and Microsoft Learn guidance.

### Reference-First Development

Before producing Dynamics 365 / Power Platform design, source changes, tests, or
deployment steps, load this file plus the relevant specialized guideline:

- Naming: `NamingConventions.md`
- Dataverse schema/data: `DataverseGuidelines.md`
- Model-driven apps/client script: `ModelDrivenAppGuidelines.md`
- Canvas apps: `CanvasAppGuidelines.md`
- Cloud flows: `PowerAutomateGuidelines.md`
- Plugins/custom APIs: `PluginCustomApiGuidelines.md`
- PCF: `PCFGuidelines.md`
- Security: `SecurityGuidelines.md`
- ALM/deployment/release: `ALMDeploymentGuidelines.md`, `release-pipeline.yml`

### Architecture Decision Process

- Same-table validations, calculated display behavior, and simple UI logic -> maker configuration, business rules, or model-driven form logic.
- Business process orchestration with connector actions and approvals -> Power Automate cloud flow.
- Transactional, low-latency Dataverse business logic -> synchronous plugin or custom API.
- Long-running or integration-heavy work -> asynchronous plugin, cloud flow, Azure Function, queue, or event-driven integration.
- Complex reusable UI control -> PCF component.
- CRUD-first user experience over Dataverse -> model-driven app.
- Task-specific mobile or composite UI -> canvas app.

### Core Standards

- All code, comments, and rule documentation must be written in English.
- Keep all first-party and custom components inside explicit solutions.
- Development uses unmanaged solutions; test, UAT, and production use managed solutions.
- Default solution customizations are forbidden except for inspection or emergency diagnosis.
- Use environment variables, connection references, configuration tables, and Azure Key Vault or secure platform features instead of hardcoded values.
- Prefer supported platform APIs and Microsoft-documented extension points.
- Keep solution layering simple and documented; avoid unmanaged customizations in downstream environments.
- Apply Power Platform Well-Architected pillars: reliability, security, operational excellence, performance efficiency, and experience optimization.

### Security, Identity, and Data Access

- Define least-privilege security roles and teams for every persona.
- Verify table privileges, column security, business units, sharing, and hierarchy impact.
- Do not store secrets in flows, apps, plugins, JavaScript, environment variables of type text, or source control.
- Use service principals or workload identity federation for CI/CD where available.
- Enforce DLP policies and connector governance before production release.
- Avoid logging personal, sensitive, credential, token, or regulated data.

### Performance and Service Protection

- Query only required Dataverse columns.
- Avoid retrieving all columns or using broad unfiltered queries.
- Respect Dataverse service protection limits and design for retry/backoff in external clients.
- Avoid synchronous long-running work in plugins, flows, and client scripts.
- Test with realistic data volumes, security roles, and concurrent usage where risk is meaningful.

### Testing and Quality

- Solution Checker must run for changed unmanaged solutions before deployment evidence is accepted.
- Critical and high Solution Checker findings are blocking unless a documented exception is approved.
- Plugin/custom API code must build and pass automated tests when present.
- PCF code must pass npm build/lint/test when present.
- Cloud flows must have run evidence or documented manual test evidence for changed business paths.
- Security role behavior must be verified for affected personas.

---

## Context Loading (Mandatory - Before Any Task)

Before starting any Dynamics 365 / Power Platform task:

1. Load `rules.md` (this file).
2. Load `NamingConventions.md`.
3. Load the phase-specific files listed below.

No design, source change, test, deployment, or release step may be produced
without this baseline.

---

## Mandatory Files to Load per Phase

| Phase | Files to Load |
| ----- | ------------- |
| All phases | `rules.md`, `NamingConventions.md` |
| 1 - Proposal | Baseline only |
| 2 - Specs | + `ProjectPlanning.md`, `SecurityGuidelines.md` |
| 3 - Design | + `DataverseGuidelines.md`, `ModelDrivenAppGuidelines.md`, `CanvasAppGuidelines.md`, `PowerAutomateGuidelines.md`, `PluginCustomApiGuidelines.md`, `PCFGuidelines.md`, `SecurityGuidelines.md`, `ALMDeploymentGuidelines.md` |
| 4 - Tasks | + all design-phase guideline files relevant to the selected components |
| 5 - Construction | All active guideline files in this directory |
| 6 - Verification | All active guideline files in this directory, `quality-gates.md` |
| 7 - Testing | + `PowerAutomateGuidelines.md`, `PluginCustomApiGuidelines.md`, `PCFGuidelines.md`, `SecurityGuidelines.md` |
| 8 - Commit and PR | + `ALMDeploymentGuidelines.md`, `quality-gates.md` |
| 9 - Release | + `ALMDeploymentGuidelines.md`, `release-pipeline.yml` |
| 10 - Archive | Baseline only |

---

## Recommended Project Structure

```text
solutions/
  [SolutionName]/
    src/                         # unpacked solution source
    [SolutionName]_managed.zip    # generated artifact only, not edited by hand
    [SolutionName].zip            # unmanaged export artifact only
plugins/
  [PluginProject]/
pcf/
  [ControlName]/
work-item/
  [project-slug]/
    05-build/
      build-log.md
      solution-inventory.md
      checker-results/
```

Project-specific repositories may use different folder names, but every
solution source path, plugin project, PCF project, and generated zip must be
documented in the work item build log.

---

## General Prohibitions

- Never customize the default solution for planned work.
- Never deploy unmanaged solutions to test, UAT, or production.
- Never hardcode environment URLs, GUIDs, credentials, tenant IDs, client secrets, queue names, or connector-specific values.
- Never commit solution export secrets, connection credentials, `.authprofile`, or local `pac` auth files.
- Never ignore critical or high Solution Checker issues without approved documented risk acceptance.
- Never leave unmanaged layers in downstream environments after release unless explicitly approved and recorded.
- Never use deprecated or unsupported Client API, OData v2.0, or direct DOM manipulation in model-driven apps.
- Never register synchronous plugins for long-running work or broad `Retrieve` / `RetrieveMultiple` logic without documented justification.
- Never use "all columns" retrieval patterns in plugins, integrations, or custom code.
- Never skip fault handling in cloud flows that perform writes, approvals, integrations, or notifications.
- Never release a flow, app, plugin, or PCF component without persona-based security validation when data access is affected.

---

## Scopes for Conventional Commits

| Scope | Use |
| ----- | --- |
| `dataverse` | Tables, columns, relationships, choices, custom APIs |
| `modelapp` | Model-driven apps, forms, views, commands, web resources |
| `canvas` | Canvas apps and Power Fx changes |
| `flow` | Power Automate cloud flows |
| `plugin` | Dataverse plugins and custom workflow activities |
| `pcf` | Power Apps component framework controls |
| `security` | Security roles, teams, field security, DLP-related configuration |
| `alm` | Solutions, `pac`, Build Tools, pipelines, deployment config |
| `test` | Automated tests and manual test evidence |

### Examples

```text
feat(dataverse): add customer renewal table
fix(flow): add retry handling to approval notification flow
test(plugin): cover quote validation custom API
chore(alm): update managed solution export pipeline
```

---

## Phase 01 - Proposal

Record high-level impact only:

- Target Dynamics 365 app or Power Platform workload.
- Expected Dataverse data model impact.
- Licensing and connector implications.
- Security persona impact.
- ALM/release complexity.
- Integration and data migration risk.
- Environment strategy assumptions.

Do not include detailed schema, plugin, flow, or UI design in Phase 1.

---

## Phase 02 - Specs

Specs must include:

- User personas and affected security roles.
- Data ownership and access expectations.
- Solution boundary and component types in scope.
- Non-functional requirements: performance, availability, auditability, compliance, and monitoring.
- Environment variables, connection references, and external dependencies.
- Acceptance criteria for apps, flows, plugins, PCF, and security where relevant.

---

## Phase 03 - Design

Design must define:

- Solution structure and publisher.
- Dataverse schema changes and relationship impact.
- App UX model: model-driven, canvas, or both.
- Automation approach: cloud flow, plugin, custom API, or external service.
- Security model: roles, teams, field security, sharing, business units.
- ALM strategy: unmanaged source solution, managed artifact, pipeline environments, rollback plan.
- Test strategy and evidence required per component type.

---

## Phase 04 - Tasks

Tasks must be decomposed by deployable or verifiable unit:

- Dataverse schema group.
- Model-driven app/form/view command group.
- Canvas app change.
- Flow change.
- Plugin/custom API assembly and registration.
- PCF component.
- Security role or persona validation group.
- ALM pipeline/configuration change.

Each task must identify the target solution and expected evidence.

---

## Phase 05 - Construction

Applicable quality gates: DPPG5.1 through DPPG5.10.

### Mandatory Pre-Step

Before any build or deploy work begins:

1. Ensure `work-item/[project-slug]/05-build/` exists.
2. Create or update `work-item/[project-slug]/05-build/solution-inventory.md`.
3. Create or update `work-item/[project-slug]/05-build/build-log.md`.
4. Confirm the target unmanaged development solution name and source folder.

### Standard Build Loop

For each task, grouped in dependency order (`Dataverse → plugins/custom APIs → apps → flows → security/roles`):

1. Build or configure the component in the development environment.
2. Add the component to the explicit unmanaged solution (segmented `core`/`feature` per solution strategy; never the default solution).
3. Export the unmanaged solution.
4. Unpack it into source control with `pac solution unpack`.
5. Update `solution-inventory.md` with exact components changed.
6. Run Solution Checker before accepting deployment evidence (per-group; critical/high block).
7. Build managed solution artifact for downstream environments (bump `major.minor.build.revision` per version policy; record upgrade type `update` vs `upgrade` vs `stage-and-upgrade`).
8. Import the managed solution into the next non-production environment **per group** (mandatory to close the group — `DPPG5.11`), applying `deploymentsettings.json` for environment variables / connection references; record import job ID + smoke result.
9. Record commands, versions, results, checker output, import result, deployment-settings resolution, and remediation notes in `build-log.md`.

> `int` is the shared integration/test environment alias in the default pipeline
> (`tech-config.yml:deployment.environments`, `release-pipeline.yml`). Projects may alias it to `test`;
> the build log always records the resolved environment URL + name actually used.

### Required Commands

Use exact commands from `tech-config.yml` unless the project README overrides
environment names, solution paths, or authentication.

### Phase 5 Completion Checklist

- [ ] All changed components are in an explicit unmanaged solution.
- [ ] Default solution was not used for planned customization.
- [ ] `solution-inventory.md` lists every changed component.
- [ ] Unmanaged solution was exported and unpacked into source control.
- [ ] Managed solution artifact was generated for downstream import.
- [ ] Solution Checker executed with no critical/high findings, or approved exceptions recorded.
- [ ] Plugin/custom API code builds and tests pass when present.
- [ ] PCF code builds and tests pass when present.
- [ ] Cloud flow fault handling and run evidence are documented when flows changed.
- [ ] Security role/persona impact is documented.
- [ ] `build-log.md` contains commands, environment names, solution version, checker output, and import result.

---

## Phase 06 - Verification

Applicable quality gates: DPPG6.1 through DPPG6.6.

Verification compares implementation against design and task list using
Dynamics/Power Platform-specific gates.

### Static Analysis

- Solution Checker: mandatory for changed unmanaged solutions.
- Plugin/custom API projects: run `.NET` build and tests when present.
- PCF projects: run npm build/lint/test when present.
- JavaScript web resources: run project-defined linting and Solution Checker.

Any critical/high Solution Checker issue, failing build, failing test, or
missing execution evidence is a blocker.

### Artifact

```text
work-item/[project-slug]/06-verification/verification-report.md
```

---

## Phase 07 - Testing

Applicable quality gates: DPPG7.1 through DPPG7.5.

Testing must cover:

- App happy path, negative path, and role-restricted path.
- Flow trigger, success path, failure path, retry/timeout behavior, and run history evidence.
- Plugin/custom API positive, negative, depth/recursion, permissions, and bulk scenarios.
- PCF render, input/output contract, accessibility, and packaging behavior.
- Persona-based access for changed tables, columns, apps, flows, and commands.

### Artifact

```text
work-item/[project-slug]/07-testing/test-report.md
```

---

## Phase 08 - Commit and PR

PRs must include:

- Changed solution source folder and solution version.
- Build log and Solution Checker evidence.
- Test report or explicit test evidence links.
- Security role/persona validation summary.
- Confirmation that generated artifacts are tracked or ignored according to project policy.
- Confirmation that no secrets or local auth files are committed.

---

## Phase 09 - Release

Applicable quality gates: DPPG9.1 through DPPG9.5.

Release must follow `technology-rules/dynamics365-powerplatform/release-pipeline.yml`
unless the project provides an approved override.

Before production:

- Confirm managed solution artifact and version.
- Validate import in the target environment when supported by pipeline tooling.
- Confirm Solution Checker result and test evidence.
- Confirm DLP, connection references, environment variables, and service connections.
- Confirm release manager sign-off and rollback plan.
- Record import job/result and post-deployment smoke evidence.

### Rollback

Power Platform solution rollback depends on solution layering and component type.
The release plan must document one of:

- Import previous managed solution version.
- Apply managed solution upgrade rollback strategy.
- Restore environment backup when the change cannot be safely reversed by solution import.
- Disable affected flow/app/command as an emergency mitigation.

### Artifact

```text
work-item/[project-slug]/09-release/release-notes.md
```

---

## Phase 10 - Archive

Archive must preserve:

- Final solution version and managed artifact reference.
- Build log, checker results, import results, and test report.
- Environment names and pipeline hop.
- Security validation evidence.
- Rollback notes and known operational risks.
