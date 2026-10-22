# Operator Guide — Axet Framework (Work-Items)

This guide is the **practical “how to run it”** companion to the framework.
Source of truth for rules and routing remains:

- `AGENTS.md`
- `framework/rules/core.md`
- `framework/config/context-routing.yml`

---

## 1) Concepts

### 1.1 Work-item (unit of work)

A **work-item** is the tracked unit of delivery. It can be:

- a new project
- a change request
- a bugfix / hotfix

Each work-item has a **slug** and a folder:

- Active: `work-item/[slug]/`
- Archived (after Phase 10): `work-item/archive/[slug]/`

### 1.2 Phases and artifacts

Each phase produces a mandatory Markdown artifact under the work-item:

- `_evidence/phase-01/` … `_evidence/phase-10/` (phase evidence)
- `01-proposal/proposal.md`
- `02-specs/specs.md`
- `03-design/design.md`
- `04-tasks/task-list.md`
- `05-build/build-log.md`
- `06-verification/verification-report.md`
- `07-testing/test-report.md`
- `08-commit-pr/pull-request.md`
- `09-release/release-notes.md`
- `10-archive/retrospective.md`

---

## 2) Create a new work-item

### 2.1 Choose a slug

Use: `lowercase-kebab-case`

Examples:

- `customer-portal-v2`
- `cr-add-opportunity-validation`
- `bugfix-login-timeout`

### 2.2 Create the folder

```bash
mkdir -p work-item/my-work-item-slug
```

### 2.3 Create the work-item README

Create `work-item/[slug]/README.md` using `framework/templates/project-readme.md` as a base.

Minimum recommended fields to include at the top:

```yaml
slug: my-work-item-slug
track: new-feature | change-request | hotfix
technology: salesforce # REQUIRED from Phase 03 onward
status: active | blocked | on-hold | closed | archived
current_phase: "01"
framework_version: "1.5.0"
```

> **Important (Mode A strict)**: From **Phase 03** and **Phase 04**, the framework requires a resolvable `technology` (via `work-item/[slug]/README.md` or `work-item/[slug]/tech-config.yml`). If missing, the agent must stop with `[BLOCKER]`.

---

## 3) Phase Guidance And Questions

At the start of every work session, Axet should state the active work-item, track, current phase, allowed artifact, and next gate. If it cannot determine any of these with high confidence, it must ask before creating or updating phase artifacts.

When Axet needs a decision, it should ask a structured question with options. In agents without a dedicated question UI, the question appears as numbered chat options.

Phase closeout is blocked when:

- the current artifact has open questions with status `open`
- a deferred question lacks explicit user approval and a target phase
- an artifact from a future phase was persisted early
- quality gates or approval requirements are not satisfied

For agent-specific behavior, see `docs/AGENT-COMPATIBILITY.md`.

---

## 4) How to interact with Axet (conversation commands)

### 4.1 Start Phase 1

```
Start Phase 1 — Proposal
Work-item: my-work-item-slug
Technology: salesforce
Description: <one sentence>
```

### 4.2 Resume a phase

```
Resume Phase 5 for work-item: my-work-item-slug
```

### 4.3 Change request mid-phase

```
Change request:
Work-item: my-work-item-slug
Phase: 05
Change: <describe the change>
Impact: minor | significant
```

---

## 5) Technology resolution (Phases 03, 04, 05, 06, 07, 09)

Axet resolves `[technology]` as:

1. Read `work-item/[slug]/README.md` fields `technology:` or `tech_stack:`
2. If not found, read `work-item/[slug]/tech-config.yml` field `technology`
3. Must match an existing directory under `technology-rules/`

If resolution fails, Axet must stop with `[BLOCKER]` requesting confirmation of the technology stack.

---

## 5.1) Project rules resolution (optional overlay)

A consuming repo may add `project-rules/project-config.yml` at the repo root to declare its own conventions.

Axet resolves the project layer as:

1. If `project-rules/project-config.yml` does **not** exist → no project layer; the effective context is technology + framework only.
2. If it exists → read `guidelines[]` (same contract as tech `guidelines[]`): a guideline whose `phases` includes the current phase loads.
3. A guideline with `replaces: <base path>` excludes the base technology guideline (only the project file loads); otherwise it is additive (`extends`).
4. `quality-gates.md` is **never** replaceable; base gates always load and project `PRG<phase>.<n>` gates are added.
5. Project rules may only **add or tighten**; they never relax technology/framework rules. If a file is missing/invalid, Axet must stop with `[BLOCKER]`.

Validate with `framework/scripts/validate-project-rules.sh` (optionally `--phase N --manifest PATH` to record the effective context for a phase). To adopt the overlay in a repo, copy `framework/templates/project-rules/` to `project-rules/`.

---

## 6) Archive policy (Phase 10)

When Phase 10 completes and is approved:

- The work-item folder is moved:
  - from `work-item/[slug]/`
  - to `work-item/archive/[slug]/`

This keeps the active workspace clean and makes completed work-items discoverable.

---

## 7) Recommended workflow for teams

- Keep `work-item/` for active delivery only
- Use `work-item/archive/` as immutable history (do not edit unless truly needed)
- If archived work requires follow-up, create a new work-item that references the archived item; do not reactivate archived folders in place.

## v1.5 notes

- Validators: `bash framework/scripts/check-all.sh` or `make check` (see `framework/rules/core.md` §11).
- Epic contract-first + `wave_policy` — see `framework/templates/epic-map.yml`.
- Gates `QG6.7` / `QG10.4` — see `framework/rules/quality-gates.md`.
- Release version: `framework/config/version.yml` (1.5.0).
