# Salesforce Deploy Protocol (Canonical — Phase 5 + Phase 9)

> Single source of truth for Salesforce deployment commands and evidence.
> `DeploymentGuidelines.md` and `rules.md` Phase 05/09 summarize; this file governs on conflict.

## 1. CLI dialect (only these forms)

```bash
# Per-artifact compile check (Phase 5, inside an already-validated group scope)
sf project deploy start -d force-app/main/default/<exact-path> --test-level NoTestRun

# Group official record (Phase 5)
sf project deploy start --manifest work-item/[project-slug]/05-build/group-N-package.xml --test-level NoTestRun

# End-of-phase final (Phase 5)
sf project deploy start --manifest work-item/[project-slug]/05-build/package.xml --test-level RunRelevantTests

# Pre-validation / dry run — all local tests (Phase 3 gate, Phase 9)
sf project deploy validate --manifest work-item/[project-slug]/05-build/package.xml --test-level RunLocalTests

# Pre-validation / dry run — specified tests only (Phase 9, interactive option)
sf project deploy validate --manifest work-item/[project-slug]/05-build/package.xml --test-level RunSpecifiedTests --tests A,B,C

# Production deploy (Phase 9, manifest-first)
sf project deploy start --manifest work-item/[project-slug]/05-build/package.xml --test-level RunLocalTests

# Reproduce any deploy/import
sf project deploy report -i <jobId>

# Quick deploy (production, validated within window)
sf project deploy quick --job-id <validation-job-id>
```

Forbidden in new work: `--dry-run` (use `deploy validate`), `--use-manifest` (use `--manifest`),
`-x` alias in docs (use `--manifest`), broad `-d force-app/.../<type>/` directories for group deploys,
`--metadata ApexClass,Flow` bulk deploys, `--source-dir force-app` for releases (exception only with written sign-off).

## 2. Target org policy (sandboxes by default, type not imposed)

- Use the configured default org (`sf config set target-org <alias>`); do NOT add `--target-org` in Phase 5 commands.
- Phase 7/9/CI add `--target-org <alias>` explicitly.
- The alias for each phase comes from `tech-config.yml:deployment.environments` or
  `work-item/[project-slug]/tech-config.yml` override. Default progression: `dev → int → uat → production`
  (typically sandboxes; exact org type is per-project configuration, never hardcoded here).
- If `sf org list` shows no default, stop and ask before adding `--target-org` ad hoc.

## 3. Phase 5 loop (per task, then per group)

Per task (fail-fast): `A build → B deploy -d <exact-path> NoTestRun → C update package.xml (append-only, no *) → D deploy --manifest (group record) → E mark [x] only when all deliverables deployed AND verified (SFG5.13)`.
Per group in dependency order `Schema → Apex → UI → Automation → Configuration`:
`validate group manifest → deploy -d per artifact → deploy --manifest group → reconcile (SFG5.11) → record provenance (SFG5.12)`.
Apex groups: close with `RunRelevantTests` for that group's scope (shift-left; the end-of-phase full `RunRelevantTests` is still mandatory, SFG5.8/SFG5.15).

## 4. Evidence (machine, no attestation for critical gates)

Every dry run and deploy in `05-build/build-log.md` records:
`Deploy ID + target org (alias + username) + checkOnly true/false + result + componentSuccesses summary`.
Reproduce with `sf project deploy report -i <id>`. Real deploys to persistent orgs prove materialization
with an idempotent re-validation dry run (`Unchanged`). `SFG5.1/SFG5.11/SFG5.12/SFG5.13/SFG5.14` accept
only this evidence — verbal/manual attestation and `N/A` are forbidden for these gates.

## 5. Release (Phase 9, manifest-first)

Release deploys `05-build/package.xml` (the artifact validated in Phase 5), not `force-app`.
`deploy_full --source-dir force-app` is deprecated; use only with written sign-off recording why the manifest
was insufficient. Record `validate_job_id + deploy_job_id + target alias + test strategy` in `09-release/release-notes.md`.
Rollback: Salesforce has no transactional rollback — redeploy the last-known-good git version
(manifest-pinned), record reason/steps, notify stakeholders. Plan destructive/irreversible changes (SFG4.5) before build.

### 5.1 Interactive validate → deploy (mandatory when the hop enables it)

For every hop with `validate_interactive: true` in `release-pipeline.yml`, the agent MUST run
this two-question sequence. No validate runs and no deploy runs until the corresponding
question is answered. Use the structured question protocol (2-4 concrete options), never a
bare yes/no prompt.

1. **Ask the test strategy (before validate).**
   - `RunSpecifiedTests` — run only the Apex test classes derived from the modified Apex
     metadata in the release manifest. The agent proposes the `*Test` classes and the user
     confirms or edits the list.
   - `RunLocalTests` — run all local Apex tests in the target org.
   - Options come from `release-pipeline.yml:validate_test_levels`; the source of the
     proposed `--tests` list is `specific_tests_source`.

2. **Run the validate (dry run, `checkOnly:true`) with the chosen test level:**
   ```bash
   # RunLocalTests
   sf project deploy validate --manifest work-item/[project-slug]/05-build/package.xml \
     --target-org <hop-alias> --test-level RunLocalTests

   # RunSpecifiedTests
   sf project deploy validate --manifest work-item/[project-slug]/05-build/package.xml \
     --target-org <hop-alias> --test-level RunSpecifiedTests --tests A,B,C
   ```
   Record `validate_job_id`, target alias (alias + username), `test_level`, the exact `--tests`
   list when applicable, and the result.

3. **On validate failure: STOP.** Treat as a **BLOCKER**. Report the failing tests/errors and do
   **not** ask the deploy question. Return to Phase 5 to fix when required.

4. **Ask the deploy decision (only after a successful validate).**
   - `deploy_now` — deploy the validated manifest:
     ```bash
     sf project deploy start --manifest work-item/[project-slug]/05-build/package.xml \
       --target-org <hop-alias> --test-level <chosen-level>
     # or, within the quick-deploy window, reuse the validation job:
     sf project deploy quick --job-id <validate_job_id> --target-org <hop-alias>
     ```
   - `skip_deploy` — do not deploy. Record the validation as complete, keep `validate_job_id`
     for a later quick deploy, and end the phase without running `start`.

5. **Record in `09-release/release-notes.md`:** chosen `test_level`, the specific `--tests` list
   when used, `validate_job_id`, the deploy decision (`deployed` / `skipped_by_user`),
   `deploy_job_id` when deployed, and the quick-deploy window expiry when the deploy was
   skipped.

> Hops with `validate_interactive: false` keep their configured `test_level` and run
> validate + deploy automatically (legacy behavior).
