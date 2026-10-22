# Quality Gates — Extended (Angular Pelayo)

> **Loaded on demand only.** This is the verbose counterpart of the compact, always-loaded
> `quality-gates.md`; together with `framework/rules/quality-gates.md` they remain the source of
> truth. Use this file during phase closeouts and whenever a gate result is disputed or needs
> remediation detail. Gate IDs, wording and phase grouping are frozen — never invent gates or
> rename IDs, and keep this file synchronized with `quality-gates.md`.

Reading a gate entry:

- **Evidence** — what must exist for the gate to be reviewable.
- **Verified by** — how the reviewer confirms it.
- **FAIL when** — conditions that make the gate fail; a failed gate is blocking.

Report every gate as `PASS` or `FAIL` (per-check for gates with sub-checks such as ANG3.3.a–d). Never report `Partially passed`; split applicability by gate ID and record the reason in the phase artifact.

---

## Phase 2 — Specifications

### ANG2.1 — Specs remain implementation-agnostic
- **Evidence:** the Phase 2 specification artifact set.
- **Verified by:** review for component/service/file/route names, Angular/technical decisions and API internals; **FAIL when** any prohibited identifier or decision appears as a requirement.

### ANG2.2 — Prototype recorded as UX validation only
- **Evidence:** the generated Angular Material prototype (if any) and the recorded note classifying it as UX validation only.
- **Verified by:** confirming the prototype uses no technical component/service names, is not a source of truth and is not part of the deliverable app (not wired into app routes); **FAIL when** it is treated as design authority or promoted into the deliverable application.

### ANG2.3 — Prototype offer response recorded
- **Evidence:** the recorded user response to the prototype offer (made / accepted / declined, with date) in the Phase 2 artifact set.
- **Verified by:** checking the response exists before Phase 2 closeout per the Phase 2 flow in `rules.md`; **FAIL when** the prototype was offered but no response is recorded.

---

## Phase 3 — Design

### ANG3.1 — Phase 3 guideline files loaded
- **Evidence:** loading record listing the Phase 3 files from the mandatory table in `rules.md`.
- **Verified by:** cross-checking the loaded set against the Phase 3 row of the table (including `verification-overlay.md`); **FAIL when** a listed file is missing or a design decision predates loading.

### ANG3.2 — Spec vs Design deviations register
- **Evidence:** deviations register for every source-spec requirement left deferred, optional, conditional or rejected, each with requirement reference and rationale.
- **Verified by:** reconciling the register against the source specs; **FAIL when** a requirement is unaccounted for or an entry does not map to a real spec requirement.

### ANG3.3 — Design self-consistency cross-checks
- **Evidence:** one `PASS`/`FAIL` record per sub-check with artifact references, in the format defined by `verification-overlay.md` (a: component-diagram ↔ inventory; b: component/service vs ADR & out-of-scope consistency; c: ADR registry literal title sync; d: requirement→task existence).
- **Verified by:** executing every sub-check; **FAIL when** any sub-check is `FAIL` or lacks recorded evidence (any literal ADR title mismatch is a `FAIL` on c).

### ANG3.4 — Architecture decisions recorded as ADRs
- **Evidence:** ADR records for meaningful decisions, covering at least: signals vs RxJS boundary, service vs store, lazy-loading/route strategy, mock strategy, dependency additions.
- **Verified by:** reviewing the design decision set for those categories; **FAIL when** a meaningful decision exists without an ADR record.

### ANG3.5 — Feasibility validated before closeout
- **Evidence:** feasibility notes recording, per Angular API used, stability in the project's Angular version (experimental APIs with recorded approval), typed API contracts, the MSW mock plan, and identified environment/build configurations.
- **Verified by:** reviewing the notes against the design; **FAIL when** an experimental API lacks recorded approval, contracts are untyped, no MSW mock plan exists, or build/environment configurations are unidentified.

### ANG3.6 — Naming and structure follow NamingConventions.md
- **Evidence:** design naming and structure decisions referencing `NamingConventions.md` (2025 file naming, feature-first structure).
- **Verified by:** comparing every proposed file/route/symbol name and folder layout against the conventions; **FAIL when** the design contradicts them without a recorded, approved deviation.

### ANG3.7 — Accessibility and performance NFRs recorded
- **Evidence:** NFR section with WCAG 2.2 AA target, bundle budgets, and responsive breakpoints.
- **Verified by:** reviewing the design for all three NFR classes with measurable targets; **FAIL when** any of the three is missing or not measurable.

