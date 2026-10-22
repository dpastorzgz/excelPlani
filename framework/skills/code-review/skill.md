# Skill: Code Review

**Phase**: 5 — Build (continuous review) / 8 — Commit & PR
**Input**: implemented code, `03-design/design.md`, technology rules
**Output**: review comments, list of issues to resolve

---

## Process

1. Load the project's technology rules (`technology-rules/[technology]/`)
2. Read the reference design (`03-design/design.md`)
3. Review the code by layers (from outermost to innermost)
4. Classify each found issue by severity
5. Document the result with concrete evidence (line, file, excerpt)
6. If there are blocking issues → do not approve until resolved
7. If there are only minor issues → approve with comments

---

## Review Dimensions

### 1. Correctness

- Does the code do what the design specifies?
- Are all use cases for the FR implemented?
- Are edge cases handled?
- Are errors handled explicitly?

### 2. Security

- Are inputs validated before processing?
- Are there no hardcoded credentials in the code?
- Is exposure of sensitive data in logs avoided?
- Do dependencies have versions without known vulnerabilities?

### 3. Performance

- Are there no costly operations inside unnecessary loops?
- Are database queries optimized (indexes, projections)?
- Is caching used where appropriate?
- Are resources released correctly?

### 4. Maintainability

- Are variable, function, and class names descriptive?
- Do functions do only one thing?
- Does the code avoid duplication (DRY)?
- Is cyclomatic complexity reasonable (< 10 per function)?
- Are there comments where the logic is not obvious?

### 5. Design Adherence

- Does each implemented component match the designed component?
- Are the interfaces (inputs/outputs) as defined in the design?
- Have no unplanned dependencies been introduced?

### 6. Tests

- Does the new code have tests covering it?
- Are the tests meaningful (not just to achieve coverage)?
- Are the tests independent of each other?

---

## Issue Classification

| Severity    | Definition                                                         | Action                                             |
| ----------- | ------------------------------------------------------------------ | -------------------------------------------------- |
| 🔴 Blocking | Bug, security vulnerability, serious design violation              | Must be resolved before merge                      |
| 🟡 Major    | Code that will work but with maintainability or performance issues | Must be resolved in this branch or create a ticket |
| 🟢 Minor    | Style, naming, improvable comments                                 | Suggestion, does not block                         |

---

## Review Comment Format

````markdown
**[SEVERITY]** `file.ext:line`

**Problem**: [description of the issue]

**Excerpt**:

```code
[problematic code snippet]
```

**Suggestion**:

```code
[how it should look]
```
````

---

## Code Review Checklist

- [ ] Correctness: all FRs implemented correctly
- [ ] No obvious security vulnerabilities
- [ ] No costly operations in loops
- [ ] Descriptive names throughout the code
- [ ] No code duplication
- [ ] Tests present and meaningful
- [ ] No critical deviations from the design
- [ ] Blocking issues = 0 before approving
