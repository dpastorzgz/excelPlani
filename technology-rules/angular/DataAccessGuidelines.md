# Data Access Guidelines

All HTTP flows through a typed data-access layer: one service per resource, DTOs mapped to
view models, functional interceptors for cross-cutting concerns, and a single typed error
model. Until the backend is available, development runs entirely on MSW 2.x mocks.

## One Data-Access Service per Resource

- One service per backend resource (`CustomerApi`, `ContractApi`, ...), living in the feature
  folder, stateless and `providedIn: 'root'`; components and stores never call `HttpClient`
  directly (ANG5.2).

```ts
// customer-api.ts
@Injectable({ providedIn: 'root' })
export class CustomerApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getCustomers(): Observable<Customer[]> {
    return this.http
      .get<CustomerDto[]>(`${this.baseUrl}/customers`)
      .pipe(map((dtos) => dtos.map(toCustomer)));
  }
}
```

- Every method returns a typed result (`Observable<T>`, or `Promise<T>` via `firstValueFrom`
  for one-shot flows — see `RxJSGuidelines.md`); one endpoint, one mapping per method.

## DTO vs View Model

- `CustomerDto` mirrors the API wire format (snake_case, nullable fields); `Customer` is the
  view model consumed by components and stores (camelCase, app types).
- Map DTO → view model with a pure function; DTOs never leak into components. When the
  backend renames a field, exactly one function changes.

```ts
// customer.ts — models and mapper for the customer feature
export type ContactChannel = 'email' | 'phone' | 'sms';

export interface CustomerDto {
  customer_id: string;
  full_name: string;
  email_address: string | null;
  preferred_channel: ContactChannel;
}
export interface Customer {
  customerId: string;
  fullName: string;
  email: string;
  preferredChannel: ContactChannel;
}
export const toCustomer = (dto: CustomerDto): Customer => ({
  customerId: dto.customer_id,
  fullName: dto.full_name,
  email: dto.email_address ?? '',
  preferredChannel: dto.preferred_channel,
});
```

- Nullable API fields get an explicit default or a documented `null` in the view model —
  decide once per field.

## Interceptors (Functional `HttpInterceptorFn`)

Register interceptors once in `app.config.ts`; order matters — correlation id first, auth
second, error normalization last so it observes every failure:
`provideHttpClient(withInterceptors([correlationIdInterceptor, authInterceptor, errorInterceptor]))`.

- **Correlation id** stamps every outgoing request so frontend and backend logs line up;
  **auth** attaches the bearer token from the in-memory auth store (see `SecurityGuidelines.md`)
  and never leaks it to third-party hosts:

```ts
// correlation-id-interceptor.ts — core/
export const correlationIdInterceptor: HttpInterceptorFn = (request, next) =>
  next(request.clone({ setHeaders: { 'X-Correlation-Id': crypto.randomUUID() } }));

// auth-interceptor.ts — core/
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthTokenStore).token();
  return next(token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request);
};
```

- **Error normalization** — every failure becomes a typed `ApiError`; features never parse
  `HttpErrorResponse` themselves:

```ts
// error-interceptor.ts — core/
export const errorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(catchError((error: unknown) => throwError(() => toApiError(error))));

export interface ApiError {
  kind: 'network' | 'client' | 'server' | 'unknown';
  status: number | null;
  code: string;
  message: string;
  correlationId: string | null;
  fieldErrors?: Record<string, string>;
}

function toApiError(error: unknown): ApiError {
  if (!(error instanceof HttpErrorResponse)) {
    return { kind: 'unknown', status: null, code: 'UNKNOWN', message: 'Se ha producido un error inesperado', correlationId: null };
  }
  const body = (error.error ?? {}) as { code?: string; message?: string; fieldErrors?: Record<string, string> };
  return {
    kind: error.status === 0 ? 'network' : error.status >= 500 ? 'server' : 'client',
    status: error.status,
    code: body.code ?? 'UNKNOWN',
    message: body.message ?? 'Se ha producido un error inesperado',
    correlationId: error.headers.get('X-Correlation-Id'),
    fieldErrors: body.fieldErrors,
  };
}
```

## Retry Policy

- Retry ONLY idempotent GET requests, bounded (maximum 2 retries) with exponential backoff;
  never blindly retry writes — a repeated POST/PATCH/DELETE can duplicate records or orders.
  Do not retry 4xx client errors; gate retries on network failures and 5xx only.

| Method | Retry |
| --- | --- |
| GET (idempotent read) | Up to 2 retries, exponential backoff |
| POST / PATCH / PUT / DELETE | Never, unless an idempotency-key contract exists and the decision is recorded |

```ts
// customer-api.ts — bounded retry for an idempotent read
this.http.get<CustomerDto>(`${this.baseUrl}/customers/${customerId}`).pipe(
  retry({
    count: 2,
    delay: (error: unknown, retryCount: number) =>
      error instanceof HttpErrorResponse && error.status >= 500 ? timer(500 * 2 ** retryCount) : throwError(() => error),
  }),
  map(toCustomer),
);
```

## Loading / Error / Empty State Contract

