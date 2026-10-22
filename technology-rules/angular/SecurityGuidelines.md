# Security Guidelines (Angular)

A frontend build ships to the browser: every string in the bundle is public and every DOM
injection point is an attack surface. These rules cover the Angular-specific risks (XSS, tokens,
headers), secrets and environment files, CSP expectations and dependency hygiene. They apply
from Phase 3 (design) through Phase 9 (release).

## XSS and Dangerous DOM APIs

Angular escapes interpolated content by default — keep that protection intact.

- Bind dynamic text with interpolation (`{{ customer.name }}`) and property bindings. Never
  assemble HTML strings in TypeScript.
- ❌ `innerHTML`, `outerHTML` and `document.write` for anything derived from data or user input.
- ❌ `bypassSecurityTrustHtml/Script/Style/Url/ResourceUrl` — only allowed with recorded review
  and a written justification, never for user-supplied or server-supplied data.
- `[innerHTML]` is sanitized by Angular but still discouraged: use it only when rich content is a
  real requirement, and sanitize explicitly for clarity. Rich text from the backend must be
  treated as untrusted.

```ts
// GOOD — plain interpolation keeps Angular escaping intact
// customer-detail.html
<p>{{ customer.notes }}</p>

// BAD — binds HTML where plain text is expected
<p [innerHTML]="customer.notes"></p>

// GOOD — reviewed rich-text case: sanitize explicitly before binding
const safeHtml = this.sanitizer.sanitize(SecurityContext.HTML, rawHtml) ?? '';

// ❌ BAD — defeats Angular security with no justification
const trusted = this.sanitizer.bypassSecurityTrustHtml(customer.comments);
```

## Secrets, Configuration and Environment Files

- Angular environment files (`environment.ts`, `environment.dev.ts`, …) are compiled into the
  public client bundle. **Treat them as public at all times.**
- ❌ No API keys, tokens, client secrets, credentials or private connection strings in code,
  environment files or any committed file.
- Environment files hold only public configuration: base URLs, feature flags, `useMocks`.
- Integrations that require a secret go through the backend/BFF — the browser never holds the
  secret.
- If a secret is ever committed, rotate it immediately: deleting the commit is not enough.

## Authentication Tokens

- Default: keep access tokens **in memory** (a private signal/field in the auth service). They
  disappear on reload and are not exposed to other tabs or persistent XSS.
- `sessionStorage` is preferred over `localStorage` when persistence across reloads is required;
  both are readable by any script running on the page.
- Persisting tokens in Web Storage requires a **recorded risk acceptance** (design note or ADR —
  see the architecture decision process in `rules.md`).
- Never log tokens, full `Authorization` headers or refresh payloads to the console, telemetry,
  error trackers or user-visible messages.

## Interceptors and Header Discipline

- The auth interceptor attaches the `Authorization` header only for the configured API host
  (see the interceptor naming in `NamingConventions.md`).
- Never forward auth headers to third-party hosts (analytics, CDNs, identity providers). Filter
  by allowlisted URL prefix, not by "everything except".

```ts
// GOOD — attach auth only to our API
if (request.url.startsWith(environment.apiBaseUrl)) {
  request = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

// BAD — every outgoing request gets the token
request = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
```

- Never propagate sensitive response headers into logs or error objects surfaced to the UI; the
  error normalization contract lives in `DataAccessGuidelines.md`.
- MSW handlers must mirror interceptor behavior in dev so missing-header bugs are visible before
  the backend exists.

## Content Security Policy and Hosting

- The app is a static SPA: CSP is delivered by the backend/hosting platform, not by Angular.
  Document and agree the policy with the hosting owner before production.
- Baseline expectations (adjust with hosting and record deviations):
  - `script-src 'self'` — production Angular builds do not require `unsafe-eval`; keep inline
    scripts out.
  - `connect-src 'self' <apiBaseUrl>` — explicit API host, no wildcards.
  - `img-src 'self' data:`; `frame-ancestors 'none'` unless embedding is a requirement.
  - `style-src` usually needs `'unsafe-inline'` for Angular component styles — record that
    decision explicitly.
- SRI (subresource integrity) does not apply to the app's own bundle (served first-party); a
  third-party CDN script, if ever added, requires SRI plus approval.
- Never relax CSP or add `unsafe-*` directives to work around a library — fix the usage or record
  an approved exception.

## Dependency and Supply-Chain Hygiene

- New runtime dependencies need an ADR (see the dependency policy in `GeneralGuidelines.md`).
- Run `npm audit` (or the organization scanner) and triage findings: no unresolved
  critical/high vulnerabilities in the shipped bundle.
- No abandoned packages (no releases or maintainer activity); prefer Angular, Material and CDK
  built-ins first.
- The lockfile is committed and is the source of truth; CI installs exactly what it pins, and
  lockfile changes are reviewed explicitly (ANG8.2).
- Review `preinstall`/`postinstall` scripts before adding a package; reject packages with
  unexpected scripts.
- Never fetch or execute remote scripts at runtime.

## Error Messages and Logging

- User-visible errors show a friendly message (plus a correlation id when available), never
  stack traces, endpoint internals or raw server messages.
- The typed `ApiError` (see `DataAccessGuidelines.md`) carries a safe `userMessage` for the UI;
  technical detail stays out of the DOM.
- No `console.log` in delivered code; diagnostics go through the approved path and never include
  tokens, PII or full request/response bodies.
- Keep debug panels and verbose error output out of production builds (ANG6.5).

## Mock Data and Fixtures

- ❌ Production customer data is **forbidden** in mocks, fixtures, specs, screenshots, demo data
  and test evidence — no exceptions.
- Use clearly fictional Pelayo-style data (`Cliente Demo`, `C-00042`, invented contracts and
  alarms).
- Scrub PII from screenshots and recorded evidence before attaching it to a phase artifact.
- Dev MSW handlers never proxy production endpoints; the first iteration makes no real backend
  calls.

## URL and Host Allowlists

- All outbound URLs come from environment/runtime configuration — never hardcoded.
- Navigation to external URLs (links, `window.open`, redirects, file downloads) validates the
  target against an allowlist; never pass user input straight into `location.href`, iframe `src`
  or `href` bindings.
- Angular blocks `javascript:` URLs in bindings by default; do not rely on that alone for
  dynamic redirects — validate first.

## Quick checklist

- [ ] No `bypassSecurityTrust*`; any `[innerHTML]` or sanitizer usage has recorded review and
      justification.
- [ ] No secrets, tokens or keys in code, environment files or any committed file; environment
      files treated as public.
- [ ] Tokens kept in memory by default; Web Storage only with recorded risk acceptance; never
      logged.
- [ ] Interceptors attach auth only to allowlisted API hosts; no header leakage to third parties.
- [ ] CSP expectations documented with backend/hosting (`script-src`, `connect-src`,
      `frame-ancestors`); no unjustified `unsafe-*`.
- [ ] `npm audit` triaged; no abandoned packages; lockfile committed and reviewed; `postinstall`
      scripts reviewed.
- [ ] Error messages and logs never leak internals, tokens or PII.
- [ ] Mocks, fixtures and evidence contain fictional data only.
- [ ] All external URLs come from configuration and are validated against an allowlist.
