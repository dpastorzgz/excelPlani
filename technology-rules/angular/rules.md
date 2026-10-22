# Technology Rules — Angular Pelayo

**Technology**: Angular 21 (standalone) + TypeScript 5.9 strict + Angular Material 21
**Applicable layers**: Components, State, Routing, Forms, Data-Access, Styling, Testing, Tooling
**Reference files**:

- `rules.md` — This file: baseline, phase rules, mandatory loading table
- `context.md` — Angular 21 background knowledge, core concepts, pitfalls, glossary
- `GeneralGuidelines.md` — Non-overlapping TypeScript and coding standards
- `NamingConventions.md` — Naming standards for files, symbols, templates, styles, tests, git
- `ProjectPlanning.md` — Estimation guidance for Angular features
- `ComponentGuidelines.md` — Standalone components, signal APIs, template rules
- `StateManagementGuidelines.md` — Signals-first state, stores, resources, RxJS interop
- `RxJSGuidelines.md` — Stream discipline, operator selection, subscription hygiene
- `FormsGuidelines.md` — Typed reactive forms, validators, error display
- `RoutingGuidelines.md` — Lazy loading, guards, resolvers, title strategy
- `DataAccessGuidelines.md` — Typed HTTP layer, interceptors, MSW mock strategy
- `StylingGuidelines.md` — SCSS architecture, Material theming, design tokens
- `AccessibilityGuidelines.md` — WCAG 2.2 AA, keyboard flows, focus, announcements
- `PerformanceGuidelines.md` — Budgets, `@defer`, lazy loading, runtime performance
- `TestingGuidelines.md` — Vitest 4, TestBed, MSW test patterns, coverage policy
- `SecurityGuidelines.md` — XSS, secrets, token handling, dependency hygiene
- `DeploymentGuidelines.md` — Build configurations, CI, environments, rollback
- `verification-overlay.md` — Build/test triage and the ANG3.3 design cross-checks
- `quality-gates.md` — Blocking Angular quality gates (`ANG*`)
- `quality-gates-extended.md` — Verbose acceptance criteria per gate (loaded on demand only)
- `release-pipeline.yml` — Environment pipeline, hops, approvals, rollback, evidence
- `templates/build-log-angular.md` — Build-log template for Angular work-items
- `templates/test-report-angular.md` — Test-report template for Angular work-items
- `skills/angular-material-prototype/skill.md` — Phase 2 Angular Material prototype skill

---

## Overview

These rules govern any work-item whose frontend technology is Angular Pelayo.
For `new-feature` work, Phase 1 remains technology-agnostic and Phase 2 remains
implementation-agnostic, with the Angular Material prototype exception defined
below. Blocking quality gates use `ANG` IDs and live in `quality-gates.md`.

---

## Authoritative Baseline

This file is the single baseline for Angular context and general standards.
Specialized rules live in the guideline files listed above; this file routes to
them and must not duplicate them.

### Role & Mission

Act as a Senior Angular Developer and Architect. Deliver production-grade,
accessible, testable frontends that follow the specialized guideline files in
this directory: everything must build, pass tests, respect bundle budgets, and
meet WCAG 2.2 AA expectations for the flows it implements.

### Feature Track Technology Boundary

For `new-feature` work:

- Phase 1 is technology-agnostic. Do not introduce Angular implementation
  choices in the proposal.
- Phase 2 is implementation-agnostic: no components, services, stores, routes,
  files, Angular APIs, RxJS design, MSW handlers, or build/deployment strategy.
- Angular may be used in Phase 2 only for the Angular Material prototype
  exception (UX validation). The prototype must not become the source of truth
  for implementation names or structure; implementation decisions start in
  Phase 3.
- Phases 3 through 9 must load the Angular guideline files listed in the
  loading table before producing design, tasks, code, tests, or release steps.

### Reference-First Development

Before producing Angular design, tasks, code, tests, or deployment steps, load
this file plus the relevant specialized guideline:

