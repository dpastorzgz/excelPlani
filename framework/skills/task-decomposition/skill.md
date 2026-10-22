# Skill: Atomic Task Decomposition

**Phase**: 4 — Atomic Task Definition
**Input**: `03-design/design.md`
**Output**: `04-tasks/task-list.md`

---

## Process

1. Read the complete design (`03-design/design.md`)
2. Identify all defined components
3. For each component, generate atomic tasks following these rules:
   - One task = one unit of work completable in ≤ 2 hours
   - A task has a binary result: done or not done
   - A task does not depend on uncompleted prior work (except explicit dependencies)
4. Assign to each task:
   - Unique ID: `T-XXX` (sequential numbering)
   - Design component it belongs to
   - Complexity: S (< 30 min) / M (30–90 min) / L (90–120 min)
   - Dependencies: list of required prior task IDs
5. Order tasks by dependencies (execution order)
6. Validate that the set of tasks covers 100% of the design

---

## Atomicity Criteria

A task IS atomic if:

- ✅ Has a single clear output artifact
- ✅ Can be verified independently
- ✅ Contains no pending design decisions

A task is NOT atomic if:

- ❌ Contains multiple unrelated components
- ❌ Its result is ambiguous ("implement the functionality")
- ❌ Requires making architecture decisions during execution

---

## Task Format

```markdown
### T-001: [Descriptive task name]

- **Component**: [Design component name]
- **Description**: [Exactly what needs to be done]
- **Expected result**: [Generated artifact or code]
- **Complexity**: S / M / L
- **Dependencies**: T-000 (or "None")
- **Status**: [ ] Pending
```

---

## task-list.md Structure

```markdown
# Task List — [Project Name]

**Total tasks**: N
**Estimated total time**: X hours
**Last update**: YYYY-MM-DD

---

## Phase: [Domain/Component name]

### T-001: [Task name]

...

### T-002: [Task name]

...

---

## Summary

| ID    | Name | Component | Complexity | Dependencies | Status |
| ----- | ---- | --------- | ---------- | ------------ | ------ |
| T-001 | ...  | ...       | S          | None         | [ ]    |
| T-002 | ...  | ...       | M          | T-001        | [ ]    |
```

---

## Complete Decomposition Checklist

- [ ] All design components have at least one task
- [ ] No task has a duration > 2 hours (if so, split it)
- [ ] All dependencies are explicit and unambiguous
- [ ] The task order allows sequential execution without blocks
- [ ] Task IDs are unique and sequential
- [ ] The user has reviewed and approved the task list
