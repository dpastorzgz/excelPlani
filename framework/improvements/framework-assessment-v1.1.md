# Framework IA — Comprehensive Assessment v1.1

**Assessment Date**: 2026-05-13
**Framework Version**: v1.1.0
**Assessed by**: Axet Plugin
**Scope**: Full structural and operational review of the `frameworkIA` repository

---

## 1. Executive Summary

The framework is in a **solid, production-ready state** for Salesforce-focused software projects. Version 1.1.0 successfully resolved 21 of the 23 improvement items identified in `framework-review-v1.md`. The core lifecycle, governance controls, quality gates, and technology extensibility are all well-designed and internally consistent.

**2 items from the v1.0 review remain open** (IMP-009, IMP-015), and this assessment identifies **12 new observations** for a potential v1.2 release.

---

## 2. Framework Structure Overview

```
frameworkIA/
├── .axetrules/         # Agent identity + workspace rules (minimal)
├── framework/
│   ├── config/         # Phase approval, skips, context routing
│   ├── improvements/   # Assessment and review artifacts
│   ├── rules/          # Core, general, evidence, quality gates, transitions
│   ├── skills/         # 10 agent skill modules
│   ├── templates/      # 14 reusable artifact templates
│   └── workflows/      # 10 phase workflow definitions
├── work-item/           # Project workspace (currently empty)
├── technology-rules/
│   ├── _template/      # Starter kit for new tech stacks
│   └── salesforce/     # 14 Salesforce-specific rule files
├── CHANGELOG.md
└── README.md
```

### Phase Lifecycle

```
P1 Proposal → P2 Specs → P3 Design → P4 Tasks → P5 Build
    → P6 Verification → P7 Testing → P8 Commit/PR → P9 Release → P10 Archive
```

All 10 transitions are **human-approved**. Four rollback paths are defined. Phase skips are individually configurable with evidence requirements.

---

## 3. Strengths

### 3.1 Lifecycle Completeness

All SDLC phases are covered end-to-end with dedicated workflows, quality gates, templates, and skills. No phase is left without a corresponding artifact chain.

### 3.2 Quality Gate Architecture

Two-tier quality gates (compact `quality-gates.md` with IDs + verbose `quality-gates-extended.md`) enable efficient daily use while preserving full traceability. Referencing by ID (e.g., `QG5.1`) keeps context windows small.

### 3.3 Context Efficiency Design

`context-routing.yml` defines a precise required/optional loading strategy per phase. The core always-on set is intentionally minimal (3 files). This is a mature design choice that directly addresses LLM context window constraints.

### 3.4 Phase Governance

`phase-approval.yml` explicitly configures all 10 transitions with `approval_mode`, `rejection_action`, and rationale notes. `phase-skips.yml` defines skip conditions with required evidence. Together they create a complete, auditable governance model.

### 3.5 Rejection & Rollback Protocol

`phase-transitions.md` defines a 4-step rejection protocol (Acknowledge → Determine rollback → Document → Re-present). Rollback routes are clearly defined in a table. This prevents silent feedback absorption, which is a common LLM failure mode.

### 3.6 Technology Extensibility

The `_template/` starter kit (context.md, README.md, rules.md, tech-config.yml) allows rapid addition of new technology stacks. The Salesforce implementation demonstrates the model at full depth.

### 3.7 Salesforce Specialization

The Salesforce technology rules are comprehensive (14 files): Apex, LWC, Flows, Tests, Data Factory, Deployment, Naming Conventions, Visualforce, Package XML, Release Pipeline. This is production-grade Salesforce governance.

### 3.8 Evidence & Traceability

`evidence-tracker.md` and `traceability-matrix.md` templates provide formal auditability from requirements to test results. `framework/rules/evidence.md` defines the evidence standard independently.

### 3.9 Version Tracking

`CHANGELOG.md` is now in place with semantic versioning. v1.1.0 entry is complete and well-structured.

---

## 4. Open Items from framework-review-v1.md

### ✅ Resolved (21/23)

