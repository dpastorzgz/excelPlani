# General Guidelines — Angular

Cross-cutting coding standards for every Angular Pelayo file: language rules, organization,
error handling baseline, dependency policy and the tooling prerequisites that gate Phase 5.
Domain rules live in their dedicated guideline files (cross-referenced below), never duplicated
here.

## TypeScript Standards

- `strict: true` everywhere — never relax it per file or per project.
- Public API surfaces (component inputs/outputs, service methods, exported functions) carry
  explicit types; inference is fine only inside implementation bodies.
- Mark injected dependencies, reference data and signal fields `readonly`.
- Prefer immutable updates: build new objects and arrays (`{ ...customer, name }`,
  `[...items, item]`) instead of mutating in place.
- No `enum` — use union types of string literals (`type CustomerStatus = 'active' | 'inactive'`)
  or `as const` maps.
- Prefer `type` over `interface` unless declaration merging is genuinely needed (e.g.
  augmenting third-party types).
- Model state variants as discriminated unions so every branch narrows exhaustively:

```ts
type LoadState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: ApiError }
  | { status: 'success'; data: T };
```

- No `any`, no `@ts-ignore`; use `unknown` + narrowing, or record a justification (ANG5.5).

## Code Organization

- One concept per file: one component, service, guard, pipe or model group.
- Feature-first folders; no type-based directories inside features (`components/`, `services/`)
  — see the structure in `rules.md`.
- Barrels (`index.ts`) are allowed only inside `shared/` to define its public API; never
  re-export across features. Import directly from the file that owns the symbol.
- Move code to `shared/` only after a second real consumer exists — no speculative abstraction.

## Error Handling Baseline

- Data access normalizes every HTTP failure into the typed `ApiError` model; mapping rules live
  in `DataAccessGuidelines.md`. Never invent ad-hoc error shapes per feature.
- User-visible failures surface through the shared feedback pattern (banner/snackbar plus inline
  form errors) — never `alert()` and never a silent catch.
- Never swallow errors: handle, map, or rethrow with context. Empty `catch` blocks are
  forbidden.
- `console.log` and `debugger` never ship in delivered code (see `rules.md` prohibitions).

## Dependency Policy

- No new runtime dependency without a recorded ADR (`ANG3.4` in `quality-gates.md`).
- Prefer built-ins first: Angular core, Angular Material 21, CDK and RxJS cover most needs; a
  dependency is justified only when these do not.
- Dev-only tooling additions must not leak into the production bundle.
- Versions are pinned through the lockfile and kept consistent with declared dependencies;
  dependency upgrades follow the migration/rollback rule (`ANG4.4`).

## Tooling Prerequisites (Blocking)

Lint and format are blocking gates (`ANG5.3`). Every Angular project MUST provide, before
Phase 5:

| Requirement | Detail |
| --- | --- |
| `eslint.config.js` | ESLint flat config wired with `angular-eslint` and Prettier compatibility |
| devDependencies | `eslint`, `angular-eslint`, `prettier` (+ required plugins), installed and locked |
| `package.json` scripts | `lint`, `format` and `format:check` with the exact frozen names |
| CI wiring | `npm run lint` and `npm run format:check` run before the build step |

- Canonical commands: `npm run lint` (0 errors), `npm run format` (write), `npm run
  format:check` (verify). A project missing these scripts cannot pass Phase 5.
- The full setup procedure (dependencies, config content, CI steps) lives in
  `DeploymentGuidelines.md`.

## Forbidden Patterns

❌ NgModules in new code — standalone is the only component model.
❌ `*ngIf` / `*ngFor` / `*ngSwitch` — use native `@if` / `@for` / `@switch` (see `ComponentGuidelines.md`).
❌ Constructor injection — use `inject()` (see `StateManagementGuidelines.md`).
❌ Decorator `@Input()` / `@Output()` in new code — use `input()`, `output()`, `model()`.
❌ `any`, `@ts-ignore`, `eslint-disable` without a recorded justification (ANG5.5).
❌ Zone.js-dependent logic or manual `markForCheck()` hacks.
❌ Direct DOM access (`document`, `nativeElement`) without justification.
❌ Function calls in templates for derived data — use `computed()`.
❌ Cross-feature barrels and wildcard re-exports.
❌ Hardcoded API URLs, secrets or tokens in source or environment files.
❌ Real backend calls in the first iteration; production customer data in fixtures or mocks.
❌ Committing generated artifacts (`dist/`, coverage output).
