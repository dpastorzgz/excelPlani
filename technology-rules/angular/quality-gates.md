# Quality Gates — Angular Pelayo (Technology-Specific)

This file extends the framework quality gates for **Angular** work-items.

- Baseline gates still apply: `framework/rules/quality-gates.md`
- This file adds **mandatory Angular-only** gates.
- These gates are **blocking**: do not advance phases if any gate below is not satisfied.

Prefer referencing IDs (e.g. `ANG5.1`) in build/verification artifacts.

---

## Phase 2 — Specifications (Angular)

- ANG2.1 — Specs remain implementation-agnostic: no component/service/file/route names, no Angular/technical decisions, no API internals.
- ANG2.2 — If an Angular Material prototype is generated, it is recorded as UX validation only (no technical component/service names, not a source of truth, not part of the deliverable app).
- ANG2.3 — If the prototype is offered (per `rules.md` Phase 2 flow), the user response is recorded before Phase 2 closeout.

---

## Phase 3 — Design (Angular)

- ANG3.1 — Phase 3 guideline files loaded before design decisions (list from `rules.md` table).
- ANG3.2 — Design contains an explicit Spec vs Design deviations register for every source-spec requirement left deferred, optional, conditional or rejected.
- ANG3.3 — Design self-consistency cross-checks executed (ANG3.3.a component-diagram ↔ inventory; ANG3.3.b component/service vs ADR & out-of-scope consistency; ANG3.3.c ADR registry literal title sync; ANG3.3.d requirement→task existence) with per-check PASS/FAIL evidence.
- ANG3.4 — Architecture decisions recorded as ADRs when meaningful (signals vs RxJS boundary, service vs store, lazy-loading/route strategy, mock strategy, dependency additions).
- ANG3.5 — Feasibility validated before closeout: every Angular API used is stable in the project's Angular version (experimental APIs need recorded approval); API contracts typed; MSW mock plan defined; environment/build configurations identified.
- ANG3.6 — Naming and structure decisions follow `NamingConventions.md` (2025 file naming, feature-first structure).
- ANG3.7 — Accessibility and performance NFRs recorded (WCAG 2.2 AA target; bundle budgets; responsive breakpoints).

### ANG3.3 mandatory cross-check set

ANG3.3 is not satisfied by a grep-only sweep of prohibited terms. Evidence must be recorded per cross-check (a–d above), each with an explicit `PASS` or `FAIL` result and artifact references; the full verification procedure and evidence format are defined in `verification-overlay.md`.

---

## Phase 4 — Tasks (Angular)

- ANG4.1 — Phase 4 guideline files loaded; each task maps to an independently verifiable UI unit (component, service, route, mock, test) with requirement/design references.
- ANG4.2 — Each task identifies exact deliverable paths, data-access/mocks needed, and expected evidence (build/lint/test commands and outputs).
- ANG4.3 — Dependency order respected: models → data-access → state → components → routes → styles; no task depends on a later task.
- ANG4.4 — Irreversible/destructive changes (dependency upgrades, public API removals, route or component renames, storage contract changes) have migration + rollback plan before build.

---

## Phase 5 — Construction (Angular)

- ANG5.1 — The application builds with the configured Angular production build (`npm run build`).
- ANG5.2 — Mock data and API access are isolated behind typed data-access services.
- ANG5.3 — ESLint 0 errors (`npm run lint`) and Prettier clean (`npm run format:check`) — blocking.
- ANG5.4 — Task completion integrity: a task is marked done only when ALL its deliverables are built AND its unit tests pass; statuses consistent across `task-list.md`, `active.yml` and build log.
- ANG5.5 — No stubs, placeholders, TODOs or commented-out code in delivered scope; no `any`, `@ts-ignore` or `eslint-disable` without a recorded justification.
- ANG5.6 — Bundle budgets respected; bundle sizes recorded in the build log; no critical build warnings left unexplained.
- ANG5.7 — Build-log evidence is reproducible: commands + outputs recorded (build, lint, tests, bundle sizes), source under version control, lockfile consistent with dependencies.

---

## Phase 6 — Verification (Angular)

- ANG6.1 — Implementation traceable to the approved design and task list; typecheck/lint clean with recorded evidence; no known blocking static issues.
- ANG6.2 — Responsive smoke verification covers desktop and mobile layouts (recorded viewports).
- ANG6.3 — Accessibility smoke on main flows: keyboard navigation + automated check (e.g. axe), no critical/serious issues unresolved.
- ANG6.4 — Smoke executed against the built artifact (`dist/` served), console free of errors.
- ANG6.5 — Environment isolation verified: no mocks in production build; no real endpoints in dev/mock mode.

---

## Phase 7 — Testing (Angular)

- ANG7.1 — Tests cover positive, negative and boundary behavior for the main feature flows.
- ANG7.2 — `npm test` completes without failures.
- ANG7.3 — Coverage ≥ 75% global; ≥85% for critical data-access/state files; coverage report recorded as evidence.
- ANG7.4 — Behavioral assertions (no snapshot-only tests); MSW used for all HTTP in tests (no real network); loading/error/empty states covered.
- ANG7.5 — Deterministic tests: no arbitrary sleeps/timeouts; `await fixture.whenStable()`, fake timers or explicit event-driven waits used instead.

---

## Phase 8 — Commit & PR (Angular)

- ANG8.1 — PR includes evidence links (build log, verification report, test report).
- ANG8.2 — PR checks green: build + lint + tests; no secrets; lockfile/dependency changes reviewed explicitly.
- ANG8.3 — Conventional commits with the frozen scopes.

---

## Phase 9 — Release (Angular)

- ANG9.1 — Release follows `release-pipeline.yml`; the released artifact is the CI-built `dist/` for the target configuration (validated in pre for production; never rebuilt locally).
- ANG9.2 — Production: release manager approval + rollback plan (previous artifact re-deploy) + post-deploy smoke recorded.
- ANG9.3 — Release notes record build id/hash, environment, validation results, smoke results, and rollback reference.

---

## Evidence Requirements (mandatory)

Evidence must be recorded in:

- Build: `work-item/[project-slug]/05-build/build-log.md`
- Verification: `work-item/[project-slug]/06-verification/verification-report.md`
- Testing: `work-item/[project-slug]/07-testing/test-report.md`
- Release: `work-item/[project-slug]/09-release/release-notes.md`
- Retrospective: `work-item/[project-slug]/10-archive/retrospective.md`

For Phase 2 and Phase 3 gates, evidence may also be recorded directly in the active Phase 2/3 artifact set when no build or verification artifact exists yet, provided the evidence is explicit and reviewable.

At minimum, evidence includes:

- command(s) executed — `npm run build`, `npm test`, `npm test -- --coverage`, `npm run lint`, `npm run format:check` — or equivalent deterministic inspection method
- timestamp (or date)
- artifact scope reviewed
- pass/fail result per required check
- evidence summary and remediation notes (if applicable)

If evidence is missing, treat as **[BLOCKER]** and do not advance the phase.
