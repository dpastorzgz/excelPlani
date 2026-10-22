# Technology Rules — Salesforce

**Technology**: Salesforce Platform  
**Applicable layers**: Apex, LWC, SOQL/SOSL, Metadata, Deployment  
**Reference files**:

- `NamingConventions.md` — Naming standards for all Salesforce components
- `ApexGuidelines.md` — Apex coding standards and governor limits
- `ApexComments.md` — ApexDoc and inline comment standards
- `ApexTestGuidelines.md` — Apex test structure and coverage rules
- `DataFactoryGuidelines.md` — TestDataFactory pattern for test data
- `LWCGuidelines.md` — Lightning Web Components rules
- `FlowGuidelines.md` — Flow development and Flow vs. Apex decisions
- `VisualforceGuidelines.md` — Visualforce development rules (legacy)
- `DeploymentGuidelines.md` — Metadata, CI/CD and release rules
- `PackageXMLGuidelines.md` — package.xml format, member naming, cumulative update protocol
- `ProjectPlanning.md` — Project planning and estimation guidelines

---

## Overview

These rules govern any project developed on the Salesforce Platform. They apply
to all Salesforce implementation phases of the framework. For `new-feature`
work, Phase 1 remains technology-agnostic and Phase 2 remains
implementation-agnostic, with the Salesforce-only SLDS prototype exception
defined below.

---

## Authoritative Baseline

This file is the single baseline for Salesforce context and general standards.
The former `context.md` and `GeneralGuidelines.md` content has been consolidated
here to avoid loading overlapping files.

### Role & Mission

Act as a Senior Salesforce Developer and Architect. Deliver production-ready,
bulkified, secure, maintainable Salesforce solutions that follow the specialized
guideline files in this directory.

### Feature Track Technology Boundary

For `new-feature` work:

- Phase 1 is technology-agnostic. Do not introduce Salesforce implementation
  choices in the proposal.
- Phase 2 is implementation-agnostic. Requirements may mention business
  behavior, users, screens, data concepts, integrations, and constraints, but
  must not decide Apex, LWC, Flow, custom objects, custom fields, API names,
  triggers, permission sets, `package.xml`, or deployment strategy.
- Salesforce may be used in Phase 2 only to generate or update an SLDS
  prototype as a visual and interaction validation artifact.
- The SLDS prototype must not become the source of truth for Salesforce
  implementation names or metadata. Implementation decisions start in Phase 3.
- Phases 3, 4, and 5 must load the Salesforce best-practice `.md` files listed
  in the phase loading table before producing technical design, tasks, code, or
  deployment steps.

### Reference-First Development

Before producing Salesforce technical design, tasks, code, tests, or deployment
steps, load this file plus the relevant specialized guideline:

- Apex: `ApexGuidelines.md` and `ApexComments.md`
- Apex tests: `ApexTestGuidelines.md` and `DataFactoryGuidelines.md`
- Flow: `FlowGuidelines.md`
- LWC: `LWCGuidelines.md`
- Deployment: `DeploymentGuidelines.md`, `PackageXMLGuidelines.md`, and `release-pipeline.yml`
- Naming: `NamingConventions.md`

### Architecture Decision Process

- Simple same-record updates -> Before-Save Flow
- Cross-object logic or complex business rules -> Apex Trigger Handler
- Large data processing over 2,000 records -> Batch Apex
- User interfaces -> Lightning Web Components
- External integrations -> Platform Events plus Queueable Apex

### UI Guidance vs Apex Authority

When a rule can be enforced both in Salesforce metadata/UI and in server-side logic, Phase 3 design must explicitly decide the enforcement pattern:

1. **Metadata/UI only** — acceptable only for low-risk guidance rules where bypass does not compromise business correctness
2. **Apex/server only** — acceptable when UI constraints are impractical or misleading
3. **Dual enforcement** — preferred for most business-critical constraints:
   - UI/metadata provides guidance, filtering, or early feedback
   - Apex/service logic remains the final authority for correctness

Default recommendation for Salesforce business-critical behavior:
- use UI/metadata for user guidance
- use Apex/service validation for final enforcement

Typical examples that should usually default to dual enforcement:
- lookup eligibility filters
- action visibility vs action authorization
- duplicate prevention cues vs duplicate blocking
- lifecycle guidance in UI vs lifecycle validation in Apex

If the design chooses metadata-only or Apex-only, it must record why that choice is sufficient.

### Core Standards

- All code, comments, and documentation must be written in English.
- Use clear names that reveal intent; detailed naming rules live in `NamingConventions.md`.
- Follow SOLID principles and keep classes focused on one reason to change.
- Prefer configuration over hardcoded values: Custom Metadata, Custom Settings, labels, or constants.
- Use Developer Names and metadata-driven references instead of record IDs or org-specific values.
- Use a service layer for business logic and keep trigger bodies thin.
- Use Queueable over `@future` for async Apex unless there is a documented exception.

### Security, Sharing, and Data Access

- Every Apex class must declare sharing (`with sharing` unless justified).
- Every SOQL query must enforce data access with `WITH USER_MODE` where supported or `Security.stripInaccessible()`.
- All DML operations must enforce CRUD/FLS through a documented strategy.
- Validate inputs early and sanitize user-controlled data.
- Avoid logging sensitive data.

### Performance and Governor Limits

- Zero SOQL or DML inside loops.
- Bulkify all logic for at least 200 records.
- Query only required fields and keep queries selective.
- Use Batch Apex for large data volumes and Queueable Apex for chained async work.
- Monitor limits proactively with the `Limits` class where risk is meaningful.

### Testing and Quality

