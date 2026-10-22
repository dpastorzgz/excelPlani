# Axet Framework — Agentic Development Lifecycle

> An AI-agent-driven framework that enforces a **structured, 10-phase software development lifecycle** with built-in quality gates, human approval checkpoints, three work tracks, and an extensible technology-rule system.

---

## Table of Contents

1. [What Is This Framework?](#1-what-is-this-framework)
2. [How the Framework Works](#2-how-the-framework-works)
3. [Work Tracks](#3-work-tracks)
4. [Repository Structure](#4-repository-structure)
5. [The 10-Phase Lifecycle](#5-the-10-phase-lifecycle)
6. [Quality Gates](#6-quality-gates)
7. [Approval Flow](#7-approval-flow)
8. [Context & Rule Loading](#8-context--rule-loading)
9. [Quick Start](#9-quick-start)
10. [How to Extend the Framework to a New Technology](#10-how-to-extend-the-framework-to-a-new-technology)
11. [Supported Technologies](#11-supported-technologies)
12. [Change Management](#12-change-management)
13. [Naming Conventions](#13-naming-conventions)
14. [Hard Prohibitions](#14-hard-prohibitions)

---

## 1. What Is This Framework?

The **Axet Framework** is an opinionated development workflow controlled by the **Axet Plugin** AI agent. It structures every software project — regardless of technology — into **10 sequential phases**, each producing a mandatory Markdown artifact. Work is organised into one of **three tracks** (`new-feature`, `change-request`, `hotfix`) that determine which phases are mandatory or pre-approved to skip. Human approval gates prevent uncontrolled progression, and technology-specific rules govern how code is generated and deployed.

**Key design goals:**

| Goal          | Mechanism                                                     |
| ------------- | ------------------------------------------------------------- |
| Traceability  | Every decision has an artifact in `work-item/[project-slug]/` |
| Quality       | Quality gates (QG IDs) must pass before phase transition      |
| Consistency   | Technology rules loaded automatically per stack               |
| Flexibility   | Three tracks adapt the lifecycle to the type of change        |
| Extensibility | Add any technology via `technology-rules/_template/`          |
| Token efficiency | One effective context set per phase; the optional `project-rules/` overlay avoids duplicate loading |
| Human control | Approval gates at every phase boundary                        |

> **Start here →** `docs/OPERATOR-GUIDE.md` · **Reference →** `docs/FRAMEWORK-REFERENCE.md` · **Rules source of truth →** `AGENTS.md` + `framework/rules/core.md`

---

## 2. How the Framework Works

### 2.1 — High-Level Lifecycle Flow

```
New Work Item
      │
      ▼
 ┌─────────────────────────────────────────────┐
 │             Resolve Work Track              │
 │  new-feature → Phase 1 (proposal.md)        │
 │  change-request → Phase 1 (cr-intake.md)    │
 │  hotfix → Phase 4 directly (bug-report.md)  │
 └─────────────────────────────────────────────┘
      │
      ▼
 Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
                                              │
                                    ◄─────────┤ (design gap)
                                              │
                                          Phase 6
                                              │
                                    ◄─────────┤ (deviation)
                                              │
                                          Phase 7
                                              │
                                          Phase 8
                                              │
                                          Phase 9
                                              │
                                          Phase 10
                                              │
                                              ▼
                              work-item/archive/[project-slug]/
```

Each phase transition requires:

- ✅ Quality gates passed (reported by QG ID, not full checklists)
- 👤 Human approval (when `approval_mode: human`)

### 2.2 — Framework Architecture

```
┌──────────────────────────── Axet Plugin (Agent) ─────────────────────────────┐
│                                                                               │
│  framework/rules/          framework/workflows/       framework/skills/       │
│  ├─ core.md (always on)    ├─ phase-01-proposal.md    ├─ architecture-design  │
│  ├─ quality-gates.md       ├─ phase-02-specs.md       ├─ code-review          │
│  └─ phase-transitions.md   ├─ …                       ├─ test-generation      │
│                            └─ phase-10-archive.md     └─ git-operations       │
│                                                                               │
│  framework/config/                  framework/templates/                      │
│  ├─ context-routing.yml             ├─ active.yml (track metadata)            │
│  ├─ phase-approval.yml              ├─ proposal.md / cr-intake.md             │
│  └─ phase-skips.yml                 ├─ bug-report.md / specs.md               │
│                                     ├─ design.md / task-list.md               │
│                                     ├─ build-log.md / test-report.md          │
│                                     └─ release-notes.md / retrospective.md   │
└───────────────────────────────────────────────────────────────────────────────┘
          │                                    │
          │ loads tech rules                   │ writes artifacts
          │ (Phases 3,4,5,6,7,9)               │
          ▼                                    ▼
┌─────────────────────────┐     ┌──────────────────────────────────┐
│  technology-rules/       │     │  work-item/[project-slug]/        │
│  ├─ salesforce/          │     │  ├─ active.yml                    │
│  │  ├─ rules.md          │     │  ├─ 01-proposal/                  │
│  │  ├─ ApexGuidelines.md │     │  ├─ 02-specs/                     │
│  │  ├─ LWCGuidelines.md  │     │  ├─ … (phase folders)            │
│  │  └─ …                 │     │  └─ 10-archive/                   │
│  └─ _template/           │     │                                   │
│     (for new tech stacks)│     │  → moved to work-item/archive/    │
│                          │     │    on Phase 10                    │
└─────────────────────────┘     └──────────────────────────────────┘
```

### 2.3 — Per-Phase Agent Execution Flow

For every phase the agent:

1. Reads `work-item/[slug]/active.yml` → resolves track
2. Checks `framework/config/phase-skips.yml` → skip if not required for track
3. Loads `framework/rules/core.md` + `quality-gates.md`
4. Loads `framework/workflows/phase-0N.md`
5. Loads applicable skills from `framework/skills/[skill-name]/skill.md`
6. If phase is in `{3,4,5,6,7,9}`: resolves & loads `technology-rules/[tech]/rules.md`
7. Loads applicable templates from `framework/templates/`
8. Executes the phase → generates artifact in `work-item/[slug]/0N-*/`
9. Evaluates quality gates → reports `Passed: [QG-x], Pending: [QG-y]`
10. Consults `framework/config/phase-approval.yml`:

- `human`: stops, presents summary + QG result, requests approval
- `automatic`: proceeds, posts short notice

---

## 3. Work Tracks

Every work item must belong to exactly one track. The track is recorded in `active.yml` **before** Phase 1 begins (or Phase 4 for `hotfix`).

| Track            | Typical trigger                    | Entry phase | Phase 1 artifact | Skips       |
| ---------------- | ---------------------------------- | ----------- | ---------------- | ----------- |
| `new-feature`    | New functionality                  | Phase 1     | `proposal.md`    | None        |
| `change-request` | Modification to existing behaviour | Phase 1     | `cr-intake.md`   | Phase 3 opt |
| `hotfix`         | Bug / emergency patch              | Phase 4     | `01-intake/bug-report.md` (intake entry to Phase 4) | Phases 1–3  |

### Track Resolution Algorithm

> Canonical track resolution: AGENTS.md → Track Selection; skip overrides: framework/config/phase-skips.yml → tracks.

### The `active.yml` File

Every project folder contains an `active.yml` that acts as the living state document:

```yaml
project_slug: my-project-slug
project_name: "My Project"
created: 2026-05-21
updated: 2026-05-21
track: new-feature # new-feature | change-request | hotfix
technology: salesforce
status: active # active | blocked | on-hold | closed | archived
current_phase: 3
phase_status: "Phase 3 — Design in progress"
phases_completed:
  - phase: 1
    completed_at: "2026-05-21"
    artifact: "01-proposal/proposal.md"
    approved_by: "user"
phases_skipped: [] # e.g. [{phase: 3, reason: "...", approved_by: "user", date: "YYYY-MM-DD"}]
blockers: []
type: feature # epic | feature
parent_epic: null
depends_on: []
wave: 0
```

---

## 4. Repository Structure

```
frameworkIA/
│
├── AGENTS.md                        ← Agent entrypoint & master rules
├── README.md                       ← This file
├── CHANGELOG.md
│
├── framework/
│   ├── rules/
│   │   ├── core.md                 ← Minimal always-on rules (loaded every phase)
│   │   ├── quality-gates.md        ← QG definitions with IDs
│   │   ├── quality-gates-extended.md
│   │   ├── phase-transitions.md    ← Transition criteria
│   │   ├── evidence.md
│   │   └── general.md
│   │
│   ├── config/                     ← Runtime configuration (read-only by agent)
│   │   ├── context-routing.yml     ← Which docs to load per phase
│   │   ├── phase-approval.yml      ← human vs. automatic per phase
│   │   └── phase-skips.yml         ← Allowed skips per track
│   │
│   ├── workflows/
│   │   ├── phase-01-proposal.md
│   │   ├── phase-02-specs.md
│   │   ├── phase-03-design.md
│   │   ├── phase-04-tasks.md
│   │   ├── phase-05-build.md
│   │   ├── phase-06-verification.md
│   │   ├── phase-07-testing.md
│   │   ├── phase-08-commit-pr.md
│   │   ├── phase-09-release.md
│   │   └── phase-10-archive.md
│   │
│   ├── templates/                  ← Artifact templates (copy into work-item/)
│   │   ├── active.yml              ← Project state template
│   │   ├── proposal.md
│   │   ├── cr-intake.md            ← Change-request track Phase 1
│   │   ├── bug-report.md           ← Hotfix track Phase 4 entry
│   │   ├── specs.md
│   │   ├── design.md
│   │   ├── adr.md / adr-registry.md
│   │   ├── task-list.md
│   │   ├── build-log.md
│   │   ├── verification-report.md
│   │   ├── test-report.md
│   │   ├── evidence-tracker.md
│   │   ├── traceability-matrix.md
│   │   ├── release-notes.md
│   │   └── retrospective.md
│   │
│   └── skills/                     ← On-demand skill modules (technology-agnostic only;
│       ├── architecture-design/    ← technology-specific skills live under
│       │   └── skill.md            ← technology-rules/[technology]/skills/)
│       ├── code-review/
│       │   └── skill.md
│       ├── git-operations/
│       │   └── skill.md
│       ├── project-archiving/
│       │   └── skill.md
│       ├── proposal-writing/
│       │   └── skill.md
│       ├── release-management/
│       │   └── skill.md
│       ├── retrospective/
│       │   └── skill.md
│       ├── specs-writing/
│       │   └── skill.md
│       ├── task-decomposition/
│       │   └── skill.md
│       ├── test-generation/
│       │   └── skill.md
│       └── verification/           ← generic flow; tech triage in
│           └── skill.md            ← technology-rules/[technology]/verification-overlay.md
│
├── technology-rules/
│   ├── _template/                  ← Scaffold for new technology stacks
│   │   ├── README.md
│   │   ├── rules.md
│   │   ├── context.md
│   │   ├── verification-overlay.md
│   │   └── tech-config.yml
│   │
│   └── salesforce/                 ← Salesforce-specific rules
│       ├── rules.md                ← Master rules (always loaded for SF)
│       ├── tech-config.yml         ← Canonical schema: identity/testing/linting/deployment/guidelines[]
│       ├── verification-overlay.md ← SF deployment triage + SFG3.3 (complements framework verification skill)
│       ├── skills/slds2-prototype/skill.md ← Salesforce-only prototype skill
│       ├── ApexGuidelines.md
│       ├── ApexTestGuidelines.md
│       ├── ApexComments.md
│       ├── DataFactoryGuidelines.md
│       ├── DeploymentGuidelines.md
│       ├── FlowGuidelines.md
│       ├── LWCGuidelines.md
│       ├── NamingConventions.md
│       ├── PackageXMLGuidelines.md
│       ├── ProjectPlanning.md
│       ├── VisualforceGuidelines.md
│       ├── quality-gates.md        ← SFG* gates (blocking)
│       ├── quality-gates-extended.md
│       ├── release-pipeline.yml
│       └── templates/
│           ├── build-log-sf.md
│           └── test-report-sf.md
│   └── dynamics365-powerplatform/ ← Dynamics 365 / Power Platform rules (DPPG* gates)
│       ├── rules.md
│       ├── tech-config.yml         ← Reference schema (guidelines[] drives context loading)
│       ├── verification-overlay.md ← (to be created in P0-3: checker triage)
│       ├── ALMDeploymentGuidelines.md
│       ├── release-pipeline.yml
│       └── templates/
│           ├── build-log-d365pp.md
│           └── test-report-d365pp.md
│
├── project-rules/                  ← OPTIONAL project overlay (consumer repo)
│   ├── project-config.yml          ← guidelines[] + PRG* gates (mirrors tech-config)
│   ├── rules.md                    ← Project conventions (add/tighten only)
│   └── quality-gates.md            ← PRG<phase>.<n> gates (never replace base gates)
│
├── work-item/                      ← Active projects (one folder per project)
│   └── [project-slug]/
│       ├── active.yml              ← Track, phase, status
│       ├── 01-proposal/
│       ├── 02-specs/
│       ├── 03-design/
│       ├── 04-tasks/
│       ├── 05-build/
│       ├── 06-verification/
│       ├── 07-testing/
│       ├── 08-commit-pr/
│       ├── 09-release/
│       └── 10-archive/
│
└── work-item/archive/              ← Completed projects (immutable)
    └── [project-slug]/             ← Moved here when Phase 10 is approved
```

---

## 5. The 10-Phase Lifecycle

| #   | Phase        | Artifact                        | Tech rules? | Track applicability               |
| --- | ------------ | ------------------------------- | ----------- | --------------------------------- |
| 1   | Proposal     | `proposal.md` / `cr-intake.md`  | No          | new-feature, change-request       |
| 2   | Specs        | `specs.md`                      | No          | new-feature, change-request       |
| 3   | Design       | `design.md`, `adr.md`           | **Yes**     | new-feature, change-request (opt) |
| 4   | Tasks        | `task-list.md`, `bug-report.md` (hotfix-only, lives in `01-intake/`) | **Yes**     | all tracks                        |
| 5   | Build        | `build-log.md`                  | **Yes**     | all tracks                        |
| 6   | Verification | `verification-report.md`        | **Yes**     | all tracks                        |
| 7   | Testing      | `test-report.md`                | **Yes**     | all tracks                        |
| 8   | Commit / PR  | PR description, commit message  | No          | all tracks                        |
| 9   | Release      | `release-notes.md`              | **Yes**     | all tracks                        |
| 10  | Archive      | `retrospective.md`              | No          | all tracks                        |

### Phase Descriptions

**Phase 1 — Proposal**
Captures the problem, goals, and high-level approach. Uses `proposal.md` for new features and `cr-intake.md` for change requests. Hotfix track skips to Phase 4.

**Phase 2 — Specs**
Defines functional and non-functional requirements, acceptance criteria, and out-of-scope items in `specs.md`. Must reference Phase 1 artifact.

**Phase 3 — Design**
Produces the technical design (`design.md`): architecture decisions, data model, component breakdown, and any ADRs. First phase to load technology rules. Optional for `change-request` track if the change is isolated.

**Phase 4 — Tasks**
Breaks the design into an ordered `task-list.md` of atomic, estimable tasks. For `hotfix`, this is the entry point with a `bug-report.md` that replaces the absent Phase 1–3 artifacts.

**Phase 5 — Build**
Implements tasks against technology rules. The `build-log.md` tracks decisions made, deviations, and references to closed tasks. If a design gap is found, flow returns to Phase 3.

**Phase 6 — Verification**
The agent self-reviews: code quality, adherence to guidelines, quality gate evaluation. Produces `verification-report.md`. If deviation is found, flow returns to Phase 5.

**Phase 7 — Testing**
Executes or generates tests per tech-specific test guidelines. Produces `test-report.md` with coverage, results, and any open defects.

**Phase 8 — Commit / PR**
Formats the commit message (Conventional Commits) and PR description following the framework template. No new code is written here.

**Phase 9 — Release**
Generates `release-notes.md`, validates deployment artifacts, and applies the release pipeline defined in `technology-rules/[tech]/release-pipeline.yml`.

**Phase 10 — Archive**
Produces the `retrospective.md`, closes the work item, and moves the entire `work-item/[slug]/` folder to `work-item/archive/[slug]/`. The archived folder becomes **immutable**.

---

## 6. Quality Gates

Quality gates are identified by QG IDs (e.g., `QG5.1`). The agent **never** reports full checklists in conversation — only the QG ID and pass/fail status.

Framework gates `QG1.1–QG10.3` are defined in `framework/rules/quality-gates.md`, Salesforce gates `SFG*` in `technology-rules/salesforce/quality-gates.md`, and Dynamics 365 / Power Platform gates `DPPG*` in `technology-rules/dynamics365-powerplatform/quality-gates.md` — this README does not duplicate gates, the canonical files rule.

Mechanical checks: `make check` (or `bash framework/scripts/check-all.sh`) runs the validators (`check-refs`, `check-gates`, `check-workitems`, `validate-project-rules`); `make check-tech` validates technology scaffolds. See `framework/rules/core.md` §11.

---

## 7. Approval Flow

The `framework/config/phase-approval.yml` file controls whether each phase transition requires human approval or is automatic.

```
Phase N completes
       │
       ▼
  QG evaluation
       │
  ┌────┴────┐
  │ Passed? │
  └────┬────┘
       │ Yes
       ▼
  Check approval_mode
  ┌────────────┐    ┌─────────────┐
  │   human    │    │  automatic  │
  └─────┬──────┘    └──────┬──────┘
        │                  │
        ▼                  ▼
  Post summary        Post notice
  Request approval    Proceed to
  STOP                Phase N+1
        │
  User: APPROVED
        │
        ▼
   Phase N+1
```

**When QGs fail:** The agent posts a `[BLOCKED]` notice listing the failed QG IDs and the required remediation. It does not proceed until QGs pass and (if required) approval is granted.

---

## 8. Context & Rule Loading

The `framework/config/context-routing.yml` defines exactly which documents are loaded per phase. Summary:

| Phase | Always loaded                                 | Tech rules loaded?          |
| ----- | --------------------------------------------- | --------------------------- |
| 1–2   | `core.md`, `quality-gates.md`, phase workflow | No                          |
| 3     | + `phase-transitions.md`                      | Yes — design guidelines     |
| 4     | + `phase-transitions.md`                      | Yes — naming, task patterns |
| 5     | + `evidence.md`                               | Yes — all coding guidelines |
| 6     | + `quality-gates-extended.md`                 | Yes — QG extended rules     |
| 7     | + tech test guidelines                        | Yes — test guidelines       |
| 8     | core only                                     | No                          |
| 9     | + `release-pipeline.yml`                      | Yes — deployment guidelines |
| 10    | core only                                     | No                          |

Tech rules are loaded lazily: the agent reads `technology-rules/[tech]/rules.md` which itself lists which sub-documents to load based on the current phase.

**Project rules overlay (optional, v1.6).** A consumer repo may add `project-rules/project-config.yml` (mirroring `tech-config.yml:guidelines[]`). Each phase then resolves **one effective context set** — no file is loaded twice:

- a project guideline may declare `replaces: <base path>` → the base technology guideline is **excluded** and only the project file loads;
- otherwise it is additive (`extends`).
- `quality-gates.md` is **never** replaceable: base technology/framework gates always load and project `PRG*` gates are added.
- Project rules may only **add or tighten**; they never relax technology/framework rules.
- Fail-closed: a missing/invalid file blocks the phase (`[BLOCKER]`). Validate with `framework/scripts/validate-project-rules.sh` (optional `--phase N --manifest <path>`).

If `project-rules/` does not exist, the effective set is exactly technology + framework — no behavior change.

> Phase 2 loads tech `quality-gates` only (no implementation docs); epic skill/map load conditionally — see `framework/rules/core.md` + `framework/config/context-routing.yml` (sizing gate / `type: epic` / explicit request).

---

## 9. Quick Start

### New Feature

```
User: "I want to add a custom order management module in Salesforce"

Agent actions:
1. Resolves track → new-feature
2. Creates work-item/custom-order-mgmt/active.yml
3. Starts Phase 1 → generates proposal.md
4. Posts summary → requests approval
5. [User approves] → Phase 2 → specs.md
...continues through all 10 phases
```

### Change Request

```
User: "Change the routing logic in the existing approval workflow"

Agent actions:
1. Resolves track → change-request
2. Creates work-item/routing-logic-change/active.yml
3. Starts Phase 1 → generates cr-intake.md
4. Phase 3 evaluated → may skip if change is isolated
...
```

### Hotfix

```
User: "Fix the SOQL query causing CPU timeout in COM_RoutingService"

Agent actions:
1. Resolves track → hotfix
2. Creates work-item/routing-cpu-hotfix/active.yml
3. Skips Phases 1–3
4. Starts Phase 4 → generates bug-report.md
5. Phase 5 → fix implemented with SF coding rules
...
```

---

## 10. How to Extend the Framework to a New Technology

1. **Copy the template:**

   ```
   cp -r technology-rules/_template/ technology-rules/[your-tech]/
   ```

2. **Fill in the required files:**

   | File              | Purpose                                                   |
   | ----------------- | --------------------------------------------------------- |
   | `rules.md`        | Master index of all sub-rules; loaded by the agent        |
   | `tech-config.yml` | Declares phases that load tech rules, coverage thresholds |
   | `context.md`      | High-level tech context loaded for all phases             |

3. **Add technology-specific guidelines** (e.g., `CodingGuidelines.md`, `TestGuidelines.md`, `NamingConventions.md`).

4. **Add QG IDs** specific to the technology in a `quality-gates.md` file, following the `QG-[TECH]-NN` format.

5. **Update `rules.md`** to reference all sub-documents and specify which phases load which sub-documents.

6. **Test** by running the agent on a `new-feature` work item with `technology: [your-tech]` in `active.yml`.

### Adding project rules to an existing repository

If a repository has conventions beyond the technology rules, add an optional overlay:

1. Copy the scaffold: `cp -r framework/templates/project-rules/ project-rules/`
2. Fill `project-rules/project-config.yml` (`project`, `guidelines[]` with `phases`, optional `replaces`/`extends`).
3. Put rules in `project-rules/rules.md` and project gates in `project-rules/quality-gates.md` (`PRG<phase>.<n>` IDs).
4. Validate: `bash framework/scripts/validate-project-rules.sh`.

Project rules add to or tighten the technology/framework rules; they never relax them. See `docs/FRAMEWORK-REFERENCE.md`.

---

## 11. Supported Technologies

| Technology | Status    | Rules path                                    | Notes                                        |
| ---------- | --------- | --------------------------------------------- | -------------------------------------------- |
| Salesforce | ✅ Active | `technology-rules/salesforce/`                | Full Apex, LWC, Flow, Deploy rules (`SFG*`)  |
| Dynamics 365 / Power Platform | ✅ Active | `technology-rules/dynamics365-powerplatform/` | Dataverse, apps, flows, plugins, ALM (`DPPG*`) |

> `framework/` is technology-agnostic: process, phases, universal gates, placeholders.
> Technology specifics (tools, commands, thresholds, checklists) live only in overlays under
> `technology-rules/[technology]/` and are loaded via `tech-config.yml:guidelines[]`.
> To add support for a new technology, follow [Section 10](#10-how-to-extend-the-framework-to-a-new-technology).
>
> An optional per-repository overlay (`project-rules/`) refines the technology layer:
> it adds/tightens rules and may replace technology **prose** guidelines (never gates).
> See [Section 8](#8-context--rule-loading) and `docs/FRAMEWORK-REFERENCE.md`.

---

## 12. Change Management

Changes to framework rules follow their own change-request lifecycle:

1. Open a work item with track `change-request` and `technology: framework`.
2. Target the specific file(s) in `framework/rules/`, `framework/config/`, or `framework/workflows/`.
3. Any change to `framework/config/phase-approval.yml` or `phase-skips.yml` requires explicit operator approval (not just agent approval).
4. Record the change in `CHANGELOG.md` following the existing format.

**Immutability rule:** Files in `work-item/archive/` must never be modified. Any required amendment creates a new work item referencing the archived project.

Releases are tagged (`git tag vX.Y.Z`); current version: `framework/config/version.yml` (1.6.0).

---

## 13. Naming Conventions

### Work Item Slugs

- Format: `[prefix]-[short-description]` using kebab-case
- Examples: `feat-custom-order-mgmt`, `cr-routing-logic`, `fix-cpu-timeout`

### Phase Folder Names

- Format: `NN-[phase-name]` (e.g., `01-proposal`, `05-build`)
- Always use zero-padded two-digit numbers

### Artifact Files

- Use the exact name defined in `framework/templates/` (e.g., `proposal.md`, not `PROPOSAL.md`)
- Technology-specific artifacts may use tech prefixes (e.g., `build-log-sf.md`)

### Framework Skill Modules

- Format: `framework/skills/[skill-name]/skill.md`
- Skill names use kebab-case (e.g., `proposal-writing`, `code-review`)
- Do not add new flat files directly under `framework/skills/`

### Technology-Specific Conventions

- See `technology-rules/[tech]/NamingConventions.md` for code-level naming rules

---

## 14. Hard Prohibitions

The following are strictly forbidden and the agent must refuse to proceed if instructed to violate them:

| #   | Prohibition                                                                        |
| --- | ---------------------------------------------------------------------------------- |
| 1   | Skipping a non-pre-approved phase without explicit operator instruction            |
| 2   | Proceeding past a `human` approval gate without confirmation                       |
| 3   | Writing code before Phase 4 (task list) is approved                                |
| 4   | Reporting full QG checklists inline — only QG IDs and pass/fail                    |
| 5   | Modifying any file inside `work-item/archive/`                                     |
| 6   | Generating production deployment artifacts before Phase 7 QGs pass                 |
| 7   | Loading technology rules for a technology not declared in `active.yml`             |
| 8   | Creating work-item folders outside `work-item/`                                    |
| 9   | Committing code with failing quality gates (QG-05 or higher unresolved)            |
| 10  | Merging `cr-intake.md` fields into `proposal.md` template (templates are separate) |

---

_Axet Framework — maintained by the Axet Plugin agent._
_For operator configuration and advanced usage, see `docs/OPERATOR-GUIDE.md` and `docs/FRAMEWORK-REFERENCE.md`._
