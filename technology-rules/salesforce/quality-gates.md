# Quality Gates — Salesforce Extensions (Technology-Specific)

This file extends the framework quality gates for **Salesforce** work-items.

- Baseline gates still apply: `framework/rules/quality-gates.md`
- This file adds **mandatory Salesforce-only** gates.
- These gates are **blocking**: do not advance phases if any gate below is not satisfied.

Prefer referencing IDs (e.g., `SFG5.1`) in build/verification artifacts.

---

## Phase 2 — Specifications (Salesforce)

- SFG2.1 — Specs remain implementation-agnostic: no Apex, LWC, Flow, trigger, metadata, API name, `package.xml`, or deployment decisions
- SFG2.2 — If an SLDS prototype is generated, it is recorded as UX validation only and does not introduce Salesforce implementation names or metadata decisions
- SFG2.3 — If an SLDS prototype is offered, the user response is recorded before Phase 2 closeout

---

## Phase 3 — Design (Salesforce)

- SFG3.1 — Phase 3 Salesforce guideline files loaded before design decisions: `rules.md`, `NamingConventions.md`, `ProjectPlanning.md`, `ApexGuidelines.md`, `LWCGuidelines.md`, `FlowGuidelines.md`, `DeploymentGuidelines.md`, `PackageXMLGuidelines.md`. Field History Tracking is reconciled **end to end**: (a) every tracked field is a Salesforce-trackable type (**0 type violations**), and (b) the **exact set** of history-tracked fields matches across the field-definition artifact, the ADRs, and the tasks. A divergence in *which* fields are tracked (not only whether the type is trackable) is a **FAIL** and must be collapsed to a single source of truth before build.
- SFG3.2 — The design contains an explicit **Spec vs Design deviations** register for every source-spec requirement left deferred, optional, conditional, or rejected
- SFG3.3 — A data-model and decision-set self-consistency check has been executed; **0 unresolved contradictions allowed**
- SFG3.4 — Delivery model is documented: root-level `force-app/`, cumulative `package.xml`, and release pipeline awareness unless project configuration states otherwise
- SFG3.5 — Meaningful Salesforce architecture tradeoffs are recorded as ADRs or design decisions
- SFG3.6 — Deployability validated before design closeout: pre-flight org capability review (standard objects / host features in scope) plus `sf project deploy validate --dry-run --manifest skeleton` (or project-configured equivalent) against the project sandbox. Missing capabilities have explicit remediation; a dry run that was never attempted is a **BLOCKER**.
- SFG3.7 — **Profile deploy justification**: the design lists every Profile to be deployed, the exact profile-only setting(s) it carries (e.g., login hours, login IP ranges / network access, default application, login flows, profile-level session settings), and why a PermissionSet cannot carry them. Any Profile that carries a permission a PermissionSet can also grant (object/field/system permissions, CRUD/FLS, tab/layout visibility, record-type visibility) is a **BLOCKER** — move it to a PermissionSet. Deploying a Profile without a recorded justification is a **BLOCKER**.

### SFG3.3 mandatory cross-check set
SFG3.3 is not satisfied by a grep-only sweep of prohibited terms. Evidence must be recorded per cross-check below, with an explicit `PASS` or `FAIL` result for each check and artifact references.

#### SFG3.3.a — Component-diagram to component-list reconciliation
Verify that every node or service represented in the design component diagrams exists in the design component/service inventory.

Minimum evidence:
- extracted component-diagram node/service names
- matching section or inventory entry for each node/service
- list of any diagram-only nodes with no corresponding design entry

Additional Salesforce-specific rule:
- if a reconciled node/service is an Apex service, there must be at least one **in-scope** task in `04-tasks/task-list.md` that constructs, configures, or otherwise delivers that service behavior
- declarative metadata controls must not be represented as Apex services unless the design explicitly justifies that routing

#### SFG3.3.b — Component/service vs ADR and out-of-scope guardrail consistency
Verify that no design component, service, or responsibility contradicts:
- any accepted/proposed ADR decision in the current Phase 3 decision set
- any explicit out-of-scope statement recorded in the design, ADRs, or active sign-off state

Minimum evidence:
- service/component name
- contradicted ADR or scope statement, if any
- conclusion for each potentially sensitive component or service

Examples of contradictions that must fail this check:
- an Apex service present in the design for behavior explicitly declared declarative-only
- a component owning integration behavior after that behavior has been marked owned downstream / out of scope
- a service responsibility that reintroduces a rejected or removed lifecycle/state model

#### SFG3.3.c — ADR registry literal title synchronization
Verify that each ADR title listed in `03-design/adr-registry.md` matches **literally** the `title` front-matter value of the corresponding ADR file.

Minimum evidence:
- ADR id
- registry title
- front-matter title
- exact-match result

Any literal mismatch is a **FAIL**.

#### SFG3.3.d — DF requirement to task existence reconciliation
Verify that every DF requirement referenced in the traceability matrix maps to:
- at least one existing **in-scope** task in `04-tasks/task-list.md`, or
- an explicit `Out of scope` / `owned downstream` classification with recorded sign-off

