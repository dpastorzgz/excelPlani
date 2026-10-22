# Workflow — Phase 4: Atomic Tasks

**Input**: `03-design/design.md`  
**Output**: `work-item/[project-slug]/04-tasks/task-list.md`  
**Skill**: `framework/skills/task-decomposition/skill.md`

---

## TL;DR (min context)

- Convert the design into small, independently verifiable tasks.
- Use `framework/skills/task-decomposition/skill.md` (prefer its TL;DR).
- Generate `task-list.md` from `framework/templates/task-list.md`.
- Iterate with the user until approved; do not move to Phase 5 without approval (see `framework/config/phase-approval.yml`).

## Phase Checkpoint

- Current phase: Phase 4 — Atomic Tasks
- Read before acting: approved `03-design/design.md`, or hotfix `01-intake/bug-report.md` when Phases 1-3 are skipped
- Allowed persisted outputs: `04-tasks/task-list.md`
- Forbidden persisted outputs: Phase 5 through Phase 10 artifacts and source code changes
- Before proceeding: state current phase, task-list path, source design or bug-report, open questions status, and approval gate
- Exit gate: task list approved, no pending design decisions, transition approved per `phase-approval.yml`

---

## Steps (details)

1. Read `03-design/design.md`.
2. Apply `framework/skills/task-decomposition/skill.md`.
3. Generate `task-list.md` using `framework/templates/task-list.md`.
4. Ensure each task:
   - is independently verifiable
   - references at least one design component (CMP-\*)
   - references related requirements (FR/NFR) where applicable
   - includes dependencies (TASK-IDs) and an estimate (S/M/L)
5. Present task list to the user for review using the structured closeout prompt from `framework/rules/phase-transitions.md`, including the full repo-relative path `work-item/[project-slug]/04-tasks/task-list.md`.
6. Iterate until approved.
7. Save to `work-item/[project-slug]/04-tasks/task-list.md`.

---

## Exit Criteria

- Approval recorded per `framework/config/phase-approval.yml`.
- Quality gates: reference `QG4.*` (do not paste the full checklist).
- Sizing: QG4.8 evaluated (tasks + effort counted, split decision recorded; blocking if over threshold).
