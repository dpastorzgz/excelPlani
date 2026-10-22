# Salesforce Verification Overlay (Technology-Specific)

Complements `framework/skills/verification/skill.md` when the target technology is `salesforce`.
Load this file together with the generic skill for Phase 5 build-evidence triage and Phase 3 `SFG3.3` checks.

## A0. Salesforce deployment-result triage (when verification is invoked on Phase 5 build evidence)

When the reviewed scope includes Salesforce deployment or dry-run output, classify failures in root-cause order before writing conclusions.

Mandatory triage rules:
1. Parse failures by referenced metadata entity, not only by line order.
2. If a metadata file fails XML well-formedness / parse validation, treat that as a root cause.
3. If another error states `referenceTo X does not resolve to a valid sObject type` and `X` also failed in the same deployment, classify the `referenceTo` error as a **secondary cascade**, not a separate root cause.
4. If an `actionOverride` points to a missing FlexiPage, classify it as a dependency-order / missing-dependency root cause unless the FlexiPage is intentionally out of scope and the override was removed for the current group.
5. If a standard object component fails because the host feature is unavailable (for example `Quote` not enabled), classify it as an **environment capability** issue and require remediation before retrying the deploy.
6. If a manifest references metadata that is not present in local source, classify it as a **scope / source-inventory** root cause and require manifest correction before retrying.
7. Report findings in this order:
   - root cause(s)
   - secondary cascades
   - environment prerequisites
   - remaining independent failures

## A0.5 Build-claim verification (anti descope-to-green) — `SFG5.11` / `SFG5.12` / `SFG5.13`

A **green dry run or deploy is not evidence that the group was delivered**. When reviewing Phase 5 build evidence, verify the claims against the org and the source, never against prose in the log:

1. **Reproduce every cited Deploy ID** with `sf project deploy report -i <id> -o <org>`: confirm `checkOnly` (dry run vs real), `status`, component count, and the actual `componentSuccesses`/`componentFailures` lists. Do not accept "OK".
2. **Org-of-record (`SFG5.12`)**: confirm the build log's `Target Org` and Deploy IDs match the org where deploys actually executed. A real (`checkOnly:false`) deploy to a persistent org must be recorded and proven materialized by an **idempotent re-validation** dry run (changed components report `Unchanged`; `created:true` in a "post-deploy" report means it is **not** yet in the org). A real deploy that no artifact records, or a build log pointing at a different org than where work landed, is a finding.
3. **Deliverable reconciliation (`SFG5.11`)**: list every in-scope deliverable of every task in the group and mark each `present-in-deploy` / `absent` / `descoped-with-sign-off` against the reproduced component set. Verify **functional shape**, not presence:
   - validation rule: the formula implements every acceptance criterion, and the `errorMessage` does not claim enforcement the formula omits;
   - field history: `enableHistory=true` **and** `trackHistory=true` on the **full** required field set (count must match the task);
   - layout/field exposure: the field actually appears in the layout.
   Any in-scope deliverable absent without written sign-off is a **descope-to-green finding**.
4. **Task completion integrity (`SFG5.13`)**: a task is `done` only if **all** its deliverables are delivered and verified; flag any task marked done with deliverables still pending, and any status that disagrees across `task-list.md`, `active.yml`, and the build log.

## B. Phase 3 design self-consistency verification (`SFG3.3`)

When `SFG3.3` is invoked, do not stop at grep-like forbidden-term checks. Execute the mandatory cross-check set below and record evidence per check.

### SFG3.3.a — Component-diagram to component-list reconciliation
1. Extract all meaningful nodes/services from the design component diagrams.
2. Extract the explicit component/service inventory from the design narrative.
3. For each diagram node/service:
   - confirm it exists in the inventory, or
   - classify it as a non-service UI/data node not required to have a service entry
4. If the node/service is an Apex service:
   - confirm there is at least one **in-scope** task in `04-tasks/task-list.md` that constructs, configures, or delivers that service behavior
5. Mark `PASS` only if no unresolved diagram-only service remains and no declarative-only concern is represented as an unjustified Apex service.

### SFG3.3.b — Component/service vs ADR and out-of-scope guardrail consistency
1. Read the design, ADR registry, ADR files, and any active sign-off notes.
2. For each sensitive component/service/responsibility:
   - compare it against ADR guardrails
   - compare it against explicit out-of-scope decisions
3. Mark `FAIL` if any component or service:
   - reintroduces behavior declared declarative-only
   - owns downstream integration behavior after that behavior was marked downstream/out of scope
   - contradicts an ADR decision title or stated consequence

### SFG3.3.c — ADR registry literal title synchronization
1. Read `03-design/adr-registry.md`.
2. For each ADR row:
   - open the referenced ADR file
   - extract the `title` front-matter value
   - compare it literally to the registry title
3. Mark `FAIL` for any mismatch, including wording drift such as `Apex` vs `validation rule`.

### SFG3.3.d — DF requirement to task existence reconciliation
1. Read the DF traceability matrix in `04-tasks/task-list.md`.
2. For each DF requirement:
   - confirm it maps to at least one existing **in-scope** task entry, or
   - confirm it is explicitly marked out of scope / owned downstream with sign-off
3. Confirm that every referenced task ID exists as a real task section in the same file.
4. Mark `FAIL` if any requirement points to a nonexistent task, removed task, or has no valid mapping/sign-off status.

## Evidence recording requirements for `SFG3.3`

For each cross-check, record:
- check id
- artifacts reviewed
- evidence summary
- `PASS` or `FAIL`
- remediation note if failed

Never collapse `SFG3.3` into a single undifferentiated global pass without the per-check breakdown.

## Phase 3 `SFG3.3` report format

```markdown
## SFG3.3 Cross-check Results

| Check ID | Result | Evidence |
| --- | --- | --- |
| SFG3.3.a | PASS/FAIL | ... |
| SFG3.3.b | PASS/FAIL | ... |
| SFG3.3.c | PASS/FAIL | ... |
| SFG3.3.d | PASS/FAIL | ... |
```

## Additional checklist for Phase 3 `SFG3.3`

- [ ] Every component/service shown in diagrams has been reconciled to the component list
- [ ] Every Apex service shown in design has at least one in-scope task or an explicit justification
- [ ] No design component contradicts an ADR or an out-of-scope guardrail
- [ ] Every ADR registry title literally matches the ADR front-matter title
- [ ] No DF requirement points to a nonexistent or removed task
- [ ] Evidence is recorded per cross-check, not only as a global result