- Minimum global Apex coverage: 75% platform minimum.
- Project target Apex coverage: at least 85%.
- Critical business logic classes: at least 90%.
- Tests must cover positive, negative, boundary, bulk, and permissions scenarios.
- Use `TestDataFactory`; do not hardcode test data or use `seeAllData=true`.
- Test behavior with meaningful assertions, not just line execution.
- Static analysis must have zero PMD priority P1/P2 violations (`.pmd/ruleset.xml`, `--minimum-priority 2`); P3+ findings are triaged, not blocking.

### Error Handling and Logging

- Catch specific exceptions such as `DmlException`, `QueryException`, and callout exceptions.
- Use a custom logging framework instead of relying on `System.debug`.
- Provide meaningful error messages with context and a next action.
- Flow DML/action elements must have fault paths.

### Deployment Readiness

- All tests pass in the target environment.
- Performance is checked with production-like data volumes for high-risk changes.
- Security review is complete.
- Rollback plan is documented.
- Monitoring and alerting impact is understood.

---

## Context Loading (Mandatory — Salesforce Phases)

Before starting any Salesforce technical task from Phase 3 onward:

1. Load `rules.md` (this file) — baseline context, non-negotiable standards, and phase rules.
2. Load `NamingConventions.md` — naming rules that apply to all metadata and code.
3. Load the phase-specific guideline files listed below.

No Salesforce code, design, test, or deployment step may be produced without
this baseline.

Phase 2 may load this file only to apply the Salesforce SLDS prototype rule. Do
not load Apex, LWC, Flow, deployment, package, or naming implementation
guidelines in Phase 2.

---

## Mandatory Files to Load per Phase

| Phase            | Files to Load                                                                                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 — Proposal     | No Salesforce files for `new-feature`; keep proposal technology-agnostic                                                                                                     |
| 2 — Specs        | `rules.md` Phase 2 section only when technology is Salesforce; `slds2-prototype` only if requested/approved                                                                  |
| 3 — Design       | `rules.md`, `NamingConventions.md`, `ProjectPlanning.md`, `ApexGuidelines.md`, `LWCGuidelines.md`, `FlowGuidelines.md`, `DeploymentGuidelines.md`, `PackageXMLGuidelines.md`, `quality-gates.md` |
| 4 — Tasks        | `rules.md`, `NamingConventions.md`, `ApexGuidelines.md`, `LWCGuidelines.md`, `FlowGuidelines.md`, `DeploymentGuidelines.md`, `PackageXMLGuidelines.md`                       |
| 5 — Construction | All active guideline files in this directory                                                                                                                                 |
| 6 — Verification | All active guideline files in this directory                                                                                                                                 |
| 7 — Testing      | `rules.md`, `NamingConventions.md`, `ApexTestGuidelines.md`, `DataFactoryGuidelines.md`                                                                                      |
| 8 — Commit & PR  | `rules.md`, `NamingConventions.md`, `DeploymentGuidelines.md`, `PackageXMLGuidelines.md`                                                                                     |
| 9 — Release      | `rules.md`, `NamingConventions.md`, `DeploymentGuidelines.md`, `release-pipeline.yml`                                                                                        |
| 10 — Archive     | `rules.md` archive section only                                                                                                                                              |

---

## Project Structure (SFDX)

```
force-app/
  main/
    default/
      classes/           # Apex classes and test classes
      triggers/          # Apex triggers (one per object)
      lwc/               # Lightning Web Components
      aura/              # Aura components (legacy, avoid new)
      flows/             # Flow definitions
      objects/           # Custom objects and fields
      permissionsets/    # Permission sets
      profiles/          # Profiles — profile-only settings only (login hours, IP ranges, …)
      layouts/           # Page layouts
      staticresources/   # Static resources
      labels/            # Custom labels
      queues/            # Queues
      roles/             # Roles
scripts/
  apex/                  # Anonymous Apex scripts (not deployed)
config/
  project-scratch-def.json
sfdx-project.json
.forceignore
```

---

## General Prohibitions

- ❌ Never hardcode record IDs, URLs, or org-specific values — use Custom Metadata, Custom Settings, or constants
- ❌ Never use `System.debug` in production code — use a custom logging framework
- ❌ Never write DML or SOQL inside loops
- ❌ Never deploy without a minimum of 75% Apex test coverage (Salesforce platform requirement)
- ❌ Never use `@SuppressWarnings('PMD')` without a documented justification
- ❌ Never create more than one trigger per Salesforce object
- ❌ Never perform DML operations on `SObject` without null-checking first
- ❌ Never deploy a Profile for permissions that a PermissionSet can carry — object/field/system permissions, CRUD/FLS, tab or layout visibility, record-type visibility, or sharing. Use Permission Sets for all access grants.
- ✅ Profiles may be deployed **only** for settings that exist exclusively on Profile metadata and cannot be expressed in a Permission Set: **login hours, login IP ranges / network access, default application, login flows, and profile-level session settings**, plus any other setting verified to be Profile-only. Every deployed Profile must carry a recorded profile-only justification (see `SFG3.7`) in the Phase 3 design and reference it in the Phase 8 PR.
- ❌ Never write Apex classes without declaring sharing (`with sharing` unless explicitly justified and documented)
- ❌ Never skip FLS/CRUD enforcement in data access: use a documented enforcement strategy (prefer `WITH USER_MODE` where supported; otherwise use `Security.stripInaccessible()`; exceptions must be justified and recorded)
- ❌ Never use `seeAllData=true` in test classes
- ❌ Never create test data inline in test methods — use `TestDataFactory` pattern
- ❌ Never deploy to production without prior successful sandbox validation

---

## Scopes for Conventional Commits

Common scopes for Salesforce projects:

