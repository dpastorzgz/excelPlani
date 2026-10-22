# Workflow — Phase 1: Proposal / Intake

**Input**: user idea, problem, change request, or bug report  
**Output**: intake artifact under `work-item/[project-slug]/01-proposal/` or `01-intake/`  
**Skill**: `framework/skills/proposal-writing/skill.md`

---

## TL;DR (min context)

1. **Determine the track** (new-feature / change-request / hotfix) before anything else.
2. Use the intake template that matches the track.
3. Present for approval and do not move to the next phase without it.

For hotfix track: Phases 1–3 are replaced by the bug report. Skip directly to Phase 4 after intake.

## Phase Checkpoint

- Current phase: Phase 1 — Proposal / Intake
- Read before acting: user request plus existing `work-item/[project-slug]/active.yml` and README if present
- Allowed persisted outputs: `01-proposal/proposal.md`, `01-proposal/cr-intake.md`, or `01-intake/bug-report.md` according to track; `active.yml`; project README
- Forbidden persisted outputs: Phase 2 through Phase 10 artifacts
- Before proceeding: state track, phase, selected intake artifact, open questions status, and next approval gate
- Exit gate: intake artifact approved, no unresolved open questions unless explicitly deferred, transition approved per `phase-approval.yml`

---

## Track Behaviour

| Track            | Template                            | Output path                | Next phase  |
| ---------------- | ----------------------------------- | -------------------------- | ----------- |
| `new-feature`    | `framework/templates/proposal.md`   | `01-proposal/proposal.md`  | Phase 2     |
| `change-request` | `framework/templates/cr-intake.md`  | `01-proposal/cr-intake.md` | Phase 2     |
| `hotfix`         | `framework/templates/bug-report.md` | `01-intake/bug-report.md`  | **Phase 4** |

> Track resolution rules: `AGENTS.md → Track Selection` and `framework/config/phase-skips.yml → tracks`.

> Canonical source: framework/config/phase-skips.yml → tracks (operational summary: AGENTS.md).

---

## Steps — new-feature

1. Ask the user to describe the problem/idea in their own words.
2. Ask clarifying questions only if needed:
   - affected user / stakeholder
   - business value
   - constraints (time, budget, technology)
   - existing systems impacted
3. Generate `proposal.md` using `framework/templates/proposal.md`.
4. Create project structure if missing:
   ```
   work-item/[project-slug]/
   ├── README.md
   ├── active.yml          ← record track: new-feature
   └── 01-proposal/
       └── proposal.md
   ```
5. Present to the user for review and approval.
6. Confirm approval before moving to Phase 2.

---

## Steps — change-request

1. Ask the user to describe what needs to change and the business reason.
2. Clarify:
   - Which existing feature/component is affected
   - Whether the change involves architecture modifications
   - Priority and deadline constraints
3. Generate `cr-intake.md` using `framework/templates/cr-intake.md`.
4. Create project structure if missing:
   ```
   work-item/[project-slug]/
   ├── README.md
   ├── active.yml          ← record track: change-request
   └── 01-proposal/
       └── cr-intake.md
   ```
5. Present to the user for review and approval.
6. Confirm approval before moving to Phase 2.
   - If Section 6 (Architecture Impact) states **no impact**, flag that Phase 3 may be skippable.

---

## Steps — hotfix

1. Ask the user to describe the bug: symptoms, reproduction steps, severity/environment.
2. Clarify:
   - Affected version / component
   - Any known root cause
   - Fix approach (if already known)
3. Generate `bug-report.md` using `framework/templates/bug-report.md`.
4. Create project structure if missing:
   ```
   work-item/[project-slug]/
   ├── README.md
   ├── active.yml          ← record track: hotfix
   └── 01-intake/
       └── bug-report.md
   ```
5. Present to the user for review and approval.
6. **Upon approval, skip to Phase 4** (Phases 2 and 3 are pre-approved to skip for hotfix).
   Announce: `[TRACK: hotfix] — Phases 2 & 3 skipped per phase-skips.yml. Proceeding to Phase 4.`

> The "skip Phases 1–3" means no proposal/specs/design artifacts — the Phase-01 hotfix intake itself (bug-report.md) is MANDATORY as entry to Phase 4.

---

## Exit Criteria

- Track recorded in `active.yml`.
- Intake artifact approved per `framework/config/phase-approval.yml`.
- Quality gates: reference `QG1.*` (do not paste the full checklist).
- Sizing: QG1.8 evaluated (capabilities + domains counted, split decision recorded).