---

## Phase 4 — Tasks

### ANG4.1 — Guideline loading and task granularity
- **Evidence:** Phase 4 loading record plus a task list where each task maps to an independently verifiable UI unit (component, service, route, mock, test) with requirement/design references.
- **Verified by:** sampling tasks for unit boundary and references; **FAIL when** a task is not independently verifiable or lacks requirement/design references.

### ANG4.2 — Deliverables, data-access and expected evidence
- **Evidence:** per task — exact deliverable paths, data-access/mocks needed, and expected evidence (build/lint/test commands and outputs).
- **Verified by:** inspecting every task entry before Phase 5; **FAIL when** any task omits deliverable paths, mocks/data-access notes, or expected evidence.

### ANG4.3 — Dependency order respected
- **Evidence:** task list ordering models → data-access → state → components → routes → styles.
- **Verified by:** dependency review confirming no task depends on a later task; **FAIL when** any forward dependency exists.

### ANG4.4 — Irreversible changes planned
- **Evidence:** migration + rollback plan for each irreversible/destructive change (dependency upgrades, public API removals, route or component renames, storage contract changes).
- **Verified by:** checking plans are recorded before build starts; **FAIL when** an irreversible change enters Phase 5 without a plan.

---

## Phase 5 — Construction

### ANG5.1 — Production build succeeds
- **Evidence:** `npm run build` output recorded in the build log with 0 errors.
- **Verified by:** re-executing the configured production build; **FAIL when** the build fails or evidence is missing.

### ANG5.2 — Typed data-access isolation
- **Evidence:** typed data-access services and evidence that mock data and API access sit behind them.
- **Verified by:** code review confirming components do not access HTTP or mocks directly; **FAIL when** any feature bypasses typed data-access services.

### ANG5.3 — Lint and format clean
- **Evidence:** `npm run lint` output with 0 errors and `npm run format:check` clean, recorded in the build log.
- **Verified by:** re-running both commands; **FAIL when** any ESLint error or Prettier diff remains (warnings only under a documented policy).

### ANG5.4 — Task completion integrity
- **Evidence:** consistent task statuses across `task-list.md`, `active.yml` and the build log; every done task has all deliverables built and its unit tests passing.
- **Verified by:** the anti descope-to-green procedure in `verification-overlay.md`; **FAIL when** statuses diverge or a partially delivered task is marked done.

### ANG5.5 — No stubs or unexcused suppressions
- **Evidence:** source scan results for stubs, placeholders, TODOs and commented-out code; justification records for any `any`, `@ts-ignore` or `eslint-disable`.
- **Verified by:** source review plus lint output; **FAIL when** an unexcused occurrence remains in delivered scope.

### ANG5.6 — Bundle budgets respected
- **Evidence:** bundle sizes recorded in the build log.
- **Verified by:** comparing sizes against the budgets in `angular.json`; **FAIL when** a budget is exceeded, sizes are unrecorded, or a critical build warning is unexplained.

### ANG5.7 — Reproducible build-log evidence
- **Evidence:** build log with commands + outputs (build, lint, tests, bundle sizes); source under version control; lockfile consistent with declared dependencies.
- **Verified by:** reproducing the recorded commands and inspecting VCS status and lockfile; **FAIL when** evidence is not reproducible, source is untracked, or the lockfile is inconsistent.

---

## Phase 6 — Verification

### ANG6.1 — Traceability and static cleanliness
- **Evidence:** traceability from implementation to the approved design and task list; typecheck/lint evidence.
- **Verified by:** reconciling implementation against design and tasks, and reviewing static analysis evidence; **FAIL when** implementation is untraceable or a known blocking static issue remains open.

### ANG6.2 — Responsive smoke
- **Evidence:** recorded viewports for desktop and mobile smoke runs.
- **Verified by:** repeating smoke at the recorded viewports; **FAIL when** a form factor is missing or viewports are unrecorded.

### ANG6.3 — Accessibility smoke
- **Evidence:** keyboard-navigation pass on main flows plus automated check (e.g. axe) results.
- **Verified by:** a keyboard-only pass and review of the automated report; **FAIL when** any critical/serious issue is unresolved.

### ANG6.4 — Smoke against the built artifact
- **Evidence:** smoke executed against `dist/` served, with console output recorded.
- **Verified by:** confirming the smoke target is the built artifact (not the dev server) and the console is free of errors; **FAIL when** smoke only ran against the dev server or console errors remain.

### ANG6.5 — Environment isolation
- **Evidence:** production build inspected for mocks; dev/mock mode observed to issue no real endpoint calls.
- **Verified by:** artifact inspection (no MSW/mocks in the production build) and dev/mock observation; **FAIL when** mocks ship in production or real endpoints are called in dev/mock mode.

---

## Phase 7 — Testing

### ANG7.1 — Positive, negative and boundary coverage
- **Evidence:** test inventory showing positive, negative and boundary scenarios for the main feature flows.
- **Verified by:** mapping each main flow to its scenarios in the test report; **FAIL when** a scenario class is missing for a main flow.

### ANG7.2 — Test suite green
- **Evidence:** `npm test` run with totals and failures recorded in the test report.
- **Verified by:** re-executing `npm test`; **FAIL when** any test fails.

### ANG7.3 — Coverage thresholds met
- **Evidence:** coverage report from `npm test -- --coverage` with ≥ 75% global and ≥ 85% on critical data-access/state files.
- **Verified by:** reviewing the coverage report per file/area; **FAIL when** either threshold is below target.

### ANG7.4 — Behavioral assertions and MSW
- **Evidence:** test report showing behavioral assertions (no snapshot-only tests), MSW handlers covering all HTTP, and loading/error/empty states covered.
- **Verified by:** inspecting specs for assertion style, MSW usage and state scenarios; **FAIL when** snapshot-only tests stand in for behavior, a real network call is made, or state coverage is missing.

### ANG7.5 — Deterministic tests
- **Evidence:** no arbitrary sleeps/timeouts in specs; waits use `await fixture.whenStable()`, fake timers or explicit event-driven waits.
- **Verified by:** spec review plus repeated test runs for determinism; **FAIL when** sleeps/timeouts or flaky results are found.

---

## Phase 8 — Commit & PR

### ANG8.1 — Evidence links in the PR
- **Evidence:** PR description linking the build log, verification report and test report.
- **Verified by:** opening the PR and confirming the links resolve; **FAIL when** any evidence link is missing or broken.

### ANG8.2 — PR checks green
- **Evidence:** build + lint + tests checks passing; no secrets in the diff; lockfile/dependency changes called out for review.
- **Verified by:** reviewing PR checks and the diff; **FAIL when** a check is red, a secret is present, or dependency changes are unreviewed.

### ANG8.3 — Conventional commits
- **Evidence:** commit history using conventional commits with the frozen scopes (`ui`, `state`, `data`, `forms`, `routes`, `styles`, `a11y`, `perf`, `test`, `mocks`, `build`, `deps`, `ci`).
- **Verified by:** reviewing the commit messages of the PR; **FAIL when** messages deviate from the convention or use non-frozen scopes.

---

## Phase 9 — Release

### ANG9.1 — Pipeline-governed artifact
- **Evidence:** release record following `release-pipeline.yml`; released artifact is the CI-built `dist/` for the target configuration.
- **Verified by:** checking artifact provenance and pipeline hops (production uses the build validated in pre); **FAIL when** the artifact was rebuilt locally or hops were skipped.

### ANG9.2 — Production approval, rollback and smoke
- **Evidence:** release manager approval, rollback plan (previous artifact re-deploy), and post-deploy smoke record.
- **Verified by:** reviewing approval, plan and smoke evidence; **FAIL when** any of the three is missing.

### ANG9.3 — Release notes complete
- **Evidence:** release notes with build id/hash, environment, validation results, smoke results, and rollback reference.
- **Verified by:** reading `release-notes.md` against the required field list; **FAIL when** any required field is absent.

---

## Evidence Recording (extended rules)

- Record every gate as `PASS`/`FAIL` with artifact references and the date of the check; per-check results are mandatory for ANG3.3.a–d.
- Phase 5 evidence belongs in `work-item/[project-slug]/05-build/build-log.md` (use `templates/build-log-angular.md`); Phase 6 in `work-item/[project-slug]/06-verification/verification-report.md`; Phase 7 in `work-item/[project-slug]/07-testing/test-report.md` (use `templates/test-report-angular.md`); Phase 9 in `work-item/[project-slug]/09-release/release-notes.md`.
- Missing evidence or an unresolved `FAIL` is a **[BLOCKER]**: the phase does not advance until the gate is remediated and re-checked.