| Scope    | Use                                   |
| -------- | ------------------------------------- |
| `apex`   | Apex classes and triggers             |
| `lwc`    | Lightning Web Components              |
| `flow`   | Flow definitions                      |
| `soql`   | Query changes                         |
| `object` | Custom objects and fields             |
| `perm`   | Permission sets                       |
| `deploy` | Pipeline and deployment configuration |
| `test`   | Apex test classes                     |
| `config` | sfdx-project.json, scratch org config |

### Examples

```
feat(apex): add OpportunityService bulk update method
fix(lwc): resolve reactive property issue in accountSearch component
test(apex): add coverage for LeadTriggerHandler edge cases
chore(deploy): update CI pipeline to validate on full sandbox
```

---

## Coverage Threshold

- Minimum global coverage: **75%** (Salesforce platform requirement)
- Project standard coverage: **≥ 85%**
- Critical business logic classes: **≥ 90%**
- Each Apex class must have a dedicated test class
- Coverage must be **behavioral** — test what the code does, not just execute lines

---

## Phase 01 — Proposal (Salesforce-specific)

For `new-feature` work, Phase 1 must remain technology-agnostic and high-level
(viability, risks, constraints). It must not contain Salesforce implementation
design.

Do not decide or name:

- Apex classes, triggers, handlers, services, or async jobs
- Lightning Web Components, Flow names, or Visualforce pages
- Custom objects, custom fields, relationships, layouts, permission sets, or API names
- `package.xml` members or deployment strategy

If Salesforce is already known as the target platform, record it only as a
context assumption. Salesforce-specific planning starts in Phase 3.

---

## Phase 02 — Specs (Salesforce-specific)

Phase 2 remains implementation-agnostic. The specs describe what the business
needs and how users experience it; they must not settle how Salesforce will
implement it.

Do not include:

- Apex, LWC, Flow, trigger, Queueable, Batch, or Platform Event decisions
- Custom object, custom field, relationship, permission set, or API names
- SOQL/SOSL details, metadata file paths, `package.xml`, or deployment commands

Allowed Salesforce-specific exception:

- An SLDS prototype may be generated or updated to validate screens,
  interaction flow, labels, and user journeys.
- The prototype is not an implementation design. It must not introduce or
  persist Salesforce metadata names or decide whether a screen becomes LWC,
  Flow, or another implementation primitive.

### Prototype generation prompt (Salesforce-only)

During **Phase 2**, after generating and presenting the **first draft** of:

- `work-item/[project-slug]/02-specs/specs.md`

the agent must ask the user:

> Salesforce project detected. Do you want me to generate an SLDS prototype
> from these specs for UX validation (skill: `slds2-prototype`)?

#### If the user answers "yes"

- Load and apply: `technology-rules/salesforce/skills/slds2-prototype/skill.md`
- Generate/update the prototype using the latest version of `02-specs/specs.md`.
- Keep the prototype implementation-agnostic: no LWC names, Apex names, Flow
  names, custom object names, custom field names, or API names.

#### If the user answers "no"

- Do not generate a prototype.
- Continue the normal Phase 2 specs iteration and approval flow.

### Prototype regeneration on-demand (requirements changed)

If, at any time during Phase 2, the user requests prototype generation again (e.g., because requirements were adjusted), the agent must:

- Confirm `02-specs/specs.md` reflects the latest agreed requirements.
- Re-run `slds2-prototype` using the updated specs.
- Treat any previously generated prototype as outdated and update/regenerate it
  per the skill instructions.

---

## Phase 03 — Design (Salesforce-specific)

Phase 3 is the first phase where Salesforce implementation decisions are made.

Before producing the Phase 3 design, load the Phase 3 Salesforce files listed in the loading table.

Before Phase 3 can be considered closed, the design must validate Salesforce platform feasibility instead of assuming metadata capabilities from intent alone.

The design must explicitly define:

* Platform primitive choices: LWC vs Flow vs Apex vs metadata configuration, with rationale and ADRs for meaningful tradeoffs.
* Data model: objects, fields, relationships, ownership, sharing, API names, and metadata flags.
* Security model: CRUD/FLS, sharing, permission sets, user mode, or `Security.stripInaccessible()` strategy.
* Automation and transaction model: trigger handler, service layer, Flow entry criteria, async strategy, bulk behavior, and governor-limit risks.
* Integration model: callouts, authentication, retry/error handling, logging, Platform Events, Queueable/Batch needs, and data volume assumptions.
* Delivery model: source development with root-level `force-app/` and cumulative `package.xml`, unless the project README or `tech-config.yml` explicitly states otherwise.
* Release pipeline awareness: confirm `release-pipeline.yml` exists and record the expected validation/release path.

### Minimum Salesforce Checks

The following Salesforce checks must be resolved and recorded in the Phase 3 design:

* Data model impact:

  * new objects/fields vs reuse
  * relationships and ownership model
  * sharing implications
  * API names and naming consistency

* Security impact:

  * CRUD/FLS requirements
  * sharing implications
  * permission sets
  * user mode or `Security.stripInaccessible()` strategy

* Volume and governor-limit risk:

  * expected record volumes
  * bulk scenarios
  * async needs
  * transaction boundaries
  * governor-limit risks

* Integration risk:

  * callouts
  * external dependencies
  * authentication model
  * retry/error handling
  * logging strategy
  * Platform Events, Queueable, or Batch needs where applicable

* Delivery model confirmation:

  * source development using SFDX is the default
  * a cumulative `package.xml` manifest is the default
  * deviations are only allowed when the project README or `tech-config.yml` explicitly states otherwise

* Release pipeline awareness:

  * confirm that a release pipeline definition exists
  * record the expected validation and release path
  * align with Phase 09 release pipeline expectations

### Platform Feasibility Checklist

The Phase 3 design must validate Salesforce platform feasibility explicitly.

