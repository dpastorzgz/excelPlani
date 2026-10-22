# Workflow — Phase 7: Testing

**Input**:

- `02-specs/specs.md` (use cases / acceptance criteria)
- Implementation produced in Phase 5
- Verification report from Phase 6

**Output**: `work-item/[project-slug]/07-testing/test-report.md`  
**Skill**: `framework/skills/test-generation/skill.md`

---

## TL;DR (min context)

- Derive test scenarios from Phase 2 acceptance criteria.
- Load technology testing rules (coverage threshold is tech-defined).
- Use `framework/skills/test-generation/skill.md` (prefer its TL;DR) to define scenarios and implement tests.
- Run tests, collect pass/fail + coverage, and generate `test-report.md`.
- Do not move to Phase 8 without approval (see `framework/config/phase-approval.yml`).

## Phase Checkpoint

- Current phase: Phase 7 — Testing
- Read before acting: specs acceptance criteria, implementation, verification report, and applicable technology test rules
- Allowed persisted outputs: tests required by approved tasks and `07-testing/test-report.md`
- Forbidden persisted outputs: Phase 8 through Phase 10 artifacts
- Before proceeding: state current phase, test scope, coverage target, open questions status, and approval gate
- Exit gate: tests pass or failures are routed back to Phase 5, report approved, transition approved per `phase-approval.yml`

---

## Steps (details)

1. Read `work-item/[project-slug]/02-specs/specs.md` and extract use cases + acceptance criteria.
2. Load applicable technology rules for testing.
3. Apply `framework/skills/test-generation/skill.md` to define test scenarios (positive/negative/boundary/bulk).
4. Implement tests per technology rules.
5. Execute tests and collect:
   - pass/fail summary
   - coverage metrics (as defined by technology rules)
   - gate applicability for QG7.1 when coverage is `N/A`
   - hotfix-specific mapping from bug reproduction / acceptance criteria to test evidence for QG7.2
6. Generate `test-report.md` using `framework/templates/test-report.md`.
7. Present to user for approval using the structured closeout prompt from `framework/rules/phase-transitions.md`, including full repo-relative artifact paths and explicit next-step options before moving to Phase 8.

---

## Exit Criteria

- Approval recorded per `framework/config/phase-approval.yml`.
- Quality gates: reference `QG7.*` (do not paste the full checklist).
