# RxJS Guidelines

RxJS is the tool for asynchronous event streams — debounced input, retries, polling, router events, HTTP. State stays in signals; RxJS feeds them through `toSignal` at the component boundary. State-placement rules live in `StateManagementGuidelines.md`, the typed HTTP/error layer in `DataAccessGuidelines.md`, and form APIs in `FormsGuidelines.md`.

## When to Use RxJS vs Signals

| Scenario | Use |
| --- | --- |
| Component/UI state, derived values | Signals (`signal`, `computed`) — see `StateManagementGuidelines.md` |
| Displaying async data in a template | `toSignal(observable$)` or the `async` pipe |
| Debounce, `distinctUntilChanged`, retry, polling, timeouts | RxJS operators |
| Combining multiple async sources over time | RxJS (`combineLatest`, `withLatestFrom`) |
| Router events and navigation streams | RxJS (`Router.events`, `ActivatedRoute` observables) |
| HTTP calls | RxJS inside typed data-access service methods |
| One-shot request inside a service method | `firstValueFrom` / `lastValueFrom` |
| Combining signals | `computed()` — never `toObservable` + `combineLatest` just to combine signals |

- Signals are the default for state; RxJS is the default for event streams. Do not convert between them without a reason.

## Subscription Hygiene

- Every manual `subscribe()` has teardown: `takeUntilDestroyed()` inside an injection context, or `takeUntilDestroyed(this.destroyRef)` when there is none.
- In templates, prefer the `async` pipe or `toSignal` over storing a subscription in a field.
- Never subscribe inside another operator — see "No Nested Subscribes".
- `.spec` note: `takeUntilDestroyed` requires an injection context. In tests, create the code under test through `TestBed` (which provides one) or call it inside `TestBed.runInInjectionContext(...)`; otherwise pass an explicit `DestroyRef`.

```typescript
// Good: teardown via takeUntilDestroyed
export class CustomerList {
  private readonly refreshTrigger = inject(CustomerRefresh);

  constructor() {
    this.refreshTrigger.trigger$.pipe(takeUntilDestroyed()).subscribe(() => this.reload());
  }
}
```

## Operator Discipline

Pick the flattening operator by concurrency semantics:

| Operator | Behavior | Use for |
| --- | --- | --- |
| `switchMap` | Cancels the previous inner observable | Latest-matters reads: typeahead search, route-param loads |
| `concatMap` | Queues inner observables, keeps order | Ordered writes / sequential saves that must not interleave |
| `mergeMap` | Runs all inner observables in parallel | Independent parallel requests where order does not matter |
| `exhaustMap` | Ignores new values while busy | Double-click / double-submit protection (save, submit) |

- Default to `switchMap` for reads triggered by a changing key, and to `exhaustMap` for submit buttons; use `concatMap` only when ordering is a real requirement.
- Common companions: `debounceTime`, `distinctUntilChanged`, `filter`, `startWith`, `timeout`, and `retry` (idempotent GET only — policy in `DataAccessGuidelines.md`).

```typescript
// Good: cancel the previous search when a new term arrives
this.searchControl.valueChanges.pipe(debounceTime(300), switchMap((term) => this.search(term)));

// Bad: mergeMap lets older responses arrive after newer ones
this.searchControl.valueChanges.pipe(mergeMap((term) => this.search(term)));
```

## No Nested Subscribes

- Compose streams with operators. A `subscribe()` inside another `subscribe()` breaks teardown, error handling and back-pressure — treat it as a defect.

```typescript
// Bad: nested subscribe — races, leaks and error paths become unmanageable
this.route.paramMap.subscribe((params) => {
  this.customerApi.getById(params.get('id')!).subscribe((customer) => this.customer.set(customer));
});
```

```typescript
// Good: one composed stream feeding a signal with typed error state
protected readonly customerState = toSignal(
  this.route.paramMap.pipe(
    map((params) => params.get('id') ?? ''),
    distinctUntilChanged(),
    switchMap((id) =>
      this.customerApi.getById(id).pipe(
        map((customer) => ({ customer, error: null })),
        catchError((error: ApiError) => of({ customer: null, error })),
      ),
    ),
  ),
  { initialValue: { customer: null, error: null } },
);
```

## Error Handling

- Map transport failures to the typed error model (`ApiError`) in one place — the error interceptor (`DataAccessGuidelines.md`).
- Place `catchError` on the **inner** observable so one failure does not kill the outer stream. A `catchError` on the outer stream silently completes it and the UI stops updating.
- Never swallow errors: map them into an explicit error state (`{ customer: null, error }`) that the UI can render, or re-throw. ❌ `catchError(() => of(null))` and `catchError(() => EMPTY)` erase the failure.
- Retry only idempotent GETs, with backoff (`retry({ count: 2, delay: ... })`); never retry writes blindly — details in `DataAccessGuidelines.md`.
- No `console.log` error handling in delivered code; user-visible feedback follows the shared error-state pattern.

```typescript
// Bad: one failure completes the stream and nothing reaches the UI
this.customerApi.getById(id).pipe(catchError(() => EMPTY));
```

## Debounced Search Pattern (Canonical)

`valueChanges` → `debounceTime` → `distinctUntilChanged` → `filter` → `switchMap` → `catchError` → results signal via `toSignal`.

