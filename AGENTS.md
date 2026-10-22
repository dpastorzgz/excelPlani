# Axet Agent Operating Guide

This file is the entrypoint for AI agents working in this repository.
Keep it small: operational detail lives in the framework files referenced below.

## Source of Truth

- Framework lifecycle rules: `framework/rules/core.md`
- Context loading map: `framework/config/context-routing.yml`
- Phase approvals: `framework/config/phase-approval.yml`
- Phase skip policy: `framework/config/phase-skips.yml`
- Quality gates: `framework/rules/quality-gates.md`
- Verbose quality gate wording: `framework/rules/quality-gates-extended.md` only when needed
- Evidence rules: `framework/rules/evidence.md`
- Technology rules: `technology-rules/[technology]/rules.md`
- Project rules (optional overlay): `project-rules/project-config.yml`

Compatibility files such as `.axetrules/rules.md` and `framework/rules/general.md`
must point back to this guide or `framework/rules/core.md`; do not add new
authoritative rules there.

## Multi-Agent Operating Contract (Mandatory)

This framework must work consistently in Codex, OpenCode, Cline, GitHub Copilot, and similar agents. Do not depend on one vendor-specific tool to enforce phase discipline.

Before creating or modifying any phase artifact, the agent MUST resolve and state:

1. `project-slug`
2. `track`
3. `current_phase`
4. `status` and `phase_status` from `active.yml` when present
5. the only persisted artifact(s) allowed for the current phase
6. the blocking gate or next approval required

If a value has a mandatory fallback in this guide, use that fallback and state it. If no fallback applies or multiple valid choices remain, stop and ask a structured question before writing artifacts.

### Structured Question Protocol

- If the agent has a question/choice tool, use it for phase, track, approval, open-question, and next-step decisions.
- If no such tool exists, ask in chat with numbered options and wait for the user's answer.
- Prefer 2-4 concrete options. Include a recommended option when appropriate.
- Do not ask bare yes/no approval questions at phase closeout when a structured next-step choice is possible.
- Do not advance phases, update `active.yml.current_phase`, or create future-phase artifacts while waiting for an answer.

### Single-Phase Artifact Rule

During a phase, the agent may persist only the artifact(s) owned by that phase. Future-phase content may be discussed as a non-persisted preview only when clearly labeled `Preview — not a phase artifact`.

When naming produced artifacts in summaries, approvals, or closeout prompts, always use full repo-relative paths such as `work-item/[project-slug]/04-tasks/task-list.md`.

### Open Questions Rule

No phase can close while its artifact contains open questions with status `open`. A question may be `deferred` only when the artifact records the target phase and the user explicitly approves the deferral.

## Operating Loop

1. Determine the current `project-slug` and `phase` using the mandatory
   resolution rules below.
2. If `phase` cannot be determined with high confidence, default to
   `phase-01-proposal` and proceed from there.
3. Load `framework/rules/core.md` and the config files listed above.
4. Use `framework/config/context-routing.yml` to load only the workflow, skill,
   template, and technology rules required for the current phase.
   Framework skill modules are loaded from `framework/skills/[skill-name]/skill.md`.
5. Produce or update the mandatory phase artifact under
   `work-item/[project-slug]/` **before touching any source code**.
   Code changes are only permitted once the intake artifact
   (`bug-report.md`, `cr-intake.md`, or `proposal.md`) exists under
   the appropriate subfolder and the project is registered in `work-item/README.md`.
6. Report quality gates by ID, with details only for pending or failed items.
7. Follow `framework/config/phase-approval.yml` before moving to the next phase.

## Project & Phase Resolution (Mandatory)

You MUST resolve `project-slug` and `phase` before loading phase context.
If resolution is ambiguous, follow the defaults below (do not guess a later
phase).

### Project slug resolution

Resolve `project-slug` in this order:

1. If exactly one directory exists under `work-item/`, use it.
2. If multiple directories exist under `work-item/`, STOP and ask a structured question listing candidates (slug + current_phase + status) — never auto-pick by mtime.
3. Ignore any projects under `work-item/archive/` (archived projects are immutable and
   must never be reactivated automatically).
4. If no project directory exists yet, create `work-item/[project-slug]/` using
   a short slug derived from the repository/workspace name. If that is not
   possible, use `project-001`.

