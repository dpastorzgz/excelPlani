# Workflow — Phase 5: Construction / Build

**Input**: `04-tasks/task-list.md` + applicable `technology-rules/*`  
**Output**: Implementation in the repository + `work-item/[project-slug]/05-build/build-log.md`  
**Skills**: `framework/skills/code-review/skill.md`

---

## TL;DR (min context)

- Load technology rules for the project and follow them (build/deploy protocol is tech-specific).
- **Before naming any API artifact** (objects, fields, classes, flows, components, etc.), derive names from `work-item/[project-slug]/03-design/design.md` (§3 Components, §4 Data Model) and apply `technology-rules/[technology]/NamingConventions.md`. Do not invent API names outside of design.
- Execute tasks in dependency order and mark tasks `[x]` in `04-tasks/task-list.md`.
- Record decisions, commands, and results in `work-item/[project-slug]/05-build/build-log.md` (from `framework/templates/build-log.md`).
- Run self-review via `framework/skills/code-review/skill.md` (prefer its TL;DR) before exiting the phase.
- Do not move to Phase 6 without explicit approval (see `framework/config/phase-approval.yml`).

## Phase Checkpoint

- Current phase: Phase 5 — Construction / Build
- Read before acting: approved `04-tasks/task-list.md`, design or bug report, and applicable technology rules
- Allowed persisted outputs: implementation files required by approved tasks, task status updates in `04-tasks/task-list.md`, and `05-build/build-log.md`
- Forbidden persisted outputs: Phase 6 through Phase 10 artifacts
- Before proceeding: state current phase, tasks to execute, technology rules loaded, open questions status, and build gate
- Exit gate: all approved tasks completed or blocked with evidence, build log updated, quality gates passed, transition approved per `phase-approval.yml`

---

## Steps (details)

1. Read `work-item/[project-slug]/04-tasks/task-list.md`.
2. Load applicable technology rules (mandatory baseline + phase-specific rules).
3. **Resolve API names from design before writing any code**:
   - Open `work-item/[project-slug]/03-design/design.md`.
   - For **objects and fields**: consult §4 (Data Model) — objects, fields, and relationships listed there are the authoritative source of API names.
   - For **components** (services, automation, UI — see technology rules): consult §3 (Components) — use the component names and responsibilities defined there.
   - Apply the naming pattern from `technology-rules/[technology]/NamingConventions.md` to each element (prefix, suffix, casing).
   - If an API name is missing or ambiguous in the design, add a clarification note in `build-log.md` and derive the name following the naming conventions; do **not** block execution.
4. Execute tasks in dependency order.
5. Update the task list marking completed tasks `[x]` — per the technology task-integrity gate (`technology-rules/[technology]/quality-gates.md`), mark `[x]` only when **all** of a task's deliverables are deployed and verified against their acceptance criteria (partial delivery stays `in-progress`); keep the status consistent with `active.yml` and the build log.
6. Generate `build-log.md` using `framework/templates/build-log.md`, documenting:
   - decisions, deviations, commands executed, and build/deploy output
7. Run build/deploy/validation commands required by the technology rules:
   - load the Phase 5 deployment protocol from `technology-rules/[technology]/` before executing any command
   - follow the deployment strategy defined in `technology-rules/[technology]/`
   - record every command executed, its output, and its result in `build-log.md`
8. Self-review: apply `framework/skills/code-review/skill.md` to the code produced in this phase; document findings and fixes in the build log.
9. Present completion summary + quality gate result (by IDs) using the structured closeout prompt from `framework/rules/phase-transitions.md`, including full repo-relative artifact paths and explicit next-step options before moving to Phase 6.

---

## Rollback Protocol

If a build or deployment step fails and cannot be resolved within the current session:

1. Stop immediately — do not attempt further changes to the codebase.
2. Document the failure in `build-log.md`:
   - step that failed
   - error message / stack trace
   - state of the system at point of failure
3. Assess rollback options:
   - if using git: `git stash` or `git revert` to the last known-good commit
   - if deployed to an environment: follow the technology-specific rollback procedure in `technology-rules/[tech]/DeploymentGuidelines.md`
4. Notify the user with a summary of: what failed, what was rolled back, and the recommended next action.
5. Do not advance to Phase 6 until the build is green and the user confirms.

---

## Exit Criteria

- Approval recorded per `framework/config/phase-approval.yml`.
- Quality gates: reference `QG5.*` (do not paste the full checklist).
