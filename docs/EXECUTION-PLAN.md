# Execution Plan — Framework Optimization (Redundancy + Clear Instructions)

This plan is meant to be **executable**: it defines steps, acceptance criteria, and verification commands.

---

## Goals

1. **Remove redundancy**: eliminate duplicated concepts and conflicting terminology.
2. **Make instructions unambiguous**: consistent naming (`work-item`) and consistent folder paths.
3. **Keep “source of truth” single**: docs should link to authoritative files, not copy them.

---

## Changes already applied in this optimization pass

### A) Terminology + paths

- Landing page updated:
  - `projects/` → `work-item/`
  - “Projects” section → “Work-items”
  - Quick Start examples now use `Work-item:` instead of `Project:`
  - Technology warning updated: phases **3,4,5,7,9** require technology resolution.

### B) Context routing policy

- `framework/config/context-routing.yml`
  - Phase **03** now loads `technology-rules/[technology]/rules.md`
  - Phase **04** now loads `technology-rules/[technology]/rules.md`
  - Placeholder resolution comment updated to reference `work-item/` not `projects/`

### C) Core rules

- `framework/rules/core.md`
  - Technology stack resolution scope updated to: phases **3,4,5,6,7,9**

### D) Operator docs added

- `docs/OPERATOR-GUIDE.md` — practical usage guide
- `docs/FRAMEWORK-REFERENCE.md` — pointers to authoritative sources

---

## Remaining recommended work (next steps)

### 1) Align remaining occurrences of `project` wording

**Why**: even if paths are correct, mixed terminology increases operator error.

**Actions**

- Replace user-facing examples to prefer “work-item” consistently:
  - `.axetrules/workflows/workflow-frameworkIA.md`
  - `README.md` and `AGENTS.md` (only if they still mention “Project:” prompts)

**Acceptance criteria**

- `git grep -n "Project:" -- .` returns **0** (or only references as “legacy / deprecated”).
- `git grep -n "Projects\\b" -- .` returns **0** in user-facing docs/UI strings.

**Verification**

```bash
git grep -n "Project:" -- . || true
git grep -n "Projects\\b" -- . || true
```

---

### 2) Reduce redundant instruction sources

**Why**: there are multiple “how to” entrypoints (README, AGENT, workflow docs, landing page, improvements docs). We want a clear hierarchy.

**Actions**

- Add a short section in `README.md`:
  - “Start here” → links to `docs/OPERATOR-GUIDE.md`
  - “Framework reference” → links to `docs/FRAMEWORK-REFERENCE.md`
  - “Rules source-of-truth” → links to `AGENTS.md` and `framework/rules/core.md`

**Acceptance criteria**

- README contains a “Start Here” section and does not duplicate the operator guide verbatim.
- No conflicting quick start instructions between README and landing page.

---

### 3) Decide what to do with `.gitignore` Salesforce scaffolding entries

**Why**: current `.gitignore` contains entries that look like **project scaffolding** (`force-app`, `sfdx-project.json`, etc.). Ignoring those at repo root can be correct for a “framework-only” repo, but it can also hide mistakes if a work-item includes a Salesforce project at root by accident.

**Options**

- Option A (strict): keep ignoring them at root, but add a comment “This repo should not contain Salesforce project at root; work-items contain projects”.
- Option B (safer): remove some of these ignores and rely on work-item structure.

**Acceptance criteria**

- Documented decision in a short ADR (optional) or in README.

---

### 4) Introduce a minimal “work-item registry” schema (optional)

**Why**: `work-item/README.md` is mentioned in improvements; having an optional registry helps navigation in teams.

**Actions**

- Create `work-item/README.md` if missing (registry table: slug, status, technology, current phase, owners).
- Keep it optional: filesystem remains authoritative.

**Acceptance criteria**

- Work-item registry exists and does not become a required gate.

---

## Quality / Safety gates for this optimization

- No broken placeholder references: `[technology]` only appears in `technology-rules/[technology]/...` paths.
- Landing page examples match operator guide examples (folder + prompt keywords).
- No instructions point to `projects/` anymore.

---

## Suggested execution order

1. Terminology grep cleanup (`Project:` / `Projects`)
2. README “Start here” section
3. `.gitignore` decision + documentation
4. Optional registry

## v1.5 status note

- v1.5 closes: terminology/tree aligned; hierarchy Start-Here/REFERENCE/AGENTS+core per §2 done in README.
- Stays open: dynamics365 P4.2 gates-only violation (see tech-config comment); Phase-2 optional `rules.md` listing.
