# Skill: Git Operations

**Phase**: 8 — Commit & PR
**Input**: implemented and verified code, passing tests
**Output**: commits, PR, version tag

---

## Commit Convention (Conventional Commits)

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Allowed types

| Type       | Use                                 |
| ---------- | ----------------------------------- |
| `feat`     | New functionality                   |
| `fix`      | Bug fix                             |
| `refactor` | Refactoring without behavior change |
| `test`     | Add or modify tests                 |
| `docs`     | Documentation changes               |
| `chore`    | Maintenance tasks (deps, config)    |
| `perf`     | Performance improvements            |
| `ci`       | CI/CD changes                       |

### Scope (common examples by technology)

- The scope is the module, layer or component affected within the project
- Generic examples: `api`, `ui`, `auth`, `db`, `core`, `config`, `test`, `deploy`
- Technology-specific scopes are defined in `technology-rules/[technology]/`

### Valid examples

```
feat(api): add user authentication endpoint
fix(ui): resolve null reference in user profile component
test(core): add coverage for payment calculation edge cases
docs(api): update authentication endpoint JSDoc
chore(config): add environment variable for payment gateway
```

---

## Branching Strategy

```
main
  └── develop
        └── feature/[project-slug]-[short-description]
        └── fix/[project-slug]-[short-description]
```

- **main**: production code. Only receives merges via approved PR.
- **develop**: integration. Features are merged here first.
- **feature/**: branches for new functionality development.
- **fix/**: branches for bug fixes.

---

## Commit Process

1. Verify all tests pass (`0 failures`)
2. Verify coverage is ≥ 75%
3. Run `git status` — review modified files
4. Group changes into logical commits (not one commit per file)
5. Use `git add -p` for precise commits if there are multiple changes
6. Write the message following Conventional Commits
7. Push to the feature branch

---

## Pull Request Process

### PR Title

```
[PROJECT-SLUG] <type>: <brief description>
```

### PR Body (template)

```markdown
## Description

[What this PR does and why]

## Changes Included

- [Change 1]
- [Change 2]

## Project Phase

Phase X — [Phase name]

## Tests

- Coverage: X%
- Tests added: X
- Tests modified: X

## Verification

- [ ] Verification report approved (phase 6)
- [ ] Tests passing (phase 7)
- [ ] Technology rules applied
- [ ] Documentation updated

## References

- Project: `work-item/[project-slug]/`
- Design: `03-design/design.md`
```

---

## Versioning (SemVer)

- **MAJOR** (X.0.0): Backwards-incompatible changes
- **MINOR** (0.X.0): Compatible new functionality
- **PATCH** (0.0.X): Compatible bug fixes

### General criteria

- Releases with compatible new functionality are MINOR
- Compatible bug fixes are PATCH
- Changes that break backwards compatibility are MAJOR
- Consult the project's technology rules for additional criteria

---

## Git Prohibitions

- ❌ Do not `git push --force` on shared branches
- ❌ Do not merge directly to `main` without a PR
- ❌ Do not commit credentials, tokens, or sensitive data
- ❌ Do not push code without tests (coverage < 75%)
- ❌ Do not mix multiple features in a single PR
