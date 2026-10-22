# Build Log — Salesforce — [Project Name]

**Phase**: 5 — Construction  
**Project**: `[project-slug]`  
**Date**: YYYY-MM-DD  
**Author**: [Agent / Developer]  
**Target Org**: [alias or org type, e.g. dev-sandbox, partial-copy-sandbox]

---

## Summary

> Brief description of what was built in this phase and the overall outcome.

---

## Tasks Completed

| #   | Task                           | Status                           | Notes |
| --- | ------------------------------ | -------------------------------- | ----- |
| 1   | [task title from task-list.md] | ✅ Done / ❌ Failed / ⚠️ Partial |       |
| 2   |                                |                                  |       |

---

## Metadata Produced

| Type          | API Name       | Location in force-app                                |
| ------------- | -------------- | ---------------------------------------------------- |
| Apex Class    | `MyClass`      | `force-app/main/default/classes/MyClass.cls`         |
| Apex Trigger  | `MyTrigger`    | `force-app/main/default/triggers/MyTrigger.trigger`  |
| LWC           | `myComponent`  | `force-app/main/default/lwc/myComponent/`            |
| Flow          | `My_Flow`      | `force-app/main/default/flows/My_Flow.flow-meta.xml` |
| Custom Object | `My_Object__c` | `force-app/main/default/objects/My_Object__c/`       |

---

## Design Deviations

> List any decisions made during construction that deviate from the approved design in `03-design/design.md`. Each deviation must include a justification.

| #   | Design Decision | Deviation | Justification |
| --- | --------------- | --------- | ------------- |
| 1   |                 |           |               |

---

## Governor Limit Considerations

> Document any specific governor limit decisions made during implementation.

- [ ] All SOQL queries are outside loops
- [ ] All DML statements are outside loops
- [ ] Logic tested/designed for 200+ record bulk scenarios
- [ ] Specific limits addressed: _(list if any)_

---

## Deployment Results (Mandatory — Salesforce Incremental + Manifest + Final RunRelevantTests)

This section is **non-skippable** for Salesforce projects.

### Step 0 — Deployment inventory and plan

**Inventory (exact paths)**

> List every created/modified metadata artifact with its exact `force-app/main/default/...` path.

**Dependency-ordered deployment plan**

> Group by layer (Schema → Apex → UI → Automation → Configuration) and define the exact deploy order.

---

### Step 1 — Incremental deploy per artifact (fail-fast)

**Command pattern (repeat for each artifact)**

```bash
sf project deploy start -d force-app/main/default/<exact-path> --test-level NoTestRun
```

**Incremental Deploy Log**
| # | Layer | Artifact Path | Date/Time | Result | Job ID | Notes |
|---|-------|---------------|-----------|--------|--------|-------|
| 1 | Schema | force-app/main/default/objects/... | YYYY-MM-DD HH:MM | ✅ / ❌ | [job-id] | |
| 2 | Apex | force-app/main/default/classes/... | YYYY-MM-DD HH:MM | ✅ / ❌ | [job-id] | |

---

### Step 2 — Update `package.xml` (cumulative) after each dependency group

**Manifest location**

- `work-item/[project-slug]/05-build/package.xml`

**Members added in this group**

> List the API names added to the manifest in this group. No wildcards (`*`) allowed.

---

### Step 3 — Group manifest deploy (official record)

**Command**

```bash
sf project deploy start \
  --manifest work-item/[project-slug]/05-build/package.xml \
  --test-level NoTestRun
```

**Manifest Deploy Log**
| # | Dependency Group | Date/Time | Result | Job ID | Notes |
|---|------------------|-----------|--------|--------|-------|
| 1 | Schema | YYYY-MM-DD HH:MM | ✅ / ❌ | [job-id] | |
| 2 | Apex | YYYY-MM-DD HH:MM | ✅ / ❌ | [job-id] | |

---

### Step 4 — Final manifest deploy + RunRelevantTests (required)

**Command**

```bash
sf project deploy start \
  --manifest work-item/[project-slug]/05-build/package.xml \
  --test-level RunRelevantTests
```

**Final Validation**

- **Status**: ✅ Success / ❌ Failed
- **Job ID**: [job-id]
- **Test summary**: [pass/fail + key failures if any]

### Errors Encountered (if any)

```
[paste deployment error output here]
```

**Resolution**:

> Describe how the error was resolved before re-attempting deployment.

---

## Rollback Record (if applicable)

> Complete this section only if a rollback was performed during this phase.

| Field                       | Value                                  |
| --------------------------- | -------------------------------------- |
| Rollback trigger            | [reason]                               |
| Rollback method             | `git revert` / previous deploy / other |
| Rollback commit/job         | [reference]                            |
| System state after rollback | Stable / Partial                       |
| Next action                 | [description]                          |

---

## Notes and Observations

> Any additional context, observations, or items to carry forward to Phase 6.

---

## Phase 5 Completion Checklist (Salesforce)

- [ ] All atomic tasks in `task-list.md` are marked `[x]`
- [ ] All metadata is in `force-app/main/default/` (root-level SFDX structure)
- [ ] Feature metadata inventory produced (all artifacts listed with exact paths)
- [ ] Dependency-ordered deployment plan produced before execution
- [ ] Incremental deploys executed per artifact with `--test-level NoTestRun` (SFG5.1)
- [ ] `work-item/[project-slug]/05-build/package.xml` created and maintained cumulatively (SFG5.2)
- [ ] Manifest deploy executed after each dependency group with `--test-level NoTestRun` (SFG5.3)
- [ ] Final manifest deploy executed with `--test-level RunRelevantTests` and 0 failures (SFG5.4)
- [ ] Build log includes job IDs and outcomes for all steps (SFG5.5)
- [ ] No compilation errors in Apex classes
- [ ] No `System.debug` statements in production code
- [ ] No hardcoded IDs or org-specific values
- [ ] All Apex classes declare sharing (`with sharing` or explicitly justified)
- [ ] All SOQL queries use `WITH USER_MODE` or `Security.stripInaccessible()`
- [ ] All public/global methods have ApexDoc comments
- [ ] Naming conventions followed (`NamingConventions.md`)
- [ ] This `build-log.md` is complete and saved
