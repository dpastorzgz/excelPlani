# Quality Gates — Acceptance Criteria by Phase (Compact)

Use this file for day-to-day phase completion reporting.
Prefer referencing **IDs** (e.g., `QG5.1`) instead of pasting long checklists.
For verbose wording, see `framework/rules/quality-gates-extended.md`.

Allowed gate result states in artifacts and conversations:

- `Passed` - requirement satisfied with recorded evidence.
- `Pending` - requirement not yet satisfied and still blocks phase closeout.
- `Failed` - requirement evaluated and did not pass.
- `N/A` - requirement does not apply to the changed technology/component/scope, and the reason plus evidence location are documented in the phase artifact.

Do not use ad hoc states such as `Partially passed` in phase closeout. If some gates pass and others do not apply, report them separately by ID.

---

## Cross-cutting principles (apply to every gate, every phase)

These bind all gates below. A phase gate that conflicts with one of these is not satisfied.

- **Evidence before done** — a gate is `Passed` only with **reproducible evidence of the outcome** (a re-run command, a deploy report, a query result), never because a status was self-declared or because an artifact merely exists or compiles. "The log says X" is not evidence; "I re-ran X and got Y" is.
- **No descope-to-green** — a check that turns green by **removing or shrinking in-scope work** (deleting a deliverable from a manifest, implementing a partial/weaker rule, tracking a subset of required fields) is a **FAIL**, not a pass. Any scope reduction requires an explicit, written sign-off; without it, an absent in-scope deliverable is a blocker. A deliverable's **functional shape** must meet its acceptance criteria — presence/compilation is not completeness, and a message/label must not claim behavior the implementation omits.
- **Single source of truth** — the status of the same item across artifacts (task-list, `active.yml`, build/verification logs) **and the real environment** must agree. Divergence between what an artifact claims and what the environment/evidence shows is a blocker until reconciled.
- **Reproducible provenance** — the artifact set a gate is evaluated against must be reproducible: source under version control or a dated baseline, and every external action (deploy, release) recorded with the exact environment and a re-runnable identifier.

---

## Phase 1 — Proposal

- QG1.1 — Has a title and description of the problem to solve
- QG1.2 — Identifies the stakeholder / affected user
- QG1.3 — Describes the expected business value
- QG1.4 — Lists known constraints (time, technology, budget)
- QG1.5 — No unresolved open questions remain, unless explicitly deferred with user approval and target phase
- QG1.6 — Only Phase 1 intake artifacts were persisted
- QG1.7 — Reviewed and approved by the user
- QG1.8 — Sizing evaluated: in-scope capabilities and functional domains counted, `Sizing & Split Decision` section completed; split recommended if >5–6 capabilities or ≥3 independent domains

---

## Phase 2 — Specs

- QG2.1 — Contains Functional Requirements (FR) numbered and prioritized
- QG2.2 — Contains Non-Functional Requirements (NFR) (performance, security, scalability)
- QG2.3 — Defines use cases / user stories with acceptance criteria
- QG2.4 — Identifies external integrations or dependencies
- QG2.5 — No ambiguities; each requirement is verifiable
- QG2.6 — No unresolved open questions remain, unless explicitly deferred with user approval and target phase
- QG2.7 — Only Phase 2 artifacts were persisted
- QG2.8 — Reviewed and approved by the user
- QG2.9 — Sizing evaluated: FRs, P1 count and UCs counted, `Sizing & Split Decision` section completed; split recommended if >12–15 FRs or >5 P1 or >4 UCs

---

## Phase 3 — Design

- QG3.1 — Defines component architecture (Mermaid diagram)
- QG3.2 — Describes each component (responsibility, inputs/outputs)
- QG3.3 — Documents data model (objects, fields, relationships)
- QG3.4 — Defines integration points
- QG3.5 — Justifies relevant design decisions (ADRs)
- QG3.6 — Aligned with all Phase 2 requirements
- QG3.7 — No unresolved open questions remain, unless explicitly deferred with user approval and target phase
- QG3.8 — Only Phase 3 artifacts were persisted
- QG3.9 — Sizing evaluated: `CMP-*` components and external integrations counted, `Sizing & Split Decision` section completed; split recommended if >5–6 components or >2 external integrations

