---
template_id: task-list
version: "1.1"
track: "{{track}}"
project_slug: "{{project_slug}}"
created: "{{date}}"
updated: "{{date}}"
---

# Atomic Task List — {{project_name}}

> Each task must be independently verifiable and reference design components (CMP-\*) and requirements (FR/NFR) where applicable.

**Track**: {{track}} | **Phase**: 4 — Atomic Tasks | **Project**: {{project_slug}}

---

## Legend

- **Status**: `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked
- **Complexity**: S (< 30 min) · M (30–90 min) · L (90–120 min, max 2h per atomic task)
- **Priority**: P1 critical · P2 high · P3 normal
- **depends_on**: list of TASK-IDs that must be completed before this task starts

---

## Summary Table

| Task     | Title          | Component | Complexity | Priority | Depends on | Status |
| -------- | -------------- | --------- | ---------- | -------- | ---------- | ------ |
| TASK-001 | {{task_title}} | CMP-01    | S          | P2       | —          | [ ]    |

---

## Tasks

### TASK-001 — {{task_title}}

- **Status**: [ ]
- **Component(s)**: CMP-01
- **Requirements**: FR-01
- **Description**: {{description}}
- **depends_on**: —
- **Complexity**: S
- **Priority**: P2
- **Verification** (how to prove done):
  - Evidence:
  - Command / screenshot / link:

---

## Open Questions / Pending Decisions

> Phase 4 cannot close while any task requires a pending design decision. Resolve questions before Phase 5 or defer with explicit user approval and target phase.

| ID | Question | Status | Resolution | Owner | Target phase |
| --- | --- | --- | --- | --- | --- |
| Q-000 | No open questions at draft creation. Add real questions as needed. | cancelled | Not applicable | Agent | Phase 4 |

---

## Sizing & Split Decision

- Metrics: tasks=__, effort_est=__h, L_tasks=__, domains=__
- Sizing gates triggered: QG__ / none
- Decision: monolith | epic-split
- If epic-split → proposed epic slug + slicing strategy (domain | risk | tech-layer) + estimated children:
- Justification / override (required if continuing as monolith with gates triggered):

---

<!--
Add more tasks following the same structure.
Keep the Summary Table in sync with the tasks below.
-->