- Components and templates: `ComponentGuidelines.md`
- State, signals, stores, resources: `StateManagementGuidelines.md`
- Streams and operators: `RxJSGuidelines.md`
- Forms and validation: `FormsGuidelines.md`
- Routing, guards, resolvers: `RoutingGuidelines.md`
- HTTP, interceptors, MSW mocks: `DataAccessGuidelines.md`
- Styling, Material theming, tokens: `StylingGuidelines.md`
- Accessibility: `AccessibilityGuidelines.md`
- Performance and budgets: `PerformanceGuidelines.md`
- Unit tests, coverage: `TestingGuidelines.md`
- Security: `SecurityGuidelines.md`
- Build, environments, release: `DeploymentGuidelines.md` and `release-pipeline.yml`
- Naming and structure: `NamingConventions.md`
- Estimation and sizing: `ProjectPlanning.md`

### Architecture Decision Process

Route decisions with these default rules:

- Local reactive state → signals inside the component (`signal()`, `computed()`).
- Shared feature state → signal-based store service (e.g. `CustomerStore`) with
  private writable signals, public readonly signals, and methods; `inject()`
  for DI. See `StateManagementGuidelines.md`.
- Async event streams and complex operator needs (debounce, retry, polling,
  cancellation) → RxJS; expose to templates via `toSignal` or the async pipe.
- Data fetching → typed data-access service behind `HttpClient`, or stable
  `resource()` / `httpResource` when available in the project's Angular
  version; otherwise RxJS + `toSignal`. See `DataAccessGuidelines.md`.
- Forms → typed reactive forms (default); template-driven only for trivial
  single-input cases. Signal Forms (`@angular/forms/signals`) are experimental
  and banned without recorded approval.
- UI primitives → Angular Material 21; CDK for custom behavior; Angular Aria is
  developer preview, opt-in with approval only, never a blocking requirement.
- Meaningful tradeoffs (signals vs RxJS boundary, service vs store,
  lazy-loading strategy, mock strategy, new dependencies) are recorded as ADRs
  in Phase 3.

### Core Standards

- Code identifiers, comments, and test names in English; visible UI text in
  Spanish.
- TypeScript strict (`strict: true`); explicit types on public APIs.
- Standalone components only — no NgModules in new code; `OnPush` on every
  component; `inject()` for DI — never constructor injection.
- Signal APIs for component I/O: `input()`, `output()`, `model()`, signal
  queries (`viewChild`, `contentChild`); no decorator `@Input`/`@Output` in
  new code.
- Native control flow only — `@if` / `@for` / `@switch`; never
  `*ngIf` / `*ngFor` / `*ngSwitch`.
- Feature-first structure (see Project Structure); no type-based directories inside features; tests co-located.
- Do not assume zone.js patching: no `markForCheck()` hacks, no zone-dependent
  logic; prefer signals.
- Component selector prefix: `pelayo-` (angular.json `prefix: "pelayo"`).
- Lint and format are blocking: `npm run lint` (ESLint, 0 errors) and
  `npm run format:check` (Prettier, clean); `npm run build` is a blocking gate.

```ts
// ❌ constructor injection, decorator input, function call in template
constructor(private readonly api: CustomerApi) {}
@Input() customer!: Customer;

// ✅ inject() + signal input; templates use @for with track
private readonly api = inject(CustomerApi);
readonly customer = input.required<Customer>();
```

### Security, Performance, Testing & Quality

Summarized here; the owning guideline has the detailed rules.

- Security (`SecurityGuidelines.md`): never use `innerHTML` or bypass
  sanitization (`bypassSecurityTrust*`) without a recorded security review;
  never store secrets or tokens in frontend code or committed environment files
  (Angular environment files are public); mocks and fixtures must never contain
  production customer data; dependency hygiene (lockfile enforced, `npm audit`
  reviewed).
- Performance (`PerformanceGuidelines.md`): OnPush everywhere, `@for` with
  `track`, lazy routes, `@defer` for heavy below-the-fold sections,
  `NgOptimizedImage` for images; bundle budgets in `angular.json` are set and
  respected (`ANG5.6`).
- Testing & Quality (`TestingGuidelines.md`): Vitest 4 + jsdom, `npm test`;
  coverage ≥ 75% global, ≥ 85% for critical data-access and state files;
  behavioral assertions only; MSW 2.x for all HTTP in tests; deterministic
  tests.

### Error Handling

- Use the typed error model from the data-access layer; components render
  loading, error, and empty states — never leave a flow without visible
  failure feedback.
- User-visible errors go through the shared feedback pattern; messages must not
  leak internals (stack traces, URLs, tokens).
- No `console.log` in delivered code.