* Confirm every Field History Tracking assumption against the actual Salesforce-supported field types.

* Never assume native history tracking for non-trackable field types, including:

  * Long Text Area
  * Rich Text Area
  * Formula
  * Roll-Up Summary
  * Auto-Number

* If a requirement needs reconstructable before/after traceability for a non-trackable field, design a compensating custom audit mechanism and record that choice explicitly.

* Evaluate whether Long Text Area is an appropriate storage type for data that must be auditable at payload level. If it is not appropriate, document the compensating design or the accepted tradeoff.

* For integration keys, import keys, or lookup-driving keys, explicitly decide whether each field needs:

  * External ID
  * uniqueness
  * indexed lookup support
  * another documented uniqueness or indexing strategy

* Run a data-model consistency review:

  * field descriptions must not reference nonexistent API names
  * picklist values and descriptions must be coherent
  * key metadata flags must match the way the field is used

* Validate that key metadata flags are aligned with imports, lookups, lifecycle rules, and validation logic, including:

  * External ID
  * required
  * unique
  * track history

### Spec vs Design Deviation Review

Run an explicit Spec vs Design deviation review before closing Phase 3.

The review must list any source-spec requirement that the design leaves:

* deferred
* optional
* conditional
* rejected
* replaced by an alternative implementation
* covered by an accepted tradeoff

No deviation may remain implicit at Phase 3 closeout.

### Phase 3 Closeout Rules

Any item marked as risky or unknown must either be resolved in Phase 3 or recorded as an open question.

Phase 3 cannot close with unresolved Salesforce implementation risk unless the user explicitly approves:

* the deferral
* the reason for the deferral
* the target phase where it will be resolved

Phase 3 closeout is blocked if any Salesforce platform-feasibility assumption remains unvalidated.


## Phase 04 — Tasks (Salesforce-specific)

Before producing Salesforce tasks, load the Phase 4 Salesforce files listed in
the loading table.

Tasks must be decomposed by independently buildable and verifiable Salesforce
unit. Each task must include:

- Related requirement(s) and design component(s).
- Salesforce metadata type(s), expected path under `force-app/main/default/`,
  and exact API/member name when known from design.
- Dependency layer: schema, apex, ui, automation, or configuration.
- `package.xml` impact: metadata type and member name to add.
- Verification evidence: deploy command, test/lint/static-analysis evidence, or
  manual validation expected for the task.
- Explicit dependencies on earlier tasks when metadata or compilation order
  requires them.
Epic waves map onto these dependency layers: Wave 0 → schema; Wave 1 → apex; Wave 2 → automation (approvals, cross-object flows); Wave 3 → ui (LWC); Wave 4 → configuration (permission sets; profiles only for profile-only settings; sharing) and integrations; Wave 5 → data, `package.xml`, release. A child in Wave N may enter Phase 5 only when each `depends_on` work-item is at Phase 7 with testing gates `Passed`, and Phase 9 only when each dependency is at Phase 9.

Do not create a Phase 4 task with pending Salesforce design decisions. If the
task cannot identify its implementation primitive, metadata type, or dependency
layer, return to Phase 3 or record an approved deferral.

---

## Phase 05 — Construction (Salesforce-specific)

> Canonical commands and evidence: `technology-rules/salesforce/deploy-protocol.md` (governs on conflict).
> Target orgs are project sandboxes by configuration (`tech-config.yml:deployment.environments`);
> org type is never hardcoded — use the configured default in Phase 5, explicit `--target-org` in Phase 7/9/CI.

### Phase 05 — Mandatory pre-step (non-skippable)

Before any build/deploy work begins in Phase 05, the agent must:

1. Ensure the Phase 05 folder exists for the current project:
   - `work-item/[project-slug]/05-build/`
2. Create (or update) the cumulative manifest:
   - `work-item/[project-slug]/05-build/package.xml`
3. Create one scoped manifest per dependency group:
   - `work-item/[project-slug]/05-build/group-N-package.xml`
4. Run a pre-flight org capability review for every standard object / host feature in scope (for example `Quote`, `Order`, `Contract`, `PersonAccount`):
   - verify the host feature is enabled in the target org before planning deploy commands
   - if disabled, record a remediation step first (for example deploy the corresponding `Settings` metadata, or document required manual setup)
5. Run XML well-formedness and metadata lint checks on the exact scoped metadata set before any dry run:
   - malformed XML is a blocker before deployment planning
   - metadata lint failures must be resolved before any deploy command
6. Build a dependency graph from the real metadata in scope before assigning dependency groups:
   - include lookup/master-detail `referenceTo` edges
   - include `actionOverrides` → `FlexiPage` edges
   - include validation-rule / formula / filter references where a missing metadata dependency would break deploy
   - fail planning if a dependency is placed in a later group than the artifact that references it

The manifest must start as a valid skeleton (correct API version) and must be maintained cumulatively for the entire feature.

> **Blocker rule**: Do not run any deployment command in Phase 05 if `work-item/[project-slug]/05-build/package.xml` does not exist.

> **Blocker rule**: Do not run any group deployment from a broad source directory such as `force-app/main/default/objects`; dependency-group deployment must use `-x work-item/[project-slug]/05-build/group-N-package.xml`.

> Manifest format and naming rules: see `PackageXMLGuidelines.md`.

### Code Location

All Salesforce metadata generated during Phase 5 **must be placed in the root-level `force-app/` directory** of the SFDX project, following the standard structure defined in the **Project Structure (SFDX)** section above.

> ❌ Do NOT create a `force-app/` subfolder inside `work-item/[project-slug]/05-build/`.
> ✅ Write code directly to `force-app/main/default/[type]/` at the repository root.