Minimum evidence:
- requirement id
- mapped task ids or out-of-scope classification
- confirmation that every mapped task id exists as a real task entry
- list of orphan requirement mappings or references to nonexistent tasks

Any DF requirement pointing to a nonexistent task, removed task, or missing sign-off classification is a **FAIL**.

---

## Phase 4 — Atomic Tasks (Salesforce)

- SFG4.1 — Phase 4 Salesforce guideline files loaded before task decomposition: `rules.md`, `NamingConventions.md`, `ApexGuidelines.md`, `LWCGuidelines.md`, `FlowGuidelines.md`, `DeploymentGuidelines.md`, `PackageXMLGuidelines.md`
- SFG4.2 — Each task maps to an independently buildable/verifiable Salesforce unit and references its design component(s) and requirement(s)
- SFG4.3 — Each task identifies expected metadata type, root-level `force-app/main/default/` path, dependency layer, and `package.xml` impact when applicable
- SFG4.4 — No task contains unresolved Salesforce implementation decisions; unresolved decisions require rollback to Phase 3 or explicit approved deferral
- SFG4.5 — Irreversible / destructive changes have an explicit plan before build: field-type changes, master-detail / sharing-model changes, deletes/renames, and Settings changes record migration steps, data impact, and rollback procedure. Starting Phase 5 with an unplanned irreversible change is a **BLOCKER**.

---

## Phase 5 — Construction (Salesforce)