### Deployment Readiness

- The production-optimized artifact validated in `pre` is promoted to `production` — same build id, never rebuilt by hand.
- Bundle budgets respected; smoke evidence recorded; rollback = re-deploy the previous artifact.

### Canonical Commands

| Purpose | Command |
| --- | --- |
| Dev server (MSW mocks) | `npm start` |
| Production build (default) | `npm run build` |
| Env builds | `npm run build:dev`, `npm run build:acp`, `npm run build:pre` |
| Unit tests | `npm test` |
| Coverage | `npm test -- --coverage` |
| Lint | `npm run lint` |
| Format check | `npm run format:check` |

---

## Context Loading (Mandatory)

Before starting any Angular technical task from Phase 3 onward, load this file,
`NamingConventions.md`, and the phase-specific guideline files listed below.
No Angular code, design, test, or deployment step may be produced without this baseline.

Phase 2 may load this file only for the Phase 2 section and `quality-gates.md`
for the `ANG2.x` gates. Do not load Angular implementation guidelines in
Phase 2.

---

## Mandatory Files to Load per Phase

| Phase | Files to Load |
| --- | --- |
| 1 — Proposal | none — proposal stays technology-agnostic |
| 2 — Specs | `rules.md` (Phase 2 section only), `quality-gates.md` (ANG2.x), `skills/angular-material-prototype/skill.md` only if offered/accepted |
| 3 — Design | `rules.md`, `quality-gates.md`, `NamingConventions.md`, `ProjectPlanning.md`, `context.md`, `GeneralGuidelines.md`, `ComponentGuidelines.md`, `StateManagementGuidelines.md`, `RxJSGuidelines.md`, `FormsGuidelines.md`, `RoutingGuidelines.md`, `DataAccessGuidelines.md`, `StylingGuidelines.md`, `AccessibilityGuidelines.md`, `PerformanceGuidelines.md`, `SecurityGuidelines.md`, `DeploymentGuidelines.md`, `verification-overlay.md` |
| 4 — Tasks | `rules.md`, `quality-gates.md`, `NamingConventions.md`, `ProjectPlanning.md`, `context.md`, `GeneralGuidelines.md`, `ComponentGuidelines.md`, `StateManagementGuidelines.md`, `RxJSGuidelines.md`, `FormsGuidelines.md`, `RoutingGuidelines.md`, `DataAccessGuidelines.md`, `StylingGuidelines.md`, `AccessibilityGuidelines.md`, `PerformanceGuidelines.md`, `SecurityGuidelines.md`, `DeploymentGuidelines.md` |
| 5 — Construction | All active guideline files in this directory (+ `verification-overlay.md`, `templates/build-log-angular.md`) |
| 6 — Verification | All active guideline files (+ `verification-overlay.md`) |
| 7 — Testing | `rules.md`, `quality-gates.md`, `NamingConventions.md`, `TestingGuidelines.md`, `DataAccessGuidelines.md`, `AccessibilityGuidelines.md`, `PerformanceGuidelines.md` (+ `templates/test-report-angular.md`) |
| 8 — Commit & PR | `rules.md`, `quality-gates.md`, `NamingConventions.md`, `SecurityGuidelines.md`, `DeploymentGuidelines.md` |
| 9 — Release | `rules.md`, `quality-gates.md`, `SecurityGuidelines.md`, `DeploymentGuidelines.md`, `release-pipeline.yml` |
| 10 — Archive | `rules.md` (archive section only) |

---

## Project Structure (Feature-First)

```
src/
  app/
    core/                      # singleton services: interceptors, guards, auth, config
    shared/                    # reusable cross-feature UI: components, directives, pipes
    features/
      customer/
        customer-routes.ts
        customer.ts            # models/interfaces for the feature
        customer-api.ts        # typed data access (HttpClient)
        customer-store.ts      # signal-based state (when needed)
        customer-list/         # component folder: .ts/.html/.scss/.spec.ts
        customer-detail/
    app.ts  app.html  app.scss
    app-routes.ts
    app.config.ts
  environments/
  mocks/                       # MSW: browser.ts, server.ts, handlers/
  styles/                      # global scss: _tokens, _typography, material theme
  main.ts
```

- Feature-first only: no type-based directories (`components/`, `services/`)
  inside features; tests are co-located (no central `tests/` folder).
- File naming (full rules in `NamingConventions.md`): kebab-case; component
  files carry no type suffix (`customer-card.ts` → class `CustomerCard`);
  services/stores carry no `.service` suffix (`customer-api.ts` →
  `CustomerApi`, `customer-store.ts` → `CustomerStore`).

---

## General Prohibitions

- ❌ Never use NgModules in new code — standalone components, directives, and pipes only
- ❌ Never use `*ngIf` / `*ngFor` / `*ngSwitch` — use `@if` / `@for` / `@switch`
- ❌ Never use constructor injection — use `inject()`
- ❌ Never use decorator-based `@Input` / `@Output` in new code — use `input()`, `output()`, `model()`
- ❌ Never rely on zone.js patching or add `markForCheck()` hacks — prefer signals and OnPush
- ❌ Never manipulate the DOM directly (`document`, `nativeElement`, `ElementRef`) without a recorded justification
- ❌ Never use `any` or `@ts-ignore` — no `eslint-disable` without a recorded justification
- ❌ Never hardcode API URLs or keep secrets/tokens in frontend code or committed environment files
- ❌ Never call a real backend in the first iteration — dev and tests use MSW mocks
- ❌ Never use production customer data in mocks or fixtures
- ❌ Never bind `innerHTML` or bypass sanitization without a recorded security review
- ❌ Never call `subscribe()` without teardown — use `takeUntilDestroyed`, the async pipe, or `toSignal`
- ❌ Never call functions or run expensive expressions in templates — use `computed()`
- ❌ Never write `@for` without `track`
- ❌ Never disable, weaken, or skip the lint/format gates (`npm run lint`, `npm run format:check`)
- ❌ Never commit generated artifacts (`dist/`, `coverage/`, caches)

- ✅ Prefer stable Angular APIs; experimental APIs (Signal Forms, Angular Aria) require recorded approval
- ✅ Prefer Angular/Material/CDK built-ins over new dependencies; new runtime dependencies require an ADR

---

## Scopes for Conventional Commits

Common scopes for Angular Pelayo projects:

| Scope | Use |
| --- | --- |
| `ui` | Components, directives, pipes |
| `state` | Signals, stores, state services |
| `data` | Data-access services, models, interceptors |
| `forms` | Reactive forms and validators |
| `routes` | Route definitions, guards, resolvers |
| `styles` | SCSS, design tokens, Material theming |
| `a11y` | Accessibility fixes and improvements |
| `perf` | Performance work (budgets, `@defer`, lazy loading) |
| `test` | Spec files and test infrastructure |
| `mocks` | MSW handlers, fixtures, mock environments |
| `build` | `angular.json`, build configs, npm scripts |
| `deps` | Dependency upgrades |
| `ci` | CI/CD pipelines and release configuration |

### Examples

```
feat(ui): add customer-card component with signal inputs
fix(state): prevent duplicate refresh in customer store
test(data): cover customer-api error mapping with MSW
chore(deps): upgrade Angular to 21.x patch release
```

---

## Coverage Threshold

- Global coverage: **≥ 75%** (statement/line) — gate `ANG7.3`
- Critical data-access and state files: **≥ 85%** — gate `ANG7.3`; critical
  files are identified in the Phase 3 design and confirmed by the Phase 7
  coverage report.
- Coverage must be **behavioral**: assert user-visible behavior; snapshot-only
  tests do not count toward the gate (`ANG7.4`).

---

## Phase 01 — Proposal (Angular Boundary)

For `new-feature` work, Phase 1 must remain technology-agnostic and high-level
(viability, risks, constraints). Do not decide or name components, directives,
pipes, services, stores, guards, resolvers, routes, files, Angular APIs, RxJS
design, MSW handlers, or build/deployment strategy. If Angular is already the
known target stack, record it only as a context assumption; Angular-specific
planning starts in Phase 3.

---

## Phase 02 — Specs (Angular Boundary)

Phase 2 remains implementation-agnostic (`ANG2.1`): the specs describe business
needs and user experience, but must not settle Angular implementation. No
component/service/store/guard/resolver/pipe/route names, file names or folder
structure, API internals, MSW handler design, or build/environment decisions.

