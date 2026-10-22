# Angular Verification Overlay (Technology-Specific)

Complements `framework/skills/verification/skill.md` when the target technology is `angular`. Load this file together with the generic skill for Phase 5 build-evidence triage (section A / A.5) and Phase 3 `ANG3.3` cross-checks (section B).

Scope: this overlay applies to verification of Angular work items; the evidence paths are the frozen paths from `quality-gates.md`.

## A. Build/test/lint result triage (when verification is invoked on Phase 5 build evidence)

When the reviewed scope includes Angular build, lint, or test output, classify failures in root-cause order before writing conclusions. Never report command output as a flat list of errors. Source the outputs from `work-item/[project-slug]/05-build/build-log.md` and the CI logs it references.

Mandatory triage rules:
1. **Parse by artifact.** Group failures by the artifact that produced them: TypeScript compiler output, Angular template diagnostics, ESLint report, Prettier check, Vitest results, bundle-budget warnings. One root cause often surfaces in several artifacts at once.
2. **TypeScript compile error = root cause.** Every file that fails to compile is a root cause; resolve it before interpreting downstream errors.
3. **Template error referencing a failed symbol = secondary cascade.** When an Angular template diagnostic references a component/service/symbol that already failed to compile, classify it as a secondary cascade, not an independent root cause.
4. **Failing test referencing an uncompiled artifact = cascade.** Tests that fail because the code under test could not compile (or a spec imported a broken module) are cascades; do not count them as test-design failures.
5. **Missing/incompatible dependency = dependency root cause.** Unresolved imports, peer-dependency conflicts, or a package/version missing from the lockfile are dependency root causes and require dependency remediation (see `GeneralGuidelines.md` dependency policy).
6. **Node/npm version mismatch = environment issue.** Engine warnings and install/build failures tied to a wrong runtime version are environment prerequisites: record the required versions and fix the environment before re-running.
7. **Flaky timing failure = determinism issue — never "environment".** A test that passes intermittently because of arbitrary sleeps, real timers, or order dependence is a determinism defect (`ANG7.5`); require fake timers or `await fixture.whenStable()` instead of re-running until green.
8. **Report in this order:**
   - root cause(s)
   - secondary cascades
   - environment prerequisites
   - remaining independent failures

## A.5 Build-claim verification (anti descope-to-green) — `ANG5.4` / `ANG5.7`

A **green build or test run is not evidence that a task was delivered.** When reviewing Phase 5 evidence, verify claims against the source tree, never against prose in the build log:

1. **Reproduce the recorded commands.** Re-run (or require recorded output of) `npm run build`, `npm run lint`, `npm run format:check`, `npm test` and `npm test -- --coverage` exactly as the build log states them. A claim that cannot be reproduced is a finding.
2. **Reconcile every task deliverable against the actual source tree.** For each task, list its declared deliverables and mark each `present-and-wired` / `absent` / `descoped-with-sign-off`:
   - files exist at the paths declared by the task, following `NamingConventions.md`;
   - components are actually wired (referenced from routes, templates or parent components — not dead files);
   - no placeholder bodies: no stub methods, `TODO`, commented-out code, or empty templates standing in for the deliverable (`ANG5.5`).
   Any in-scope deliverable absent without written sign-off is a **descope-to-green finding**.
3. **Task completion integrity (`ANG5.4`).** A task is `done` only when **all** its deliverables are built **and** its unit tests pass. Flag any task marked done with deliverables still pending, and any status that disagrees across `task-list.md`, `active.yml`, and the build log.
4. **Evidence reproducibility (`ANG5.7`).** Commands and outputs are recorded in `work-item/[project-slug]/05-build/build-log.md`; source is under version control; the lockfile matches the declared dependencies.

## B. Phase 3 design self-consistency verification (`ANG3.3`)

When `ANG3.3` is invoked, do not stop at grep-like forbidden-term checks. Execute the mandatory cross-check set below and record evidence per check.

### ANG3.3.a — Design component-diagram to component/service inventory reconciliation
1. Extract all meaningful components/services/stores from the design component diagrams.
2. Extract the explicit component/service inventory from the design narrative.
3. For each diagram node:
   - confirm it exists in the inventory, or
   - classify it as a non-component UI/data node that does not require an inventory entry.
4. If the node is a stateful service/store or a data-access service:
   - confirm there is at least one **in-scope** task in `04-tasks/task-list.md` that constructs or delivers that behavior.
5. Mark `PASS` only if no unresolved diagram-only component/service remains and no UI-only concern is represented as an unjustified service.

### ANG3.3.b — Component/service vs ADR and out-of-scope guardrail consistency
1. Read the design, ADR registry, ADR files, and any active sign-off notes.
2. For each sensitive component/service/responsibility:
   - compare it against ADR guardrails;
   - compare it against explicit out-of-scope decisions.
3. Mark `FAIL` if any component or service:
   - contradicts an ADR decision title or stated consequence (e.g. signals vs RxJS boundary, service vs store);
   - reintroduces behavior declared out of scope;
   - assumes a backend capability or mock strategy that the ADR or out-of-scope notes rejected.

### ANG3.3.c — ADR registry literal title synchronization
1. Read `03-design/adr-registry.md`.
2. For each ADR row:
   - open the referenced ADR file;
   - extract the literal title;
   - compare it character-for-character against the registry title.
3. Mark `FAIL` for any mismatch, including wording drift (e.g. `store` vs `signal store`).

### ANG3.3.d — Requirement to task existence reconciliation
1. Read the requirement traceability matrix in `04-tasks/task-list.md`.
2. For each requirement (spec or design):
   - confirm it maps to at least one existing **in-scope** task entry, or
   - confirm it is explicitly marked out of scope / deferred with sign-off.
3. Confirm every referenced task ID exists as a real task section in the same file.
4. Mark `FAIL` if any requirement points to a nonexistent or removed task, or has no valid mapping/sign-off status.

## Evidence recording requirements for `ANG3.3`

For each cross-check, record:
- check id
- artifacts reviewed
- evidence summary
- `PASS` or `FAIL`
- remediation note if failed

Never collapse `ANG3.3` into a single undifferentiated global pass without the per-check breakdown.

## Phase 3 `ANG3.3` report format

```markdown
## ANG3.3 Cross-check Results

| Check ID | Result | Evidence |
| --- | --- | --- |
| ANG3.3.a | PASS/FAIL | ... |
| ANG3.3.b | PASS/FAIL | ... |
| ANG3.3.c | PASS/FAIL | ... |
| ANG3.3.d | PASS/FAIL | ... |
```

## Additional checklist for sections A and A.5

- [ ] Build/test/lint triage reports root causes before secondary cascades and environment prerequisites
- [ ] Flaky timing was classified as a determinism issue, never as "environment"
- [ ] Build-claim verification reproduced the recorded commands and reconciled every task deliverable
- [ ] Task statuses are consistent across `task-list.md`, `active.yml` and the build log

## Additional checklist for Phase 3 `ANG3.3`

- [ ] Every component/service shown in diagrams has been reconciled to the inventory
- [ ] Every stateful service/store shown in design has at least one in-scope task or an explicit justification
- [ ] No design component contradicts an ADR or an out-of-scope guardrail
- [ ] Every ADR registry title literally matches the ADR title
- [ ] No requirement points to a nonexistent or removed task
- [ ] Evidence is recorded per cross-check, not only as a global result
