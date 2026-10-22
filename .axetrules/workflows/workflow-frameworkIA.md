---
description: "Workflow — FrameworkIA: Entry / Dispatcher"
author: "Cline Team"
version: "1.1"
category: "Meta"
tags: ["workflow", "dispatcher", "frameworkIA"]
globs: ["*.*"]
---

<task name="Workflow — FrameworkIA: Entry / Dispatcher">

<task_objective>
Orchestrate the FrameworkIA lifecycle by:

1. ensuring the user provides a project name/slug,
2. checking whether the project already exists and determining the current phase from project metadata,
3. routing execution to the appropriate phase workflow in `framework/workflows/`.

If the project does not exist yet, start at Phase 01 (Proposal) and request the idea/problem description as the first input.
</task_objective>

<detailed_sequence_steps>

# FrameworkIA — Entry / Dispatcher

## 0) Project identification (required)

1. If the user did **not** provide a project name, ask for it:
   - Project name (human-friendly), e.g. "CPQ Custom"
   - Optional: project slug, e.g. `cpq-custom`
2. Normalize and confirm:
   - Convert to `project-slug` in kebab-case: `my-project-name`
   - Confirm the chosen `project-slug` with the user before creating or reading project files.

## 1) Check framework execution state (project routing)

### 1.1) Determine whether the project exists

- If `work-item/[project-slug]/` does **not** exist → treat as a new project.
- If `work-item/[project-slug]/` exists → treat as an existing project.

### 1.2) New project → start Phase 01

If the project does not exist:

1. Create the project folder: `work-item/[project-slug]/`
2. Create `work-item/[project-slug]/README.md` based on `framework/templates/project-readme.md` (fill at least: Slug, Technology if known, Status, Current Phase = "01").
3. Start Phase 01 by following:
   - `framework/workflows/phase-01-proposal.md`
4. First input to request (Phase 01): ask the user to describe the idea/problem in their own words.

### 1.3) Existing project → continue at the current phase

If the project exists, determine the current phase in this order:

#### Source of truth order

Resolve the current phase per `AGENTS.md → Phase resolution`
(`work-item/[project-slug]/active.yml:current_phase` canonical, then
mandatory phase artifacts, then default `phase-01-proposal` + structured question).

#### Inconsistency handling

- If there is a mismatch between README/registry and actual artifacts, ask the user to confirm the intended current phase.
- Prefer the filesystem reality for safety, and suggest updating `work-item/[project-slug]/README.md` (and `work-item/README.md` if used) to reflect the confirmed state.

### 1.4) Route to the phase workflow

Once the current phase is determined (01–10), continue by executing the corresponding workflow:

- Phase 01 → `framework/workflows/phase-01-proposal.md`
- Phase 02 → `framework/workflows/phase-02-specs.md`
- Phase 03 → `framework/workflows/phase-03-design.md`
- Phase 04 → `framework/workflows/phase-04-tasks.md`
- Phase 05 → `framework/workflows/phase-05-build.md`
- Phase 06 → `framework/workflows/phase-06-verification.md`
- Phase 07 → `framework/workflows/phase-07-testing.md`
- Phase 08 → `framework/workflows/phase-08-commit-pr.md`
- Phase 09 → `framework/workflows/phase-09-release.md`
- Phase 10 → `framework/workflows/phase-10-archive.md`

## 2) Governance reminders (do not skip)

- Phase transitions and approvals must follow: `framework/config/phase-approval.yml`
- Phase skipping (if ever requested) must follow: `framework/config/phase-skips.yml` and requires explicit user confirmation.
- Never skip Phase 06 (Verification). This is a hard prohibition in this framework.
  </detailed_sequence_steps>

</task>
