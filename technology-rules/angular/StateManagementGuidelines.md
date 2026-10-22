# State Management Guidelines

State is signals-first: signals hold state and feed templates, while RxJS drives async event streams. Place every piece of state at the lowest level that works — component signal → feature store → root singleton — and keep exactly one owner per piece of state. RxJS-specific rules live in `RxJSGuidelines.md`, the HTTP/error contract in `DataAccessGuidelines.md`, and form state in `FormsGuidelines.md`.

## Decision Tree

| State | Where it lives |
| --- | --- |
| Local UI state (toggles, drafts, selection inside one component) | `signal()` in the component |
| Derived local state (totals, filtered lists) | `computed()` in the component |
| Derived-but-user-resettable state (default selection, page reset) | `linkedSignal()` |
| State shared by siblings within one feature | signal store service (`CustomerStore`), provided at the feature route |
| App-wide singleton state (session, theme, permissions) | signal service in `core/` with `providedIn: 'root'` |
| Async event streams (debounce, retry, polling, websockets) | RxJS, exposed to templates via `toSignal` — see `RxJSGuidelines.md` |
| Server reads | `resource()` / `httpResource` when stable in the project's Angular version; otherwise typed data-access + `toSignal(http$)` (or the store) |
| Form state | typed reactive forms — see `FormsGuidelines.md` |

- Promote state to a store only when two or more sibling components genuinely share it; never duplicate state at a second level "for convenience".
- Never keep a parallel copy of server state in component-local signals — one owner per piece of state.

## Signals, computed and linkedSignal

- `signal()` holds state; only its owner writes it (`set` / `update`).
- `computed()` must be pure: read signals, return a value. ❌ Never write signals, call HTTP, log or navigate inside `computed()`.
- Derived values are never stored in their own signal and kept in sync manually — derive them where they are needed.
- `linkedSignal()` is for derived values that must stay writable: they recompute when their source changes but the user can override them.

```typescript
// Good: pure computed derivations
protected readonly activeContracts = computed(() =>
  this.contracts().filter((contract) => contract.status === 'active'),
);

protected readonly monthlyTotal = computed(() =>
  this.activeContracts().reduce((sum, contract) => sum + contract.monthlyPrice, 0),
);
```

```typescript
// Bad: writing a signal inside computed()
protected readonly activeContracts = computed(() => {
  this.activeCount.set(this.contracts().filter((c) => c.status === 'active').length); // not pure
  return this.contracts().filter((contract) => contract.status === 'active');
});
```

```typescript
// Good: linkedSignal for a default the user can reset or override
readonly selectedContractId = linkedSignal(() => this.contracts()[0]?.id ?? null);
// The user picks another contract with .set(...); when contracts() changes, the default re-derives.
```

## Effects: Side Effects Only

- `effect()` is for side effects that must run when signals change: persistence to storage, logging/telemetry, syncing a third-party widget, manual DOM APIs.
- ❌ Never use `effect()` to derive state into another signal — that is `computed()`.
- Keep effects small and self-contained; use `untracked()` to read signals that must not re-trigger the effect.
- Prefer component lifecycle (`afterNextRender`) when the "side effect" is about rendering (see `ComponentGuidelines.md`).

```typescript
// Good: persist a non-sensitive preference
private readonly density = signal<TableDensity>('comfortable');

constructor() {
  effect(() => localStorage.setItem('pelayo.table-density', this.density()));
}
```

```typescript
// Bad: effect used for state derivation
constructor() {
  effect(() => this.filteredCustomers.set(this.customers().filter((c) => c.active))); // use computed()
}
```

## Feature Store Pattern

- One store per feature that needs shared state. It owns the writable signals, exposes readonly views and encodes use cases as methods (`loadCustomers()`, `selectCustomer(id)`).
- Expose state with `asReadonly()` (or `computed`); keep writable signals private. Avoid public raw setters — expose focused methods.
- Scope the store to the feature: provide it in the feature routes (`providers: [CustomerStore]`) so its lifetime matches the feature. Use `providedIn: 'root'` only for genuinely app-wide services.
- The store depends on the typed data-access service (`CustomerApi`), never on `HttpClient` internals; DTO mapping stays in the data-access layer (`DataAccessGuidelines.md`).