Stores adjacent to data-access expose a predictable contract: data, error and loading as
signals — plus derived `isEmpty` for lists. Loading means "no data and no error yet"; when a
request completes the store clears the error and sets either data or the typed `ApiError`.
Components render all states; full store rules live in `StateManagementGuidelines.md`:

```ts
// customer-store.ts (excerpt)
export class CustomerStore {
  private readonly api = inject(CustomerApi);
  private readonly customersState = signal<Customer[] | null>(null);
  private readonly errorState = signal<ApiError | null>(null);
  readonly customers = this.customersState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly isLoading = computed(() => this.customersState() === null && this.errorState() === null);
  readonly isEmpty = computed(() => this.customersState()?.length === 0);
}
```

- `resource()` / `httpResource` are allowed when stable in the project's Angular version
  (validate per ANG3.5); otherwise use RxJS + `toSignal`.
- Error state carries the typed `ApiError`; user feedback uses the shared feedback pattern
  (see the error handling baseline in `GeneralGuidelines.md`).

## MSW 2.x Development Mocks

The first iteration has NO real backend calls: screens are developed and verified against
MSW handlers until the API contract is available and the switch is recorded. Mocks live in
`src/mocks/` and never ship in production builds (ANG6.5).

### Structure

```
src/mocks/
  browser.ts                 # setupWorker(...) — dev server (npm start)
  server.ts                  # setupServer(...) — Vitest (see TestingGuidelines.md)
  handlers/
    customer-handlers.ts     # one handler file per feature/resource
```

### Handlers and Fixtures

```ts
// customer-handlers.ts
import { http, HttpResponse, delay } from 'msw';
import { environment } from '../../environments/environment';
import type { CustomerDto } from '../../app/features/customer/customer';

const customers: CustomerDto[] = [
  { customer_id: 'C-1001', full_name: 'Lucía Ferrer Gómez', email_address: 'lucia.ferrer@example.com', preferred_channel: 'email' },
];

export const customerHandlers = [
  http.get(`${environment.apiUrl}/customers`, async () => {
    await delay(200); // small delay keeps loading states visible
    return HttpResponse.json(customers);
  }),

  http.get(`${environment.apiUrl}/customers/:customerId`, ({ params }) => {
    const customer = customers.find((item) => item.customer_id === params.customerId);
    return customer ? HttpResponse.json(customer) : new HttpResponse(null, { status: 404 });
  }),
];
```

- Fixtures are realistic (Spanish names, plausible formats) but 100% invented. Using
  production customer data in mocks is FORBIDDEN (see `SecurityGuidelines.md`).
- Handlers are deterministic: no `Math.random()`, no clock-dependent payloads; tests rely on
  exact fixture values. Error scenarios are explicit (special ids such as `C-ERROR-500`, or
  `server.use()` overrides per test) — never random failures.
- Mock responses match the agreed API contract (`CustomerDto`) exactly; unknown ids return
  404, never a silent empty payload.

### Enabling Mocks in Development Only

Mocks activate only when `environment.useMocks` is true (dev builds), via dynamic import, so
mock code is never loaded by pre/production builds:

```ts
// main.ts
async function enableMocking(): Promise<void> {
  if (!environment.useMocks) return;
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking().then(() => bootstrapApplication(App, appConfig));
```

- Production environment files set `useMocks: false`; pre/production builds contain no mock
  handlers, no mock service worker and no `@mswjs` runtime — verify in the built artifact
  (ANG6.5). When the real backend arrives, only the mock flag and the environment URL change;
  that is why all access sits behind `CustomerApi`.

## Base URL Configuration

- The base URL comes from the environment (`environment.apiUrl`) or runtime config — NEVER
  hardcoded in services, components or handlers. Environment files are public: no tokens or
  secrets in them (see `SecurityGuidelines.md`, `DeploymentGuidelines.md`).

## Testing

- All HTTP in tests goes through the MSW `server.ts` boundary — no real network, ever
  (ANG7.4); prefer MSW over spying on `HttpClient` or mocking services (mock services only
  for pure unit isolation of a single class).
- Critical data-access files (API services, mappers, interceptors, stores) carry ≥85%
  coverage (ANG7.3). Server lifecycle and patterns live in `TestingGuidelines.md`.

## Quick Checklist

- [ ] One typed data-access service per resource (`CustomerApi`); no `HttpClient` in components.
- [ ] DTO → view-model mapper is pure and used at the boundary; DTOs never leak to components.
- [ ] Every HTTP call is typed with generic response/request types.
- [ ] Functional interceptors registered in order: correlation id, auth, error normalization.
- [ ] All failures normalized to a typed `ApiError` with correlation id; messages safe to display.
- [ ] Retries only on idempotent GETs, bounded (≤2) with backoff; writes never blindly retried.
- [ ] Loading/error/empty states exposed as signals; consumers render all three.
- [ ] MSW handlers per feature under `src/mocks/handlers/`; deterministic, realistic fixtures,
      no production customer data — ever.
- [ ] Mocks gated by `environment.useMocks` + dynamic import; absent from production builds (ANG6.5).
- [ ] Base URL from environment/runtime config; nothing hardcoded.
- [ ] First iteration runs entirely on mocks; HTTP tests use MSW `server.ts` (`TestingGuidelines.md`).
