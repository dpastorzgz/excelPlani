<!--
Skill: epic-decomposition/skill.md
Framework version: 1.5
Last updated: 2026-09-10
-->

# Skill — Epic Decomposition (Phases 1–2, epic work-items)

## Purpose

Split an oversized feature into an epic parent plus N child work-items with explicit waves and dependencies, so each child runs a normal 10-phase cycle while the epic tracks coverage.

## When to use

Load this skill in Phase 1 or 2 when any sizing gate (`QG1.8`, `QG2.9`) fires with an epic-split decision, or when the user explicitly requests a split.

## Process

### 1. Slice by domain first

- Group FRs/UCs by shared entity, actor, and lifecycle. Each group with an independent acceptance story becomes one child.
- Prefer domain slicing over risk slicing over tech-layer slicing (tech-layer is the last resort: it creates the strongest cross-child dependencies).
- If a single slice still trips the sizing gates, subdivide it recursively and record why.

### 2. Assign waves and dependencies

- Wave 0: data/schema/contracts (no dependencies).
- Higher waves depend on lower waves via `depends_on` following the wave order in
  `technology-rules/[technology]/tech-config.yml:deployment` (or `rules.md` Phase 04 when the tech config has no wave table).
- Children in the same wave must be mutually independent and may run in parallel; never let a lower wave depend on a higher wave.

### 3. Scaffold children (automatic, with notice)

- For each child: create `work-item/[child-slug]/` with `README.md` (from `project-readme.md`), `active.yml` (`type: feature`, `parent_epic`, `depends_on`, `wave`, `track: new-feature`), and `01-proposal/proposal.md` sliced from the epic scope plus a link back to the epic.
- Write `work-item/[epic-slug]/epic-map.yml` from `framework/templates/epic-map.yml` covering 100% of Epic-FRs.

### 4. Validate the DAG before closing

- Every `depends_on` slug exists in `epic-map.yml`; no cycles; no lower wave depending on a higher wave.
- A child may enter Phase 5 only when each dependency is at ≥ Phase 7 with testing gates `Passed`; Phase 9 only when each dependency is at ≥ Phase 9.
- A child never edits another work-item's artifacts (read-only cross-loading via `epic-map.yml`).

## Complete Epic-Decomposition Checklist

- [ ] Every Epic-FR maps to at least one child (100% coverage in the epic traceability matrix)
- [ ] No child trips the sizing gates on its own (or recursion is recorded)
- [ ] DAG is acyclic with valid slugs and coherent waves
- [ ] Build/release entry rules (§4 above) are recorded in `epic-map.yml`
- [ ] The user has reviewed and approved the breakdown

## 5. Contract-first shared design (optional) + freshness + wave override

- The epic MAY run Phase 3 to produce `work-item/[epic-slug]/03-design/design.md` (global architecture, data model, inter-child contracts, global ADRs). Children load it **read-only** in Phases 2–5; a child refines locally and MUST NOT contradict epic contracts — deviation requires a child ADR + escalation to the epic.
- The epic MUST NOT own `04-tasks/task-list.md`: epic planning lives in `epic-map.yml`.
- Freshness: every child phase/status change in its `active.yml` MUST update the matching `epic-map.yml` row in the same session (child active.yml wins on conflict).
- Wave override: parallel execution outside the entry rule (§4) requires `wave_policy: relaxed` + justification + date in `epic-map.yml`; without it a violation is Failed and blocks.
