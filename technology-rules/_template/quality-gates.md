# Quality Gates — {{Technology Name}} Extensions (Template)

This file extends the framework quality gates for `{{technology_slug}}` work items.

- Baseline gates still apply: `framework/rules/quality-gates.md`
- These gates are mandatory for `{{technology_slug}}` work and blocking: do not advance phases if any gate below is not satisfied.
- Gate ID convention: `QG-[TECH]-NN` is deprecated; use `<PREFIX><phase>.<n>` matching existing stacks
  (e.g. Salesforce `SFG5.x`, Dynamics `DPPG5.x`). Pick a short uppercase prefix for your stack
  (e.g. `NJG5.1` for Node.js) and use it consistently.

Prefer referencing IDs in build/verification artifacts.

---

## Phase 3 — Design ({{technology_slug}})

- `<PX>3.1` — Platform feasibility validated before design closeout (capabilities, limits, quotas)
- `<PX>3.2` — Deployability dry-run gate (or documented equivalent) executed against the project environment

## Phase 4 — Tasks ({{technology_slug}})

- `<PX>4.1` — Each task maps to an independently buildable/verifiable unit with expected paths, dependency layer, and artifact impact
- `<PX>4.2` — Irreversible / destructive changes have an explicit migration + rollback plan before build

## Phase 5 — Construction ({{technology_slug}})

- `<PX>5.1` — Incremental deploy/import per task/group in dependency order (fail-fast); a task closes only when ALL deliverables are deployed AND verified
- `<PX>5.2` — Cumulative release artifact maintained (manifest / solution version / package — see `tech-config.yml:deployment`)
- `<PX>5.3` — Machine evidence only for critical gates (deploy/import IDs + target environment + reproducible report); attestation/`N/A` forbidden for these gates

## Phase 6 — Verification ({{technology_slug}})

- `<PX>6.1` — Static analysis per `tech-config.yml:linting` passes (tool/threshold defined here, not in `framework/`)
- `<PX>6.2` — Smoke in target environment as configured user/role for behavior changes (inspection-only verification is a finding)

## Phase 7 — Testing ({{technology_slug}})

- `<PX>7.1` — Coverage meets `tech-config.yml:testing.coverage_threshold`; positive/negative/boundary (+bulk where applicable)

## Phase 9 — Release ({{technology_slug}})

- `<PX>9.1` — Release follows `release-pipeline.yml`; release artifact = Phase 5 artifact (no rebuilding from source dirs)
- `<PX>9.2` — Production approval + rollback plan + post-deploy smoke recorded with job IDs

---

## Evidence Requirements

- Build: `work-item/[project-slug]/05-build/build-log.md`
- Verification: `work-item/[project-slug]/06-verification/verification-report.md`
- Testing: `work-item/[project-slug]/07-testing/test-report.md`
- Release: `work-item/[project-slug]/09-release/release-notes.md`
