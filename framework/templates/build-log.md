# Build Log — {{project_name}}

## 1. Build summary
- Date:
- Implementer/agent:
- Phase: 05-build
- Scope summary:

## 2. Decisions made during construction
> Record key decisions and tradeoffs. Link to ADRs if applicable.

- Decision:
- Rationale:
- Alternatives considered:
- Impact:

## 3. Deviations from Design / Tasks
> Any deviation must be documented with justification.

- Deviation:
- Justification:
- Mitigation / follow-up:

## 4. Commands executed
```bash
# paste commands here
```

## 5. Deployment / Build output (provenance)
> One row per dry run AND per real deploy. Each entry must be reproducible
> with the technology's report/status command (see `technology-rules/[technology]/tech-config.yml:deployment`
> and the technology overlay template, e.g. `build-log-sf.md` / `build-log-d365pp.md`).
> A real deploy to a persistent environment must be proven materialized by an
> idempotent re-validation (changed components report `Unchanged` / `No changes`).

- Source provenance: version-controlled? (yes/no) / baseline ref:

| Deploy/Import ID | Target environment (alias + user/principal) | Dry-run? | Result | Components | Notes |
| --- | --- | --- | --- | --- | --- |
|  |  | true/false |  |  |  |

## 6. Group deliverable reconciliation (anti descope-to-green)
> List every in-scope deliverable of every task in the group. A green deploy is not proof of delivery:
> verify functional shape against acceptance criteria, not mere presence.

| Task | Deliverable | present-in-artifact / absent / descoped(sign-off) | Evidence (deploy/import ID + component reference) |
| --- | --- | --- | --- |
|  |  |  |  |

## 7. Task completion integrity
> A task is `done` only when ALL its deliverables are verified. Status must match across task-list / active.yml / this log.
> Technology-specific integrity rules live in `technology-rules/[technology]/quality-gates.md`.

| Task | All deliverables delivered? | Status (task-list / active.yml / here) | Pending split (if partial) |
| --- | --- | --- | --- |
|  |  |  |  |

## 8. Evidence
- Links / screenshots / logs:
