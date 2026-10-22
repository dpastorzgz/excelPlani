# Framework Review — Improvement Proposals v1

**Date**: 2026-05-12  
**Reviewer**: Axet Plugin (AI Agent)  
**Scope**: Full framework audit — all rules, workflows, templates, skills, and technology-rules  
**Status**: Draft — Pending user review

---

## Executive Summary

The framework is well-structured and covers the complete software development lifecycle across 10 phases. Its core strengths are: strict phase separation, mandatory human approval gates, technology-specific rule loading, and comprehensive artifact generation. The following review identifies **23 improvement opportunities** grouped into 6 areas, ranging from structural gaps to process enhancements.

---

## Area 1 — Missing Structural Elements

### IMP-001: No `work-item/` directory or project registry

**Severity**: 🔴 High  
**Location**: Framework root  
**Problem**: The framework extensively references `work-item/[project-slug]/` but:

- The `work-item/` directory does not exist in the repository
- There is no project registry (index) tracking all projects, their current phase, and status
- Onboarding to a new project has no documented bootstrap procedure

**Proposed solution**:

1. Create `work-item/README.md` as a project registry template
2. Create `framework/templates/project-bootstrap.md` — a guide to initialize a new project's folder structure
3. Create `framework/templates/project-readme.md` — the README template each project should have at `work-item/[project-slug]/README.md`

**Proposed project registry format** (`work-item/README.md`):

```markdown
# Project Registry

| Slug         | Name            | Technology | Current Phase | Status         | Last Updated |
| ------------ | --------------- | ---------- | ------------- | -------------- | ------------ |
| example-slug | Example Project | Salesforce | 03-design     | 🟡 In Progress | 2026-05-12   |
```

---

### IMP-002: No template for adding new technology stacks

**Severity**: 🔴 High  
**Location**: `technology-rules/`  
**Problem**: Only Salesforce is defined. There is no template or guide for adding a new technology (e.g., Node.js, Python, React). An agent working on a non-Salesforce project has no way to know what files to create or what structure to follow.

**Proposed solution**:

1. Create `technology-rules/_template/` directory with:
   - `rules.md` — master rules file template (same structure as `salesforce/rules.md`)
   - `tech-config.yml` — configuration template
   - `context.md` — context template
   - `guidelines/` — placeholder for technology-specific guidelines
2. Create `technology-rules/README.md` documenting how to add a new technology

---

### IMP-003: Missing skill files for Phases 1, 9, and 10

**Severity**: 🟡 Medium  
**Location**: `framework/skills/`  
**Problem**: Skills exist for phases 2–8 but the following phases have no dedicated skill file:

- **Phase 1 (Proposal)** — no `proposal-writing.md` skill
- **Phase 9 (Release)** — no `release-management.md` skill
- **Phase 10 (Archive)** — `retrospective.md` exists but covers only one part of archiving; no `project-archiving.md` skill

**Proposed solution**: Create the missing skill files:

- `framework/skills/proposal-writing/skill.md`
- `framework/skills/release-management/skill.md`
- `framework/skills/project-archiving/skill.md`

---

### IMP-004: No ADR registry template

**Severity**: 🟢 Low  
**Location**: `framework/templates/`  
**Problem**: ADRs are generated per decision but there is no index/registry to track all ADRs across a project. Finding decisions over time requires manual searching.

**Proposed solution**: Create `framework/templates/adr-registry.md`:

```markdown
# ADR Registry — {{project_name}}

| ID      | Title   | Status   | Date       | Phase     |
| ------- | ------- | -------- | ---------- | --------- |
| ADR-001 | [Title] | Accepted | YYYY-MM-DD | 03-design |
```

---

## Area 2 — Workflow Gaps

### IMP-005: Phase 05 workflow lacks an explicit code review step

**Severity**: 🔴 High  
**Location**: `framework/workflows/phase-05-build.md`  
**Problem**: The build phase produces code but there is no explicit step invoking the `code-review.md` skill before deployment. The code review skill describes itself as "Phase 5 (continuous review)" but the Phase 5 workflow does not reference it. This means code could be deployed without a review.