The `work-item/[project-slug]/05-build/` folder is reserved exclusively for the **`build-log.md`** artifact and deployment manifest. It must not contain Salesforce metadata or source code.

### Artifacts

Phase 5 produces two artifacts:

```
work-item/[project-slug]/05-build/build-log.md
work-item/[project-slug]/05-build/package.xml
```

**`build-log.md`** must document:

- Decisions made during construction (design choices, deviations from the design, workarounds)
- The result of each group deployment (per-artifact commands + job IDs) and the manifest deployment

**`package.xml`** is the cumulative deployment manifest:

- Created at the start of Phase 5 (empty `<Package>` skeleton with the correct API version).
- Updated after each deployment group succeeds: new `<members>` entries are appended to the appropriate `<types>` blocks.
- **`<members>*</members>` is strictly forbidden** — every member must be named explicitly with its exact Salesforce API name.
- By the end of Phase 5 it contains the complete inventory of every metadata component created or modified in the feature.
- Format rules and member naming: see `PackageXMLGuidelines.md`.

### Per-Task Build & Deploy Protocol (mandatory loop)

For Phase 05, **each individual task** in `04-tasks/task-list.md` must complete the following **5-step cycle** before the next task begins. This guarantees that every task is independently buildable, immediately deployable, and fully traceable in `package.xml` and `task-list.md`.

#### Step A — Build the task metadata

Construct all metadata artifacts required by the task. Apply construction rules by type:

| Metadata type                       | Construction rule                                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Custom Object (`*.object-meta.xml`) | Create the **complete XML** file — `Label`, `PluralLabel`, `NameField`, `DeploymentStatus`, `SharingModel`, and all required elements |
| Custom Field (`*.field-meta.xml`)   | Create the **complete XML** file — `fullName`, `label`, `type`, and all type-specific required elements                               |
| Apex Class (`*.cls`)                | Create the class file **AND** its `*.cls-meta.xml` (correct `apiVersion`, `status: Active`)                                           |
| Apex Trigger (`*.trigger`)          | Create the trigger file **AND** its `*.trigger-meta.xml` (correct `apiVersion`, `status: Active`)                                     |

> ❌ Never create a `.cls` or `.trigger` without its `-meta.xml` counterpart — the CLI requires both files to deploy.

#### Step B — Deploy the task metadata (no tests)

```bash
sf project deploy start -d <path-to-task-artifact> --test-level NoTestRun
```

Deploy the **minimum set of files** required for this task only (one artifact or one logical unit such as an object folder). If deployment fails, treat as **[BLOCKER]**: fix the source and re-run before proceeding.

#### Step C — Update package.xml

Add the task's metadata members to `work-item/[project-slug]/05-build/package.xml`:

- Locate or create the `<types>` block for each metadata type.
- Add one `<members>` entry per artifact using its exact Salesforce API name.
- The file is **append-only** — never remove existing entries.
- `<members>*</members>` is strictly forbidden — every member must be named explicitly.

#### Step D — Deploy package.xml (no tests)

```bash
sf project deploy start \
  --manifest work-item/[project-slug]/05-build/package.xml \
  --test-level NoTestRun
```

This confirms the cumulative manifest remains accurate and deployable after adding the new task's members.

#### Step E — Mark the task as done

In `04-tasks/task-list.md`, change `- [ ]` to `- [x]` for the completed task.

> ❌ Do **not** mark a task as done until Steps A–D have all completed successfully with 0 errors.

---

### Post-Construction Deployment

Phase 05 deployment is executed **by dependency groups**, with **fail-fast incremental deploys inside each group**:

- **Group-level**: schema → apex → ui → automation → configuration (Step 2)
- **Inside each group**: deploy minimal logical units one-by-one (Step 3) to detect errors early
- **After each group**: update `package.xml` and run a **manifest deployment** (Step 3b) to confirm the manifest is correct

> **Blocker rule**: Step 3b (manifest deploy) is mandatory after each group and must not be deferred to the end.

Once **all atomic tasks** in `04-tasks/task-list.md` are marked as completed (`[x]`), an **incremental deployment by dependency group** must be executed. The goal is **fail-fast**: detect compilation and deployment errors as early as possible, before they accumulate.

> ⚠️ Do **not** add `--target-org`. The command uses the org configured as default in the workspace (`sf config set target-org` or `.sf/config.json`).  
> ⚠️ Do **not** run Apex tests during Phase 5 deployment. Use `--test-level NoTestRun` on every command.
>
> ✅ Exception (mandatory end-of-phase validation): execute Step 4 (manifest + `RunRelevantTests`) to guarantee the full manifest deploys and relevant tests pass.

#### Step 1 — Inventory the feature metadata

Read `04-tasks/task-list.md` and list **every concrete metadata artifact created or modified** in the feature, with its exact path under `force-app/main/default/`. Example:

```
force-app/main/default/objects/Panel360__c/
force-app/main/default/objects/Panel360__c/fields/Cliente__c.field-meta.xml
force-app/main/default/classes/Panel360Controller.cls
force-app/main/default/classes/Panel360Service.cls
force-app/main/default/lwc/panel360ResumenCliente/
```

Only include metadata that was **actually created or modified** in the current feature. Do not include unrelated existing metadata.

#### Step 2 — Analyze dependencies and build the deployment plan

Analyze the dependencies between the inventoried metadata and determine the correct deployment order. Build the plan from the real metadata references, not from file location assumptions alone. At minimum, the dependency graph must inspect:

- custom field `referenceTo` targets for Lookup and Master-Detail relationships
- object/action override references to FlexiPages
- validation rule, formula, and lookup-filter references to fields/objects
- standard-object host feature requirements (for example `Quote` requires Quotes to be enabled separately from deploying custom fields)