```typescript
// customer-search.ts — GOOD
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, filter, map, Observable, of, switchMap } from 'rxjs';
import { ApiError } from '../api-error';
import { Customer } from './customer';
import { CustomerApi } from './customer-api';

type SearchState = { customers: Customer[]; error: ApiError | null };

@Component({
  selector: 'pelayo-customer-search',
  imports: [ReactiveFormsModule],
  templateUrl: './customer-search.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerSearch {
  private readonly customerApi = inject(CustomerApi);

  protected readonly searchControl = new FormControl('', { nonNullable: true });

  protected readonly results = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter((term) => term.trim().length >= 2),
      switchMap((term) =>
        this.customerApi.search(term.trim()).pipe(
          map((customers): SearchState => ({ customers, error: null })),
          catchError((error: ApiError): Observable<SearchState> => of({ customers: [], error })),
        ),
      ),
    ),
    { initialValue: { customers: [], error: null } satisfies SearchState },
  );
}
```

```html
<!-- customer-search.html — the template only reads the signal -->
@for (customer of results().customers; track customer.id) {
  <span>{{ customer.fullName }}</span>
}

@if (results().error) {
  <p>La búsqueda ha fallado. Inténtalo de nuevo.</p>
}
```

- Form control details and validation rules live in `FormsGuidelines.md`; loading/error/empty presentation belongs to the shared feedback pattern.

## shareReplay — Only With Justification

- Use `shareReplay({ bufferSize: 1, refCount: true })` only when multiple subscribers genuinely need the same expensive source (e.g. an HTTP read consumed by two components at the same time); leave a comment explaining why the sharing exists.
- Default to no sharing: if two components need the same server data, cache it in a data-access service or a signal store instead (`StateManagementGuidelines.md`) — do not bolt `shareReplay` on "just in case".
- Never omit `refCount: true` in a component-scoped stream, or the buffered value outlives its consumers.

## Combining Streams

- Combine a few observables with `combineLatest` when all sources are asynchronous; use `withLatestFrom` when a trigger stream should read the latest value of others.
- Combine signals with `computed()` — do not convert signals to observables only to combine them.
- If a combination grows complex, move it into a data-access or store method and expose one signal.

```typescript
// Good: signals combined with computed()
protected readonly visibleContracts = computed(() =>
  this.contracts().filter((contract) => contract.status === this.statusFilter()),
);

// Bad: toObservable(...) + combineLatest only to combine signals — use computed() above
```

## One-Shot Requests: firstValueFrom / lastValueFrom

- Service methods that perform a single request convert it to a promise with `firstValueFrom`; use `lastValueFrom` when the source must run to completion and you need its final value.
- ❌ Never `subscribe()` inside a service method and mutate state from the callback — return the observable (or promise) and let the caller or store own the outcome.

```typescript
// Good: one-shot write in a data-access method
async archiveContract(id: string): Promise<Contract> {
  const dto = await firstValueFrom(
    this.http.patch<ContractDto>(`${this.baseUrl}/contracts/${id}`, { status: 'archived' }),
  );
  return mapContractDto(dto);
}
```

## BehaviorSubject Stores Are Banned in New Code

- New state holders use signals (`StateManagementGuidelines.md`); a `BehaviorSubject`-based store duplicates `signal()` with more ceremony and leaks subscriptions.
- A plain `Subject` remains fine as an internal trigger inside a service (e.g. a refresh trigger), never as the app state.
- Converting a `BehaviorSubject` with `toSignal()` is a migration crutch, not a target design.

```typescript
// Bad: BehaviorSubject-based store in new code
@Injectable({ providedIn: 'root' })
export class CustomerStore {
  private readonly customersSubject = new BehaviorSubject<Customer[]>([]);
  readonly customers$ = this.customersSubject.asObservable(); // signals do this without extra ceremony
}
// Good: the same contract with signals — see StateManagementGuidelines.md (`CustomerStore`)
```

## Testing RxJS Code

- Assert the outcome, not the pipeline: drive time with `vi.useFakeTimers()` — no arbitrary sleeps, no `done`-callbacks waiting on wall-clock time.
- Serve HTTP through MSW in tests (no real network); full patterns in `TestingGuidelines.md`.

## Quick Checklist

- [ ] Signals for state, RxJS for event streams; `toSignal` at the template boundary.
- [ ] Every manual subscription terminated with `takeUntilDestroyed` (or `async` pipe / `toSignal`).
- [ ] Flattening operator matches semantics: `switchMap` (latest), `concatMap` (ordered), `mergeMap` (parallel), `exhaustMap` (double-submit guard).
- [ ] No nested subscribes — streams composed with operators.
- [ ] `catchError` on the inner observable; failures mapped to typed error state, never swallowed.
- [ ] Retries only on idempotent GETs, with backoff (`DataAccessGuidelines.md`).
- [ ] `shareReplay` only with a justified shared source, `refCount: true`.
- [ ] Signals combined with `computed()`, not `combineLatest(toObservable(...))`.
- [ ] One-shot service requests use `firstValueFrom` / `lastValueFrom`; services never subscribe internally.
- [ ] No new `BehaviorSubject`-based stores; a plain `Subject` only as an internal trigger.
- [ ] Tests use fake timers and MSW — no sleeps, no real network.