```typescript
// customer-store.ts — GOOD
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiError } from '../api-error';
import { CustomerApi } from './customer-api';
import { Customer } from './customer';

@Injectable()
export class CustomerStore {
  private readonly customerApi = inject(CustomerApi);

  private readonly customersState = signal<Customer[]>([]);
  private readonly selectedIdState = signal<string | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<ApiError | null>(null);

  readonly customers = this.customersState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly selectedCustomer = computed(
    () => this.customersState().find((customer) => customer.id === this.selectedIdState()) ?? null,
  );

  async loadCustomers(): Promise<void> {
    this.loadingState.set(true);
    this.errorState.set(null);
    try {
      this.customersState.set(await firstValueFrom(this.customerApi.list()));
    } catch (error) {
      this.errorState.set(error as ApiError); // normalized by the error interceptor
    } finally {
      this.loadingState.set(false);
    }
  }

  selectCustomer(id: string | null): void {
    this.selectedIdState.set(id);
  }
}
```

```typescript
// customer-routes.ts — one store instance per feature activation
export const customerRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./customer-list/customer-list').then((m) => m.CustomerList),
    providers: [CustomerStore],
  },
];
```

```typescript
// Bad: exposed writable signals, duplicated derived state, deep mutation
@Injectable({ providedIn: 'root' })
export class CustomerStore {
  customers = signal<Customer[]>([]); // consumers can corrupt it
  customerCount = signal(0);          // duplicated derived state — use computed()

  addCustomer(customer: Customer): void {
    this.customers().push(customer);  // in-place mutation never notifies readers
    this.customerCount.set(this.customers().length);
  }
}
```

## RxJS Interop

- Convert streams to signals with `toSignal` at the component boundary; convert signals to streams with `toObservable` only when an operator pipeline needs them (debounce, `switchMap`).
- Every manual subscription uses `takeUntilDestroyed` (or the `async` pipe) — full rules in `RxJSGuidelines.md`.
- Stores expose signals, not observables; do not mix paradigms arbitrarily.

## Server State (Async Reads)

- Prefer `resource()` / `httpResource` for read-through server state once stable in the project's Angular version (verify at Phase 3): it exposes `value()`, `isLoading()` and `error()` signals directly.

```typescript
// Good: server read as signals (when resource() is stable in the project's Angular version)
protected readonly contracts = resource({
  params: () => ({ customerId: this.customerId() }),
  loader: ({ params }) => firstValueFrom(this.customerApi.listContracts(params.customerId)),
});
// Template: contracts.value(), contracts.isLoading(), contracts.error()
```

- Fallback when `resource()` is not stable in the project's version: fetch through the store (loading/error signals as in the sample above) or expose the data-access observable with `toSignal` (`RxJSGuidelines.md`).
- Refresh server state through the owning method (`loadCustomers()`, resource `reload()`), never by mutating local copies.

## Persistence

- `localStorage` / `sessionStorage` only for non-sensitive preferences: theme, density, column layout, last-used filter.
- ❌ Never persist tokens, customer data or any PII — token storage policy in `SecurityGuidelines.md`.
- Persist inside an `effect()` or an explicit method, never in templates.

## Testing State

- Test stores through their public surface: create via `TestBed`, call the methods, assert the exposed signals.
- Component tests set inputs with `fixture.componentRef.setInput(...)`, read signals directly and wait with `await fixture.whenStable()`.
- Full patterns in `TestingGuidelines.md`.

## Anti-Patterns

- ❌ Writable signals exposed publicly; consumers calling `store.customers.set(...)`.
- ❌ `effect()` used to derive state or patch another signal.
- ❌ Derived values stored in their own signal and kept in sync manually.
- ❌ In-place mutation of arrays/objects held in signals (`push`, `splice`, direct property writes) — update immutably with `set` / `update`.
- ❌ `BehaviorSubject`-based stores in new code — see `RxJSGuidelines.md`.
- ❌ Duplicating server state into component-local signals.
- ❌ Making everything a root singleton "in case it is needed elsewhere".

## Quick Checklist

- [ ] State placed at the right level (component signal → feature store → root service).
- [ ] Store exposes readonly signals + methods; writable signals are private.
- [ ] Store is feature-scoped via route `providers` (root only when genuinely global).
- [ ] `computed()` pure — no writes, no HTTP; no duplicated derived state.
- [ ] `effect()` only for side effects (storage, logging, DOM sync); never for derivation.
- [ ] `linkedSignal()` used for derived values the user can reset or override.
- [ ] Server reads via `resource()` (when stable) or store/`toSignal`; single owner per state.
- [ ] Persistence limited to non-sensitive preferences.
- [ ] Store methods and services covered by tests per `TestingGuidelines.md`.