Fail the plan if an artifact references metadata that is assigned to a later dependency group.

Use the following reference hierarchy (lower number = fewer dependencies = deploy first):

| Layer             | Metadata types                                                                                           | Notes                                 |
| ----------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| 1 — Schema        | `objects/`, `customMetadata/`, `globalValueSets/`, `customPermissions/`, `standardValueSets/`            | No Apex or UI dependencies            |
| 2 — Apex          | `classes/`, `triggers/`                                                                                  | May reference schema from layer 1     |
| 3 — UI            | `lwc/`, `aura/`, `pages/` (Visualforce)                                                                  | May call Apex from layer 2            |
| 4 — Automation    | `flows/`, `workflows/`, `approvalProcesses/`                                                             | May reference objects, Apex, LWC      |
| 5 — Configuration | `permissionsets/`, `layouts/`, `tabs/`, `applications/`, `labels/`, `staticresources/`, `contentassets/` | Typically no compilation dependencies |

> Within each layer, if one artifact depends on another of the same layer (e.g., a service class depends on a utility class), deploy the dependency first.

Produce the final ordered deployment plan before executing any command.

#### Step 3 — Execute incremental deployment (fail-fast)

Deploy **each concrete metadata artifact** using its exact path. One command per artifact or per minimal logical unit (e.g., an object folder that includes its fields).

Do not use a broad directory deploy as a substitute for scoped planning. In particular, `sf project deploy start -d force-app/main/default/objects ...` is forbidden for dependency-group execution because it can silently pull metadata from later groups or unrelated baseline scope.

```bash
# Example — Layer 1: Schema
sf project deploy start -d force-app/main/default/objects/Panel360__c --test-level NoTestRun

# Example — Layer 2: Apex (deploy dependencies before dependents)
sf project deploy start -d force-app/main/default/classes/Panel360Service.cls --test-level NoTestRun
sf project deploy start -d force-app/main/default/classes/Panel360Controller.cls --test-level NoTestRun

# Example — Layer 3: LWC
sf project deploy start -d force-app/main/default/lwc/panel360ResumenCliente --test-level NoTestRun

# Example — Layer 4: Flows
sf project deploy start -d force-app/main/default/flows/Panel360_AssignOwner.flow-meta.xml --test-level NoTestRun
```

**Deployment outcome handling (per command):**

| Result     | Action                                                                                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ✅ Success | Record the job ID and command in `build-log.md`. Continue to the next artifact.                                                                                                                   |
| ❌ Failure | Treat as **[BLOCKER]**. Stop immediately. Fix the source file(s) that caused the error. Re-run the failed command. Do not proceed to the next artifact until this one succeeds with **0 errors**. |

#### Step 3b — Update package.xml and deploy with manifest

Once **all artifacts in the current group** have deployed successfully one by one (Step 3):

1. **Update `work-item/[project-slug]/05-build/package.xml`**: add every artifact from the completed group as a `<members>` entry in the correct `<types>` block. The file is **append-only** — never remove existing entries.
   - `<members>*</members>` is **strictly forbidden**.
   - See `PackageXMLGuidelines.md` for the full format reference and member naming rules.

2. **Deploy using the updated manifest**:

   ```bash
   sf project deploy start \
     -x work-item/[project-slug]/05-build/group-N-package.xml \
     --test-level NoTestRun
   ```

   This is the **official deployment record** for the group. It confirms the manifest is accurate and only deploys the explicitly listed metadata.

3. **Record in `build-log.md`**: list the members added to `package.xml`, the scoped group manifest used, the manifest deploy command, the job ID, the result, and root-cause-first error classification. If a `referenceTo X does not resolve` error appears while `X` also failed in the same deploy, classify the `referenceTo` error as secondary cascade rather than a root cause.

> ⚠️ If the manifest deployment fails after all individual artifact deployments succeeded, check for incorrect API names or missing `<types>` blocks in `package.xml`. Fix the manifest and re-run Step 3b — do **not** restart Step 3.

> All artifacts in the inventory must deploy successfully (Steps 3 + 3b per group) before Phase 5 can be considered complete. Do not advance to Phase 6 until **every group** has a confirmed successful manifest deployment.

#### Step 4 — Final manifest deployment + relevant tests (non-skippable validation)

Once all feature artifacts have deployed with 0 errors, perform a **final end-to-end validation** using the Phase 05 manifest.

##### Step 4 — Final manifest deployment + RunRelevantTests (required)

```bash
sf project deploy start \
  --manifest work-item/[project-slug]/05-build/package.xml \
  --test-level RunRelevantTests
```

> ✅ This guarantees that:
>
> - The manifest is complete and accurate
> - All metadata deploys together without hidden dependency gaps
> - Relevant tests run successfully against the exact manifest payload
>
> ⚠️ If Step 4 fails, treat it as **[BLOCKER]**: fix the failing code/tests/manifest and re-run Step 4 until 0 failures.

Record Step 4 in `build-log.md`:

- the exact command
- the Deploy ID / job ID
- result status
- test summary

### Phase 5 Completion Checklist (Salesforce)

