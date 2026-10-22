# Testing Guidelines (Angular)

Unit tests are written with **Vitest 4.x on jsdom** and executed with the frozen commands
`npm test` and `npm test -- --coverage`. Tests are behavioral, deterministic, co-located with the
code under test and exercise all HTTP at the boundary with MSW 2.x (Phases 5–7 per `rules.md`).

## Test Commands

| Purpose | Command |
| --- | --- |
| Run the full unit suite | `npm test` |
| Produce the coverage report | `npm test -- --coverage` |
| Run one spec while working | `npm test -- customer-api.spec.ts` |

- `npm test` must complete with zero failures before a task can be marked done (ANG7.2).
- `npm test -- --coverage` is the only coverage command; its report is recorded evidence for
  ANG7.3 in `work-item/[project-slug]/07-testing/test-report.md`.
- Do not add another runner (Karma, Jasmine, Jest) or hand-edit coverage artifacts.

## Placement and Naming

- Co-locate specs next to the unit under test: `customer-api.ts` → `customer-api.spec.ts`,
  `customer-list.ts` → `customer-list.spec.ts`. No central `tests/` folder for unit tests.
- `describe` names the unit under test; each test name is English and follows the
  **"should ... when ..."** pattern so a failure reads as a behavior statement.
- Define test data per spec (or reuse immutable fixtures from `src/mocks/`); never share mutable
  state across tests.

```ts
describe('CustomerStore', () => {
  test('should expose the selected customer when selectCustomer is called', () => {
    // ...
  });
  test('should keep the previous selection when the API call fails', () => {
    // ...
  });
});
```

## TestBed Setup for Standalone Components

- Import the standalone component directly in `imports` — no NgModules anywhere.
- Provide only what the unit needs; keep real dependencies whenever they are cheap (real
  data-access service + MSW instead of a fake).
- Component patterns under test (signals, inputs/outputs, control flow) are defined in
  `ComponentGuidelines.md`.

```ts
import { TestBed } from '@angular/core/testing';
import { CustomerCard } from './customer-card';

describe('CustomerCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerCard],
    }).compileComponents();
  });
});
```

- Query the rendered DOM via `fixture.nativeElement` (or `debugElement` for directives) and
  assert user-visible behavior: rendered text, enabled/disabled state, emitted outputs,
  navigation.
- Do not assert internal structure: private fields, layout-only style classes, or the exact DOM
  tree of Angular Material components.

## Zoneless-Safe Waiting

- The default wait is `await fixture.whenStable()`. Never use arbitrary sleeps
  (`setTimeout`, `await new Promise(resolve => setTimeout(...))`) (ANG7.5).
- **`detectChanges` polling is banned.** Waiting by repeatedly calling `fixture.detectChanges()`
  until something appears is a flaky test. A single synchronous `fixture.detectChanges()` is
  allowed only when the test intentionally renders without async work.
- Prefer event-driven waits: interact, then `await fixture.whenStable()`.

```ts
// GOOD — drive the state through signals, then wait for stability
fixture.componentRef.setInput('customer', customer);
await fixture.whenStable();
expect(fixture.nativeElement.textContent).toContain('Cliente Demo');

// BAD — arbitrary sleep
await new Promise<void>(resolve => setTimeout(resolve, 500));

// BAD — polling detectChanges until the element appears
while (!fixture.nativeElement.querySelector('h3')) {
  fixture.detectChanges();
}
```

## Signals in Tests

- Set signal inputs with `fixture.componentRef.setInput('customer', customer)`. Never assign to
  the component instance and never rely on decorator inputs.
- Read signal state directly — the test sees exactly what the template sees: `store.customers()`,
  `store.isLoading()`, `component.filteredContracts()`.
- Assert `output()` emitters by subscribing, and prefer real interactions (clicks, input events)
  to trigger them.

```ts
test('should emit the customer when the save button is clicked', async () => {
  const fixture = TestBed.createComponent(CustomerForm);
  fixture.componentRef.setInput('customer', customer);
  const saved = vi.fn();
  fixture.componentInstance.saved.subscribe(saved);
  await fixture.whenStable();

  fixture.nativeElement.querySelector('button[type="submit"]').click();
  await fixture.whenStable();

  expect(saved).toHaveBeenCalledWith(customer);
});
```

## HTTP Testing with MSW

- All HTTP in tests goes through MSW 2.x (`setupServer` in `src/mocks/server.ts`); no real
  network calls, ever (ANG7.4); handler and dev `setupWorker` details live in `DataAccessGuidelines.md`.
- Lifecycle — start once, reset after every test, close at the end:

```ts
// test setup (shared or per spec)
import { server } from '../../../mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

- `onUnhandledRequest: 'error'` converts a missing handler into a failure instead of a silent
  real request.
- Override handlers per test with `server.use(...)`; `resetHandlers()` in `afterEach` keeps tests
  isolated and order-independent.
- **Prefer MSW at the HTTP boundary over mocking services**: the real data-access service,
  interceptors, DTO mapping and error normalization execute in the test. Mock a service
  (`{ provide: CustomerStore, useValue: fakeStore }`) only for pure unit isolation when HTTP is
  not the concern — for example a presentational component tested without the real store.
- MSW handlers and fixtures are deterministic: fixed data, no randomness, no time-dependent
  output, realistic Pelayo content (never production customer data — see `SecurityGuidelines.md`).

## Required Scenario Classes

Every main feature flow covers four scenario classes (ANG7.1, ANG7.4):

| Class | Proves | Customer-domain example |
| --- | --- | --- |
| Positive | Happy path works | Customer list renders two customers when the API returns data |
| Negative | Failures are handled | 500 response shows the error state and a typed `ApiError` |
| Boundary | Edges behave | Empty list, single result, maximum-length field, zero filter matches |
| State | Async states render | Loading, error and empty states each visible and correct |

- Not every unit needs all four; every *flow* does — cover the classes the unit owns.

## What NOT to Test

- ❌ Private methods or internal call order — refactors break the test without a behavior change.
- ❌ Angular Material internals (for example, `MatTable` sorting logic owned by the library).
- ❌ Snapshot-only assertions as the sole evidence that a component renders.
- ❌ Template implementation details: whitespace, wrapper elements, layout-only classes.
- ❌ Private state access (`store['items']`) instead of the public signal API.

## Deterministic Tests

- Debounced and time-based behavior uses Vitest fake timers, restored after each test (ANG7.5):

```ts
test('should emit the search results when 300ms elapse', async () => {
  vi.useFakeTimers();
  const customerApi = TestBed.inject(CustomerApi);
  const received: Customer[][] = [];

  customerApi.searchCustomers('ana').subscribe(results => received.push(results));
  await vi.advanceTimersByTimeAsync(300);

  expect(received.at(-1)?.map(customer => customer.name)).toEqual(['Ana López']);
  vi.useRealTimers();
});
```

- No sleeps, no real HTTP, no reliance on execution order: every test passes in isolation and in
  the full suite.
- Do not depend on shared mutable fixtures between tests; create fresh data per test.

## Coverage Policy

- Global gate: **75%** (statement/line) — below threshold is a blocking failure (ANG7.3).
- Critical files gate: **≥85%** for data-access and state files (`customer-api.ts`,
  `customer-store.ts`, interceptors, guards).
- CI enforces both thresholds with `npm test -- --coverage`; the recorded report with the exact
  command output is evidence in `work-item/[project-slug]/07-testing/test-report.md`.
- Coverage is not a goal by itself: raise it by covering behavior, never with trivial assertions.

## Example Specs

### Component with a signal input (Pelayo customer domain)

```ts
import { TestBed } from '@angular/core/testing';
import { CustomerCard } from './customer-card';
import type { Customer } from './customer';

const customer: Customer = { id: 'C-00042', name: 'Cliente Demo', status: 'active' };

describe('CustomerCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CustomerCard] }).compileComponents();
  });

  test('should render the customer name when the input signal is set', async () => {
    const fixture = TestBed.createComponent(CustomerCard);
    fixture.componentRef.setInput('customer', customer);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Cliente Demo');
  });

  test('should show the loading state when isLoading is true', async () => {
    const fixture = TestBed.createComponent(CustomerCard);
    fixture.componentRef.setInput('customer', customer);
    fixture.componentRef.setInput('isLoading', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('mat-progress-spinner')).toBeTruthy();
  });
});
```

### Data-access service with MSW (positive, negative, boundary)

```ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { http, HttpResponse } from 'msw';
import { server } from '../../../mocks/server';
import { CustomerApi } from './customer-api';
import { ApiError } from '../../../core/api-error';

describe('CustomerApi', () => {
  let customerApi: CustomerApi;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    customerApi = TestBed.inject(CustomerApi);
  });

  test('should return customers when the API responds 200', async () => {
    const customers = await firstValueFrom(customerApi.getCustomers());

    expect(customers.length).toBeGreaterThan(0);
    expect(customers[0].name).toBe('Cliente Demo');
  });

  test('should throw ApiError when the API responds 500', async () => {
    server.use(http.get('/api/customers', () => new HttpResponse(null, { status: 500 })));

    await expect(firstValueFrom(customerApi.getCustomers())).rejects.toBeInstanceOf(ApiError);
  });

  test('should return an empty array when the API responds with no data', async () => {
    server.use(http.get('/api/customers', () => HttpResponse.json([])));

    expect(await firstValueFrom(customerApi.getCustomers())).toEqual([]);
  });
});
```

## Quick checklist

- [ ] Spec is co-located `.spec.ts`; test names follow "should ... when ...".
- [ ] Positive, negative, boundary and state scenarios covered for each main flow (ANG7.1, ANG7.4).
- [ ] Signal inputs set with `fixture.componentRef.setInput`; signal state read directly.
- [ ] `await fixture.whenStable()` used; no sleeps and no `detectChanges` polling (ANG7.5).
- [ ] All HTTP served by MSW `setupServer` with `beforeAll`/`afterEach`/`afterAll` and
      `resetHandlers`; no real network.
- [ ] Fake timers used for debounced and time-based code.
- [ ] Tests are order-independent and pass when run in isolation.
- [ ] No private-method, Material-internal, implementation-detail or snapshot-only assertions.
- [ ] `npm test` green; `npm test -- --coverage` meets the 75% global and ≥85% critical gates, and
      the report is recorded (ANG7.2, ANG7.3).