| ID      | Title                                             | Status      |
| ------- | ------------------------------------------------- | ----------- |
| IMP-001 | work-item/README.md missing                       | ✅ Resolved |
| IMP-002 | No tech-rules template                            | ✅ Resolved |
| IMP-003 | Missing skills (proposal, release, archiving)     | ✅ Resolved |
| IMP-004 | ADR registry template missing                     | ✅ Resolved |
| IMP-005 | No code review step in phase-05                   | ✅ Resolved |
| IMP-006 | No CI/CD gate in phase-08                         | ✅ Resolved |
| IMP-007 | Salesforce release steps incomplete               | ✅ Resolved |
| IMP-008 | No rollback protocol in phase-05                  | ✅ Resolved |
| IMP-010 | Salesforce build-log template missing             | ✅ Resolved |
| IMP-011 | Salesforce test-report template missing           | ✅ Resolved |
| IMP-012 | project-readme.md template missing                | ✅ Resolved |
| IMP-013 | Retrospective lacked framework feedback section   | ✅ Resolved |
| IMP-014 | phase-approval.yml not fully explicit             | ✅ Resolved |
| IMP-016 | No rejection protocol                             | ✅ Resolved |
| IMP-017 | evidence-tracker template missing                 | ✅ Resolved |
| IMP-018 | traceability-matrix template missing              | ✅ Resolved |
| IMP-019 | Quality gates missing evidence artifact locations | ✅ Resolved |
| IMP-020 | No CHANGELOG                                      | ✅ Resolved |
| IMP-021 | README lacks Quick Start                          | ✅ Resolved |
| IMP-022 | tech-config.yml schema undefined                  | ✅ Resolved |
| IMP-023 | Rule precedence hierarchy missing                 | ✅ Resolved |

### ⚠️ Still Open (2/23)

| ID      | Title                                                                                                | Impact     | Recommended Action                                                                                                                                         |
| ------- | ---------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IMP-009 | Templates lack metadata headers (version, owner, last-updated)                                       | Low–Medium | Add a standard YAML front-matter block to all templates: `version`, `owner`, `last_updated`.                                                               |
| IMP-015 | `.axetrules/rules.md` duplicates `framework/rules/general.md` (Identity section + Hard Prohibitions) | Low        | Replace the duplicated sections in `.axetrules/rules.md` with a single reference: `"Identity and prohibitions are defined in framework/rules/general.md"`. |

---

## 5. New Observations

### OBS-001 — phase-skips.yml: `allowed: false` + `requires_user_confirmation: true` is contradictory

**File**: `framework/config/phase-skips.yml`, phases 1, 2, 5, 6
**Detail**: If `allowed: false`, there is nothing for `requires_user_confirmation` to confirm. The field is meaningless (and slightly misleading) when the phase cannot be skipped.
**Recommendation**: Set `requires_user_confirmation: false` on all `allowed: false` phases, or remove the field entirely with a comment: `# N/A — phase is hard-mandatory`.
**Priority**: Low

---

### OBS-002 — context-routing.yml does not load `proposal-writing.md` skill for Phase 1

**File**: `framework/config/context-routing.yml`, phase `"1"`
**Detail**: `framework/skills/proposal-writing/skill.md` was created in v1.1.0 (IMP-003) but is not listed in the Phase 1 required or optional loading list. The skill is loaded nowhere.
**Recommendation**: Add `framework/skills/proposal-writing/skill.md` to `phases."1".required`.
**Priority**: Medium

---

### OBS-003 — context-routing.yml Phase 5: technology rules are "optional" but phase-transitions.md makes them mandatory

**File**: `framework/config/context-routing.yml` phase `"5"` vs `framework/rules/phase-transitions.md` (4→5 transition)
**Detail**: `phase-transitions.md` states the Axet action for transition 4→5 is "Load technology rules + execute tasks". However, in `context-routing.yml`, `technology-rules/[technology]/rules.md` is listed as **optional** for Phase 5 with the condition `"construction always requires tech rules"` (a contradictory note — if it "always requires", it should be `required`).
**Recommendation**: Move `technology-rules/[technology]/rules.md` from `optional` to `required` in Phase 5.
**Priority**: Medium

---

### OBS-004 — `framework/rules/evidence.md` is not referenced in context-routing.yml

**File**: `framework/config/context-routing.yml`
**Detail**: `evidence.md` defines the evidence standard used across phases (especially Phase 6 Verification), but it is not loaded at any phase. Agents operating in Phase 6 may not have this rule in context.
**Recommendation**: Add `framework/rules/evidence.md` to `phases."6".required` (and optionally `phases."5".optional`).
**Priority**: Medium

---

### OBS-005 — task-list template has no dependency field, but phase-transitions.md requires dependency ordering

**File**: `framework/templates/task-list.md` vs `framework/rules/phase-transitions.md` (4→5 transition)
**Detail**: The transition 4→5 requires the Axet action "execute tasks in dependency order", but `QG4.4` ("Dependencies between tasks are identified") has no corresponding field in the `task-list.md` template to capture those dependencies.
**Recommendation**: Add a `depends_on` field (e.g., `| T-01 | … | depends_on: none |`) to the task-list template row format.
**Priority**: Medium

---

### OBS-006 — quality-gates.md and quality-gates-extended.md have no sync mechanism

**Files**: `framework/rules/quality-gates.md`, `framework/rules/quality-gates-extended.md`
**Detail**: Both files define the same QG IDs. There is no stated rule or process to keep them synchronized when one is updated. Over time they may diverge.
**Recommendation**: Add a comment header to both files: `# SYNC NOTICE: Any change to QG IDs or criteria must be reflected in both quality-gates.md and quality-gates-extended.md.` Optionally, add this as a rule in `general.md`.
**Priority**: Low

---

### OBS-007 — No active project state tracker

**Files**: N/A (missing artifact)
**Detail**: There is no file that tracks "which project is currently active and at which phase". When working across sessions, the agent must re-read the project structure to determine where it left off.
**Recommendation**: Add a lightweight `work-item/active.yml` or `work-item/state.yml` file that tracks:

```yaml
active_project: project-slug
current_phase: 5
last_updated: 2026-05-13
```

**Priority**: Medium

---

### OBS-008 — Technology rules exist only for Salesforce; no guidance on when to create new stacks

**Files**: `technology-rules/`, `framework/rules/general.md`, `framework/rules/core.md`
**Detail**: The `_template/` starter kit exists but there is no rule defining the trigger for creating a new technology rules stack (e.g., "when a project uses a technology that has no rules directory, create one before starting Phase 5").
**Recommendation**: Add a rule in `general.md` or `core.md`: _"Before starting Phase 5, verify that a technology rules directory exists for the project's tech stack. If not, create one from `technology-rules/_template/` and populate it before proceeding."_
**Priority**: Medium

---

### OBS-009 — Phase 9 does not load technology rules for deployment, only as optional

**File**: `framework/config/context-routing.yml`, phase `"9"`
**Detail**: The Salesforce technology rules include `DeploymentGuidelines.md` and `release-pipeline.yml`, which are critical for Phase 9. However, `technology-rules/[technology]/rules.md` is only listed as optional for Phase 9. Missing these during a release could lead to non-compliant deployments.
**Recommendation**: Move `technology-rules/[technology]/rules.md` to `required` in Phase 9, consistent with Phase 7 which already treats it as mandatory for testing conventions.
**Priority**: Medium

---

### ✅ OBS-010 — No mechanism to detect or warn about context-routing template variables `[technology]` — **RESOLVED**

**File**: `framework/config/context-routing.yml`, `framework/rules/core.md`
**Resolution**: Added a 5-step `PLACEHOLDER RESOLUTION — [technology]` block at the top of `context-routing.yml` with explicit instructions to resolve from the project's README or `tech-config.yml`, validate against `technology-rules/` directories, create from `_template/` if missing, and never proceed silently. Added a corresponding **Section 5 — Technology Stack Resolution** to `framework/rules/core.md` as an always-on operational rule covering the same 5-step protocol.
**Resolved in**: v1.2.0-dev

---

### OBS-011 — No projects have been executed through the framework yet

**Files**: `work-item/` (contains only `README.md`)
**Detail**: The `work-item/` directory contains no actual project workspaces. The framework has not been battle-tested with a real project. Edge cases in the workflow, template usability issues, and quality gate ambiguities will only surface in practice.
**Recommendation**: Run a pilot project (even a simple, internal one) through all 10 phases to validate the framework end-to-end. Document friction points and feed them back into v1.2.
**Priority**: High (strategic)

---

### OBS-012 — `framework/rules/quality-gates-extended.md` is never referenced in context-routing.yml

**File**: `framework/config/context-routing.yml`
**Detail**: `quality-gates-extended.md` contains the verbose, human-readable definitions of all quality gate criteria. It is never listed in any phase's loading configuration — not even as optional. This means the agent has no mechanism to load the detailed criteria when needed (e.g., when a user asks "what exactly does QG6.3 require?").
**Recommendation**: Add `framework/rules/quality-gates-extended.md` as an optional entry under a global or per-phase `optional` block with condition: `"when detailed QG criteria are needed"`.
**Priority**: Low

---

## 6. Observations Summary Table

| ID      | Title                                                                                | Priority | Category              |
| ------- | ------------------------------------------------------------------------------------ | -------- | --------------------- |
| OBS-001 | phase-skips.yml: `allowed: false` + `requires_user_confirmation: true` contradictory | Low      | Config consistency    |
| OBS-002 | `proposal-writing.md` skill not loaded in Phase 1 context routing                    | Medium   | Config gap            |
| OBS-003 | Tech rules "optional" in Phase 5 but mandated by phase-transitions.md                | Medium   | Config/rules mismatch |
| OBS-004 | `evidence.md` not loaded in Phase 6 context routing                                  | Medium   | Config gap            |
| OBS-005 | task-list template missing `depends_on` field                                        | Medium   | Template gap          |
| OBS-006 | No sync mechanism between quality-gates.md and quality-gates-extended.md             | Low      | Maintenance risk      |
| OBS-007 | No active project state tracker across sessions                                      | Medium   | Operational gap       |
| OBS-008 | No rule defining trigger to create new technology rules stack                        | Medium   | Process gap           |
| OBS-009 | Tech rules only optional in Phase 9 (Release/Deploy)                                 | Medium   | Config gap            |
| OBS-010 | `[technology]` placeholder in context-routing.yml has no resolution instruction      | **High** | Operational risk      |
| OBS-011 | No real projects executed through the framework yet                                  | **High** | Validation gap        |
| OBS-012 | `quality-gates-extended.md` never referenced in context-routing.yml                  | Low      | Config gap            |

---

## 7. Recommendations for v1.2

### 7.1 High Priority (must fix)

1. **Resolve `[technology]` placeholder** (OBS-010): Define resolution logic in `core.md` and add a comment to `context-routing.yml`. Without this, Phase 5, 7, and 9 context loading is ambiguous.
2. **Run a pilot project** (OBS-011): Execute one full 10-phase project to validate the framework. Use the Salesforce tech rules. Document pain points.

### 7.2 Medium Priority (should fix)

3. **Add `proposal-writing.md` to Phase 1 context routing** (OBS-002): 1-line fix in `context-routing.yml`.
4. **Promote tech rules to `required` in Phase 5** (OBS-003): 1-line fix in `context-routing.yml`.
5. **Add `evidence.md` to Phase 6 required** (OBS-004): 1-line fix in `context-routing.yml`.
6. **Promote tech rules to `required` in Phase 9** (OBS-009): 1-line fix in `context-routing.yml`.
7. **Add `depends_on` field to task-list template** (OBS-005): Minor template update.
8. **Add technology stack creation rule** (OBS-008): Add 2–3 sentences to `general.md`.
9. **Add project state tracker** (OBS-007): Create `work-item/active.yml` with a defined schema.

### 7.3 Low Priority (nice to have)

10. **Fix `phase-skips.yml` contradictory fields** (OBS-001): Minor config cleanup.
11. **Add QG sync notice** (OBS-006): Comment headers in both quality-gates files.
12. **Add `quality-gates-extended.md` to optional context routing** (OBS-012): 1-line fix.
13. **Resolve IMP-009** (template metadata headers): Add YAML front-matter to all 14 templates.
14. **Resolve IMP-015** (`.axetrules/rules.md` deduplication): Replace duplicated content with a reference.

---

## 8. Framework Health Scorecard

| Dimension                   | Score      | Notes                                                       |
| --------------------------- | ---------- | ----------------------------------------------------------- |
| Lifecycle Coverage          | ⭐⭐⭐⭐⭐ | All 10 phases fully defined                                 |
| Quality Gates               | ⭐⭐⭐⭐⭐ | Two-tier system, all phases covered                         |
| Governance & Approval       | ⭐⭐⭐⭐⭐ | All transitions explicit, skips governed                    |
| Context Efficiency          | ⭐⭐⭐⭐☆  | Good design, but `[technology]` placeholder unresolved      |
| Traceability                | ⭐⭐⭐⭐☆  | Templates exist, evidence.md not wired into Phase 6 routing |
| Technology Rules            | ⭐⭐⭐⭐☆  | Salesforce excellent; no other stacks yet                   |
| Rejection/Rollback Handling | ⭐⭐⭐⭐⭐ | 4-step protocol, rollback table, fully defined              |
| Template Completeness       | ⭐⭐⭐⭐☆  | 14 templates; missing metadata headers (IMP-009)            |
| Operational Readiness       | ⭐⭐⭐☆☆   | Not yet validated with a real project                       |
| Documentation & Versioning  | ⭐⭐⭐⭐⭐ | README, CHANGELOG, Quick Start all present                  |

**Overall**: **4.3 / 5** — Production-ready infrastructure with identified gaps that are all addressable in a focused v1.2 sprint.

---

## 9. Conclusion

The `frameworkIA` v1.1.0 represents a mature, well-architected software development governance system. The v1.1.0 release successfully closed 21 of 23 previously identified gaps. The framework demonstrates strong design discipline: intentional context minimization, explicit governance at every transition, structured rejection handling, and a clear extensibility model for technology rules.

The two highest-priority items for v1.2 are:

1. **OBS-010** — Resolving the `[technology]` placeholder in context routing (an operational risk that could cause silent failures in Phase 5, 7, and 9).
2. **OBS-011** — Executing the first real project through the framework to discover practical friction.

The remaining 10 observations are low-effort fixes (most are 1-line changes in config files) that would bring the framework to a **4.8/5 health score**.

---

_Assessment produced by Axet Plugin | Framework IA v1.1.0 | 2026-05-13_
