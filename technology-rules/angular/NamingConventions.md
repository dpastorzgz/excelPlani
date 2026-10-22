# Naming Conventions

Naming rules for Angular Pelayo frontends covering files, TypeScript symbols, component APIs,
templates, styles, tests, mocks, routes and Git history. Consistent names keep features
discoverable for humans and AI agents working through the Axet phases.

## General Rules

- All identifiers, comments and test names are English; Spanish appears only in visible UI
  strings (e.g. `"Guardar cambios"`).
- Descriptive, self-documenting names — full words over abbreviations (`customer`, not `cust`).
- kebab-case for every file and folder name (Angular 2025 style guide, v20+ CLI defaults).
- One concept per file; the file name describes the concept, never a generic role bucket.
- Feature-first structure: everything for a feature lives under `features/<feature>/`, never in
  type-based folders such as `components/` or `services/`.

## File Naming

| Artifact | File name | Symbol / notes |
| --- | --- | --- |
| Component | `customer-card.ts` (+ `customer-card.html`, `customer-card.scss`) | class `CustomerCard`; NO type suffix in the file name |
| Component test | `customer-card.spec.ts` | co-located next to the code under test |
| Data-access service | `customer-api.ts` | class `CustomerApi`; no `.service` suffix |
| Feature store | `customer-store.ts` | class `CustomerStore`; no `.service` suffix |
| Functional guard | `authenticated-guard.ts` | const `authenticatedGuard` |
| HTTP interceptor | `error-interceptor.ts` | const `errorInterceptor` |
| Pipe | `truncate-pipe.ts` | class `TruncatePipe` |
| Resolver | `customer-resolver.ts` | const `customerResolver` |
| Feature routes | `customer-routes.ts` | const `customerRoutes` |
| Model / interface | `customer.ts` | interface `Customer`; inside the feature folder |
| MSW handlers | `src/mocks/handlers/customer-handlers.ts` | one handler file per feature resource |
| Global SCSS partial | `_tokens.scss`, `_typography.scss` | underscore prefix for non-component partials |
| App shell | `app.ts`, `app.html`, `app.scss`, `app-routes.ts`, `app.config.ts` | root symbols `App`, `appRoutes`, `appConfig` |

The separator before the role word is a **dash**, not a dot: `authenticated-guard.ts`,
`error-interceptor.ts`, `truncate-pipe.ts`, `customer-resolver.ts`, `customer-routes.ts`.
Template and style files share the component base name: `customer-card.html`,
`customer-card.scss`.

## TypeScript Symbols

| Symbol kind | Convention | Example |
| --- | --- | --- |
| Class | PascalCase, descriptive | `CustomerCard`, `CustomerApi`, `CustomerStore`, `TruncatePipe` |
| Interface / type alias | PascalCase, no `I` prefix | `Customer`, `CustomerDto`, `ApiError` |
| Signal | camelCase, NO `$` suffix | `customers`, `selectedCustomer`, `isLoading` |
| Observable | camelCase WITH `$` suffix | `customers$`, `saveResult$` |
| Boolean | `is` / `has` / `can` prefix | `isLoading`, `hasError`, `canEdit` |
| Constant | UPPER_SNAKE_CASE | `DEFAULT_PAGE_SIZE`, `MAX_RETRY_ATTEMPTS` |
| Method | camelCase verb phrase | `loadCustomer()`, `saveCustomer()` |
| Generic | `<T>` for a single type, descriptive `<TResult>` when ambiguity hurts | `Resource<T>` |

- Do not create TypeScript `enum`s — use union types over string literals
  (`type CustomerStatus = 'active' | 'inactive'`) or `as const` maps.
- Reserve `$` strictly for Observables; never suffix a signal with `$`.

## Component API

- Selectors use the frozen `pelayo-` prefix: `selector: 'pelayo-customer-card'`. The prefix is
  configured once in `angular.json` (`prefix: "pelayo"`) — never override it per component.
- Inputs carry no prefix or alias; the signal name is the public API name:

```ts
readonly customer = input.required<Customer>();
readonly compact = input(false);
```

- Outputs carry no `on` prefix and describe what happened:

```ts
readonly saved = output<void>();
readonly customerSelected = output<Customer>();
```

- Two-way values use `model()`:

```ts
readonly selected = model(false);
```

- Mark `input()`, `output()` and `model()` fields `readonly`.
- Members referenced only from the template are `protected`; templates never touch `private`
  members.

```ts
protected readonly isExpanded = signal(false);
```

- Signal queries name the element they target, not a generic `el`:
  `protected readonly customerForm = viewChild.required('customerForm');`

## Templates

- Event handlers are named for what they do, never for the trigger:
  `(click)="saveCustomer()"` — not `onSave()`, `onClick()` or `handleClick()`.
- Output bindings use the bare output name: `(saved)`, never `(onSaved)`.
- Template expressions reference `protected` members only; heavy derivations use `computed()`
  (see `ComponentGuidelines.md`).

## SCSS

- BEM-light naming: `block__element--modifier`. Blocks match the component name; nesting stays
  shallow.

```scss
.customer-card {
  &__title { /* ... */ }
  &__title--muted { /* ... */ }
}
```

- Component styles live next to the component (`customer-list.scss`) and stay encapsulated.
- Global partials live under `src/styles/` with a leading underscore: `_tokens.scss`,
  `_typography.scss`. Full theming rules live in `StylingGuidelines.md`.

## Tests

- Spec files are co-located: `customer-card.spec.ts` next to `customer-card.ts`.
- `describe` blocks use the class name under test; test names are English and follow the
  **`should ... when ...`** pattern:

```ts
describe('CustomerCard', () => {
  it('should render the customer name when data is provided', () => { /* ... */ });
  it('should emit saved when the form is valid', () => { /* ... */ });
});
```

- Fixture variables are descriptive English nouns (`customer`, `errorResponse`), never `foo`.
- Waiting is deterministic: `await fixture.whenStable()` — no sleeps (see
  `TestingGuidelines.md`).

## MSW Handlers

- One handler file per feature resource: `src/mocks/handlers/customer-handlers.ts`.
- Exported handler arrays are named after the resource (`customerHandlers`) and registered in
  `src/mocks/browser.ts` and `src/mocks/server.ts`.
- Handlers and fixtures use synthetic data only — never production customer data.

## Routes

- One route file per feature: `customer-routes.ts`, exporting `customerRoutes: Routes`.
- Feature routes are lazy-loaded via `loadChildren` with a dynamic import; never static-import
  a feature route file into `app-routes.ts`:

```ts
{
  path: 'customers',
  loadChildren: () => import('./features/customer/customer-routes').then(m => m.customerRoutes),
}
```

- Route `path` segments are lowercase kebab-case; deeper routing rules live in
  `RoutingGuidelines.md`.

## Git

- Branch names: `feature/<short-kebab-description>` (e.g. `feature/customer-list`).
- Conventional commits with the frozen scopes: `ui`, `state`, `data`, `forms`, `routes`,
  `styles`, `a11y`, `perf`, `test`, `mocks`, `build`, `deps`, `ci`.

```
feat(ui): add customer card with status badge
fix(data): map 404 responses to a typed not-found error
test(mocks): add deterministic MSW handlers for the customer list
```

- Commit messages are English; code identifiers inside them stay English too.
