# Workflow — Phase 2: Specifications

**Input**: `01-proposal/proposal.md`  
**Output**: `work-item/[project-slug]/02-specs/specs.md`  
**Skill**: `framework/skills/specs-writing/skill.md`

---

## TL;DR (min context)

- Read the proposal and extract requirements.
- Use `framework/skills/specs-writing/skill.md` (prefer its TL;DR) to produce clear, verifiable FR/NFR + acceptance criteria.
- Generate `specs.md` from `framework/templates/specs.md`.
- Iterate with the user until approved; do not move to Phase 3 without approval (see `framework/config/phase-approval.yml`).

## Phase Checkpoint

- Current phase: Phase 2 — Specifications
- Read before acting: approved Phase 1 intake artifact
- Allowed persisted outputs: `02-specs/specs.md` and supporting Phase 2 traceability updates
- Forbidden persisted outputs: Phase 3 through Phase 10 artifacts
- Before proceeding: state current phase, specs artifact path, open questions status, and approval gate
- Exit gate: specs approved, no unresolved open questions unless explicitly deferred, transition approved per `phase-approval.yml`

---

## Steps (details)

1. Read `01-proposal/proposal.md`.
2. Apply `framework/skills/specs-writing/skill.md` to extract and classify requirements.
3. Generate `specs.md` using `framework/templates/specs.md`.
4. Present to the user for review.
5. Iterate until there are no ambiguities and the user approves.
6. Save in `work-item/[project-slug]/02-specs/specs.md`.

---

## Exit Criteria

- Approval recorded per `framework/config/phase-approval.yml`.
- Quality gates: reference `QG2.*` (do not paste the full checklist).
- Sizing: QG2.9 evaluated (FRs + P1 + UCs counted, split decision recorded).
