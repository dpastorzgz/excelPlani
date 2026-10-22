# Core Framework Rules (Minimal Always-On)

This file is the **minimal** rule set intended to be kept in context at all times.
All other framework documents are considered **load-on-demand** via `framework/config/context-routing.yml`.

---

## 1) Phase Discipline

- Phases are executed **sequentially**. You must not start Phase N+1 until Phase N is complete.
- Every phase must produce its **mandatory artifact** (Markdown) in `work-item/[project-slug]/`.
- If a phase is blocked, announce `[BLOCKER] — <description>` and request the missing input.

---

## 1.1) Operational Checkpoint (Always-On)

At the start of each work session and before touching a phase artifact, state the current operating checkpoint:

- Work item: `project-slug`
- Track: `new-feature`, `change-request`, or `hotfix`
- Current phase: phase number and name
- Work-item status: `active`, `blocked`, `on-hold`, `closed`, or `archived`
- Phase status: descriptive `active.yml.phase_status` text when present
- Allowed persisted artifact(s): only the current phase artifact(s)
- Next gate: approval, missing input, quality gate, or blocker
- With >1 active work-item, project resolution is a structured question (candidates with phase/status), never most-recently-modified.

If a checkpoint value has a mandatory fallback in `AGENTS.md`, use that fallback and state it. If no fallback applies or multiple valid choices remain, ask a structured question and wait for the answer.

## 1.2) Structured Questions

- Use a question/choice tool when available.
- If no question tool exists, ask in chat with numbered options.
- Ask before choosing a track only when it cannot be resolved deterministically, and before resolving ambiguous phase state, deferring open questions, skipping a phase, or moving to the next phase.
- At phase closeout, use a structured next-step question with 2-4 options; do not use a bare yes/no prompt when the user may need to revise, pause, or resolve evidence.

## 1.3) Open Questions And Artifact Scope

- A phase cannot close while any current-phase open question has status `open`.
- `deferred` questions require explicit user approval and a named target phase.
- Do not persist artifacts owned by later phases during the current phase.
- Update `active.yml.current_phase` only after the transition gate passes and approval is recorded.
- When reporting produced artifacts, use full repo-relative paths.

---

## 2) Track Selection

Every work item belongs to exactly one **track**. The track determines which phases are mandatory,
optional, or pre-approved to skip. Resolve the track before loading any phase context.

| Track            | Typical trigger                   | Entry phase         | Key skips        |
| ---------------- | --------------------------------- | ------------------- | ---------------- |
| `new-feature`    | New functionality                 | Phase 1             | None             |
| `change-request` | Modification to existing behavior | Phase 1 (CR intake) | Phase 3 optional |
| `hotfix`         | Bug / emergency patch             | Phase 4             | Phases 1–3       |

> Canonical source: framework/config/phase-skips.yml → tracks (operational summary: AGENTS.md).

**Resolution**: See `AGENTS.md → Track Selection` for the full resolution algorithm.  
**Skip rules**: See `framework/config/phase-skips.yml → tracks` for per-track skip overrides. After resolving the track, apply the matching `types.[active.yml.type]` overrides; type-specific rules take precedence over track rules for the same phase.  
**Epic rule**: An epic keeps `track: new-feature` but uses `type: epic` and `types.epic.skip_overrides` for delegated Phases 3–9. Epic children use `type: feature` and the normal `new-feature` track policy. An epic MAY run Phase 3 contract-first (shared design.md + global ADRs, read-only for children); it MUST NOT own 04-tasks/task-list.md (planning lives in epic-map.yml).  
**Constraint**: The track and work-item type must be recorded in `work-item/[project-slug]/active.yml` before Phase 1 (or Phase 4 for hotfix).

---

## 3) Approval Policy (Transitions)

- Before every phase transition, consult `framework/config/phase-approval.yml`.
- If the user requests skipping a phase, consult `framework/config/phase-skips.yml`:
  - default: skipping is not allowed unless explicitly enabled
  - even if enabled, require explicit user confirmation and any required evidence
- If `approval_mode: human`, stop and present:
  1. summary of what was produced
  2. quality gate result (prefer IDs, do not paste long checklists)
  3. explicit request for approval to proceed
- If `approval_mode: automatic`, proceed once criteria are met (post a short notice if configured).

---

## 4) Quality Gates

- Quality gates live in `framework/rules/quality-gates.md`.
- When reporting quality gates, **do not paste full checklists**.
- Report as:
  - `Passed: [QG...], Pending: [QG...]`
  - Provide details only for pending/failed items.

---

## 5) Change Management

- If construction (Phase 5) reveals design gaps, return to Phase 3 before continuing.
- If verification (Phase 6) finds deviations, document them and return to Phase 5.
- Scope changes must be reflected in updated Specs (Phase 2) before affecting design/build.

---

## 6) Rule Layer Resolution

### 6.1) Technology stack (Phases 3, 4, 5, 6, 7, 9)

Whenever a phase requires loading `technology-rules/[technology]/rules.md` (Phases 3, 4, 5, 6, 7, 9):

1. Read `work-item/[project-slug]/README.md` and look for a `technology:` or `tech_stack:` field.
2. If not found, read `work-item/[project-slug]/tech-config.yml` → field `technology`.
3. The resolved value must match an existing directory under `technology-rules/`
   (e.g., `"salesforce"` → `technology-rules/salesforce/`).
4. If no matching directory exists: **stop**, create one from `technology-rules/_template/`,
   and populate it before resuming the phase.
