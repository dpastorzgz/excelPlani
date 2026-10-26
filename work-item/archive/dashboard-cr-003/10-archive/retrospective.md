# Retrospective — Dashboard CR-003

## 1. Summary

- Date: 2026-10-26 | Release: v0.4.0 (`8456b4e`) | Archive commit: **TBD**

## 2. What went well

- **projectStart/projectEnd propagation**: Existing metadata from workbook gateway (`plan.projectStart`, `plan.projectEnd`) was already parsed — only needed to thread it through the state and domain. Clean extension with no new infrastructure.
- **Domain isolation maintained**: Time-based metrics computed entirely in `planning-domain.js` using the same `ordinal()` helper already present. No date logic leaked into the view.
- **69/69 tests green**: Only 3 tests needed updating (toEqual metric shape changes); no functional regressions.

## 3. What went poorly

- **Two-step move command**: The physical move required a workaround (tmp dir) because `Move-Item` to a pre-existing directory places the folder inside rather than merging. Should use `robocopy` or ensure target doesn't exist first.

## 4. What we learned

- When `toEqual` is used in tests for metric objects, any new field addition to the metrics object requires updating every `toEqual` assertion — `toMatchObject` would be more resilient for partial checks.

## 5. Metrics

- Lead time: 1 day | Tasks: 6/6 | FRs: 4/4 | Tests: 69/69

## 6. Archive Movement Record

- Archive commit hash: **TBD**
- Original: `work-item/dashboard-cr-003/` → Archive: `work-item/archive/dashboard-cr-003/`
- Archived: 2026-10-26
