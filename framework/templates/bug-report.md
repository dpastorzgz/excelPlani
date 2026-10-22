---
template: bug-report
version: 1.0.0
track: hotfix
phase: "01-skip"
---

# Bug Report — [BUG-ID]: [Short Title]

**Date**: YYYY-MM-DD  
**Reporter**: [Name / Team]  
**Severity**: P1-Critical | P2-High | P3-Medium | P4-Low  
**Environment**: Production | Staging | UAT | Dev  
**Target Fix**: [version or sprint]

---

## 1. Summary

> One-line description of the bug.

## 2. Steps to Reproduce

1.
2.
3.

## 3. Expected Behavior

> What should happen.

## 4. Actual Behavior

> What actually happens. Include error messages, screenshots, or logs if available.

## 5. Root Cause Analysis

> (Fill in after investigation) What caused this bug?

## 6. Affected Components

| Component | Impact |
| --------- | ------ |
|           |        |

## 7. Fix Approach

> Brief description of the proposed fix. No full design doc needed unless architectural change is involved.

## 8. Regression Risk

- [ ] Low — isolated change, unit tests sufficient
- [ ] Medium — affects shared logic, integration tests required
- [ ] High — core system impacted, full regression suite required

## 9. Acceptance Criteria / Verification

1. Bug no longer reproducible via steps above.
2.
3.

---

## Hotfix Track — Phase Entry Point

> This bug report replaces Phase 1 (Proposal). Proceed directly to **Phase 4 (Tasks)**.
>
> Phases skipped: P1 (Proposal), P2 (Specs), P3 (Design)  
> Phases required: P4 → P5 → P6 → P7 → P8 → P9 → P10

---

## 10. Open Questions

> Hotfix intake and Phase 4 cannot close while any question has status `open`. Deferred questions require explicit user approval and a target phase.

| ID | Question | Status | Resolution | Owner | Target phase |
| --- | --- | --- | --- | --- | --- |
| Q-000 | No open questions at draft creation. Add real questions as needed. | cancelled | Not applicable | Agent | Phase 4 |

---

## Sign-off

| Role      | Name | Status    | Date |
| --------- | ---- | --------- | ---- |
| Reporter  |      | Confirmed |      |
| Tech Lead |      | Approved  |      |
