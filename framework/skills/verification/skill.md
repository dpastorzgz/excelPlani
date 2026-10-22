# Skill: Implementation Verification

**Primary Phase**: 6 — Verification
**Additional Phase 3 Use**: design self-consistency checks (technology overlay in `technology-rules/[technology]/verification-overlay.md`)
**Input**: `03-design/design.md`, `03-design/adr-registry.md`, ADR files, `04-tasks/task-list.md`, implemented code where applicable
**Output**: `06-verification/verification-report.md` or explicit evidence embedded in the active Phase 3 artifact set when the check is design-only

> Technology-specific triage lives in overlays, not here:
> load `technology-rules/[technology]/verification-overlay.md` together with this skill.

---

## Process

### A0. Technology deployment-result triage (overlay)

When verification is invoked on Phase 5 build evidence, load the technology overlay first
(`technology-rules/[technology]/verification-overlay.md`, §A0/A0.5 or equivalent)
and classify failures in root-cause order before writing conclusions.

### A. Phase 6 implementation verification (generic)
1. Read `03-design/design.md` — extract component list
2. Read `04-tasks/task-list.md` — extract task list
3. For each design component:
   - Locate its implementation in the code
   - Compare defined responsibility vs. implemented responsibility
   - Compare defined inputs/outputs vs. implemented
   - Mark as ✅ Compliant, ⚠️ Minor Deviation, or ❌ Critical Deviation
4. For each task in the task-list:
   - Confirm **every** deliverable is present in the deployed/built set (reproduced, per A0.5), not merely that a file exists
   - Confirm each deliverable meets its **acceptance criteria** (functional shape), not just that it compiles/deploys
   - Mark ✅ Completed **only if all** deliverables are verified; partial delivery is ❌ Not completed (or `in-progress`) with the delivered/pending split recorded
5. Generate `verification-report.md`
6. If there are critical deviations → roll back to phase 5

### B. Phase 3 design self-consistency verification (technology overlay)

For technology-specific cross-check sets, execute the overlay:
`technology-rules/[technology]/verification-overlay.md` §B, and record evidence per check.
Do not stop at grep-like forbidden-term checks.

---

## Deviation Classification

| Type         | Definition                                | Action                  |
| ------------ | ----------------------------------------- | ----------------------- |
| ✅ Compliant | Implementation matches design             | None                    |
| ⚠️ Minor     | Non-functional difference (names, format) | Document, continue      |
| ❌ Critical  | Behavior differs from design              | Stop, return to phase 5 |

---

## Verification Report Format

```markdown
# Verification Report — [Project Name]

**Date**: YYYY-MM-DD
**Phase**: 6 — Verification

## Summary

- Total components: X
- Compliant: X ✅
- Minor deviations: X ⚠️
- Critical deviations: X ❌

## Verification by Component

### [Component Name]

- **Status**: ✅ / ⚠️ / ❌
- **Observations**: ...

## Task Verification

| ID    | Task | Status |
| ----- | ---- | ------ |
| T-001 | ...  | ✅     |

## Conclusion

[APPROVED / REJECTED] — [Justification]
```

### Phase 3 technology cross-check report format (see overlay)

```markdown
## Technology Cross-check Results

| Check ID | Result | Evidence |
| --- | --- | --- |
| <TECH>-3.3.a | PASS/FAIL | ... |
```

---

## Verification Checklist

- [ ] All design components have been reviewed
- [ ] All tasks in the task-list have been checked
- [ ] All critical deviations have been resolved (or their return to phase 5 documented)
- [ ] Minor deviations are documented with justification
- [ ] The report has been reviewed and signed by the user

### Additional checklist for Phase 3 technology cross-checks (see overlay for the per-check list)
- [ ] Every component/service shown in diagrams has been reconciled to the component list
- [ ] No design component contradicts an ADR or an out-of-scope guardrail
- [ ] Evidence is recorded per cross-check, not only as a global result
