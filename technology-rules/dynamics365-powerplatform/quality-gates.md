# Quality Gates - Dynamics 365 / Power Platform Extensions

This file extends the framework quality gates for
`dynamics365-powerplatform` work items.

- Baseline gates still apply: `framework/rules/quality-gates.md`
- These gates are mandatory for Dynamics 365 / Power Platform work.
- These gates are blocking: do not advance phases if any required gate below is not satisfied.

Prefer referencing IDs such as `DPPG5.1` in build and verification artifacts.

For baseline framework gates reported alongside these technology gates, use only `Passed`, `Pending`, `Failed`, or `N/A`. Do not report `Partially passed`; split applicability by gate ID and document the reason in the current phase artifact.

---

## Phase 5 - Construction

- DPPG5.1 - All changed components are included in an explicit unmanaged development solution.
- DPPG5.2 - No planned customization was performed in the default solution.
- DPPG5.3 - `solution-inventory.md` exists and lists every changed solution component.
- DPPG5.4 - Unmanaged solution export and `pac solution unpack` were executed, with exact commands recorded.
- DPPG5.5 - Managed solution artifact was generated for downstream environments.
- DPPG5.6 - Solution Checker executed and produced no critical/high findings, or approved exceptions are recorded.
- DPPG5.7 - Plugin/custom API build and tests passed when plugin/custom API code is present.
- DPPG5.8 - PCF build/lint/test passed when PCF code is present.
- DPPG5.9 - Changed cloud flows include run evidence or documented manual test evidence.
- DPPG5.10 - Build log records environment, solution name, solution version, commands, checker result, import result, and remediation notes.
- DPPG5.11 - **Import per group is mandatory**: each dependency group (`Dataverse → plugins → apps → flows → security`) closes only with a managed import into the next non-production environment plus smoke result. Checker-only or export-only evidence does not close a group. These gates accept only reproducible machine evidence (commands + checker output + import job ID + smoke result); verbal/manual attestation and `N/A` are forbidden for DPPG5.4/DPPG5.6/DPPG5.11.
- DPPG5.12 - **Deployment settings resolved per environment**: environment variables and connection references for the group are resolved via `deploymentsettings.json` (or documented project equivalent) before import; production values come from pipeline/administrator configuration, never developer-owned connections. Import with unresolved settings is a **BLOCKER**.
- DPPG5.13 - **Version and upgrade policy recorded**: solution version bump (`major.minor.build.revision`), publisher/prefix, segmentation (`core`/`feature`), and upgrade type (`update` vs `upgrade` vs `stage-and-upgrade`, holding solution when needed) are recorded before downstream import.

---

## Phase 6 - Verification

- DPPG6.1 - Implementation is compared against design, task list, and solution inventory.
- DPPG6.2 - Solution Checker evidence is referenced from `verification-report.md`.
- DPPG6.3 - Critical/high Solution Checker findings are blockers unless approved exceptions are recorded.
- DPPG6.4 - Plugin/custom API .NET build and tests are verified when present.
- DPPG6.5 - PCF build/lint/test evidence is verified when present.
- DPPG6.6 - Security role/persona access impact is verified for changed data, apps, flows, commands, and APIs.

---

## Phase 7 - Testing

- DPPG7.1 - App tests cover happy path, negative path, and role-restricted path.
- DPPG7.2 - Cloud flow tests cover changed success and failure paths with run evidence.
- DPPG7.3 - Plugin/custom API tests cover positive, negative, permission, depth/recursion, and bulk scenarios when present.
- DPPG7.4 - PCF tests cover render, input/output contract, accessibility, and packaging behavior when present.
- DPPG7.5 - Test evidence avoids exposing secrets, tokens, personal data, and regulated data.

---

## Phase 9 - Release

- DPPG9.1 - Release follows `release-pipeline.yml` or a documented project override.
- DPPG9.2 - Managed solution artifact and version are identified before release.
- DPPG9.3 - Environment variables, connection references, DLP impact, and service connections are confirmed.
- DPPG9.4 - Production release has approval, rollback plan, and smoke test plan.
- DPPG9.5 - Release notes record target environment, solution version, import result/job, checker evidence, and post-deploy smoke result.

---

## Evidence Requirements

Evidence must be recorded in:

- Build: `work-item/[project-slug]/05-build/build-log.md`
- Inventory: `work-item/[project-slug]/05-build/solution-inventory.md`
- Checker output: `work-item/[project-slug]/05-build/checker-results/`
- Verification: `work-item/[project-slug]/06-verification/verification-report.md`
- Testing: `work-item/[project-slug]/07-testing/test-report.md`
- Release: `work-item/[project-slug]/09-release/release-notes.md`

At minimum, evidence includes:

- command executed
- date/time or run ID
- environment name
- solution name and version
- pass/fail result
- blocker remediation notes when applicable
