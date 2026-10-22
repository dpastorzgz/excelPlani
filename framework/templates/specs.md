---
template_id: specs
version: "1.0"
track: "{{track}}"
project_slug: "{{project_slug}}"
created: "{{date}}"
updated: "{{date}}"
---

<!--
SPECS PHASE — SCOPE REMINDER
This document answers "What must the system do?". It is a behavioral requirements document.
✅ Use: functional requirements (Given/When/Then), business rules, user roles, NFR metrics, integrations at system level, security principles.
❌ Avoid: API names, object/field names, class/trigger/flow names, implementation patterns (Apex, Flow details), data model specifics, API contracts. Those belong in Phase 3 (Design).
See framework/skills/specs-writing/skill.md for the full Specs/Design boundary.
-->

# Specifications — {{project_name}}

## 1. Overview

- **Goal**:
- **Stakeholders / users**:
- **In scope**:
- **Out of scope**:

## 2. Functional Requirements (FR)

<!-- Each FR describes WHAT the system must do (observable behavior), not HOW.
     Use business entity names (e.g. "Order Request"), not API names (e.g. CustomOrderRequest__c).
     Do NOT reference implementation: no Apex, no Flow, no object API names. -->

> Numbered and prioritized. Each FR must be testable/verifiable.

- **FR-01 (P1)**:
  - Description:
  - Acceptance Criteria (Given / When / Then):
  - Notes / Dependencies:

## 3. Non-Functional Requirements (NFR)

<!-- State WHAT is required (metric/threshold), not HOW it will be achieved.
     e.g. "must respond within 2 seconds" — NOT "must use Queueable Apex for async processing". -->

- **NFR-01**:
  - Category: Performance / Security / Scalability / Maintainability / Compliance
  - Requirement:
  - Metric / Acceptance Criteria:

## 4. User Stories / Use Cases

<!-- Describe behavior from the user's perspective. Acceptance criteria must be observable outcomes.
     Do NOT include implementation details in acceptance criteria. -->

### UC-01 — {{use_case_name}}

- **Actor**:
- **Preconditions**:
- **Main flow**:
- **Alternative flows**:
- **Acceptance Criteria**:

## 5. Integrations & Dependencies

<!-- Describe integrations at SYSTEM level: which systems exchange data and what data flows.
     Do NOT specify field mappings, API endpoint paths, request/response payloads, or auth implementation. Those belong in Design. -->

- Systems involved:
- Data that flows (business description):
- Constraints (e.g., "integration is read-only in Phase 1", "no real-time sync required"):

## 6. Security & Access Principles

<!-- State access rules as business/role principles, NOT as Salesforce implementation standards.
     e.g. "Sales Managers may approve" — NOT "enforced via OWD + permission set + Apex with sharing".
     CRUD/FLS implementation details, OWD settings, profile configurations → Design phase. -->

- Access rules (who can do what):
- Data sensitivity / classification:
- Audit requirements (what must be logged / immutable):

## 7. Assumptions

- ...

## 8. Open Questions

> Phase 2 cannot close while any question has status `open`. Deferred questions require explicit user approval and a target phase.

| ID | Question | Status | Resolution | Owner | Target phase |
| --- | --- | --- | --- | --- | --- |
| Q-000 | No open questions at draft creation. Add real questions as needed. | cancelled | Not applicable | Agent | Phase 2 |

## 9. Sizing & Split Decision

- Metrics: FRs=__, P1=__, UCs=__, domains=__
- Sizing gates triggered: QG__ / none
- Decision: monolith | epic-split
- If epic-split → proposed epic slug + slicing strategy (domain | risk | tech-layer) + estimated children:
- Justification / override (required if continuing as monolith with gates triggered):

## 10. Approval

- **Status**: Draft / Approved
- **Approved by**:
- **Date**:
