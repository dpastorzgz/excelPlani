# Changelog — frameworkIA

All notable changes to this framework are documented in this file.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Framework versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

> Cleanup pass: make the validator suite runnable and tested, remove the
> duplicated technology validator, and close drift in the `_template` scaffold.

### Added

- `Makefile` (new) — `make check` → `framework/scripts/check-all.sh`; `make check-tech` → `framework/scripts/validate-new-tech.sh`.
- `framework/scripts/tests/test-validators.sh` (new) — black-box tests (8 cases) for `check-refs.sh`, `check-gates.sh`, `check-workitems.sh`, `validate-new-tech.sh` via a disposable `AXET_ROOT` tree.
- `technology-rules/_template/verification-overlay.md`, `technology-rules/_template/skills/README.md` (new) — complete the scaffold (the README already advertised the overlay; the validator expected the scaffold).

### Changed

- `framework/scripts/validate-new-tech.sh` — now the single canonical copy; no-arg mode validates every technology; honors `AXET_ROOT`; `NamingConventions.md` is required and `verification-overlay.md` recommended.
- `technology-rules/_template/scripts/validate-new-tech.sh` — **removed** (identical duplicate; `_template/README.md` points to the canonical script).
- `framework/scripts/check-refs.sh`, `check-gates.sh`, `check-workitems.sh`, `check-all.sh`, `validate-project-rules.sh` — accept `AXET_ROOT` as a repository-root override (default unchanged).
- `framework/scripts/check-gates.sh` — no longer aborts under `set -o pipefail` when a repo has no `technology-rules/*/quality-gates.md`.
- `framework/rules/core.md` — new §11 "Framework Validators (Mechanical Checks)".
- `technology-rules/_template/{README.md,tech-config.yml,rules.md,context.md}` — required/recommended columns aligned with the validator, `GeneralGuidelines.md` now optional, version stamps bumped to 1.6.
- `docs/FRAMEWORK-REFERENCE.md`, `docs/OPERATOR-GUIDE.md` — reference `make check` and `framework/rules/core.md` §11.

## [1.6.0] — 2026-09-18

> Release v1.6: optional **project rules overlay** (`project-rules/`) with deterministic per-phase *effective context* resolution. A consuming repo/product can declare its own rules that add to or tighten technology/framework rules, using `replaces` (no duplicate loading) or `extends` (additive). Token-efficient, fail-closed, and fully backward compatible: with no `project-rules/`, behavior is unchanged. Closes IMP-023 in `framework/improvements/framework-review-v1.md`.

### Added

- `framework/templates/project-rules/` (new) — Scaffold for the overlay: `project-config.yml` (schema mirroring `tech-config.yml:guidelines[]`), `rules.md`, `quality-gates.md` (PRG* namespace), and adoption `README.md`.
- `framework/scripts/validate-project-rules.sh` (new) — Zero-dependency validator (bash + grep/awk/sed): schema, phases, file existence, forbidden `replaces`, PRG* gate-ID collisions; supports `--phase N` and `--manifest PATH` to emit the effective project context for a phase.
- `framework/config/context-routing.yml` — `placeholder_resolution.project_rules` + `effective_context` block describing discovery, `replaces`/`extends` semantics, gates-never-replaced policy, and fail-closed resolution.

### Changed

- `framework/rules/core.md` — Section 6 renamed to "Rule Layer Resolution" with new §6.2 "Project rules overlay"; §9 Rule Precedence rewritten as additive-only (project may add/tighten, never relax; more-restrictive rule wins; gates never replaceable).
- `framework/scripts/check-all.sh` — Wires `validate-project-rules.sh` into the validator suite (no-op when the overlay is absent).
- `README.md`, `docs/FRAMEWORK-REFERENCE.md`, `docs/OPERATOR-GUIDE.md`, `docs/AGENT-COMPATIBILITY.md`, `AGENTS.md`, `technology-rules/_template/README.md`, `technology-rules/_template/rules.md`, `framework/templates/project-readme.md`, `.axetrules/rules.md` — Document the project rules overlay, its precedence and token model.
- `framework/config/version.yml` — `1.5.0` → `1.6.0`.

## [1.5.0] — 2026-09-10

> Release v1.5 (assessment v1.5 P1–P4): consistency fixes (AGENTS refs, QG6.7, status vocab incl. closed, cross-refs, bug-report path, phases_skipped); mechanical validators (framework/scripts/check-refs|gates|workitems|all); epic contract-first + QG10.4 + wave closeout + wave_policy; context hygiene + version.yml. Cycles v1.2–v1.4 remain documented under framework/improvements/. Full detail: framework/improvements/framework-assessment-v1.5.md.

### Added

- `technology-rules/salesforce/deploy-protocol.md` (new, canonical) — Single Salesforce CLI dialect (`validate/start/report/quick`), sandbox-by-configuration target-org policy, per-task/per-group loop, machine-evidence rule, manifest-first release.
- `technology-rules/salesforce/verification-overlay.md`, `technology-rules/dynamics365-powerplatform/verification-overlay.md` (new) — Technology deployment triage + design cross-checks complementing the generic verification skill.
- `technology-rules/salesforce/skills/slds2-prototype/` (moved from `framework/skills/`) — Salesforce-only prototype skill now lives in its overlay.
- `technology-rules/salesforce/quality-gates.md` — New `SFG3.6` (design dry-run gate), `SFG4.5` (irreversible/destructive-change plan), `SFG5.14` (manifest-first + machine-evidence-only), `SFG5.15` (RunRelevantTests per Apex group), `SFG6.5` (smoke as running user).
- `technology-rules/dynamics365-powerplatform/quality-gates.md` — New `DPPG5.11` (managed import per group mandatory), `DPPG5.12` (`deploymentsettings.json` resolved per environment), `DPPG5.13` (version/upgrade policy).
- `technology-rules/dynamics365-powerplatform/templates/deploymentsettings.json.template`, `solution-inventory.md` (new) — Settings schema and inventory fulfilling `DPPG5.3/DPPG5.12`.
- `technology-rules/_template/quality-gates.md`, `release-pipeline.yml`, `NamingConventions.md`, `GeneralGuidelines.md`, `templates/build-log-overlay.md`, `scripts/validate-new-tech.sh` (new) — Installable scaffold + validator (`guidelines[]` existence, `framework/` agnostic check).

- `framework/rules/quality-gates.md` — New sizing gates `QG1.8`, `QG2.9`, `QG3.9`, `QG4.8` with the "0 = monolith, 1 = recommendation, ≥2 = mandatory split" decision rule.
- `framework/templates/proposal.md`, `specs.md`, `design.md`, `task-list.md` — New `Sizing & Split Decision` section carrying the auditable evidence for the sizing gates.
- `framework/templates/epic-map.yml` (new) — Epic children, dependencies and waves; single source of truth for the breakdown.
- `framework/templates/active.yml` — New optional hierarchy fields `type`, `parent_epic`, `depends_on`, `wave`.
- `framework/skills/epic-decomposition/skill.md` (new) — Domain slicing, wave assignment, child scaffolding, DAG validation.
- `framework/config/phase-skips.yml`, `phase-approval.yml`, `context-routing.yml` — Epic-aware skips (delegated Phases 3–9), approval-by-wave notes, and child context loading (`epic-map.yml` + dependency outputs, read-only).
- `technology-rules/salesforce/rules.md` — Epic waves mapped onto Salesforce dependency layers with Phase 5/9 entry rules.
- `framework/templates/task-list.md` — Complexity scale unified to `S <30min / M 30–90min / L 90–120min` (max 2h per atomic task).
- `work-item/README.md`, `docs/OPERATOR-GUIDE.md` — Archive path corrected to `work-item/archive/`; `_evidence/` added to documented folder trees.
- `docs/AGENT-COMPATIBILITY.md` — Cross-agent operating guide for Codex, OpenCode, Cline, and GitHub Copilot covering structured questions, phase discipline, and closeout behavior.
- `framework/config/context-routing.yml` — Restored phase context routing manifest with always-required files and per-phase workflow/skill/template loading.
- `framework/config/phase-skips.yml` — Restored explicit per-track skip policy for `new-feature`, `change-request`, and `hotfix`.

### Changed