- [ ] All atomic tasks in `task-list.md` are marked `[x]`
- [ ] All metadata is in `force-app/main/default/` (root-level SFDX structure) — not inside `work-item/[project-slug]/`
- [ ] Feature metadata inventory produced (all artifacts listed with exact paths)
- [ ] Dependency-ordered deployment plan produced before execution
- [ ] All feature metadata artifacts deployed individually with `--test-level NoTestRun` (Step 3 — fail-fast)
- [ ] Every individual deployment command returned 0 errors
- [ ] `work-item/[project-slug]/05-build/package.xml` created and updated after each group
- [ ] `package.xml` contains no `<members>*</members>` wildcards — all members named explicitly
- [ ] Every group has a successful manifest deployment (`--manifest package.xml`) confirming accuracy
- [ ] Post-deployment test run executed with `RunRelevantTests` — 0 test failures
- [ ] No compilation errors in Apex classes
- [ ] No `System.debug` statements in production code
- [ ] No hardcoded IDs or org-specific values
- [ ] All Apex classes declare sharing (`with sharing` or explicitly justified)
- [ ] All SOQL queries use `WITH USER_MODE` or `Security.stripInaccessible()`
- [ ] All public/global methods have ApexDoc comments (`ApexComments.md`)
- [ ] Naming conventions followed (`NamingConventions.md`)
- [ ] `build-log.md` generated with full deployment plan, per-command results, and manifest deploy results

---

## Phase 06 — Verification (Salesforce-specific)

Verification consists of comparing the implementation against the design (`03-design/design.md`) and the task list (`04-tasks/task-list.md`), applying Salesforce-specific quality checks.

### Static Analysis (mandatory)

Run the project-defined linters/scanners and record evidence in `verification-report.md`:

- Apex: PMD — required threshold: **0 priority P1/P2** violations (`pmd check -R .pmd/ruleset.xml -d force-app/main/default --minimum-priority 2`); the full Code Analyzer report (P1–P5) is attached as evidence and P3+ findings are triaged
- LWC: ESLint — required threshold: **0 errors** (warnings policy must be stated in the project README or verification report)

If any of the above thresholds are violated, treat as **[BLOCKER]** and **return to Phase 5** to fix the issues before continuing.

### Phase 6 Quality Checklist (Salesforce)

**Coverage & Testing**

- [ ] Global Apex test coverage ≥ 75% (platform minimum)
- [ ] Project Apex test coverage ≥ 85% (project standard)
- [ ] Critical business logic classes ≥ 90%
- [ ] Every Apex class has a dedicated test class

**Code Quality**

- [ ] Zero PMD priority P1/P2 violations (.pmd/ruleset.xml, `--minimum-priority 2`)
- [ ] No `System.debug` in production code
- [ ] No hardcoded IDs, URLs, or org-specific values
- [ ] All Apex classes declare sharing (`with sharing` or documented exception)
- [ ] All SOQL queries enforce FLS/CRUD (`WITH USER_MODE` or `Security.stripInaccessible()`)
- [ ] All public/global methods have ApexDoc comments
- [ ] Class headers present (description, author, date, history)

**Governor Limits**

- [ ] Zero SOQL queries inside loops
- [ ] Zero DML statements inside loops
- [ ] All logic bulkified for 200+ records

**Architecture**

- [ ] One trigger per object maximum
- [ ] Trigger handler pattern followed
- [ ] Service layer separation maintained
- [ ] No inline SOQL/DML in trigger bodies (delegated to handler/service)

**Flows (if applicable)**

- [ ] Fault paths implemented for all DML/Action elements
- [ ] No hardcoded IDs in Flow elements (use Custom Metadata)
- [ ] Entry conditions configured to prevent unnecessary executions

**LWC (if applicable)**

- [ ] Lightning Data Service used for standard CRUD operations
- [ ] Error handling with toast messages implemented
- [ ] Accessibility guidelines followed (WCAG 2.1)
- [ ] Dialogs built on `lightning/modal` (themed header + close button) — no hand-rolled `slds-modal` (see `LWCGuidelines.md`)

### Artifact

```
work-item/[project-slug]/06-verification/verification-report.md
```

---

## Phase 07 — Testing (Salesforce-specific)

### Standard Commands (recommended)

Run all local tests with coverage:

```bash
sf apex run test --test-level RunLocalTests --code-coverage --result-format human
```

For machine-readable output (CI usage):

```bash
sf apex run test --test-level RunLocalTests --code-coverage --result-format json
```

> If an org alias/username must be specified, use `--target-org <alias>` and record it in the Phase 5 build log and Phase 7 test report.

### Testing Rules

- Use `TestDataFactory` for **all** test data creation — no inline data in test methods
- Every test class must use `@isTest` annotation and `@TestSetup` for shared data
- Test scenarios required for each Apex class:
  - **Positive**: valid input, expected happy path
  - **Negative**: invalid input, error handling, null values
  - **Bulk**: 200+ records to validate bulkification and governor limit compliance
  - **Permissions**: test with different user profiles/permission sets where applicable
- No `seeAllData=true` — tests must be self-contained
- Use `Test.startTest()` / `Test.stopTest()` to reset governor limit counters
- Assert behavior, not just execution — every test must have meaningful assertions (`System.assertEquals`, `System.assertNotEquals`, `System.assert`)

### Phase 7 Completion Checklist (Salesforce)

- [ ] All Apex classes have a dedicated `*Test` class
- [ ] `TestDataFactory` used for all test data
- [ ] Bulk tests (200+ records) pass without governor limit errors
- [ ] Positive, negative, and edge case scenarios covered
- [ ] No `seeAllData=true` in any test class
- [ ] All tests use `@isTest` and `@TestSetup` where appropriate
- [ ] `Test.startTest()` / `Test.stopTest()` used in all test methods
- [ ] Global coverage ≥ 85% confirmed
- [ ] All tests pass in target sandbox environment

### Artifact

```
work-item/[project-slug]/07-testing/test-report.md
```

---

## Phase 08 — Commit & PR (Salesforce-specific)

In addition to the framework Phase 8 workflow, Salesforce PRs must include:

- Evidence links:
  - `work-item/[project-slug]/05-build/build-log.md` (deployment job IDs)
  - `work-item/[project-slug]/06-verification/verification-report.md`
  - `work-item/[project-slug]/07-testing/test-report.md` (when applicable)
