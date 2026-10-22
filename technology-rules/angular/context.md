# Technology Context — Angular

> Background knowledge an agent needs before starting any task on Angular Pelayo frontends.
> This file explains the platform only; rules live in `rules.md` and the domain guideline files.

## What is Angular 21?

Angular 21 is a TypeScript-first framework for building single-page browser applications,
maintained by Google. The 21.x line is standalone-first: components, directives and pipes no
longer require NgModules, reactivity is signal-based, and Angular Material 21 + CDK 21 provide
the UI foundation. Pelayo uses it for CRM/MDM frontends (customers, contracts, alarms) built
through the Axet phases.

## Core Concepts

1. **Standalone components** — every new component, directive and pipe declares its own
   `imports`; NgModules are not part of new code.
2. **Signals** — `signal()` holds reactive state, `computed()` derives it, `effect()` runs side
   effects. This is the default state model; RxJS is kept for async event streams.
3. **Dependency injection with `inject()`** — dependencies are resolved through `inject()` in
   field initializers; constructor injection is not used.
4. **Signal-based component API** — `input()`, `output()`, `model()` and signal queries
   (`viewChild`, `contentChild`) replace decorator-based inputs/outputs.
5. **Native control flow** — the `@if` / `@for` / `@switch` block syntax replaces
   `*ngIf` / `*ngFor` / `*ngSwitch`; `@for` requires `track`.
6. **Change detection & zoneless** — `ChangeDetectionStrategy.OnPush` is standard; Angular 21
   new applications are zoneless by default, and this project may still carry zone.js. Nothing
   may rely on zone.js patching or on `markForCheck()` hacks; tests wait with
   `await fixture.whenStable()` instead of arbitrary sleeps.
7. **Angular Material theming** — Material 21 uses an M3 token-based theme system
   (`mat.theme`); customization goes through tokens, not internal selectors.
8. **Vitest** — Angular 21 ships Vitest as the CLI default and stable unit-test runner
   (`@angular/build:unit-test`); this project pins Vitest 4.x with jsdom.
9. **MSW (Mock Service Worker)** — 2.x intercepts HTTP for development (`setupWorker`) and for
   tests (`setupServer`); the first iteration of a project has no real backend.

## Platform / Environment

| Property | Value |
| --- | --- |
| Runtime environment | Web browser (client-side single-page application) |
| Execution model | Standalone component tree with signal-driven change detection (zoneless direction; zone.js may still be present) |
| Build system | Angular CLI 21 (`@angular/build`); production configuration by default |
| Deployment unit | Static `dist/` artifact built in CI, promoted `dev → acp → pre → production` |
| Unit test runner | Vitest 4.x + jsdom (`npm test`) |
| HTTP mocking | MSW 2.x — `setupWorker` in dev, `setupServer` in tests |

## Key Constraints and Limitations

- **Bundle budgets**: the `angular.json` budgets (initial bundle + component styles) are a
  blocking gate (`ANG5.6`); measured sizes are recorded in the build log.
- **Browser support**: evergreen modern browsers only (current Chrome, Edge, Firefox, Safari);
  no legacy-browser or polyfill paths.
- **No SSR**: the application is a client-rendered SPA today; nothing may assume server-side
  rendering APIs.
- **Accessibility**: WCAG 2.2 AA target for all main flows (enforced per
  `AccessibilityGuidelines.md`).
- **Coverage**: 75% global minimum; ≥85% for critical data-access/state files (`ANG7.3`).
- **Experimental APIs**: Signal Forms (`@angular/forms/signals`) are experimental in v21 and
  not used by default; `resource()`/`httpResource` only where stable in the project's version;
  Angular Aria is developer preview — opt-in with approval, never a requirement.
- **Environments**: frozen pipeline `dev → acp → pre → production`; the production artifact is
  promoted, never rebuilt; mocks never ship in a production build.
- **Lint/format**: `npm run lint` (ESLint, 0 errors) and `npm run format:check` (Prettier) are
  blocking gates (`ANG5.3`).

## Common Pitfalls

