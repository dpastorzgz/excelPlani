# Workflow — Phase 8: Commit & Pull Request

**Input**: Verified + tested implementation, plus Phase 7 test report approval  
**Output**: Git commit(s) + PR description artifact (optional)  
**Skill**: `framework/skills/git-operations/skill.md` + `framework/skills/code-review/skill.md`

---

## TL;DR (min context)

- Ensure Phase 7 is approved and tests/coverage are green.
- Run quick self-review (`framework/skills/code-review/skill.md`, prefer TL;DR).
- Commit using Conventional Commits and open/update the PR with evidence + risk notes.
- Treat CI/CD as a gate: checks green (or explicitly documented absence + sign-off).
- Do not finish Phase 8 without approval per `framework/config/phase-approval.yml`.

## Phase Checkpoint

- Current phase: Phase 8 — Commit & Pull Request
- Read before acting: approved test report, verification report, task list, and git status
- Allowed persisted outputs: commit(s), PR description, and Phase 8 notes if the project keeps a PR artifact
- Forbidden persisted outputs: Phase 9 and Phase 10 artifacts
- Before proceeding: state current phase, commit/PR readiness, CI status, open questions status, and approval gate
- Exit gate: commit/PR prepared, checks documented, approval recorded per `phase-approval.yml`

---

## Steps (details)

1. Ensure Phase 7 quality gate is met and user approval is recorded.
2. Run quick self-review using `framework/skills/code-review/skill.md`.
3. Prepare commits following Conventional Commits and appropriate scopes.
4. Create / update PR with:
   - context and link to `work-item/[project-slug]/`
   - summary of changes
   - testing evidence and coverage summary
   - risk/rollback notes
5. CI/CD gate — Before requesting PR merge, verify:
   - all automated checks (CI pipeline) pass on the PR branch
   - code coverage meets the threshold defined in `technology-rules/[tech]/tech-config.yml`
   - no security/lint violations flagged by the pipeline
   - CI is required by default (QG8.3). Exception only for isolated `change-request`/docs scope
     with written user approval recording why CI does not apply and any follow-up; `N/A` without that record is a FAIL.
6. Wait for approval per `framework/config/phase-approval.yml`, using the structured closeout prompt from `framework/rules/phase-transitions.md` and full repo-relative artifact paths.

---

## Exit Criteria

- Approval recorded per `framework/config/phase-approval.yml`.
- Quality gates: reference `QG8.*` (do not paste the full checklist).