**Proposed solution**: Add a mandatory step in `phase-05-build.md`:

```markdown
### Step N: Code Review (before deployment)

- Load `framework/skills/code-review/skill.md`
- Execute all review dimensions (correctness, security, performance, maintainability)
- Resolve all 🔴 Blocking issues before proceeding to deployment
- Document result in `build-log.md` section 2 (Decisions)
```

---

### IMP-006: No CI/CD pipeline integration in Phase 08

**Severity**: 🟡 Medium  
**Location**: `framework/workflows/phase-08-commit-pr.md`  
**Problem**: Phase 08 documents the commit and PR process but makes no reference to CI/CD pipeline triggers, status checks, or automated gates. In modern workflows, a PR should require green CI before merge.

**Proposed solution**: Add a CI/CD gate section to the Phase 08 workflow:

```markdown
### CI/CD Gate

Before merging the PR:

- [ ] All CI checks pass (linting, build, tests)
- [ ] Coverage gate met (as defined in technology rules)
- [ ] No security scanning failures
- [ ] PR has at least one approval (human or documented agent review)
```

---

### IMP-007: Phase 09 (Release) workflow lacks Salesforce-specific release steps

**Severity**: 🟡 Medium  
**Location**: `framework/workflows/phase-09-release.md`, `technology-rules/salesforce/rules.md`  
**Problem**: The Salesforce technology rules define deployment standards but Phase 09 workflow is generic. There are no Salesforce-specific steps for production deployment (Change Sets vs SFDX Deploy, Release Manager approval, governor limit checks post-deploy).

**Proposed solution**: Add a Salesforce-specific section to `technology-rules/salesforce/rules.md` for Phase 09, similar to the existing Phase 05, 06, and 07 sections:

```markdown
## Phase 09 — Release (Salesforce-specific)

- Validate deployment on full copy sandbox before production
- Use `sf project deploy validate --source-dir force-app --target-org production`
- Confirm 0 test failures in production org post-deploy
- Verify Apex test coverage ≥ 75% reported by production org
```

---

### IMP-008: No explicit rollback procedure in Phase 05 (failed build)

**Severity**: 🟡 Medium  
**Location**: `framework/workflows/phase-05-build.md`  
**Problem**: When a build fails mid-phase, there is no documented procedure for what to do with partially completed tasks, partial deployments, or partially modified files.

**Proposed solution**: Add a "Build Failure Protocol" section to Phase 05 workflow and `build-log.md` template, specifying:

- How to document the failure state
- Whether to roll back partial task completions
- When to escalate to redesign (Phase 3)

---

## Area 3 — Template Inconsistencies and Gaps

### IMP-009: Templates lack metadata headers

**Severity**: 🟢 Low  
**Location**: All `framework/templates/` files  
**Problem**: No template includes a metadata block with version, last updated date, or framework version. This makes it impossible to detect stale templates in long-running projects.

**Proposed solution**: Add a metadata comment block to all templates:

```markdown
<!--
Template: [template-name]
Framework version: 1.x
Last updated: YYYY-MM-DD
-->
```

---

### IMP-010: `build-log.md` template missing Salesforce-specific deployment fields

**Severity**: 🟡 Medium  
**Location**: `framework/templates/build-log.md`  
**Problem**: The build log template is generic. The Salesforce rules require recording specific deployment data (org alias, job ID, `sf project deploy` result), but the template's section 5 (Deployment output) doesn't have these fields explicitly.

**Proposed solution**: Either:

- A) Add a Salesforce-specific build log template: `technology-rules/salesforce/templates/build-log-sf.md`
- B) Expand the generic template's section 5 to include fields that cover Salesforce's needs

Recommended: Option A — keeps the generic template clean and lets each technology define its own extension.

---

### IMP-011: `test-report.md` template doesn't align with Salesforce test output structure

**Severity**: 🟡 Medium  
**Location**: `framework/templates/test-report.md`  
**Problem**: The test report template is minimal and doesn't capture the structured output produced by `sf apex run test --result-format human/json`. It's missing: per-class coverage breakdown, specific failed assertion messages, and test run ID.

