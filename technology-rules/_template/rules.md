<!--
Template: technology-rules/rules.md
Framework version: 1.6
Last updated: 2026-09-18
Instructions: Copy this file to technology-rules/[your-technology]/rules.md
             and fill in every section. Delete placeholder comments when done.
-->

# Technology Rules — {{technology_name}}

> Master rules file for the {{technology_name}} technology stack.  
> This file is loaded by the agent before generating any code for this technology.
>
> Project overlay: a repository may add `project-rules/` guidelines that add to
> or tighten these rules (never relax them) and, if declared with
> `replaces:`, supersede a prose guideline file. `quality-gates.md` is never
> replaceable. See `framework/rules/core.md` §6.2 and §9.

---

## Phase 01 — Proposal ({{technology_name}}-specific)

_Define any technology-specific constraints that must appear in the proposal:_
- Minimum platform/runtime version required
- Licensing constraints
- Known platform limitations to document upfront

---

## Phase 02 — Specs ({{technology_name}}-specific)

_Define acceptance criteria format or any spec requirements specific to this technology:_
- Required non-functional requirements (e.g., API rate/quota limits, platform-specific throughput constraints)
- Platform-specific security requirements
- Integration constraints

---

## Phase 03 — Design ({{technology_name}}-specific)

_Define architecture and design standards:_
- Preferred architectural patterns for this technology
- Naming convention references (link to `NamingConventions.md` if applicable)
- Component model / module structure standards
- Forbidden patterns (anti-patterns to avoid)

---

## Phase 04 — Tasks ({{technology_name}}-specific)

_Define how tasks should be decomposed for this technology:_
- Maximum granularity of a single task (e.g., one class, one component)
- Required task metadata (e.g., target org, deploy unit)
- Dependency constraints

---

## Phase 05 — Construction ({{technology_name}}-specific)

_Define build standards:_
- Required linting tools and configuration
- Code style guide reference
- Mandatory code review checklist items specific to this technology
- Deployment commands (exact CLI commands to use)
- Build failure protocol (what to do on partial deploy failure)

---

## Phase 06 — Verification ({{technology_name}}-specific)

_Define verification steps:_
- How to compare implementation against design in this technology
- Platform-specific verification tools (e.g., org diff, metadata comparison)
- Verification evidence format

---

## Phase 07 — Testing ({{technology_name}}-specific)

_Define testing standards:_
- Minimum test coverage threshold: **XX%**
- Test framework and runner commands
- Required test categories (unit, integration, e2e)
- Test data management approach
- Forbidden patterns in tests

---

## Phase 08 — Commit / PR ({{technology_name}}-specific)

_Define version control standards:_
- Branch naming convention
- Required PR checks (CI gates)
- Merge strategy (squash / merge commit / rebase)

---

## Phase 09 — Release ({{technology_name}}-specific)

_Define release / deployment standards:_
- Target environment progression (dev → staging → production)
- Release validation steps
- Post-deploy verification commands
- Rollback procedure

---

## Phase 10 — Archive ({{technology_name}}-specific)

_Define archiving standards:_
- What artifacts must be retained
- Where archived projects are stored
- Retention period

---

## Forbidden Patterns

_List of patterns that are NEVER allowed in this technology:_

```
❌ [Pattern 1] — Reason
❌ [Pattern 2] — Reason
```

---

## Required Tools and Versions

| Tool | Version | Purpose |
|------|---------|---------|
| [tool] | [version] | [purpose] |

---

## External References

- Official documentation: [link]
- Style guide: [link]
- Guidelines files: See `technology-rules/{{technology_slug}}/` directory