5. **Never guess or proceed silently.** If resolution fails, ask the user to confirm the technology stack.

### 6.2) Project rules overlay (`project-rules/`)

A consuming repo/product MAY declare its own rules under `project-rules/` at the
repo root. The overlay is optional and repo-global (it applies to every work-item
in that repo).

Resolution:

1. If `project-rules/project-config.yml` does not exist, the overlay is inactive:
   the effective context is exactly technology + framework (no behavior change).
2. If it exists, read `guidelines[]` (same contract as
   `technology-rules/[technology]/tech-config.yml:guidelines[]`): each entry has
   `file` and `phases`, and may declare `replaces` (the referenced base file is
   excluded and only the project file loads) or `extends` (additive; the default).
3. `quality-gates.md` is NEVER replaceable. Base technology/framework gates
   always load; project gates use the `PRG<phase>.<n>` namespace and are additive.
4. **Fail-closed**: every file in the effective set must exist and validate. If
   any is missing or invalid, stop with `[BLOCKER]`; never load best-effort.
5. Emit the phase manifest with
   `validate-project-rules.sh --phase N --manifest <path>`.

Project rules may only **add or tighten**; they never relax technology or
framework rules (see §9).

---

## 7) Technical Documentation Discipline

- If the project defines living technical documentation for modules, areas, or components, consult it before analyzing or modifying the affected functionality.
- Use the configured index document to locate the relevant module or area sheet before changing code or phase artifacts that depend on implementation context.
- Treat the project's technical documentation as the functional and architectural source of truth unless the current change is explicitly updating that documentation.
- If a change modifies responsibilities, flows, contracts, dependencies, entry points, or relevant behavior, update the affected technical documentation before closing the work.

---

## 8) Framework Skill Resolution

- Framework skills are directory-based modules under `framework/skills/[skill-name]/`.
- The canonical entrypoint for each skill is `framework/skills/[skill-name]/skill.md`.
- Legacy flat paths such as `framework/skills/[skill-name].md` must not be used.

---

## 9) Rule Precedence

When rules overlap, apply in order:

1. Project rules (`project-rules/`) — **additive: may only add or tighten**
2. Technology rules (`technology-rules/[technology]/`)
3. Framework rules (this file + other `framework/rules/*`)
4. Agent defaults

Semantics:

- Project rules **never relax** technology or framework rules. A project guideline
  that would weaken a higher layer is invalid: it is not applied and the conflict
  is surfaced.
- When two layers cover the same topic, the **more restrictive** rule applies
  (e.g. project coverage 90% vs technology 85% → 90%).
- A project guideline may `replaces:` a technology **prose** guideline so the base
  file is not loaded (token efficiency); `quality-gates.md`, `framework/*` and
  technology gates are never replaceable.
- If a conflict cannot be resolved by these rules, surface it to the user before
  proceeding.

---

## 10) Prohibitions (Hard)

- Do not modify any source file before the mandatory intake artifact exists under
  `work-item/[project-slug]/01-intake/` (hotfix) or `work-item/[project-slug]/01-proposal/`
  (new-feature / change-request). Creating the work-item artifact always comes first.
- Do not start Phase 5 (Build) without a completed Phase 4 task-list artifact at
  `work-item/[project-slug]/04-tasks/task-list.md`.
- Do not generate code without loading applicable technology rules.
- Do not skip Phase 6 (Verification).
- Do not commit code without tests (Phase 7 completed).
- Do not release/archive without required approvals and artifacts.
- When Phase 10 (Archive) is approved, the full project folder MUST be moved
  from `work-item/[project-slug]/` to `work-item/archive/[project-slug]/`.
- **Phase 10 CANNOT be marked as Done or Closed until ALL of the following are confirmed:**
  1. The physical directory move has been executed — `work-item/[project-slug]/` must no longer exist.
  2. A git commit recording the archive movement has been created (use `--allow-empty` if files are gitignored).
  3. The archive commit hash has been recorded in the retrospective at `work-item/archive/[project-slug]/10-archive/retrospective.md`.
  - Marking status as `closed` in `active.yml` before these steps is **prohibited**.
  - Logical closure (status field update) ≠ Archive completion. Physical relocation is mandatory.
- Archived projects are immutable and must never be reactivated in-place.

---

## 11) Framework Validators (Mechanical Checks)

The framework ships zero-dependency bash validators under `framework/scripts/`.
They mechanically enforce invariants that prose alone cannot guarantee: run them
before closing a change and wire them into CI/pre-commit where possible.

- `bash framework/scripts/check-all.sh` (or `make check`) — runs every validator
  in order and prints `ALL-CHECKS-PASS` on success.
- `bash framework/scripts/check-refs.sh` — every repo-relative `*.md`/`*.yml`
  path cited in normative docs resolves.
- `bash framework/scripts/check-gates.sh` — every cited gate ID (`QG*`/`SFG*`/
  `DPPG*`) is defined in its `quality-gates.md`.
- `bash framework/scripts/check-workitems.sh` — `active.yml` schema/vocabulary,
  registry ↔ filesystem reconciliation, and epic DAG/waves/freshness.
- `bash framework/scripts/validate-project-rules.sh` — optional `project-rules/`
  overlay (`--phase N`, `--manifest PATH`).
- `bash framework/scripts/validate-new-tech.sh [slug]` (or `make check-tech`) —
  technology scaffold completeness; no-arg validates every technology.

Validators accept `AXET_ROOT` as a repository-root override (used by the test
suites); the default is always the repo root.
