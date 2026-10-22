---
template_id: proposal
version: "1.0"
track: new-feature
project_slug: "{{project_slug}}"
created: "{{date}}"
updated: "{{date}}"
---

<!--
PROPOSAL PHASE — SCOPE REMINDER
This document answers "Why?" and "What value?". It is a business alignment document.
✅ Use: business problem, functional capabilities, stakeholders, observable success criteria, platform choice, business-level constraints and risks.
❌ Avoid: API names, object/field names, class/trigger/flow names, Apex coding patterns, SFDX specifics, architectural decisions. Those belong in Phase 3 (Design).
See framework/skills/proposal-writing/skill.md for the full Proposal/Specs/Design boundary.
-->

# Project Proposal — {{project_name}}

## 1. Summary

- **Problem / Opportunity**:
- **Proposed solution (high level)**:
  <!-- Describe WHAT the solution will do in functional/business terms. Do NOT name specific objects, classes, or implementation patterns. -->
- **Stakeholder / affected user(s)**:
- **Business value**:

## 2. Context

- **Current state / existing system**:
- **Pain points**:
- **Assumptions**:

## 3. Scope

<!-- Describe capabilities in business/functional language. Do NOT use API names (e.g. CustomObject__c), field names, or technology-specific terms. -->

### In scope

- ...

### Out of scope

- ...

## 4. Constraints

<!-- ✅ OK: platform choice, timeline, budget, compliance principles, high-level integrations out of scope.
     ❌ Avoid: coding standards (sharing/access patterns), deployment toolchain details (CLI commands, manifest specifics), specific API versions. Those belong in Design. -->

- **Time**:
- **Budget**:
- **Technology / platform**:
- **Compliance / security**:
  <!-- State security as a principle (e.g. "access must be role-based", "audit data must be immutable"), not as an implementation standard. -->
- **Dependencies**:

## 5. Risks

<!-- State mitigations as strategic decisions, not architectural ones. Do NOT prescribe Apex patterns, Flow designs, or specific automation approaches here. -->

| Risk | Likelihood | Impact | Mitigation |
| ---- | ---------- | ------ | ---------- |
|      |            |        |            |

## 6. Success criteria

<!-- Each criterion should be an observable business outcome. Avoid referencing implementation details (e.g. "enforced at Apex layer"). -->

- ...

## 7. Open questions

> Phase 1 cannot close while any question has status `open`. Use `answered`, `deferred`, or `cancelled` to close a question. `deferred` requires explicit user approval and a target phase.

| ID | Question | Status | Resolution | Owner | Target phase |
| --- | --- | --- | --- | --- | --- |
| Q-000 | No open questions at draft creation. Add real questions as needed. | cancelled | Not applicable | Agent | Phase 1 |

## 8. Sizing & Split Decision

- Metrics: capabilities_in_scope=__, domains=__
- Sizing gates triggered: QG__ / none
- Decision: monolith | epic-split
- If epic-split → proposed epic slug + slicing strategy (domain | risk | tech-layer) + estimated children:
- Justification / override (required if continuing as monolith with gates triggered):

## 9. Approval

- **Status**: Draft / Approved
- **Approved by**:
- **Date**:
