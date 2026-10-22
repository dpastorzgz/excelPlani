<!--
Skill: proposal-writing/skill.md
Framework version: 1.0
Last updated: 2026-05-12
-->

# Skill — Proposal Writing (Phase 1)

## Purpose

Guide the agent in producing a high-quality project proposal that clearly defines scope, goals, constraints, and success criteria — in business language, without implementation detail.

## When to use

Load this skill at the start of Phase 1 (Proposal).

---

## Phase boundary: Proposal vs. Specs vs. Design

The Proposal answers **"Why?"** and **"What value?"**. It is a business alignment document.

| Belongs in Proposal                                      | Belongs in Specs                                               | Belongs in Design                                       |
| -------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------- |
| Business problem and opportunity                         | Functional requirements (Given/When/Then)                      | Data model (objects, fields, API names)                 |
| High-level solution description (in functional terms)    | Business rules and edge cases                                  | Security model (OWD, permission sets, role hierarchy)   |
| Stakeholders and affected users                          | Non-functional requirements (performance, security principles) | Specific technology components (see technology rules) |
| In-scope / out-of-scope capabilities                     | Integrations at system level                                   | API contracts, integration contracts                    |
| Business constraints (budget, timeline, platform choice) | Acceptance criteria                                            | Architectural patterns and technology decisions         |
| Business risks and mitigations                           | Open questions for Specs/Design                                | ADRs                                                    |
| Success criteria (observable outcomes)                   |                                                                |                                                         |

### ❌ DO NOT include in a Proposal

- Object/entity API names (e.g., `CustomOrderRequest__c`, `CustomOrderApproval__c`)
- Field-level specifications (field types, lengths, formulas)
- Technology component names (class, trigger, flow, frontend component — see technology rules)
- Specific coding patterns (sharing/access enforcement, limit/quota approaches — see technology rules)
- Specific deployment toolchain details (CLI commands, manifest specifics — see technology rules)
- Architectural decisions or platform-specific implementation patterns (e.g., "metadata-driven thresholds", "queue-based worker for routing")
- Specific validation rule logic or automation implementation details

### ✅ Acceptable in a Proposal

- Platform choice (e.g., "Salesforce-native solution")
- High-level security principles (e.g., "data must be access-controlled by role", "audit records must be immutable")
- General technology constraints (e.g., "no ERP integration in Phase 1")
- Reference to existing objects by their business name (e.g., "linked to the existing Opportunity record"), not their API name

---

## Steps

### 1. Understand the request

- Identify the core problem or opportunity being addressed
- Clarify ambiguous requirements by asking targeted questions
- Identify the primary stakeholder(s)

### 2. Define scope boundaries

- Explicitly state what IS in scope
- Explicitly state what is OUT of scope
- Document assumptions made where requirements are unclear

### 3. Draft the proposal

Use `framework/templates/proposal.md` as the base. Ensure every section is complete:

- **Problem statement** — What problem does this solve?
- **Proposed solution** — High-level approach (not implementation detail)
- **Goals and non-goals** — Measurable outcomes
- **Constraints** — Time, budget, technical, regulatory
- **Success criteria** — How will we know this succeeded?
- **Risks** — Top 3 risks and proposed mitigations

### 4. Quality checks before presenting

- [ ] Problem statement is understood and agreed by stakeholder
- [ ] Success criteria are measurable (not vague) and expressed as observable business outcomes
- [ ] At least one risk identified
- [ ] Scope boundaries explicitly documented in business/functional terms
- [ ] Platform choice identified or flagged as TBD
- [ ] **No API names, class names, field names, or implementation patterns present** — if found, move to Design
- [ ] Risk mitigations are strategic, not architectural (no technology-specific patterns or automation designs)
- [ ] Constraints are business/platform-level, not coding-standard-level

### 5. Present for approval

Present the proposal to the user following the phase approval protocol in `framework/config/phase-approval.yml`.