Allowed Angular-specific exception (`ANG2.2`): an Angular Material prototype
may be generated to validate screens, interaction flow, labels, and user
journeys. It is UX validation only — not a source of truth, not part of the
deliverable app, with no names binding to the implementation. It lives in
`work-item/[project-slug]/02-specs/prototype/`, never inside `src/`, and is
never wired into app routes.

### Prototype offer (mandatory flow)

During **Phase 2**, after generating and presenting the **first draft** of
`work-item/[project-slug]/02-specs/specs.md`, ask the user:

> Angular project detected. Do you want me to generate an Angular Material
> prototype from these specs for UX validation (skill:
> `angular-material-prototype`)?

- If the user answers **yes**: load and apply
  `technology-rules/angular/skills/angular-material-prototype/skill.md`;
  generate/update the prototype from the latest `02-specs/specs.md`, keeping it
  implementation-agnostic (no component, service, store, route, file, or API
  names).
- If the user answers **no**: do not generate a prototype; continue the normal
  Phase 2 specs iteration and approval flow.

Record the user response in `02-specs/` notes before Phase 2 closeout
(`ANG2.3`).

### Prototype regeneration on demand (requirements changed)

If, at any time during Phase 2, the user requests prototype generation again
(e.g. requirements changed): confirm `02-specs/specs.md` reflects the latest
agreed requirements, re-run the `angular-material-prototype` skill with the
updated specs, and treat any previous prototype as outdated.

---

## Phase 03 — Design (Angular-Specific)

Phase 3 is the first phase where Angular implementation decisions are made.
Load the Phase 3 files listed in the loading table before producing the design
(`ANG3.1`).

The design must explicitly define:

- Architecture: components, services, stores, routes, and data-access
  responsibilities (see `ComponentGuidelines.md`,
  `StateManagementGuidelines.md`, `RoutingGuidelines.md`,
  `DataAccessGuidelines.md`).
- ADRs for meaningful decisions (`ANG3.4`): signals vs RxJS boundary, service
  vs store, lazy-loading/route strategy, mock strategy, dependency additions.
- A Spec vs Design deviations register: every source-spec requirement left
  deferred, optional, conditional, or rejected (`ANG3.2`).
- Naming and structure decisions per `NamingConventions.md` (`ANG3.6`).
- Accessibility and performance NFRs (`ANG3.7`): WCAG 2.2 AA target, bundle
  budgets, responsive breakpoints (< 600 mobile, 600–1024 tablet, > 1024
  desktop).
- Mock and data-access plan: typed API contracts (DTO vs view-model), MSW
  handlers per resource, `useMocks` strategy, environment/build configurations
  (`ANG3.5`).

### Feasibility Validation (mandatory)

Before Phase 3 closeout, validate instead of assuming:

- Every Angular API used is stable in the project's Angular version;
  experimental APIs (Signal Forms, Angular Aria) require recorded approval.
- API contracts are typed; environment and build configurations are
  identified.
- The MSW mock plan covers every endpoint used in the first iteration.

### Design Self-Consistency Cross-Checks (mandatory)

Execute the `ANG3.3` cross-check set exactly as defined in
`verification-overlay.md` (section B), recording per-check `PASS`/`FAIL`
evidence: `ANG3.3.a` component-diagram ↔ inventory; `ANG3.3.b`
component/service vs ADR & out-of-scope consistency; `ANG3.3.c` ADR registry
literal title sync; `ANG3.3.d` requirement → task existence reconciliation.

### Phase 3 Closeout Rules

Resolve every risky or unknown item in Phase 3 or record it as an open question
with an approved deferral (target phase included). Phase 3 cannot close with
unresolved Angular feasibility risk.

---

## Phase 04 — Tasks (Angular-Specific)

Load the Phase 4 files listed in the loading table before producing tasks
(`ANG4.1`). Decompose work by independently verifiable UI unit — component,
service, route, mock, or test — with requirement and design references
(`ANG4.1`). Each task must include:

- Related requirement(s) and design component(s).
- Exact deliverable paths under `src/` (component folder, service, route file,
  MSW handler, spec file).
- Models, data-access, and mocks needed for the task.
- Dependency layer: models → data-access → state → components → routes → styles.
- Expected evidence: build/lint/test commands and outputs (`ANG4.2`).

Rules:

- No task may depend on a later task (`ANG4.3`).
- Irreversible/destructive changes (dependency upgrades, public API removals,
  route or component renames, storage contract changes) require a migration +
  rollback plan before build starts (`ANG4.4`).
