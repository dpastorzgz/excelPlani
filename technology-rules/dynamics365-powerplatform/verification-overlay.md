# Dynamics 365 / Power Platform Verification Overlay (Technology-Specific)

Complements `framework/skills/verification/skill.md` when the target technology is
`dynamics365-powerplatform`. Load together with the generic skill for Phase 5
build-evidence triage and Phase 6 verification.

## A0. Solution import / checker triage (Phase 5 build evidence)

When reviewing Phase 5 evidence, classify in root-cause order:

1. Export/unpack integrity first: solution missing from source control or unpacked source drifted from the exported zip is a root cause — fix inventory before re-running checker.
2. Solution Checker `critical`/`high` findings are blockers (`DPPG5.6`); `medium`/`low` need triage notes. A green import with unrecorded checker output is not evidence.
3. `missing dependency` / `unknown component` import errors are dependency-order or segmentation root causes (wrong group order, component in the wrong solution, publisher/prefix mismatch) — not independent failures.
4. Connection-reference / environment-variable failures are settings root causes: resolve via `deploymentsettings.json` (`DPPG5.12`) and re-import; do not retry the same zip unchanged.
5. Real import to a persistent environment must cite environment URL + name, solution name + version, managed artifact path, import job ID, and smoke result. Reproduce via pipeline run / `pac solution list` / import job record.

## A0.5 Build-claim verification (anti descope-to-green)

A green import is not proof the group was delivered (`DPPG5.11`):

1. Reconcile every in-scope deliverable of every task in the group against `solution-inventory.md` + import result: `present-in-solution` / `absent` / `descoped-with-sign-off`.
2. Verify functional shape: flow run evidence for changed business paths, plugin tests for transactional logic, role/persona checks for security changes — presence in the solution is not completeness.
3. Task `[x]` only when ALL deliverables are imported AND verified; status must agree across `task-list.md`, `active.yml`, and `build-log.md`.

## B. Phase 6 verification (checker + builds + personas)

1. Reference Solution Checker evidence from `verification-report.md` (`DPPG6.2`); critical/high findings block without approved exception (`DPPG6.3`).
2. Verify plugin/custom API `.NET` build+tests and PCF npm build/lint/test when present (`DPPG6.4/6.5`).
3. Verify security role/persona impact for changed data, apps, flows, commands, APIs (`DPPG6.6`) — inspection-only verification of a behavior change is a finding.