**Proposed solution**: Create `technology-rules/salesforce/templates/test-report-sf.md` with fields tailored to Salesforce test output.

---

### IMP-012: No `project-readme.md` template

**Severity**: 🟡 Medium  
**Location**: `framework/templates/`  
**Problem**: Each project should have a `work-item/[project-slug]/README.md` as the project's "home page" showing its status, phase history, and key links. No such template exists.

**Proposed solution**: Create `framework/templates/project-readme.md`:

```markdown
# [Project Name]

- **Slug**: [project-slug]
- **Technology**: [tech]
- **Status**: 🟡 In Progress / ✅ Completed / ❌ Cancelled / 📦 Archived
- **Current phase**: [phase]

## Phase History

| Phase       | Status | Artifact    | Completed  |
| ----------- | ------ | ----------- | ---------- |
| 01-proposal | ✅     | proposal.md | YYYY-MM-DD |

...
```

---

### IMP-013: `retrospective.md` template lacks section for framework improvement actions

**Severity**: 🟢 Low  
**Location**: `framework/templates/retrospective.md`  
**Problem**: Section 7 (Technical Learnings) in the skill file `retrospective.md` explicitly states learnings should be incorporated back into the framework. However, the template doesn't have a section for tracking which framework files need updating and their status.

**Proposed solution**: Add to `framework/templates/retrospective.md`:

```markdown
## 8. Framework improvement actions

| Learning   | Target file         | Action | Status |
| ---------- | ------------------- | ------ | ------ |
| [Learning] | framework/rules/... | Update | [ ]    |
```

---

## Area 4 — Rules and Configuration Gaps

### IMP-014: `phase-approval.yml` doesn't document all 10 transitions explicitly

**Severity**: 🟡 Medium  
**Location**: `framework/config/phase-approval.yml`  
**Problem**: The config relies on a default of `human` for transitions not listed. This is a good safety default but makes the configuration implicit and harder to audit. A developer reading the file can't immediately see the intended approval mode for all phases.

**Proposed solution**: List all 10 phase transitions explicitly in `phase-approval.yml`, even if they all use `human`. Add a comment explaining the default:

```yaml
# Default for any transition not listed here: human
# All transitions are explicitly declared for auditability.
transitions:
  phase-01-to-02:
    approval_mode: human
  phase-02-to-03:
    approval_mode: human
  # ... all 10
```

---

### IMP-015: `framework/rules/general.md` duplicates content from `.axetrules/rules.md`

**Severity**: 🟢 Low  
**Location**: `framework/rules/general.md`, `.axetrules/rules.md`  
**Problem**: Both files define agent behavior rules (phase management, artifact generation, code construction). This creates a maintenance problem — updating one doesn't update the other, and an agent loading only one source gets an incomplete picture.

**Proposed solution**: Consolidate into a single source of truth. Options:

- A) Make `.axetrules/rules.md` import/reference `framework/rules/general.md`
- B) Move all operational rules to `framework/rules/general.md` and keep `.axetrules/rules.md` as a thin pointer

---

### IMP-016: No explicit error handling protocol for phase approval failures

**Severity**: 🟡 Medium  
**Location**: `framework/rules/phase-transitions.md`, `framework/config/phase-approval.yml`  
**Problem**: The framework defines how to request approval but not what to do if the user rejects a phase transition. There is no documented protocol for: (a) what changes are required to earn approval, (b) how many revision cycles are allowed, (c) when to abandon a project.

**Proposed solution**: Add a "Rejection Protocol" section to `framework/rules/phase-transitions.md`:

```markdown
## Rejection Protocol

When a phase transition is rejected by the user:

1. Document the rejection reason in the current phase artifact
2. Identify the specific gaps preventing approval
3. Revise the artifact addressing each gap
4. Re-present for approval with a summary of changes made
5. After 3 rejection cycles without progress → escalate: request user clarification on blocking issue
```

---

## Area 5 — Evidence and Traceability Gaps

