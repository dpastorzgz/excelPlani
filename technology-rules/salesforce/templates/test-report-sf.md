# Test Report — Salesforce — [Project Name]

**Phase**: 7 — Testing  
**Project**: `[project-slug]`  
**Date**: YYYY-MM-DD  
**Author**: [Agent / Developer]  
**Target Org**: [alias or org type, e.g. dev-sandbox, partial-copy-sandbox]

---

## Summary

> Overall test result. State whether the phase passed or failed and the final global coverage percentage.

**Overall Result**: ✅ PASSED / ❌ FAILED  
**Global Apex Coverage**: [XX]%  
**Total Test Classes**: [count]  
**Total Test Methods**: [count]  
**Failures**: [count]

---

## Test Execution Command

```bash
sf apex run test --test-level RunLocalTests --code-coverage --result-format human
```

> If a specific org alias was required: `--target-org <alias>`

---

## Test Class Inventory

| Test Class               | Class Under Test     | Methods | Pass | Fail | Coverage % |
| ------------------------ | -------------------- | ------- | ---- | ---- | ---------- |
| `AccountServiceTest`     | `AccountService`     | 6       | 6    | 0    | 92%        |
| `LeadTriggerHandlerTest` | `LeadTriggerHandler` | 5       | 5    | 0    | 88%        |
|                          |                      |         |      |      |            |

---

## Coverage Summary

| Class / Trigger      | Lines Covered | Lines Total | Coverage % | Meets Threshold |
| -------------------- | ------------- | ----------- | ---------- | --------------- |
| `AccountService`     | 92            | 100         | 92%        | ✅ (≥85%)       |
| `LeadTriggerHandler` | 44            | 50          | 88%        | ✅ (≥85%)       |
|                      |               |             |            |                 |
| **Global**           |               |             | **[XX]%**  | ✅/❌ (≥75%)    |

### Coverage Thresholds

| Level                     | Threshold | Status  |
| ------------------------- | --------- | ------- |
| Platform minimum (global) | ≥ 75%     | ✅ / ❌ |
| Project standard          | ≥ 85%     | ✅ / ❌ |
| Critical business logic   | ≥ 90%     | ✅ / ❌ |

---

## Test Scenario Coverage

> Confirm that the required scenario types are covered for each class under test.

| Class Under Test     | Positive | Negative | Bulk (200+) | Permissions |
| -------------------- | -------- | -------- | ----------- | ----------- |
| `AccountService`     | ✅       | ✅       | ✅          | ✅          |
| `LeadTriggerHandler` | ✅       | ✅       | ✅          | ⚠️ Partial  |

---

## Test Failures (if any)

> Complete this section for every failing test method.

### Failure 1

- **Test Class**: `[TestClassName]`
- **Test Method**: `[methodName]`
- **Error Type**: `[System.AssertException / LimitException / other]`
- **Error Message**:
  ```
  [paste error message here]
  ```
- **Root Cause**: [description]
- **Fix Applied**: [description of fix]
- **Status after fix**: ✅ Resolved / ❌ Still failing

---

## Governor Limit Observations

> Note any governor limit warnings or near-limit scenarios observed during testing.

| Scenario              | Limit Type   | Usage | Limit | Status  |
| --------------------- | ------------ | ----- | ----- | ------- |
| Bulk insert 200 Leads | SOQL queries | 8     | 100   | ✅ Safe |
|                       |              |       |       |         |

---

## Data Factory Usage

- [ ] All test data created via `TestDataFactory` (no inline data in test methods)
- [ ] No `seeAllData=true` in any test class
- [ ] `@TestSetup` used for shared test data where applicable
- [ ] `Test.startTest()` / `Test.stopTest()` used in all test methods

---

## Phase 7 Completion Checklist (Salesforce)

- [ ] All Apex classes have a dedicated `*Test` class
- [ ] `TestDataFactory` used for all test data
- [ ] Bulk tests (200+ records) pass without governor limit errors
- [ ] Positive, negative, and edge case scenarios covered
- [ ] No `seeAllData=true` in any test class
- [ ] All tests use `@isTest` and `@TestSetup` where appropriate
- [ ] `Test.startTest()` / `Test.stopTest()` used in all test methods
- [ ] Global coverage ≥ 85% confirmed
- [ ] All tests pass in target sandbox environment
- [ ] This test report is complete and saved to `work-item/[project-slug]/07-testing/test-report.md`