- SFG5.0 — **Source provenance & reproducibility**: all metadata deployed for any group must be under version control (not git-ignored) **or** backed by a dated retrieved-from-org provenance baseline recorded in the build log, so every manifest member is reproducible against a known source state. A deploy whose source cannot be diffed against a committed/baselined state is a **BLOCKER** — it is neither auditable nor reproducible (a manifest member that has drifted from its source file, e.g. a renamed list view, must be caught here and by SFG5.4).
- SFG5.1 — Pre-flight org capability gate executed for every standard object / host feature in scope (for example `Quote`), with explicit remediation recorded before deployment planning when the feature is not enabled. The gate must map each standard object in scope to its required org capability and fail planning if the capability is missing.
- SFG5.2 — XML well-formedness and metadata lint gate executed on the exact scoped deployment set before any dry run; malformed metadata (for example invalid `xsi:nil`) is a blocker before deploy. On Windows environments without `xmllint`, an equivalent deterministic parser-based validation command is mandatory.
- SFG5.3 — Deployments are scoped by explicit manifest only for dependency groups; deploying broad directories such as `-d force-app/main/default/objects` for a group is forbidden.
- SFG5.4 — Dependency graph validation executed from real metadata references before issuing the group plan; the plan fails if any referenced dependency is scheduled in a later group, if a required child member (for example a lookup/formula field under an included object) is missing from the scoped source-backed set, or if a manifest names metadata that is not present in local source. The graph must include at minimum: lookup/master-detail `referenceTo`, `actionOverride` to FlexiPage/App/Page targets, validation-rule cross-object references, and any child source files required by included object members.
- SFG5.5 — Incremental deployments executed per artifact / minimal unit (fail-fast) using exact paths only inside the already-validated group scope; group official deployment record uses `sf project deploy start -x <group-package.xml> --test-level NoTestRun`.
- SFG5.6 — Cumulative manifest exists and is maintained: `work-item/[project-slug]/05-build/package.xml`.
- SFG5.7 — Manifest updated after each dependency group and deployed with `-x <group-package.xml> --test-level NoTestRun` (group-level official deployment record); directory-based deploy commands are not an acceptable substitute.
- SFG5.8 — End-of-phase final manifest deployment executed with `--test-level RunRelevantTests` and shows 0 failures.
- SFG5.9 — Build log contains: inventory, dependency-ordered plan, pre-flight/gate evidence, per-command results (job IDs **with target org and `checkOnly` flag**), root-cause-first error classification, explicit cascade classification where applicable, the SFG5.11 deliverable-reconciliation table, the SFG5.12 deploy-provenance record, and final RunRelevantTests summary.
- SFG5.10 — Standard objects are never deployed as `CustomObject` definitions; only in-scope custom metadata on them is deployed, and host feature enablement is validated separately.
- SFG5.11 — **Group deliverable reconciliation (anti descope-to-green)**: a green dry run or deploy is **not** evidence that a group is delivered. Before accepting a group as built, reconcile **every in-scope deliverable of every task in that group** against the actual deployed component set (`sf project deploy report` `componentSuccesses`). For each deliverable record: `present-in-deploy` / `absent` / `descoped-with-written-sign-off`. Any in-scope deliverable `absent` without sign-off = **BLOCKER**. Reconciliation must verify **functional shape, not mere presence**: validation-rule formulas implement *every* acceptance criterion (and the `errorMessage` must not claim enforcement the formula omits); Field History delivers `enableHistory=true` **plus** `trackHistory=true` on the **full** required field set (the tracked-field count must equal the task's, not a subset); layout exposure means the field actually appears in the layout's `<field>` set. Because declarative metadata compiles whether or not a deliverable is complete, completeness is proven against acceptance criteria, never inferred from a passing deploy.
- SFG5.12 — **Deploy provenance & build-log↔org reconciliation**: every dry run and deploy recorded in the build log must cite the exact target org (alias + username), a reproducible Deploy ID, and `checkOnly` true/false. The build log's declared `Target Org` and Deploy IDs must match the org where deploys **actually executed**, verified with `sf project deploy report -i <id> -o <org>`. A real (`checkOnly:false`) deploy to a **persistent (non-scratch) org** must be recorded as such and proven materialized by an **idempotent re-validation dry run** (the changed components report `Unchanged`). Phase progress is **BLOCKED** if the build log's org/IDs diverge from the reproduced org state, or if a real deploy is undocumented.
- SFG5.13 — **Task completion integrity**: a task is marked `[x]`/`done` only when **all** of its listed deliverables are deployed **and** verified against **all** of its acceptance criteria. Partial delivery (e.g., history enabled but a required Apex service not built) keeps the task `in-progress` with an explicit delivered/pending split. The status of a given task in `04-tasks/task-list.md`, `active.yml`, and `05-build/build-log.md` must be mutually consistent; any divergence between artifacts about the same task is a **BLOCKER**.
- SFG5.14 — **Release artifact = Phase 5 manifest; machine evidence only**: the release deploys `05-build/package.xml` (manifest-first; `--source-dir force-app` only with written sign-off). `SFG5.1/SFG5.11/SFG5.12/SFG5.13/SFG5.14` accept only reproducible machine evidence (Deploy ID + target org + `checkOnly` + `deploy report`); verbal/manual attestation and `N/A` are forbidden for these gates.
- SFG5.15 — **Tests shift-left per Apex group**: each dependency group containing Apex closes with `RunRelevantTests` for that group's scope (in addition to the end-of-phase full `RunRelevantTests`, SFG5.8). Bulk behavior (200+ records) is verified at group close, not deferred to Phase 7.
- SFG5.16 — **Profile deploy guard**: a `Profile` member may enter `package.xml` and any deploy group **only** when its `SFG3.7` profile-only justification is recorded in the design. Any Profile payload that includes access grants (object/field/system permissions, CRUD/FLS, tab/layout visibility, record-type visibility) is a **BLOCKER** — strip them to the owning PermissionSet before deploying. At least one real (non-dry-run) deploy and a `deploy report` of the Profile must be recorded in `build-log.md`.

---

## Phase 6 — Verification (Salesforce)

- SFG6.1 — PMD executed with `pmd check -R .pmd/ruleset.xml -d force-app/main/default --minimum-priority 2`; **0 priority P1/P2 violations allowed**; the full Salesforce Code Analyzer report (`sf scanner run --target force-app/main/default --engine pmd,eslint --normalize-severity`) is recorded as evidence and **P3+ findings are triaged, not blocking**
- SFG6.2 — ESLint (LWC) executed; **0 errors allowed**; evidence recorded in verification report
- SFG6.3 — Absence of PMD or ESLint execution evidence = **BLOCKER**
- SFG6.4 — Any PMD priority **P1/P2** violation OR any ESLint error = **BLOCKER** and mandatory rollback to Phase 5
- SFG6.4-note — PMD severity mapping in Code Analyzer: P1 → High, P2/P3 → Moderate, P4/P5 → Low; PMD never produces Critical. The blocking policy is defined by the priorities declared in `.pmd/ruleset.xml`, not by the "High severity"/"critical/high" wording.
- SFG6.5 — Smoke in sandbox as running user: Flows, permission sets, and sharing for in-scope personas are exercised post-deploy with recorded org + user + steps + result. Flows/permsets verified only by static inspection is a **BLOCKER**.
- SFG6.6 — **Profile-only setting verification**: every deployed Profile is verified post-deploy (recorded org + Profile name + setting + expected vs actual), confirming the profile-only settings actually materialized (e.g., login hours, login IP ranges / network access, default application, login flows). Verifying a Profile only by inspecting the source XML is a **BLOCKER**.

---

## Evidence Requirements (mandatory)

Evidence must be recorded in:

- Build: `work-item/[project-slug]/05-build/build-log.md`
- Verification: `work-item/[project-slug]/06-verification/verification-report.md`

For Phase 3 design gates, evidence may also be recorded directly in the active Phase 3 artifact set when no build/verification artifact exists yet, provided the evidence is explicit and reviewable.

At minimum, evidence includes:

- command(s) executed, or equivalent deterministic inspection method
- timestamp (or date)
- artifact scope reviewed
- pass/fail result per required check
- evidence summary and remediation notes (if applicable)
- when a CLI referenced in a gate is unavailable on the current OS, the substituted deterministic validation method actually used

If evidence is missing, treat as **[BLOCKER]** and do not advance the phase.