### Phase resolution

Resolve `phase` in this order:

1. `work-item/[project-slug]/active.yml:current_phase` (canonical).
2. Otherwise, infer phase from the presence of mandatory phase artifacts under
   `work-item/[project-slug]/` (proposal/specs/design/tasks/build/etc.) as
   defined by `framework/workflows/`.
3. If you still cannot determine phase with high confidence, default to
   `phase-01-proposal` and ask a structured question before writing artifacts.

## Track Selection (Mandatory)

You MUST determine the work **track** before loading phase context. The track
controls which phases are required, optional, or pre-approved to skip.

### Available tracks

| Track            | Work type                              | Intake artifact | Entry phase          |
| ---------------- | -------------------------------------- | --------------- | -------------------- |
| `new-feature`    | New functionality                      | `proposal.md`   | Phase 1              |
| `change-request` | Modification to existing functionality | `cr-intake.md`  | Phase 1 (simplified) |
| `hotfix`         | Bug fix / emergency patch              | `bug-report.md` | Phase 4              |

### Track resolution order

1. Read `work-item/[project-slug]/active.yml` field `track:` if the file exists.
2. If a `bug-report.md` exists under `work-item/[project-slug]/01-intake/`, use `hotfix`.
3. If a `cr-intake.md` exists under `work-item/[project-slug]/01-proposal/`, use `change-request`.
4. If a `proposal.md` exists under `work-item/[project-slug]/01-proposal/`, use `new-feature`.
5. If none of the above, **ask the user** to identify the track before proceeding.

### Track behaviour

- `new-feature`: Apply default `phases` rules from `framework/config/phase-skips.yml`.
- `change-request`: Apply `tracks.change-request.skip_overrides` from `framework/config/phase-skips.yml`. Use `framework/templates/cr-intake.md` as the Phase 1 artifact.
- `hotfix`: Apply `tracks.hotfix.skip_overrides`. Use `framework/templates/bug-report.md` as the intake artifact. Skip Phases 1–3 without further confirmation; start work at Phase 4. The Phase-01 hotfix intake (phase-01-proposal.md → Steps — hotfix, 01-intake/bug-report.md) is mandatory as entry to Phase 4.
- Type-specific overrides: after resolving the track, read `active.yml.type`. For `type: epic`, apply `types.epic.skip_overrides` and `types.epic.entry_phase`; the epic retains `track: new-feature`. `type: feature` has no additional overrides.

Record the resolved track in `work-item/[project-slug]/active.yml` field `track:` and the work-item type in `active.yml` field `type:`.

---

## Technology Resolution

For phases that require technology rules, resolve `[technology]` from:

1. `work-item/[project-slug]/README.md` fields `technology:` or `tech_stack:`
2. `work-item/[project-slug]/tech-config.yml` field `technology`

The value must match an existing directory under `technology-rules/`. If it does
not, stop and create the technology rule set from `technology-rules/_template/`
before continuing.

## Project Rules Overlay (Optional)

A consuming repo MAY declare project-specific rules under `project-rules/` at the
repo root (`project-config.yml` + guideline files), mirroring
`technology-rules/[technology]/tech-config.yml:guidelines[]`.

- If `project-rules/project-config.yml` does **not** exist → the overlay is
  inactive and the effective context is exactly technology + framework.
- If it exists → resolve one **effective context** per phase: project guidelines
  whose `phases` match are added; a guideline with `replaces:` excludes the
  referenced base file (no duplicate loading); otherwise it is additive.
- Project rules may only **add or tighten**; they never relax technology or
  framework rules. `quality-gates.md` is never replaceable; project gates use the
  `PRG<phase>.<n>` namespace.
- Fail-closed: any missing/invalid file in the effective set blocks the phase
  (`[BLOCKER]`). Validate with `framework/scripts/validate-project-rules.sh`.

Canonical detail: `framework/rules/core.md` §6.2 and §9.

## Salesforce

Salesforce baseline rules are consolidated in
`technology-rules/salesforce/rules.md`. Load that file first, then load the
phase-specific Salesforce guideline files it names. Do not reintroduce separate
baseline context files for Salesforce unless they contain genuinely new,
non-overlapping information.