### IMP-017: `evidence.md` defines standards but no evidence tracker template exists

**Severity**: 🟡 Medium  
**Location**: `framework/rules/evidence.md`  
**Problem**: `evidence.md` defines what constitutes valid evidence per phase, but there is no centralized evidence tracker that links each phase's artifacts to their evidence. This makes it hard to audit a project's compliance with the framework.

**Proposed solution**: Create `framework/templates/evidence-tracker.md`:

```markdown
# Evidence Tracker — {{project_name}}

| Phase | Artifact    | Evidence Type              | Location            | Verified |
| ----- | ----------- | -------------------------- | ------------------- | -------- |
| 01    | proposal.md | User approval comment      | —                   | [ ]      |
| 02    | specs.md    | FR/NFR acceptance criteria | specs.md#acceptance | [ ]      |

...
```

---

### IMP-018: No traceability matrix template (FR → Component → Task → Test)

**Severity**: 🟡 Medium  
**Location**: `framework/templates/`  
**Problem**: The framework enforces traceability conceptually (specs → design → tasks → verification → tests) but there is no artifact that explicitly maps each Functional Requirement through all phases. This makes it hard to confirm complete end-to-end coverage.

**Proposed solution**: Create `framework/templates/traceability-matrix.md`:

```markdown
# Traceability Matrix — {{project_name}}

| FR ID  | FR Name | Component   | Task ID | Test ID  | Verified |
| ------ | ------- | ----------- | ------- | -------- | -------- |
| FR-001 | [Name]  | [Component] | T-001   | TEST-001 | [ ]      |
```

This template would be populated progressively as phases complete and used in Phase 6 (Verification) as a primary verification tool.

---

### IMP-019: Quality gates checklist items are not linked to specific artifacts

**Severity**: 🟢 Low  
**Location**: `framework/rules/quality-gates.md`  
**Problem**: Quality gates define pass/fail criteria per phase but don't reference the specific artifact or section where evidence of compliance must be recorded. This makes the gate a checklist but not a true audit trail.

**Proposed solution**: Add an "Evidence location" column to each quality gate table in `quality-gates.md`:

```markdown
| Criterion    | Pass condition             | Evidence location                |
| ------------ | -------------------------- | -------------------------------- |
| FRs approved | User has reviewed specs.md | specs.md — user approval section |
```

---

## Area 6 — Operational and Usability Improvements

### IMP-020: No framework version tracking (`CHANGELOG.md`)

**Severity**: 🟢 Low  
**Location**: Framework root  
**Problem**: The framework itself has no version number or changelog. When improvements are made (like those proposed here), there is no way to know which version of the framework a given project was developed under, making it impossible to retrospectively assess if a project followed outdated rules.

**Proposed solution**:

1. Create `CHANGELOG.md` at the framework root following Keep a Changelog format
2. Add a `version` field to `framework/config/phase-approval.yml` or a new `framework/config/version.yml`
3. Record framework version in each project's `README.md`

---

### IMP-021: No quick-start guide for new projects

**Severity**: 🟡 Medium  
**Location**: `README.md`  
**Problem**: The current `README.md` describes the framework structure but doesn't include a step-by-step "Start a new project in 5 minutes" guide. A new user must read multiple files to understand how to begin.

**Proposed solution**: Add a "Quick Start" section to `README.md`:

```markdown
## Quick Start — New Project

1. Create the project folder: `work-item/[your-project-slug]/`
2. Copy `framework/templates/project-readme.md` → `work-item/[slug]/README.md`
3. Register the project in `work-item/README.md`
4. Start Phase 1: follow `framework/workflows/phase-01-proposal.md`
5. Use `framework/templates/proposal.md` to create your first artifact
```

---

### IMP-022: `tech-config.yml` has no documented schema

**Severity**: 🟢 Low  
**Location**: `technology-rules/salesforce/tech-config.yml`  
**Problem**: The `tech-config.yml` file exists but its schema (what keys are expected, which are mandatory, what values are valid) is not documented anywhere. An agent generating a new technology's `tech-config.yml` has no reference.