---

## Phase 4 — Atomic Tasks

- QG4.1 — Each task is independent and has a verifiable result
- QG4.2 — Each task references its design component
- QG4.3 — Task set covers 100% of the design
- QG4.4 — Dependencies between tasks are identified
- QG4.5 — Each task has a complexity estimate (S/M/L)
- QG4.6 — No task contains pending design decisions or unresolved open questions
- QG4.7 — Only Phase 4 artifacts were persisted during Phase 4 execution
- QG4.8 — Sizing evaluated: tasks counted and total effort estimated (S<30min / M30–90min / L90–120min), `Sizing & Split Decision` section completed; split is blocking if >20 tasks or >40h estimated or >5 L tasks

**Sizing decision rule (QG1.8 / QG2.9 / QG3.9 / QG4.8):** 0 sizing gates triggered → continue as monolith. 1 triggered → agent presents split recommendation (non-blocking; monolith continuation requires written justification in the artifact). ≥2 triggered → epic split is mandatory; the phase cannot close as a monolith without explicit user override recorded in the artifact. Scope must never be silently cut to pass a sizing gate (`No descope-to-green`).

---

## Phase 5 — Construction

- QG5.1 — All atomic tasks are marked completed — a task is `completed` only when **all** its deliverables are delivered and verified against **all** its acceptance criteria (partial delivery stays `in-progress`); task status must be consistent across `task-list`, `active.yml`, and the build log
- QG5.2 — Code follows applicable technology rules
- QG5.3 — No compilation / static analysis errors
- QG5.4 — Code is documented (comments on complex methods)
- QG5.5 — Build log generated at `work-item/[project-slug]/05-build/build-log.md`

---

## Phase 6 — Verification

- QG6.1 — Each design component has its implementation verified
- QG6.2 — Each atomic task has its implementation evidence
- QG6.3 — Deviations documented with justification
- QG6.4 — No unresolved critical deviations
- QG6.5 — Verification report approved by the user
- QG6.6 — Static analysis per `technology-rules/[technology]/tech-config.yml` passes (tool and threshold defined by the technology overlay gates), or `N/A` with reason when no applicable static-analysis target exists in scope and the verification artifact records why
- QG6.7 — Technology verification overlay checks per `technology-rules/[technology]/verification-overlay.md` executed and recorded, or `N/A` with reason when the technology has no overlay

---

## Phase 7 — Testing

- QG7.1 — Code coverage meets technology-rule threshold, or `N/A` when the changed scope has no coverage-producing test runtime and the test artifact records why
- QG7.2 — All applicable Phase 2 use cases have an associated test; for hotfix track, the bug reproduction and acceptance criteria must have associated test evidence
- QG7.3 — Tests cover positive, negative, boundary cases
- QG7.4 — No failing tests
- QG7.5 — Test report documents coverage summary

---

## Phase 8 — Commit & PR

- QG8.1 — Commits follow Conventional Commits
- QG8.2 — PR description complete and references the project
- QG8.3 — PR passed automated checks (required by default; `N/A` only for isolated change-request/docs scope with written approval recording why CI does not apply)
- QG8.4 — PR reviewed and approved

---

## Phase 9 — Release

- QG9.1 — Release notes complete (changes, impacts, rollback)
- QG9.2 — Deployment performed in target environment
- QG9.3 — Post-deploy functionality verified
- QG9.4 — Tag/version created in repository, or `N/A` when the project release policy explicitly does not use repository tags and the release artifact records that policy

---

## Phase 10 — Archive

- QG10.1 — Retrospective documented at `work-item/[project-slug]/10-archive/retrospective.md`
- QG10.2 — All project artifacts exist in their corresponding folders
- QG10.3 — Project marked as ARCHIVED in its README
- QG10.4 — (only type: epic) 100% of children in work-item/archive/, epic-map.yml 100% done, aggregated retrospective covering 100% of Epic-FRs
