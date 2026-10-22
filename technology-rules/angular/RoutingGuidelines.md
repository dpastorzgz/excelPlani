# Routing Guidelines

Routing defines how users reach features and how URL state is modeled. Every feature is
lazy-loaded, route state is typed and signal-based, and guards/resolvers stay thin — data
loading belongs to data-access plus component loading/error states.

## Lazy Loading by Default

- Every feature route is lazy: `loadChildren` for a feature route file, `loadComponent` for a
  single standalone component. Eager loading is reserved for the app shell.
- One `*-routes.ts` file per feature (`customer-routes.ts`), exporting a typed `Routes` array.
  Never declare feature routes inside `app-routes.ts`.

✅ GOOD — shell routes stay tiny; features load on demand:

```ts
// app-routes.ts
export const appRoutes: Routes = [
  {
    path: 'customers',
    loadChildren: () => import('./features/customer/customer-routes').then((m) => m.customerRoutes),
  },
  { path: '', redirectTo: 'customers', pathMatch: 'full' },
  { path: '**', component: NotFound },
];
```

```ts
// customer-routes.ts
export const customerRoutes: Routes = [
  { path: '', component: CustomerList, title: 'Clientes' },
  { path: ':customerId', component: CustomerDetail, title: 'Detalle del cliente' },
];
```

❌ BAD — importing every feature component eagerly into `app-routes.ts`; using
`RouterModule.forRoot`/`forChild` (no NgModules in new code).

## Router Configuration

Configure routing once with `provideRouter` in `app.config.ts`:

```ts
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
  ],
};
```

## Route Parameters as Component Inputs

With `withComponentInputBinding()`, path, query and resolved data arrive as typed signal
inputs — no `ActivatedRoute` plumbing for the common case: `readonly customerId = input.required<string>();`.

- Use component inputs as the default way to read route state; inputs update automatically on
  navigation between sibling params. `ActivatedRoute` is only for advanced stream cases.

## Functional Guards and Resolvers

- All guards and resolvers are functional (`CanActivateFn`, `ResolveFn`, ...) and use
  `inject()`.
- Guards return `boolean | UrlTree` (or an observable/promise of them); redirect with
  `router.createUrlTree`, never by calling `router.navigate` inside a guard.

✅ GOOD — thin auth guard placeholder:

```ts
// authenticated-guard.ts
export const authenticatedGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
};
```

- Attach guards to the protected feature subtree with `canActivate: [authenticatedGuard]`.
- `AuthService` starts as a placeholder (no real auth backend in the first iteration) and is
  replaced when real authentication lands; the guard contract does not change.
- Prefer NOT to use resolvers: load data in the store from the typed data-access service and
  render loading/error/empty states (see `DataAccessGuidelines.md`). Resolve only when the
  route is meaningless without the data (e.g. the entity that feeds the page title).
- A resolver is still thin: one data-access call, no orchestration, no mutation. A failed
  resolution blocks navigation — almost never the UX we want.

## Titles

- Set `title:` on every routable page; titles are Spanish UI text.

```ts
// app-title-strategy.ts — core/
@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot);
    this.title.setTitle(pageTitle ? `${pageTitle} | Pelayo` : 'Pelayo');
  }
}
```

- Breadcrumbs are opt-in: only when the design requires them, built from router state.

## Redirects and Wildcards

- Default entry: `{ path: '', redirectTo: 'customers', pathMatch: 'full' }`.
- Unknown URLs: `{ path: '**', component: NotFound }` as the last route, with Spanish content.
- Never redirect to a route that itself redirects — chained redirects are a debugging trap.
- Keep legacy redirects explicit, few, and recorded when they are user-visible.

## routerLink vs Programmatic Navigation

- Declarative navigation uses `routerLink` on a real `<a>` element — keyboard friendly,
  openable in a new tab. Use `routerLinkActive` for active styling.
- Programmatic `Router.navigate`/`navigateByUrl` is for flows: after a successful save,
  guard-driven redirects, wizard steps.
- Never navigate from a `(click)` handler on a `div`/`span`; if it navigates, it is a link
  (see `AccessibilityGuidelines.md`).

```html
<!-- Declarative -->
<a mat-button routerLink="/customers" routerLinkActive="active-link">Clientes</a>
```

```ts
await this.router.navigate(['/customers']); // programmatic: after a successful save flow
```

## Query Params vs Route Params

- Path params identify a resource: `/customers/:customerId` — hierarchical and required.
- Query params carry view state: `/customers?status=active&page=2` — optional, shareable, and
  what makes refresh and back/forward preserve the view. Preserve them across navigation with
  `queryParamsHandling: 'merge'`.
- Keep filters/sorting/pagination in query params whenever users expect to bookmark or share
  the view.

## Feature-Scoped Providers

Provide feature stores at the feature route level so their lifecycle matches the route
subtree: state is created on entry and destroyed when the user leaves the feature.

```ts
// customer-routes.ts
export const customerRoutes: Routes = [
  { path: '', providers: [CustomerStore], children: [ /* feature routes */ ] },
];
```

- Do not register route-scoped state as `providedIn: 'root'`; the store pattern itself is
  defined in `StateManagementGuidelines.md`.

## Scroll Restoration

- `withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })`
  is part of the base router configuration (shown above); back/forward restores scroll.
- In-page navigation to sections uses fragment links (`routerLink="." fragment="alarms"`);
  intentional exceptions (e.g. wizard steps starting at top) are documented in the design.

## Quick Checklist

- [ ] Every feature lazy-loads via `loadChildren`/`loadComponent`; only the shell is eager.
- [ ] One `*-routes.ts` per feature, exporting a typed `Routes` array.
- [ ] Router configured with `provideRouter` in `app.config.ts`; no NgModules.
- [ ] `withComponentInputBinding()` enabled; route/query params read as signal inputs.
- [ ] Guards are functional `CanActivateFn` with `inject()`; thin, no heavy logic.
- [ ] Resolvers used only when the route is meaningless without the data; data loading lives
      in data-access + component states.
- [ ] `TitleStrategy` override applied; every route has a Spanish `title`.
- [ ] Redirects explicit; wildcard `**` route renders the NotFound page last.
- [ ] `routerLink` for declared navigation; `Router.navigate` only for flows.
- [ ] Query params hold filter/sort/page state and survive back/forward.
- [ ] Feature stores provided at route level for correct lifecycle.
- [ ] `withInMemoryScrolling` enabled; scroll restoration verified on main flows.
