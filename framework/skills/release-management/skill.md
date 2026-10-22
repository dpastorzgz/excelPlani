<!--
Skill: release-management/skill.md
Framework version: 1.0
Last updated: 2026-05-12
-->

# Skill — Release Management (Phase 9)

## Purpose

Guide the agent through planning and executing a production release, including pre-release validation, deployment, and post-release verification.

## When to use

Load this skill at the start of Phase 9 (Release).

## Prerequisites

- Phase 7 (Testing) completed and test report generated
- Phase 8 (Commit/PR) completed and PR merged to main/master
- Release notes drafted in `release-notes.md`

## Steps

### 1. Pre-release checklist

- [ ] All Phase 7 tests pass in staging/UAT environment
- [ ] Release notes are complete and reviewed
- [ ] Deployment runbook is prepared (rollback procedure documented)
- [ ] Stakeholder sign-off obtained for production deployment
- [ ] Maintenance window communicated (if applicable)

### 2. Validate the release (interactive when enabled)

Read the target hop in `technology-rules/[tech]/release-pipeline.yml`.

**When `validate_interactive: true` (Salesforce), run the two-question protocol**
(see `deploy-protocol.md` §5.1). Never run `validate` or `start` before its
question is answered; use a structured question with 2-4 options.

1. **Ask the test strategy (before validate):**
   - `RunSpecifiedTests` — run only the Apex test classes derived from the modified
     Apex metadata in the release manifest; the agent proposes the `*Test` classes
     and the user confirms or edits them.
   - `RunLocalTests` — run all local Apex tests in the target org.
2. **Run validate** with the chosen level:
   ```bash
   sf project deploy validate --manifest work-item/[project-slug]/05-build/package.xml --test-level <chosen-level> [--tests A,B,C]
   ```
   Record `validate_job_id`, target alias, test level, the `--tests` list when used,
   and the result.
3. **On validate failure:** STOP (BLOCKER). Report failures and do **not** ask the
   deploy question.

**When `validate_interactive: false`:** run validate automatically with the hop's
configured `test_level`.

### 3. Deploy (ask before deploying when interactive)

**When `validate_interactive: true` and validate succeeded, ask the deploy decision:**
- `deploy_now` — deploy the validated manifest (`sf project deploy start`, or
  `sf project deploy quick --job-id <validate_job_id>` within the quick-deploy window).
- `skip_deploy` — do not deploy. Record the validation as complete, keep
  `validate_job_id` for a later quick deploy, and end the phase without running `start`.

Otherwise follow the deployment steps defined in `technology-rules/[tech]/`
(e.g., `DeploymentGuidelines.md`), deploy the validated manifest, and record the
deployment start time, target environment, deployer, and `deploy_job_id`.

### 4. Prepare the release artifact

- Tag the commit following the convention in `framework/skills/git-operations/skill.md`
- Format: `v{MAJOR}.{MINOR}.{PATCH}` (Semantic Versioning)
- Create GitHub/GitLab Release with release notes attached

### 5. Post-deployment verification

- [ ] Smoke tests pass in production
- [ ] No critical errors in application logs immediately post-deploy
- [ ] Key business flows verified manually or via automated sanity suite
- [ ] Performance metrics within expected range

### 6. Rollback criteria

Trigger rollback if any of the following occur within 1 hour of deployment:

- Critical error rate exceeds pre-deployment baseline
- Core business functionality is broken
- Data integrity issues detected

### 7. Complete the release artifact

Save the completed `release-notes.md` to `work-item/[project-slug]/09-release/`.

### Quality gate

| Criterion            | Pass condition                        |
| -------------------- | ------------------------------------- |
| Validation completed | `validate` ran with the chosen test level; 0 errors |
| Deploy decision      | When interactive: user explicitly chose `deploy_now` or `skip_deploy` |
| Deployment completed | 0 errors during deployment, or deploy explicitly skipped by the user |
| Smoke tests          | All pass in production (when deployed) |
| Release artifact     | `release-notes.md` saved and complete |
| Rollback plan        | Documented before deployment begins   |