- No task with pending design decisions — return to Phase 3 or record an
  approved deferral.

---

## Phase 05 — Construction (Angular-Specific)

### Code Location

All application code generated during Phase 5 must be placed in the root-level
`src/` directory, following the Project Structure above.

> ❌ Do NOT create an `src/` folder inside `work-item/[project-slug]/05-build/`.
> ✅ Write code directly to `src/app/...` at the repository root.
> The `05-build/` folder is reserved for the `build-log.md` artifact only.

### Artifact

`work-item/[project-slug]/05-build/build-log.md` — use
`templates/build-log-angular.md`. It records, per task and per build: commands,
results, bundle sizes (initial + component), test totals, coverage, lint/format
results, blockers and resolutions.

### Per-Task Build Loop (mandatory)

For each task in `04-tasks/task-list.md`, complete this loop before the next
task begins:

1. Implement the task deliverables at their exact paths.
2. `npm run build` — production configuration, 0 errors (`ANG5.1`).
3. Run the task's unit tests — all pass.
4. `npm run lint` — 0 errors (`ANG5.3`).
5. `npm run format:check` — clean (`ANG5.3`).
6. Update the build log (task id, files, commands, results, bundle sizes) (`ANG5.7`).
7. Mark the task done only when ALL deliverables are built AND its tests pass (`ANG5.4`).

Failure at any step is a **[BLOCKER]**: fix it before starting the next task;
do not batch failures to the end of the phase.

Construction rules for the delivered scope:

- Mock data and API access stay isolated behind typed data-access services (`ANG5.2`).
- No stubs, placeholders, TODOs, or commented-out code; no `any`,
  `@ts-ignore`, or `eslint-disable` without recorded justification (`ANG5.5`).
- Bundle budgets respected; sizes recorded in the build log (`ANG5.6`).
- Statuses consistent across `task-list.md`, `active.yml`, and the build log (`ANG5.4`).

### Phase 5 Completion Checklist (Angular)

- [ ] All tasks marked done; statuses consistent across `task-list.md`,
      `active.yml`, and the build log (`ANG5.4`)
- [ ] `npm run build` green — production configuration, 0 errors (`ANG5.1`)
- [ ] `npm run lint` 0 errors and `npm run format:check` clean (`ANG5.3`)
- [ ] Mock data and API access isolated behind typed data-access services (`ANG5.2`)
- [ ] No stubs, TODOs, commented-out code, `any`, `@ts-ignore`, or unjustified
      `eslint-disable` (`ANG5.5`)
- [ ] Bundle budgets respected; bundle sizes recorded in the build log (`ANG5.6`)
- [ ] Build log reproducible: commands + outputs recorded; source under version
      control; lockfile consistent with dependencies (`ANG5.7`)
- [ ] Naming and structure follow `NamingConventions.md`

---

## Phase 06 — Verification (Angular-Specific)

Compare the implementation against `03-design/design.md` and
`04-tasks/task-list.md`. Load `verification-overlay.md`: use section A for
root-cause-first triage of build/test/lint results, and section A.5 build-claim
verification before accepting any "green" claim.

### Mandatory Checks

- Typecheck/lint clean with recorded evidence; no known blocking static issues (`ANG6.1`).
- Responsive smoke covers desktop and mobile layouts; record the viewports (`ANG6.2`).
- Accessibility smoke on main flows: keyboard-only pass plus an automated check
  (e.g. axe); no critical/serious issues unresolved (`ANG6.3`).
- Smoke runs against the built artifact (serve `dist/`); console free of
  errors (`ANG6.4`).
- Environment isolation: no mocks in the production build; no real endpoints
  in dev/mock mode (`ANG6.5`).

Any failure is a **[BLOCKER]**: return to Phase 5 to fix before continuing.

### Artifact

```
work-item/[project-slug]/06-verification/verification-report.md
```

---

## Phase 07 — Testing (Angular-Specific)

```bash
npm test                    # Vitest 4 + jsdom unit tests (ANG7.2)
npm test -- --coverage      # coverage report (ANG7.3)
```

### Testing Rules

- Cover positive, negative, and boundary behavior for the main feature flows (`ANG7.1`).
- Behavioral assertions only — no snapshot-only tests; assert user-visible
  behavior (`ANG7.4`).
