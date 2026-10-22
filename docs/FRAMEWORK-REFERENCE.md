# Framework Reference — Axet (Work-Item Root)

This document is a **reference** to understand how Axet is organized.
It intentionally **links to source-of-truth files** instead of duplicating them.

## Source of truth

- Agent entrypoint: `AGENTS.md`
- Always-on rules: `framework/rules/core.md`
- Context routing: `framework/config/context-routing.yml`
- Approval policy: `framework/config/phase-approval.yml`
- Phase skipping policy: `framework/config/phase-skips.yml`
- Quality gates (compact): `framework/rules/quality-gates.md`
- Quality gates (verbose, only when needed): `framework/rules/quality-gates-extended.md` (deprecated pointer → quality-gates.md)
- Evidence rules: `framework/rules/evidence.md`
- Framework version: `framework/config/version.yml`
- Validators: `framework/scripts/check-all.sh` / `make check` (see `framework/rules/core.md` §11)
- Technology rules: `technology-rules/[technology]/rules.md`
- Project rules (optional overlay): `project-rules/project-config.yml`

## Repository layout (high level)

- `framework/` — rules, workflows, skills, templates
- `technology-rules/` — tech-specific policies
- `project-rules/` — optional project overlay for a consuming repo (add/tighten only)
- `work-item/` — active work-items (each work-item is a 10-phase lifecycle)
- `work-item/archive/` — completed work-items moved here after Phase 10
- `docs/` — operator documentation

## Framework skill modules

Framework skills are directory-based modules. Load each skill through its
entrypoint:

- `framework/skills/[skill-name]/skill.md`

Do not use legacy flat paths such as `framework/skills/[skill-name].md`.

## Work-item path contract

All phase artifacts live under:

- Active: `work-item/[work-item-slug]/NN-phase-name/<artifact>.md`
- Archived: `work-item/archive/[work-item-slug]/...`

## Technology resolution (strict from Phase 03 onwards)

Phases requiring technology rules:

- Phase 03 — Design
- Phase 04 — Tasks
- Phase 05 — Build
- Phase 06 — Verification
- Phase 07 — Testing
- Phase 09 — Release

Resolution order (see `framework/rules/core.md` and `framework/config/context-routing.yml`):

1. `work-item/[slug]/README.md` fields `technology:` or `tech_stack:`
2. `work-item/[slug]/tech-config.yml` field `technology`
3. Must match a folder under `technology-rules/`

If resolution fails, the agent must stop with `[BLOCKER]`.

## Project rules overlay (optional)

A consuming repo/product may add `project-rules/project-config.yml` at the repo root. Its `guidelines[]` mirrors `technology-rules/[technology]/tech-config.yml:guidelines[]` (each entry has `file` and `phases`).

Resolution produces **one effective context set** per phase:

- `replaces: <base path>` → the referenced base guideline is excluded; only the project file loads (no duplicate context).
- otherwise the project guideline is additive (`extends`).
- `quality-gates.md` is never replaceable: base technology/framework gates always load and project gates use the `PRG<phase>.<n>` namespace.
- **Additive precedence**: project rules may only add or tighten, never relax technology/framework rules; when two layers cover the same topic, the more restrictive wins.
- **Fail-closed**: every file in the effective set must exist and validate, otherwise the phase blocks with `[BLOCKER]`.

If `project-rules/project-config.yml` does not exist, the effective set is exactly technology + framework (no behavior change).

Key framework pieces:

- Resolution and precedence: `framework/rules/core.md` (§6.2 and §9)
- Routing config: `framework/config/context-routing.yml` (`effective_context`)
- Validator: `framework/scripts/validate-project-rules.sh` (`--phase N`, `--manifest PATH`)
- Scaffold: `framework/templates/project-rules/`

### Worked example — overriding a technology rule

Goal: the repository wants to **supersede** the Salesforce naming convention with
its own (stricter) convention, without loading both files.

**1. Declare the replacement** in `project-rules/project-config.yml`:

```yaml
project: "prosegur-cpq"
guidelines:
  - file: "NamingConventions.md"
    description: "Prosegur naming — supersedes the Salesforce naming file."
    phases: [03, 04, 05, 06]
    replaces: "technology-rules/salesforce/NamingConventions.md"
  - file: "quality-gates.md"
    phases: [05, 06]
```

**2. Provide the project file** `project-rules/NamingConventions.md`. Because it
replaces the base file, it must be **at least as strict** — it should restate the
base rules it still wants to apply and add the project-specific ones:

```markdown
# Naming Conventions — Prosegur CPQ

> Supersedes `technology-rules/salesforce/NamingConventions.md`. Every base rule
> still applies unless explicitly tightened below.

- Apex classes in the CPQ domain MUST be prefixed `CPQ_` (e.g. `CPQ_RoutingService`).
- All other Salesforce naming rules from the base convention remain in force.
```

**3. Resolve the effective context for a phase** — the base file is excluded, so
only one naming document is loaded:

```bash
bash framework/scripts/validate-project-rules.sh --phase 5
# PROJECT-RULES ACTIVE-PHASE-5 project-rules/NamingConventions.md
# PROJECT-RULES REPLACES-PHASE-5 technology-rules/salesforce/NamingConventions.md
# PROJECT-RULES ACTIVE-PHASE-5 project-rules/quality-gates.md
# PROJECT-RULES: OK [prosegur-cpq]
```

Net effect for Phase 5: the base set keeps `technology-rules/salesforce/rules.md`,
`ApexGuidelines.md`, … and **drops** `NamingConventions.md`, which is replaced by
`project-rules/NamingConventions.md`.

### Worked example — adding a project rule (no override)

To add rules **on top of** the technology layer, omit `replaces` (or set
`extends: true`); both files load:

```yaml
  - file: "extra-hardening.md"
    description: "Extra review rules on top of the Salesforce baseline."
    phases: [05, 06]
    extends: true
```

> Rule of thumb: use `extends` when the base guidance is still wanted; use
> `replaces` only when the project file fully covers (and tightens) that topic.
> Never use `replaces` to weaken a rule — that is invalid and blocked by policy.

## Living technical documentation

Axet supports project-level living technical documentation as a reusable capability for implementation context and maintenance.

Use it when a project keeps modular technical sheets for areas, modules, components, or services and wants agents to consult and maintain them during delivery work.

Recommended project configuration:

```yml
technical_documentation:
  enabled: true
  root: docs/
  index: docs/README.md
  module_pattern: docs/<module>.md
```

Key framework pieces:

- Always-on discipline: `framework/rules/core.md`
- Reusable skill: `framework/skills/project-documentation/skill.md`
- Reusable module sheet template: `framework/templates/module-doc.md`

`docs/` is a recommended convention, not a hardcoded framework path. Projects may use another path if they configure an equivalent index and sheet structure.

## Archive policy

After Phase 10 completes and is approved, the entire work-item folder is moved:

- `work-item/[slug]/` → `work-item/archive/[slug]/`

See `framework/skills/project-archiving/skill.md` and `framework/workflows/phase-10-archive.md`.

## v1.5 notes

- Epic-map `wave_policy` + freshness — see `framework/templates/epic-map.yml`.
- Gate `QG10.4`, `closed` status — see `framework/rules/quality-gates.md` + `framework/rules/core.md`.
- Epic skill/map load conditionally — see `framework/config/context-routing.yml`.
