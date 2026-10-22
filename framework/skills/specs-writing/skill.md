# Skill: Specifications Writing

**Phase**: 2 — Specifications  
**Input**: `01-proposal/proposal.md`  
**Output**: `02-specs/specs.md`

---

## TL;DR (min context)

- Extract and classify requirements from the proposal: FR (what) + NFR (how well).
- Write each requirement as a **verifiable** statement (must/should) + measurable criteria.
- Prioritize (P1/P2/P3) and add acceptance criteria (Given/When/Then) for FRs.
- Identify integrations and dependencies at **system level** (not field/object/API level).
- Iterate with the user until there are no ambiguities; approval is required to close Phase 2.

---

## Phase boundary: Specs vs. Design

Specs answers **"What must the system do?"**. Design answers **"How will it be built?"**.

| Belongs in Specs                                          | Belongs in Design (Phase 3)                         |
| --------------------------------------------------------- | --------------------------------------------------- |
| Functional requirements (behavior, rules)                 | Data model (specific entities, fields, API names)       |
| Business rules and edge cases                             | Security model (access control, roles, permission sets) |
| NFRs — _what_ is needed (e.g., "response < 2s")           | NFR implementation (e.g., async via background worker/queue — see technology rules) |
| User roles and access principles                          | Technology component names (see technology rules)       |
| Integration needs at system level (what data flows where) | API contracts, endpoint specs, field mappings       |
| Acceptance criteria (Given/When/Then on behavior)         | ADRs, architectural patterns, technology decisions  |
| Open questions for Design to resolve                      | Deployment details (toolchain, manifest, pipeline specifics) |

### DO NOT include in Specs

- Entity/field API names (e.g., `CustomOrderRequest__c`, `Status__c`) — describe entities by their business name
- Technology component names (class, trigger, flow, frontend component — see technology rules)
- Specific platform implementation patterns (e.g., "enforce via trigger", "use queue for async", "metadata-driven routing")
- Specific API endpoint paths or request/response payloads — those are Design artifacts
- Deployment toolchain references (CLI, manifest, CI/CD pipeline specifics)

### Acceptable in Specs

- Business entity names (e.g., "Order Request", "Approval Record", "the Opportunity") — not their API names
- Integration at system level (e.g., "the system must send an email notification to the approver" — not the Apex method that does it)
- Security as a principle (e.g., "only users with the Sales Manager role may approve", "audit records must be read-only after creation")
- Performance/scalability targets as metrics (e.g., "must handle 500 concurrent submissions"), not implementation approach

---

## Do / Don't

- Do: keep requirements atomic, testable, and unambiguous. Use business language.
- Don't: write tasks/solutions as requirements; avoid subjective wording ("fast", "easy") without metrics.
- Don't: specify implementation — if you find yourself writing "via Apex" or "using a Flow", stop and move it to Design.

---

## Process (extended)

1. Read the proposal (`01-proposal/proposal.md`)
2. Identify and classify requirements:
   - **Functional (FR)**: what the system must do
   - **Non-Functional (NFR)**: how it must behave (performance, security, etc.)
3. Write each requirement in a verifiable format: "The system **must** [verb + object + condition]"
4. Assign priority: `P1` (critical) / `P2` (important) / `P3` (desirable)
5. Define use cases or user stories with acceptance criteria (BDD if applicable)
6. Identify external integrations and dependencies at system level
7. Document known constraints at principle level (not implementation level)
8. Validate with the user: are there ambiguities? Is anything missing?

---

## Requirement Writing Rules

A good requirement:

- Is **verifiable**: it can be checked whether it is met or not
- Is **atomic**: describes a single thing
- Is **complete**: requires no additional interpretation
- Uses the verb **"must"** (mandatory) or **"should"** (desirable)

A bad requirement:

- "The system must be fast" — not verifiable
- "The system must manage accounts and contacts" — not atomic
- "Implement the business logic" — this is a task, not a requirement
- "The system must enforce approval via a synchronous transaction hook" — this is Design, not a requirement

---

## Functional Requirement Format

```markdown
### FR-001: [Requirement name]

**Priority**: P1 / P2 / P3
**Description**: The system must [verb + object + condition].
**Acceptance criteria**: Given [context], when [action], then [expected result].
```

## Non-Functional Requirement Format

```markdown
### NFR-001: [Requirement name]

**Category**: Performance / Security / Scalability / Usability
**Description**: The system must [measurable condition].
**Metric**: [Concrete value, e.g., "< 2 seconds response time"]
```

## User Story Format

```markdown
### US-001: [Story name]

**As** [user role],
**I want** [functionality],
**so that** [benefit/value].

**Acceptance criteria**:

- [ ] [Criterion 1]
- [ ] [Criterion 2]
```

---

## Complete Specs Checklist (extended)

Before considering specs complete, verify:

- [ ] All FRs have verifiable acceptance criteria (Given/When/Then on observable behavior)
- [ ] All NFRs have concrete metrics (numbers, not vague adjectives)
- [ ] External integrations identified at system level (what data flows, not field-level mappings)
- [ ] Constraints documented at principle level, not implementation level
- [ ] No contradictory requirements exist
- [ ] **No API names, class/trigger/flow/component names, or implementation patterns present** — if found, move to Design
- [ ] The user has reviewed and approved

> Reporting tip: in phase closeout, reference `QG2.*` instead of pasting this checklist.
