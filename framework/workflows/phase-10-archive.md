# Phase 10 — Archive (HARD GATE VERSION v1.2)

## Objective

Formally close the project AND physically archive the work-item.

⚠️ This phase CANNOT be marked as Done unless the work-item is physically moved to archive.

> **Rule cross-references:**
>
> - `framework/rules/core.md` → Section 10 (Prohibitions)
> - `framework/config/phase-approval.yml` → `phase_10_closure` (hard gate)

---

## Phase Checkpoint

- Current phase: Phase 10 — Archive
- Read before acting: release notes, all phase artifacts, project README, `active.yml`, and archive policy
- Allowed persisted outputs: `10-archive/retrospective.md`, post-move `active.yml` closure update, archive movement commit, and archive evidence
- Forbidden persisted outputs: new feature/build/test artifacts unrelated to closure
- Before proceeding: state current phase, archive readiness, physical move status, open questions status, and final closure gate
- Exit gate: work-item physically moved, archive commit hash recorded, retrospective approved, `phase_10_closure` approved

# Mandatory Archive Protocol (Enforced)

## Step 1 — Closure Validation

Confirm:

- ✅ Status = Completed (in README)
- ✅ Current Phase = 10
- ✅ Retrospective created
- ✅ Release Notes created
- ✅ Assessment (if applicable) generated

---

## Step 2 — Physical Archive Movement (MANDATORY)

The project MUST be moved:

work-item/[project-slug]  
→ work-item/archive/[project-slug]

Required:

- ✅ Create archive folder if not exists
- ✅ Move entire project directory
- ✅ Confirm original folder no longer exists in root work-item/
- ✅ Validate all artifacts moved

> ⛔ **DO NOT update `active.yml` status to `closed` before this step is completed.**
> Status `closed` is only valid after physical relocation is confirmed.

---

## Step 3 — Version Control Enforcement

- Commit archive movement.
- Use commit message:

  chore(archive): move [project-slug] to work-item/archive after Phase 10 closure

Required:

- ✅ git mv used (not manual copy)
- ✅ Commit executed
- ✅ Commit hash recorded in retrospective

---

# Agent Verification Checklist (Must Execute Before Closure)

Before presenting closure for human approval (`phase_10_closure` gate), the agent MUST
execute and confirm each of the following checks:

| #   | Verification                                                  | Command / Evidence                                                               |
| --- | ------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 1   | `work-item/[project-slug]/` no longer exists                  | `ls work-item/` must NOT contain the slug                                        |
| 2   | `work-item/archive/[project-slug]/` exists with all artifacts | `ls work-item/archive/[project-slug]/`                                           |
| 3   | Archive git commit exists                                     | `git log --oneline -5` — commit with `chore(archive):` message visible           |
| 4   | Commit hash recorded in retrospective                         | `work-item/archive/[project-slug]/10-archive/retrospective.md` contains the hash |
| 5   | `active.yml` status is `closed` **only after steps 1–4**      | Read `active.yml` and confirm                                                    |

If any check fails → resolve it before proceeding. Phase remains 🔄 In Progress.

---

# Completion Criteria (Hard Gate)

Phase 10 cannot be marked ✅ Done unless:

- [ ] Project marked Completed
- [ ] Work-item physically moved to `work-item/archive/` (step 1 & 2 above verified)
- [ ] Commit of movement executed and hash recorded in retrospective
- [ ] Archive structure validated
- [ ] Human approval received via `phase_10_closure` gate in `phase-approval.yml`

If any condition fails → Phase remains 🔄 In Progress.

---

# Epic Closure (only type: epic — QG10.4)

- [ ] Every child work-item physically moved to `work-item/archive/[child-slug]/`
- [ ] `epic-map.yml` rows 100% `done`
- [ ] Aggregated retrospective covering 100% of Epic-FRs at `work-item/[epic-slug]/10-archive/retrospective.md`

---

# Governance Note

Logical closure (README update or `active.yml` status change) ≠ Archive completion.

Archive completion requires:

1. **Physical relocation** of the work-item directory to `work-item/archive/[project-slug]/`.
2. **Git commit** recording the event.
3. **Retrospective** updated with the archive commit hash.
4. **Human approval** via the `phase_10_closure` gate.

Setting `status: closed` in `active.yml` before the physical move is a **framework violation**.
