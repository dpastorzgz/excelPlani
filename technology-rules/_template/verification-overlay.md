# {{Technology Name}} Verification Overlay (Technology-Specific) — Template

> Complements `framework/skills/verification/skill.md` when the target technology is `{{technology_slug}}`.
> Load this file together with the generic skill for Phase 5 build-evidence triage and Phase 3 design cross-checks.

---

## A. Deployment-result triage (Phase 5 build evidence)

When the reviewed scope includes `{{deploy_tool}}` deploy or dry-run output, classify failures in root-cause order before writing conclusions.

Mandatory triage rules:

1. Parse failures by referenced artifact/entity, not only by line order.
2. If an artifact fails structural validation (schema, well-formedness), treat that as a root cause.
3. If a downstream error references an artifact that also failed in the same run, classify it as a **secondary cascade**, not a separate root cause.
4. If a dependency is missing because of ordering, classify it as a **dependency-order** root cause unless the dependency is intentionally out of scope.
5. If a component fails because a platform feature/capability is unavailable in the target environment, classify it as an **environment capability** issue and require remediation before retrying.
6. If the manifest references artifacts not present in local source, classify it as a **scope / source-inventory** root cause and require manifest correction before retrying.
7. Report findings in this order:
   - root cause(s)
   - secondary cascades
   - environment prerequisites
   - remaining independent failures

---

## A.5 Build-claim verification (anti descope-to-green)

A **green dry run or deploy is not evidence that the group was delivered**. Verify claims against the environment and the source, never against prose in the log:

1. **Reproduce every cited deploy/import ID** using the technology's CLI; confirm dry-run vs real, status, and the actual success/failure lists. Do not accept "OK".
2. **Environment of record**: confirm the build log's target environment and IDs match where the work actually executed.
3. **Deliverable reconciliation**: list every in-scope deliverable of every task in the group and mark each `present` / `absent` / `descoped-with-sign-off` against the reproduced result set. Verify functional shape, not mere presence. Any in-scope deliverable absent without written sign-off is a **descope-to-green finding**.
4. **Task completion integrity**: a task is `done` only if **all** its deliverables are delivered and verified; flag any task marked done with deliverables still pending, and any status that disagrees across `task-list.md`, `active.yml`, and the build log.

---

## B. Design self-consistency verification (Phase 3)

When the design gate is invoked, do not stop at grep-like forbidden-term checks. Execute the mandatory cross-checks below and record evidence per check.

### B.1 Component-diagram to component-list reconciliation

1. Extract all meaningful nodes/services from the design component diagrams.
2. Extract the explicit component/service inventory from the design narrative.
3. For each diagram node/service, confirm it exists in the inventory, or classify it as a non-service UI/data node.
4. If the node/service is a service, confirm there is at least one **in-scope** task that delivers its behavior.
5. Mark `PASS` only if no unresolved diagram-only service remains.

### B.2 Component/service vs ADR and out-of-scope guardrail consistency

1. Read the design, ADR registry, ADR files, and any active sign-off notes.
2. For each sensitive component/service, compare it against ADR guardrails and explicit out-of-scope decisions.
3. Mark `FAIL` if any component reintroduces behavior declared out of scope or contradicts an ADR decision.

### B.3 ADR registry title synchronization

1. Read the ADR registry.
2. For each ADR row, open the referenced ADR file and compare the `title` front-matter value literally to the registry title.
3. Mark `FAIL` for any wording drift.

### B.4 Requirement to task existence reconciliation

1. Read the traceability matrix in `04-tasks/task-list.md`.
2. For each requirement, confirm it maps to at least one existing **in-scope** task, or is explicitly marked out of scope with sign-off.
3. Confirm that every referenced task ID exists as a real task section.
4. Mark `FAIL` if any requirement points to a nonexistent or removed task.

---

## Evidence recording requirements

For each cross-check, record:

- check id
- artifacts reviewed
- evidence summary
- `PASS` or `FAIL`
- remediation note if failed

Never collapse the design self-consistency check into a single undifferentiated global pass without the per-check breakdown.

### Report format

```markdown
| Check ID | Result | Evidence |
| --- | --- | --- |
| A.0 | PASS/FAIL | ... |
| A.5 | PASS/FAIL | ... |
| B.1 | PASS/FAIL | ... |
| B.2 | PASS/FAIL | ... |
| B.3 | PASS/FAIL | ... |
| B.4 | PASS/FAIL | ... |
```

---

## Additional checklist

- [ ] Deployment failures classified by root cause before conclusions
- [ ] Every cited deploy/import ID reproduced and matched to the environment of record
- [ ] Every in-scope deliverable reconciled (present / absent / descoped-with-sign-off)
- [ ] Every component/service shown in diagrams reconciled to the component list
- [ ] No design component contradicts an ADR or an out-of-scope guardrail
- [ ] Every ADR registry title literally matches the ADR front-matter title
- [ ] No requirement points to a nonexistent or removed task
- [ ] Evidence recorded per cross-check, not only as a global result
