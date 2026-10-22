<!--
Skill: project-archiving/skill.md
Framework version: 1.0
Last updated: 2026-05-12
-->

# Skill — Project Archiving (Phase 10)

## Purpose

Guide the agent through closing a project: completing the retrospective, ensuring all artifacts are saved, and archiving the project folder.

## When to use

Load this skill at the start of Phase 10 (Archive).

## Prerequisites

- Phase 9 (Release) completed and production deployment verified
- All phase artifacts saved in `work-item/[project-slug]/`

## Steps

### 1. Verify all artifacts are present

Check that `work-item/[project-slug]/` contains:

- [ ] `01-proposal/proposal.md`
- [ ] `02-specs/specs.md`
- [ ] `03-design/design.md`
- [ ] `04-tasks/task-list.md`
- [ ] `05-build/build-log.md`
- [ ] `06-verification/verification-report.md`
- [ ] `07-testing/test-report.md`
- [ ] `08-commit-pr/` (PR link or equivalent)
- [ ] `09-release/release-notes.md`
- [ ] `README.md` (project home page)

### 2. Conduct the retrospective

- Load `framework/skills/retrospective/skill.md`
- Complete all sections of `framework/templates/retrospective.md`
- Specifically populate Section 8 (Framework improvement actions) if using updated template
- Save to `work-item/[project-slug]/10-archive/retrospective.md`

### 3. Extract framework improvements

- Review retrospective Section 8 for any framework improvement actions
- Create issues or notes in `framework/improvements/` for each identified improvement
- These feed the next iteration of the framework itself

### 4. Update the project registry

- In `work-item/README.md`, update the project row:
  - Status → `📦 Archived`
  - Current phase → `10-archive`
  - Last updated → today's date

### 5. Tag the final state in git

- Create a final tag: `project/[slug]/archived`
- Push the tag to the remote repository

### 6. Archive the project folder (optional)

If the repository uses a monorepo with multiple projects, move completed work-items to `work-item/archive/` or use git sparse checkout to exclude them from active workspaces.

### Quality gate

| Criterion              | Pass condition                                    |
| ---------------------- | ------------------------------------------------- |
| All artifacts present  | All 10 phase folders have at least one artifact   |
| Retrospective complete | All sections filled, framework actions documented |
| Registry updated       | `work-item/README.md` shows Archived status       |
| Final git tag created  | Tag `project/[slug]/archived` exists              |
