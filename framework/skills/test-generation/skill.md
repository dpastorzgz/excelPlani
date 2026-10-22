# Skill: Test Generation

**Phase**: 7 — Testing
**Input**: implemented code, `02-specs/specs.md`, technology rules
**Output**: test suite, `07-testing/test-report.md`

---

## Process

1. Read the specs to identify all use cases and acceptance criteria
2. Load the technology rules (`technology-rules/[technology]/`) for test conventions
3. For each component, identify the scenarios to test
4. Write tests following the AAA pattern (Arrange, Act, Assert)
5. Run the tests and verify they pass
6. Measure coverage and document in `test-report.md`

---

## Test Types

### Unit Tests

- Test a single unit of code (function, method, class) in isolation
- External dependencies are mocked
- Fast and deterministic
- Cover: happy path, edge cases, error handling

### Integration Tests

- Test the interaction between two or more components
- May use real databases or services (test environment)
- Verify that contracts between components are respected

### End-to-End Tests (E2E)

- Test complete flows from input to output
- Simulate real user behavior
- Most expensive to maintain — use only for critical flows

---

## AAA Pattern

```
// Arrange — prepare initial state
[configure input data, mocks, fixtures]

// Act — execute the action to test
[call the method or function under test]

// Assert — verify the result
[check that the output is as expected]
```

---

## Coverage Strategy

### What to always test

- ✅ Business logic (calculations, validations, transformations)
- ✅ Error handling and edge cases
- ✅ Each acceptance criterion from the specs
- ✅ Code that has had previous bugs

### What not to test

- ❌ Trivial getters/setters without logic
- ❌ Automatically generated code
- ❌ Third-party infrastructure (the library already has its own tests)

### Minimum coverage

The coverage threshold is defined in the project's technology rules. If not defined, use as reference:

- Business logic: ≥ 90%
- Application layers: ≥ 75%
- Global project: as per `technology-rules/[technology]/`

---

## Test Naming

Test names must describe the expected behavior:

```
[method/function]_[scenario]_[expected result]
```

Examples:

- `calculateDiscount_withVipCustomer_returns20Percent`
- `createUser_withDuplicateEmail_throwsValidationError`
- `processPayment_whenGatewayTimeout_retriesThreeTimes`

---

## Complete Testing Checklist

- [ ] Each FR from specs has at least one test validating it
- [ ] Edge cases are covered (null values, empty, boundaries)
- [ ] Errors are explicitly tested
- [ ] Coverage meets the threshold defined in technology rules
- [ ] All tests pass (0 failures)
- [ ] `test-report.md` is generated with the summary