- MSW (`setupServer`) handles all HTTP in tests — no real network (`ANG7.4`).
- Loading, error, and empty states covered (`ANG7.4`).
- Deterministic tests: no arbitrary sleeps/timeouts; use
  `await fixture.whenStable()`, fake timers, or event-driven waits (`ANG7.5`).
- Coverage ≥ 75% global; ≥ 85% for critical data-access/state files; the
  coverage report is recorded as evidence (`ANG7.3`).

See `TestingGuidelines.md` for TestBed patterns, signal testing, and MSW
lifecycle.

### Artifact

```
work-item/[project-slug]/07-testing/test-report.md
```

Use `templates/test-report-angular.md`.

---

## Phase 08 — Commit & PR (Angular-Specific)

- Evidence links in the PR (`ANG8.1`): `work-item/[project-slug]/05-build/build-log.md`,
  `work-item/[project-slug]/06-verification/verification-report.md`,
  `work-item/[project-slug]/07-testing/test-report.md`.
- PR checks green: build + lint (`npm run lint`, `npm run format:check`) +
  tests; no secrets; lockfile/dependency changes reviewed explicitly (`ANG8.2`).
- Conventional commits with the frozen scopes; branch pattern `feature/*` (`ANG8.3`).

If a PR reveals an issue considered a **[BLOCKER]** by the Phase 6 quality
checks, return to Phase 5 to fix it before proceeding.

---

## Phase 09 — Release (Angular-Specific)

Release follows `technology-rules/angular/release-pipeline.yml`: environments
`dev → acp → pre → production`; released artifact = CI-built `dist/` for the
target configuration (build id = commit SHA). Production receives the artifact
validated in `pre` — same build id, never rebuilt locally (`ANG9.1`).

### Pipeline Hops

| Hop | Validation before deploy | Approval |
| --- | --- | --- |
| dev → acp | development-config build + lint + tests | none (automatic) |
| acp → pre | production-config build + full test suite + smoke checklist | QA sign-off |
| pre → production | release-manager approval + rollback plan + post-deploy smoke | release manager |

- All hops: validate before deploy — never deploy an unvalidated artifact.
- Production approval and a rollback plan are mandatory (`ANG9.2`).
- Rollback = re-deploy the previous artifact (previous build id); the frontend
  is stateless — keep the last N builds per the pipeline definition.
- `release-notes.md` records build id/hash, environment, validation results,
  smoke results, and the rollback reference (`ANG9.3`).

### Artifact

```
work-item/[project-slug]/09-release/release-notes.md
```

---

## Phase 10 — Archive (Angular-Specific)

Preserve the following for audit and future maintenance (all under
`work-item/[project-slug]/`):

- `05-build/build-log.md` as built (bundle sizes, command evidence)
- `06-verification/verification-report.md`
- `07-testing/test-report.md` and the coverage report
- `09-release/release-notes.md` (artifact reference and rollback reference)
- Final `04-tasks/task-list.md` and design ADRs that impacted implementation
  (signals vs RxJS, store design, route strategy, dependency additions)
- `10-archive/retrospective.md`

---

## Required Tools and Versions

| Tool | Version | Purpose |
| --- | --- | --- |
| Node.js | ≥ 22 | Runtime for CLI, build, and tests |
| Angular CLI | 21.x | Workspace, dev server, builds |
| TypeScript | 5.9 (strict) | Application language |
| Angular Material + CDK | 21.x | UI primitives and behavior |
| Vitest | 4.x (+ jsdom) | Unit test runner |
| MSW | 2.x | Dev mocks and test HTTP interception |
| ESLint (angular-eslint) + Prettier | Current stable | Lint and format gates |
| SCSS | — | Application styling |

Project setup requirement: since lint and format check are blocking gates
(`ANG5.3`), every consuming project must provide `eslint.config.js` (flat
config), the matching devDependencies, and the scripts `lint`, `format`,
`format:check`. See `GeneralGuidelines.md` and `DeploymentGuidelines.md`.

---

## External References

- Angular documentation: https://angular.dev
- Angular style guide: https://angular.dev/style-guide
- Angular Material: https://material.angular.dev
- Vitest: https://vitest.dev
- MSW: https://mswjs.io
- ESLint: https://eslint.org