**Proposed solution**: Create `technology-rules/_template/tech-config.yml` with full inline documentation of every field and its valid values, serving as both the template and schema reference.

---

### IMP-023: No mechanism to detect framework vs. project-level rule conflicts

**Severity**: 🟡 Medium  
**Location**: `framework/rules/`, `technology-rules/`  
**Problem**: The framework allows technology-specific rules to override or extend generic framework rules. However, there is no documented precedence order or conflict resolution protocol. For example: if `framework/rules/quality-gates.md` mandates coverage ≥ 75% but `technology-rules/salesforce/rules.md` mandates ≥ 85%, which wins in edge cases?

**Proposed solution**: Add a "Rule Precedence" section to `framework/rules/general.md`:

```markdown
## Rule Precedence (highest to lowest)

1. Technology-specific rules (`technology-rules/[tech]/`)
2. Project-specific overrides (documented in project's `README.md`)
3. Framework generic rules (`framework/rules/`)
4. Global agent rules (`.axetrules/rules.md`)

Technology rules always win over generic framework rules for technology-specific criteria.
When a conflict exists, the more restrictive rule applies unless explicitly overridden with justification.
```

---

## Improvement Priority Summary

| ID      | Area      | Severity  | Effort | Recommended Order |
| ------- | --------- | --------- | ------ | ----------------- |
| IMP-001 | Structure | 🔴 High   | Medium | 1                 |
| IMP-002 | Structure | 🔴 High   | High   | 2                 |
| IMP-005 | Workflow  | 🔴 High   | Low    | 3                 |
| IMP-003 | Structure | 🟡 Medium | Medium | 4                 |
| IMP-006 | Workflow  | 🟡 Medium | Low    | 5                 |
| IMP-007 | Workflow  | 🟡 Medium | Low    | 6                 |
| IMP-008 | Workflow  | 🟡 Medium | Low    | 7                 |
| IMP-010 | Templates | 🟡 Medium | Low    | 8                 |
| IMP-011 | Templates | 🟡 Medium | Low    | 9                 |
| IMP-012 | Templates | 🟡 Medium | Low    | 10                |
| IMP-014 | Rules     | 🟡 Medium | Low    | 11                |
| IMP-016 | Rules     | 🟡 Medium | Low    | 12                |
| IMP-017 | Evidence  | 🟡 Medium | Medium | 13                |
| IMP-018 | Evidence  | 🟡 Medium | Medium | 14                |
| IMP-021 | Usability | 🟡 Medium | Low    | 15                |
| IMP-023 | Usability | 🟡 Medium | Low    | 16                |
| IMP-004 | Structure | 🟢 Low    | Low    | 17                |
| IMP-009 | Templates | 🟢 Low    | Low    | 18                |
| IMP-013 | Templates | 🟢 Low    | Low    | 19                |
| IMP-015 | Rules     | 🟢 Low    | Low    | 20                |
| IMP-019 | Evidence  | 🟢 Low    | Low    | 21                |
| IMP-020 | Usability | 🟢 Low    | Low    | 22                |
| IMP-022 | Usability | 🟢 Low    | Low    | 23                |

---

## Recommended Next Steps

The following improvements can be implemented immediately with low effort and high impact:

1. **IMP-001** — Create `work-item/README.md` registry + `framework/templates/project-readme.md`
2. **IMP-005** — Add code review step to `framework/workflows/phase-05-build.md`
3. **IMP-012** — Create `framework/templates/project-readme.md`
4. **IMP-014** — Expand `framework/config/phase-approval.yml` with all transitions explicit
5. **IMP-021** — Add Quick Start section to `README.md`

The following are higher effort but address significant structural gaps:

6. **IMP-002** — Create `technology-rules/_template/` for new technology onboarding
7. **IMP-003** — Create missing skill files (proposal-writing, release-management, project-archiving)
8. **IMP-018** — Create traceability matrix template

---

_This document was generated after a full audit of the framework. Each improvement is independent and can be implemented separately. Refer to each IMP-XXX for implementation details._
