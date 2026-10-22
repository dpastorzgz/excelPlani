# Project Documentation Skill

Use this skill when the project maintains living technical documentation for modules, areas, components, or services and that documentation is relevant to understanding or implementing the requested change.

## Purpose

This skill standardizes how an agent should consume and maintain project technical documentation so that implementation work stays aligned with the documented functional and architectural intent.

## When To Load

Load this skill when any of the following is true:

- the project explicitly configures living technical documentation in `work-item/[project-slug]/README.md` or `work-item/[project-slug]/tech-config.yml`
- a technical documentation index exists in the repository
- the user instructs the agent to use project documentation as implementation context
- the requested change affects an area that is known to be documented through module or area sheets

Typical phases where this skill is useful: Phases 3, 4, 5, 6, and 7.

## Project Configuration

The preferred project-level configuration is:

```yml
technical_documentation:
  enabled: true
  root: docs/
  index: docs/README.md
  module_pattern: docs/<module>.md
```

### Resolution order

Resolve the documentation setup in this order:

1. `work-item/[project-slug]/README.md`
2. `work-item/[project-slug]/tech-config.yml`
3. repository conventions detected from existing files

### Recommended fallback detection

If no explicit configuration exists, detect living technical documentation only when there is enough evidence to do so safely, for example:

- a directory such as `docs/`, `docs/modules/`, or `docs/architecture/`
- an index file describing documented modules or areas
- multiple module or area sheets following a consistent pattern

Do not guess undocumented structure as a source of truth.

## Operating Rules

### 1) Consult documentation before implementation work

Before analyzing or modifying an affected functionality:

- resolve whether the project has configured living technical documentation
- locate the configured index document
- use that index to identify the relevant module, area, or component sheet
- consult the relevant sheet before changing code or implementation-dependent phase artifacts

If the documentation is missing, incomplete, or conflicting with the code, surface that fact explicitly in the work log or phase artifact.

### 2) Treat documentation as source of truth

Treat the configured technical documentation as the functional and architectural source of truth unless one of these applies:

- the current change is explicitly updating the documentation
- the user states that the documentation is outdated for the affected area
- the documented guidance conflicts with a newer approved phase artifact

When conflicts exist, do not silently choose one side. State the conflict and align the update accordingly.

### 3) Maintain documentation with the change

Update the affected documentation when a change modifies any of the following:

- responsibility of a module or area
- business or technical flow
- contract between modules or components
- dependency on another module, service, library, or storage mechanism
- entry point, trigger, or integration surface
- externally visible or architecturally relevant behavior

Do not leave relevant functional or structural changes reflected only in code when that would make the documentation stale.

## Standard Module Sheet Template

Unless the project defines an approved alternative, each module sheet should contain exactly these sections, in this order:

1. `## Proposito`
2. `## Archivos clave`
3. `## Responsabilidades`
4. `## Contratos y dependencias`
5. `## Particularidades criticas`

Use the reusable template at `framework/templates/module-doc.md` when creating or replacing a sheet.

### Section expectations

#### `## Proposito`

- 2 to 3 short lines
- explain what the module is for
- avoid deep implementation detail

#### `## Archivos clave`

- list of repo-relative paths
- include only the files needed to understand or maintain the module

#### `## Responsabilidades`

- short bullets
- one idea per bullet
- ideally 10 bullets or fewer

#### `## Contratos y dependencias`

- short bullets
- include explicit contracts, integration points, storage keys, payload expectations, external dependencies, and cross-module assumptions

#### `## Particularidades criticas`

Include a bullet only when at least one of these is true:

- business logic cannot be inferred clearly from the code alone
- there is a hidden contract with another module
- there is a deliberate hack or workaround for an external limitation
- there is a role, tenant, or context restriction that is not obvious in the implementation

Do not include routine implementation details that are already obvious from reading the code.

## Hard Limits

Each module sheet other than the index must stay within all of these limits:

- 100 lines or fewer
- 8 KB or less
- concise bullets instead of long prose

If the sheet would exceed the limit after a change:

- trim redundant detail
- split the content into sibling sheets
- update the index accordingly

Do not relax the limit.

## Replace, Do Not Accumulate

When updating a module sheet:

- edit or replace the existing content that changed
- do not append historical sections such as updates, phases, corrections, or bug notes
- do not add changelog-style traceability inside the functional sheet

Traceability belongs in commits, work items, and framework phase artifacts, not inside the module sheet.

## Avoid Duplicating Global Rules

Do not add per-sheet sections such as:

- recurring risks
- when to touch this module
- when to update this documentation
- generic maintenance instructions

Those cross-cutting rules belong in the framework or project operating guide, not in each sheet.

## Expected Agent Behavior

When this skill is active, the agent should:

1. identify whether living technical documentation exists
2. read the configured index before modifying an affected area
3. read the relevant module or area sheet before implementation work
4. update the corresponding documentation when the change affects documented behavior or structure
5. keep the documentation concise, current, and non-historical

## Outputs And Reuse

This skill is intentionally path-agnostic. `docs/` is a recommended project convention, not a framework-wide hardcoded requirement.

Projects may adopt other paths if they define an equivalent configuration and maintain the same discipline.