- Metadata hygiene:
  - permission sets for all access grants; Profiles only for justified profile-only settings (`SFG3.7`)
  - no hardcoded IDs/URLs/org-specific values
  - no `seeAllData=true`
  - no `System.debug` in production code
- Manifest hygiene:
  - `work-item/[project-slug]/05-build/package.xml` is up to date (explicit members only, no wildcards)
  - member API names match the actual metadata created/modified in `force-app/main/default/`

If a PR reveals issues considered **[BLOCKER]** by Phase 6 quality checks (security, PMD critical/high, ESLint errors), return to Phase 5 to fix before proceeding.

---

## Phase 09 — Release (Salesforce-specific)

### Release pipeline configuration (mandatory)

Release must follow the pipeline and test strategy defined in:

- `technology-rules/salesforce/release-pipeline.yml`

This file defines:

- the ordered environment pipeline (by alias/name)
- how to determine the “next environment”
- the test strategy per environment hop (e.g., `NoTestRun` / `RunRelevantTests` / `RunLocalTests` / `RunSpecifiedTests`)
- whether a hop runs the interactive validate → deploy protocol (`validate_interactive`)
- evidence requirements (job IDs, reports)

### Pre-Release Validation

Before any deployment, the following must be confirmed:

- [ ] The “next environment” was identified from `release-pipeline.yml`
- [ ] The hop's `validate_interactive` setting was read and applied
- [ ] The required test strategy for that hop was executed successfully
- [ ] All Apex tests pass in the validation org per pipeline test strategy
- [ ] `sf project deploy validate` used for pre-validation (dry run equivalent) with the chosen `--test-level`
- [ ] Stakeholder/release manager sign-off obtained
- [ ] Maintenance window agreed (if impacting production users)

### Interactive Validate → Deploy Protocol (mandatory when `validate_interactive: true`)

For a hop with `validate_interactive: true`, the agent MUST run the two-question
sequence defined in `deploy-protocol.md` §5.1. This applies to any hop, not only
production — enable it per hop in `release-pipeline.yml`. Do not run `validate` or
`start` before the corresponding question is answered; use the structured question
protocol (2-4 options), never a bare yes/no prompt.

1. **Ask the test strategy (before validate)** — `RunSpecifiedTests` (the agent proposes
   the `*Test` classes derived from the modified Apex metadata in the release manifest and
   the user confirms or edits them) or `RunLocalTests`.
2. **Run the validate** with the chosen test level:

   ```bash
   # RunLocalTests
   sf project deploy validate --manifest work-item/[project-slug]/05-build/package.xml --target-org <hop-alias> --test-level RunLocalTests

   # RunSpecifiedTests
   sf project deploy validate --manifest work-item/[project-slug]/05-build/package.xml --target-org <hop-alias> --test-level RunSpecifiedTests --tests A,B,C
   ```

3. **On validate failure:** STOP — **BLOCKER**. Report failures and do **not** ask the deploy
   question. Return to Phase 5 when required.
4. **Ask the deploy decision (only after a successful validate):**
   - `deploy_now` → deploy the validated manifest:
     ```bash
     sf project deploy start --manifest work-item/[project-slug]/05-build/package.xml --target-org <hop-alias> --test-level <chosen-level>
     # or, within the quick-deploy window, reuse the validation job:
     sf project deploy quick --job-id <validate_job_id> --target-org <hop-alias>
     ```
   - `skip_deploy` → do not deploy. Record the validation as complete, keep `validate_job_id`
     for a later quick deploy, and end the phase without running `start`.

> ⚠️ Always run `validate` before `start`.
> Release the Phase 5 manifest, not `force-app` (`deploy_full --source-dir force-app` is deprecated —
> exception only with written sign-off per SFG5.14).
> Record the chosen test level, the specific `--tests` list when used, the `validate_job_id`, the
> deploy decision (`deployed` / `skipped_by_user`), and the `deploy_job_id` when deployed in
> `release-notes.md`.

> Hops with `validate_interactive: false` keep their configured `test_level` and run
> validate + deploy automatically.

### Quick Deploy (optional)

If validation was recently completed (within 10 days), Quick Deploy can be used:

```bash
sf project deploy quick --job-id <validation-job-id> --target-org production
```

### Rollback

Salesforce does not support transactional rollback of deployments. If a production deployment must be reversed:

1. Identify the last-known-good metadata version in git
2. Deploy the previous version using `sf project deploy start` with the previous source
3. Document the rollback in `release-notes.md` with the reason and steps taken
4. Notify affected users and stakeholders

### Phase 9 Completion Checklist (Salesforce)

- [ ] Validation job completed with 0 errors in the target org/hop
- [ ] When `validate_interactive: true`: test strategy chosen by the user and the deploy decision explicitly answered
- [ ] Deployment job completed with 0 errors — or the deploy was explicitly skipped by the user (`skipped_by_user`) and recorded
- [ ] Post-deployment smoke tests pass in the target org (when deployed)
- [ ] Release notes include validation/deployment job IDs and the chosen test strategy
- [ ] `release-notes.md` saved to `work-item/[project-slug]/09-release/`

### Artifact

```
work-item/[project-slug]/09-release/release-notes.md
```

---

## Phase 10 — Archive (Salesforce-specific)

Archive must preserve traceability for audit and future maintenance:

- Final `work-item/[project-slug]/05-build/package.xml` snapshot (as deployed)
- Release evidence: deployment/validation job IDs referenced in `09-release/release-notes.md`
- Target org aliases used (validation + production) and the pipeline hop executed (from `release-pipeline.yml`)
- Links to ADRs/design decisions that impacted implementation (Flow vs Apex, sharing model, security strategy)
