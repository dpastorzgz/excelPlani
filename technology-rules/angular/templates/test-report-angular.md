# Test Report — Angular — [Project Name]

**Phase**: 7 — Testing  
**Project**: `[project-slug]`  
**Date**: YYYY-MM-DD  
**Author**: [Agent / Developer]

> Technology provenance: this report extends the generic Phase 7 test report with the Angular-specific evidence required by ANG7.1–ANG7.5 — Vitest 4.x + jsdom, MSW 2.x at the HTTP boundary, deterministic waits and coverage thresholds.

## Summary

**Overall Result**: ✅ PASSED / ❌ FAILED  
**Spec files**: [count]  
**Tests**: [count] — passed [count] / failed [count]  
**Global coverage**: [XX]% (threshold ≥75%)  
**Critical data-access / state coverage**: [XX]% (threshold ≥85%)

## Scope

> Features and files covered by this test run.

- `src/app/features/[feature]/[feature]-list/` — [what is covered]
- `src/app/features/[feature]/[feature]-api.ts` and `[feature]-store.ts` — [what is covered]

## Test Inventory

| Spec file (`*.spec.ts`) | Unit under test | Positive | Negative | Boundary | State | Result |
| --- | --- | --- | --- | --- | --- | --- |
| `[feature]-list.spec.ts` | `[FeatureList]` | ✅ | ✅ | ✅ | ✅ loading/error/empty | ✅ |
| `[feature]-api.spec.ts` | `[FeatureApi]` | ✅ | ✅ | ✅ | ✅ loading/error | ✅ |

> Assert user-visible behavior — no snapshot-only tests (ANG7.4); waits use `await fixture.whenStable()`, fake timers or events — no arbitrary sleeps (ANG7.5).

## Commands and Outputs

```bash
npm test                # Test Files [N] passed · Tests [N] passed · 0 failed
npm test -- --coverage  # coverage report: work-item/[project-slug]/07-testing/coverage/
```

**Result**: ✅ `npm test` completes without failures (ANG7.2).

## Coverage

| Area / File | Coverage % | Threshold | Result |
| --- | --- | --- | --- |
| Global | [XX]% | ≥75% | ✅ / ❌ |
| `[feature]-api.ts` (data access) | [XX]% | ≥85% | ✅ / ❌ |
| `[feature]-store.ts` (state) | [XX]% | ≥85% | ✅ / ❌ |

> Coverage report saved under `work-item/[project-slug]/07-testing/coverage/` (ANG7.3).

## MSW Fixtures Used

| Handler / fixture | Endpoint(s) | Used by |
| --- | --- | --- |
| `src/mocks/handlers/[feature]-handlers.ts` | `GET /[resource]`, `POST /[resource]` | `[feature]-api.spec.ts` |

- All test HTTP runs through `src/mocks/server.ts` (`setupServer`); no real network (ANG7.4).
- Fixtures are deterministic and contain no production customer data.

## Known Gaps and Justification

| Gap | Justification | Follow-up |
| --- | --- | --- |
| [e.g. no visual regression test for X] | [reason] | [planned / accepted] |

## Failures (if any)

- **Spec**: `[file].spec.ts` — **Test**: `should [behavior] when [condition]` — **Error**: [type]
- **Root cause**: [description] — **Fix**: [description] — **Status after fix**: ✅ Resolved / ❌ Still failing

## Sign-Off

| Role | Name | Date | Result |
| --- | --- | --- | --- |
| [Agent / Developer] | | YYYY-MM-DD | ✅ / ❌ |
| [Reviewer] | | YYYY-MM-DD | ✅ / ❌ |

## Phase 7 Completion Checklist (Angular)

- [ ] Positive, negative, boundary and state scenarios covered for main flows (ANG7.1, ANG7.4)
- [ ] `npm test` completes without failures (ANG7.2)
- [ ] Coverage ≥75% global; ≥85% critical data-access/state; report recorded (ANG7.3)
- [ ] MSW used for all HTTP in tests; no real network calls (ANG7.4)
- [ ] Deterministic tests only — no sleeps or arbitrary timeouts (ANG7.5)
- [ ] This `test-report.md` saved to `work-item/[project-slug]/07-testing/test-report.md`
