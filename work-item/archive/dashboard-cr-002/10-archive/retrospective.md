# Retrospective — Dashboard CR-002

## 1. Summary

- Date: 2026-10-26 | Track: change-request | Release: v0.3.0 (`987417f`)
- Archive commit hash: `ab92b10`

## 2. What went well

- **Scope clarification in Phase 1**: Q-001 led to a much richer CR-002-3 scope (3 new KPIs instead of a simple flag change). The framework's open-question protocol prevented building the wrong thing.
- **Clean domain extension**: Adding `completedOnTime`, `completedLate`, `behindSchedule` to `classifyTaskAtDate()` required only localized changes; no interfaces were broken.
- **`computeExpectedProgress` formula**: The ratio `(ctrl-start)/(end-start)` naturally handles tasks not yet started (returns 0) and overdue tasks (returns 1), requiring minimal edge-case handling.
- **69/69 tests green**: All pre-existing tests continued to pass after semantic change to `delayed`.

## 3. What went poorly

- **CSS replace_in_file failures**: The legend-milestone block required 3 attempts due to truncated REPLACE blocks in tool calls. Should limit to 2 SEARCH/REPLACE blocks per call for CSS files.

## 4. What we learned

- When changing the semantics of an existing field (`delayed`), update ALL tests that depend on the old semantics before running the suite — don't wait for failures.
- The `behindSchedule` metric is more actionable than `overdueWhileOpen` for daily PM tracking: it catches tasks that are lagging before they become vencidas.

## 5. Metrics

- Lead time: 1 day | Tasks: 9/9 | FRs: 4/4 | Tests: 69/69 (+2 new)

## 6. Phase 10 Quality Gates

- QG10.1 — Passed | QG10.2 — Passed | QG10.3 — Passed | QG10.4 — N/A

## 7. Archive Movement Record

- Archive commit hash: `ab92b10`
- Original: `work-item/dashboard-cr-002/` → Archive: `work-item/archive/dashboard-cr-002/`
- Archived: 2026-10-26, Europe/Madrid