- ❌ **Relying on zone.js** — change detection must work from signals alone; `markForCheck()`
  and patching assumptions break under zoneless.
- ❌ **Unmanaged subscriptions** — every `subscribe()` needs `takeUntilDestroyed` (or the async
  pipe), otherwise the subscription outlives the component.
- ❌ **Writing signals inside `computed()`** — `computed` is pure derivation; writes belong in
  event handlers, methods or `effect()`.
- ❌ **Function calls in templates** — they re-execute on every render; derive values with
  `computed()`.
- ❌ **`@for` without `track`** — forces full DOM rebuilds and causes identity bugs.
- ❌ **Mutating signal values in place** — `items().push(x)` does not notify consumers; always
  set new arrays/objects.
- ❌ **Barrel overuse** — cross-feature `index.ts` re-exports create cycles and defeat lazy
  loading.
- ❌ **`any` as an escape hatch** — it disables the strictness the stack depends on; use
  `unknown` + narrowing or a typed model.
- ❌ **Over-customizing Material** — `::ng-deep`, internal DOM selectors and private token
  overrides make upgrades fragile; style through public theme tokens.
- ❌ **Testing implementation details** — assert user-visible behavior and public APIs, never
  private methods, internal signals or class shape.

## Integration Points

- **Inbound**: none — the SPA is served to users in the browser and exposes no API surface.
- **Outbound**: REST over `HttpClient` behind typed data-access services; functional
  interceptors handle auth headers, error normalization and correlation ids (see
  `DataAccessGuidelines.md`).
- **Authentication**: token attachment is a strategy placeholder in the current platform; the
  storage policy and security rules live in `SecurityGuidelines.md`.
- **Backend absence**: while no real backend exists, MSW answers dev and test requests; a
  future BFF can replace the base URL without touching feature code.
- **Configuration**: base URLs come from environment/runtime configuration; environment files
  are public and never hold secrets.

## Toolchain Overview

| Tool | Purpose | When to use |
| --- | --- | --- |
| Node.js ≥ 22 | Runtime for all tooling | Local development and CI |
| Angular CLI 21 | Dev server, builds, scaffolding | `npm start`, `npm run build` / `build:dev` / `build:acp` / `build:pre` |
| TypeScript 5.9 (strict) | Language | Always |
| Vitest 4.x + jsdom | Unit tests | `npm test`; coverage with `npm test -- --coverage` |
| MSW 2.x | HTTP mocks | Dev (`npm start`) and tests |
| ESLint + angular-eslint + Prettier | Lint and format gates | `npm run lint`, `npm run format`, `npm run format:check` |
| Angular Material 21 + CDK 21 | UI components and behavior primitives | Feature UI |
| SCSS | Styling | Component styles and global partials |

## Glossary

| Term | Definition |
| --- | --- |
| **Standalone** | Component/directive/pipe that declares its own imports and needs no NgModule. |
| **Signal** | Writable reactive value (`signal()`); reading tracks dependencies, writing notifies consumers. |
| **Computed** | Read-only derived signal that recomputes lazily from its dependencies; must stay pure. |
| **Effect** | Runs a side effect when tracked signals change (storage, logging, DOM sync) — never for state derivation. |
| **linkedSignal** | Signal derived from a source that can be reset or written locally (e.g. selection synced to a list). |
| **resource** | Angular API for async reads exposing loading/error/value states; used only when stable in the project's version. |
| **Zoneless** | Change detection driven by signals and events without zone.js; the default direction for Angular 21 apps. |
| **MSW** | Mock Service Worker — intercepts HTTP at the network level for the browser (dev) and Node (tests). |
| **CVA** | `ControlValueAccessor` — bridge interface that lets a custom control work inside Angular forms. |
| **OnPush** | Change detection strategy that renders only on input changes, events or signal notifications; required on every component. |
| **Lazy route** | Route loaded on demand (`loadChildren`/`loadComponent`) to keep the initial bundle small. |
| **Budget** | `angular.json` size limit (initial bundle, component styles) enforced at build time. |
