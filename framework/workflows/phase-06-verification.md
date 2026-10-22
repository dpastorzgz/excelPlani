# Workflow — Phase 6: Verification

**Input**:

- `03-design/design.md`
- `04-tasks/task-list.md`
- Implementation produced in Phase 5

**Output**: `work-item/[project-slug]/06-verification/verification-report.md`  
**Skill**: `framework/skills/verification/skill.md`

---

## TL;DR (min context)

- Compare implementation vs Design + Task List (objective check).
- Load verification-related technology rules if applicable.
- Use `framework/skills/verification/skill.md` (prefer its TL;DR) to record evidence + deviations.
- Generate `verification-report.md` from `framework/templates/verification-report.md`.
- Do not move to Phase 7 without approval (see `framework/config/phase-approval.yml`). Critical deviations return to Phase 5.

## Phase Checkpoint

- Current phase: Phase 6 — Verification
- Read before acting: design, task list, build log, implementation files, and applicable technology rules
- Allowed persisted outputs: `06-verification/verification-report.md`
- Forbidden persisted outputs: Phase 7 through Phase 10 artifacts and new feature code except fixes explicitly routed back to Phase 5
- Before proceeding: state current phase, verification scope, open deviations, open questions status, and approval gate
- Exit gate: no unresolved critical deviations, report approved, transition approved per `phase-approval.yml`

---

## Steps (details)

1. Read:
   - `work-item/[project-slug]/03-design/design.md`
   - `work-item/[project-slug]/04-tasks/task-list.md`
2. Load applicable technology rules (verification/testing related).
3. Apply `framework/skills/verification/skill.md` to:
   - verify each design component has a corresponding implementation
   - verify each atomic task has implementation evidence
   - document deviations and classify critical vs minor
   - record gate applicability for QG6.6 and QG6.7 when they are `N/A`
   - record structured manual attestation when evidence is provided verbally by the user/operator
4. Generate `verification-report.md` using `framework/templates/verification-report.md`.
5. Present to user for review and approval using the structured closeout prompt from `framework/rules/phase-transitions.md`, including full repo-relative artifact paths and explicit next-step options.
6. If critical deviations exist, rollback to Phase 5 per `framework/rules/phase-transitions.md`.

---

## Exit Criteria

- Approval recorded per `framework/config/phase-approval.yml`.
- Quality gates: reference `QG6.*` (do not paste the full checklist).