- `AGENT.md` — Added a mandatory multi-agent operating contract covering checkpoint reporting, structured questions, single-phase artifact discipline, full artifact paths, and open-question handling.
- `framework/rules/core.md` — Added always-on operational checkpoint, structured next-step question rules, and artifact-scope/open-question constraints.
- `framework/rules/phase-transitions.md` — Added universal transition blockers, standardized closeout prompt format, and explicit rejection re-presentation using option-based next steps.
- `framework/rules/quality-gates.md` — Expanded Phase 1-4 gates for open-question and artifact-scope control; formalized gate result states (`Passed`, `Pending`, `Failed`, `N/A`); clarified applicability for `QG6.6`, `QG6.7`, `QG7.1`, `QG7.2`, and `QG9.4`.
- `framework/rules/evidence.md` — Added structured manual attestation requirements for user/operator-provided evidence.
- `framework/templates/proposal.md`, `framework/templates/specs.md`, `framework/templates/design.md`, `framework/templates/task-list.md`, `framework/templates/cr-intake.md`, `framework/templates/bug-report.md` — Normalized open-question sections with status, resolution, owner, and target phase.
- `framework/templates/verification-report.md`, `framework/templates/test-report.md`, `framework/templates/release-notes.md` — Added gate applicability notes and structured manual attestation sections.
- `framework/workflows/phase-01-proposal.md` through `framework/workflows/phase-10-archive.md` — Added compact `Phase Checkpoint` blocks and aligned phase closeout with structured prompts and explicit artifact boundaries.
- `technology-rules/dynamics365-powerplatform/quality-gates.md` — Aligned technology-specific reporting with the baseline gate-state vocabulary and removed ambiguous `Partially passed` reporting.
- `README.md`, `docs/FRAMEWORK-REFERENCE.md`, `docs/OPERATOR-GUIDE.md`, `framework/skills/project-archiving/skill.md` — Standardized archive location references to `work-item/archive/[project-slug]/`.
- `docs/axet_framework_landing_page.jsx` — Updated Phase 1-4 quality gate ranges and Phase 1 highlighted approval gate to match the current baseline gate set.

- `framework/skills/` — Skill guides now use directory-based modules with `skill.md` entrypoints (`framework/skills/[skill-name]/skill.md`).
- `framework/config/context-routing.yml` — Phase skill loading now points to the new skill module entrypoints.
- `.gitignore` — Framework config files under `framework/config/` are no longer hidden by the generic `config` ignore rule.
- `technology-rules/salesforce/rules.md` — Phase 03 now includes a Salesforce-specific design feasibility checklist, requires explicit Phase 3 loading of `quality-gates.md`, and formalizes checks for field-history feasibility, custom audit triggers, key indexing/External ID decisions, and data-model self-consistency. Phase 05 still enforces a non-skippable pre-step to create/maintain `work-item/[project-slug]/05-build/package.xml`, clarifies group-based deploy strategy, and adds a mandatory final validation deploy by manifest with `RunRelevantTests`.
- `technology-rules/salesforce/quality-gates.md` — Added blocking Phase 3 gates `SFG3.1`–`SFG3.3` for field-history feasibility validation, explicit Spec vs Design deviation tracking, and data-model self-consistency checks.
- `technology-rules/salesforce/DeploymentGuidelines.md` — Phase 05 protocol updated to require final validation via manifest deploy (`NoTestRun` then `RunRelevantTests`) instead of deploying the entire `classes/` directory.
- `technology-rules/salesforce/LWCGuidelines.md` — Added a "Modals and Dialogs" standard: dialogs must be built on the base `lightning/modal` (`LightningModal`) so the header and close (X) button inherit the org theme; hand-rolled `slds-modal` markup (whose `slds-button_icon-inverse` close button is invisible and not theme-aware) is prohibited. Includes component/opener example and a Quick LWC Checklist item.
- `technology-rules/salesforce/rules.md` — Phase 06 LWC quality checklist now verifies dialogs use `lightning/modal` (themed chrome) rather than a hand-rolled `slds-modal`.
- `framework/skills/architecture-design/skill.md` — Added mandatory Phase 3 technology feasibility validation, explicit Spec vs Design deviation capture in the ADR gap scan, and a data-model self-consistency check before design closeout.
- `framework/` agnostic decoupling — `build-log.md` §§5-7, `verification-report.md` §5, `test-report.md` §§1-3, `design.md` §§4/6, `quality-gates.md` `QG6.6` (+ extended), `phase-03/05` workflows, `proposal-writing`/`specs-writing`/`epic-decomposition`/`architecture-design` skills generalized to placeholders + `technology-rules/[technology]/` pointers; `verification/skill.md` split (generic flow here, triage in per-tech `verification-overlay.md`).
- `framework/config/context-routing.yml` — Phase 3/4 no longer hardcode `NamingConventions.md`/`ProjectPlanning.md`; `tech-config.yml:guidelines[]` is the single source of truth. `evidence.md` now required in Phases 7/9.
- `framework/workflows/phase-08-commit-pr.md`, `framework/rules/quality-gates.md` — CI (`QG8.3`) required by default; exception only for isolated scope with written approval.
- `technology-rules/salesforce/tech-config.yml` — Migrated to canonical schema (identity/testing/linting/deployment/guidelines[]/references); `deploy_full --source-dir force-app` deprecated in favor of manifest-first release.
- `technology-rules/salesforce/rules.md` Phase 09 + `release-pipeline.yml` — Production validates/deploys `05-build/package.xml` with target-org policy (default in Phase 5, explicit in 7/9/CI).
- `technology-rules/salesforce/DeploymentGuidelines.md` — Canonical dialect fixed (`deploy validate`, `--manifest`; `--dry-run`/`--use-manifest`/bulk `--metadata` forbidden); points to `deploy-protocol.md`.
- `technology-rules/dynamics365-powerplatform/rules.md`, `ALMDeploymentGuidelines.md`, `tech-config.yml` — Per-group managed import loop in dependency order, Build Tools v2 task names, solution segmentation/versioning/upgrade policy, `deploymentsettings.json` reference, `int` alias documented.

- Framework v1.5 corrections P1–P4 per framework/improvements/framework-assessment-v1.5.md (see release note above).

## [Unreleased]

> Changes staged for the next framework release (post-1.5.0).

---

## [1.1.0] — 2026-05-12

### Added

- `framework/improvements/framework-review-v1.md` — First comprehensive framework review with 23 identified improvements
- `framework/templates/project-readme.md` — Project-level README template
- `framework/templates/adr-registry.md` — ADR registry template for tracking architectural decisions
- `framework/templates/evidence-tracker.md` — Single-page evidence index tracking all phase artifacts and approvals
- `framework/templates/traceability-matrix.md` — Requirements-to-tests traceability template
- `framework/skills/proposal-writing/skill.md` — Skill guide for writing proposals
- `framework/skills/release-management/skill.md` — Skill guide for release management
- `framework/skills/project-archiving/skill.md` — Skill guide for project archiving
- `technology-rules/_template/` — Reusable template for new technology rule sets (`rules.md`, `tech-config.yml`, `context.md`, `README.md`)
- `technology-rules/salesforce/templates/build-log-sf.md` — Salesforce-specific build log template with deployment result tracking
- `technology-rules/salesforce/templates/test-report-sf.md` — Salesforce-specific test report template with coverage tables and bulk test validation
- `work-item/README.md` — Projects directory index and conventions

### Changed

- `framework/workflows/phase-05-build.md` — Added explicit code location rules, post-construction deployment steps, blocker handling table, and Phase 5 completion checklist
- `framework/workflows/phase-08-commit-pr.md` — Added CI/CD gate section with pre-merge quality checks and branch protection guidance
- `framework/rules/phase-transitions.md` — Added rejection protocol: what happens when a human reviewer rejects a phase
- `framework/rules/general.md` — Added rule precedence hierarchy (global rules → technology rules → project overrides)
- `framework/rules/quality-gates.md` — Aligned gate criteria with phase workflows; added evidence requirements per gate
- `framework/config/phase-approval.yml` — Expanded with all 9 transitions, added `notes` field, documented approval modes
- `framework/templates/retrospective.md` — Added framework improvement actions section
- `technology-rules/salesforce/rules.md` — Added Phase 09 (Release) section with production deployment commands, validation gate, quick deploy, and rollback protocol

### Fixed

- Terminology inconsistency: Phase 5 folder name standardized to `05-construction/` in all references (previously `05-build/` in some files)

---

## [1.0.0] — 2026-05-01

### Added

- Initial framework structure with 10-phase software development lifecycle
- `framework/workflows/` — Workflow files for all 10 phases
- `framework/rules/` — General rules, quality gates, evidence requirements, phase transitions
- `framework/templates/` — Artifact templates for all phases
- `framework/skills/` — Skill guides for architecture design, code review, git operations, retrospective, specs writing, task decomposition, test generation, verification
- `framework/config/phase-approval.yml` — Phase approval configuration
- `technology-rules/salesforce/` — Salesforce technology rules covering Apex, LWC, Flow, deployment, testing, naming conventions
- `.axetrules/rules.md` — Global agent behavior rules
- `README.md` — Framework overview

---

[Unreleased]: https://github.com/[org]/frameworkIA/compare/v1.5.0...HEAD
[1.5.0]: https://github.com/[org]/frameworkIA/compare/v1.1.0...v1.5.0
[1.1.0]: https://github.com/[org]/frameworkIA/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/[org]/frameworkIA/releases/tag/v1.0.0
