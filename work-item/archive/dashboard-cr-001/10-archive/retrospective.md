# Retrospective — Dashboard — Mejoras y correcciones v1

## 1. Summary

- Date: 2026-10-26
- Participants: Responsable del proyecto, Axet Agent
- Project duration: 2026-10-26 (single day — change request)
- Track: `change-request`
- Technology: `web-standalone`
- Release: `v0.2.0` — tag on commit `868931f`
- Archive commit hash: `0dcb934` (full: see `git log --oneline`)

---

## 2. What went well

- **Fast lifecycle**: all 10 phases completed in a single session — CR intake to archive in one day.
- **Root cause clarity on FR-05**: identifying the "controlled input" anti-pattern (`render()` overwriting a focused input) led to a surgical 4-line fix rather than a complex UI widget.
- **Test-driven verification**: each new feature had a dedicated integration test before the phase closed, making Phase 6 verification straightforward.
- **Zero regressions**: 61 pre-existing tests continued to pass after all 5 changes.
- **Framework track discipline**: `change-request` track correctly pre-approved Phase 3 skip, saving one full phase of design work for a purely localized change set.

---

## 3. What went poorly

- **TASK-005 initial misunderstanding**: the first interpretation of FR-05 was to add +/- month stepper buttons, which required a follow-up clarification from the user. The actual fix was simpler (focus guard). Better upfront scoping of the root cause would have avoided the rework.
- **app.js export cleanup**: the `announce()` function removal was not caught in the initial TASK-002 implementation and required a second ESLint-driven fix pass.

---

## 4. What we learned

- **Focus guard for controlled inputs**: `if (document.activeElement !== el) { el.value = ... }` is a simple and robust pattern for preventing render cycles from interrupting user input in `<input type="date">` fields.
- **`X` as boolean convention**: Spanish Excel files commonly use `X` as a "yes/true" marker. Adding it to the recognized truthy values is a low-risk, high-value improvement for real-world compatibility.
- **CR intake clarifies ambiguity early**: Q-001 (how to display assignee) was resolved in Phase 1, preventing a rework loop during implementation.

---

## 5. Action items

- [ ] Operator: deploy updated files from `main@868931f` to the permanent deployment directory — Owner: Responsable del proyecto — Due: operator discretion
- [ ] Framework: add root-cause analysis prompt to Phase 5 TASK template for UI interaction fixes — Owner: framework maintainer — Due: next framework improvement cycle

---

## 6. Metrics

- Lead time: 1 calendar day (2026-10-26)
- Phases completed: 10 / 10
- Tasks completed: 6 / 6
- FRs delivered: 5 / 5
- Defects found in testing: 0 blocking
- Test count delta: +6 new tests (61 → 67)
- Files changed: 8 source + 3 test files
- Commit: `868931f` (+145 / -46 lines)

---

## 7. Framework Improvement Actions

| # | Area | Observation | Proposed Improvement | Priority | Status |
|---|---|---|---|---|---|
| 1 | Phase 5 template | No prompt to investigate root cause before implementing UI interaction fixes | Add "root cause identified?" checkpoint to TASK template for `fix` type items | Low | ⬜ Pending |
| 2 | CR intake template | FR-05 wording ("allow editing only the month") was ambiguous without a root cause analysis | Add "root cause / current behavior" field to each FR row in CR intake | Low | ⬜ Pending |

---

## 8. Phase 10 Quality Gates

- QG10.1 — Passed: retrospective at `work-item/dashboard-cr-001/10-archive/retrospective.md`
- QG10.2 — Passed: all phase artifacts present (01–09, build-log, verification, test-report, closeout, release-notes)
- QG10.3 — Passed: project README will be marked ARCHIVED after physical move
- QG10.4 — N/A: project type is `feature`, not epic

---

## 9. Archive Movement Record

- Archive commit message: `chore(archive): move dashboard-cr-001 to work-item/archive after Phase 10 closure`
- Archive commit hash: `0dcb934`
- Original path: `work-item/dashboard-cr-001/`
- Archive path: `work-item/archive/dashboard-cr-001/`
- Archived by: Axet Agent
- Archived at: 2026-10-26, Europe/Madrid
