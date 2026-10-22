# Deployment Guidelines

Deployment rules for Angular Pelayo frontends: how builds are produced, how the release artifact is promoted across environments, and what must never reach an environment. The pipeline of record is `release-pipeline.yml`; this file documents the build, CI, hosting and rollback practices behind it.

## Build Configurations (Frozen Commands)

| Purpose | Command | Configuration |
| --- | --- | --- |
| Dev server (MSW mocks) | `npm start` | development serve |
| Production build (default) | `npm run build` | production |
| Dev environment build | `npm run build:dev` | development |
| ACP environment build | `npm run build:acp` | development |
| Pre environment build | `npm run build:pre` | production |
| Unit tests | `npm test` | Vitest 4 + jsdom |
| Coverage | `npm test -- --coverage` | Vitest coverage |
| Lint | `npm run lint` | ESLint + angular-eslint |
| Format check | `npm run format:check` | Prettier check |

- `dev`/`acp` use the development configuration (`npm run build:dev`, `npm run build:acp`); `pre`/`production` use the production configuration (`npm run build:pre`, `npm run build`).
- The production-optimized artifact validated in `pre` is the exact artifact promoted to `production` — never rebuilt by hand.
- `npm run build` is a blocking gate: 0 errors and bundle budgets in `angular.json` respected (see `PerformanceGuidelines.md`).

## Artifact Policy

- The release artifact is the `dist/` output produced **in CI only** — never a local build.
- Build id = git commit SHA. Every artifact is traceable to exactly one commit.
- Artifacts are immutable: never patch, never rebuild an artifact for a promotion; promote the existing one.
- Promotion path `acp → pre → production`: each environment validates the artifact built for its required configuration, and the production-optimized artifact validated in `pre` (same build id) is promoted unchanged to `production`.
- Retain the last **N = 5 builds** in the artifact store (or rely on the hosting platform's versioning) so any release can be rolled back (see Rollback).

## Environment Configuration Strategy

- Pick one strategy per project and record why if it is not the default:
  - default: build-time environment files under `src/environments/`, switched per configuration via `fileReplacements` in `angular.json`;
  - alternative: runtime configuration (a `config.json` fetched before bootstrap) — only with an ADR.
- Never hardcode URLs, ports, feature flags or tenant identifiers in code. Read them from environment/runtime config.

```ts
// GOOD — resolved from environment configuration
this.http.get<CustomerDto[]>(`${environment.apiBaseUrl}/customers`);
```

```ts
// BAD — hardcoded URL: breaks per environment and leaks internal topology
this.http.get<CustomerDto[]>('https://pre-api.pelayo.internal/v1/customers');
```

- The mock flag (`environment.useMocks`) must be `false` for `pre` and `production` builds; mocks are loaded only when it is `true` (see `DataAccessGuidelines.md`). **Mocks must never ship.**
- CI must assert that a production-configuration artifact contains no MSW handlers or mock service-worker code.

## CI Pipeline Outline

Stages (any red stage stops the pipeline; no artifact is published from a failed run):

1. **Install** — `npm ci` from the lockfile; the lockfile must be committed and consistent with dependencies.
2. **Lint** — `npm run lint`; 0 errors, blocking (`ANG5.3`).
3. **Format check** — `npm run format:check`; clean, blocking.
4. **Test** — `npm test`; 0 failures.
5. **Coverage** — `npm test -- --coverage`; ≥75% global, ≥85% critical data-access/state.
6. **Build per configuration** — development config (`npm run build:dev`, `npm run build:acp`) for `dev`/`acp`; production config (`npm run build:pre`, `npm run build`) for `pre`/`production`.
7. **Publish artifact** — immutable store keyed by build id, named per project/config (e.g. `[project-name]-[config]-[build-id]`).

- Cache only dependencies (npm cache keyed by the lockfile); never cache `dist/`.
- Production builds keep `outputHashing` on: hashed filenames allow long-lived asset caching, while `index.html` is served no-cache.
- One pipeline definition drives all environments; the promoted artifact, not the source, moves between environments.
- Toolchain: Node ≥22, Angular CLI 21 and the committed lockfile; CI and developer machines must use the same major versions.
- Dependency changes are explicit and reviewed (see `GeneralGuidelines.md` dependency policy); `npm ci` fails fast on a stale or missing lockfile.

## Hosting Assumptions

- The app is a static browser SPA (`dist/` served as static files); no SSR today.
- Required **SPA fallback**: any request that does not resolve to an existing file must rewrite to `/index.html` with status 200, so deep links and hard reloads work with the client router. Document the rewrite rule with the hosting team:

```
# Generic SPA fallback rewrite (adapt to the hosting platform)
match:  request path does not resolve to an existing file under dist/
action: serve /index.html with status 200
```

- Serve `index.html` with `Cache-Control: no-cache`; serve hashed assets with long-lived immutable caching.
- Coordinate security headers (CSP, X-Content-Type-Options) with the hosting/backend team — see `SecurityGuidelines.md`.

## ESLint + Prettier Project Setup (Mandatory)

`ANG5.3` is blocking: a project cannot pass Phase 5 until the lint and format gates exist and run.

- Required files: `eslint.config.js` (flat config) using angular-eslint; a Prettier configuration (`.prettierrc` or a `prettier` key).
- Required devDependencies (at least): `eslint`, `typescript-eslint`, `angular-eslint`, `prettier`.
- Required scripts — exact names:

```json
{
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

- The flat config must cover TypeScript sources and inline/template HTML through the angular-eslint presets; see `GeneralGuidelines.md` and `ComponentGuidelines.md` for the rules the codebase must satisfy.
- Never weaken the gates to make a build pass: no blanket `eslint-disable`, no removing or renaming the scripts.

## Release Procedure

Releases follow `release-pipeline.yml` — hops, approvals and smoke requirements live there; this section summarizes the discipline.

| Hop | Validate | Approval |
| --- | --- | --- |
| `dev → acp` | development-config build + lint + tests | none (automatic) |
| `acp → pre` | production-config build + full test suite + smoke checklist + a11y check | QA sign-off |
| `pre → production` | artifact identity verified (same build id validated in pre; no rebuild) | release manager (rollback plan + post-deploy smoke required) |

- Never promote an artifact that did not pass the hop's checks in the source environment.
- Record deployment evidence with the release notes: `target_environment`, `build_id_or_commit`, `artifact_reference`, `validation_result`, `smoke_result`, `rollback_reference` (`ANG9.3`).

## Build Log and Deployment Evidence

- Record every build/lint/test command and result in `work-item/[project-slug]/05-build/build-log.md` (`ANG5.7`): command, configuration, result, bundle sizes (initial and per component).
- Bundle sizes are recorded per build; unexplained growth against budgets is a blocker (`ANG5.6`, see `PerformanceGuidelines.md`).
- Verification evidence goes to `work-item/[project-slug]/06-verification/verification-report.md`; testing evidence to `work-item/[project-slug]/07-testing/test-report.md`.
- Release evidence goes to `work-item/[project-slug]/09-release/release-notes.md` with the required fields from `release-pipeline.yml`.
- Keep artifact and evidence cross-referenced by build id so any deployed state can be traced back to its commit and its validation history.

## Rollback

- Rollback = re-deploy the previous artifact version (previous build id). Never rebuild from an older commit.
- Keep the last N = 5 builds (or use platform versioning/instant rollback) so the previous artifact is always available.
- The frontend owns no data migration: rollback is a pure artifact swap. When a release depends on API or storage changes, coordinate the frontend rollback with the backend/data rollback.
- Identify and record the rollback reference **before** production promotion (release manager requirement in `release-pipeline.yml`).

## What Must Never Be Deployed

- ❌ MSW mocks, mock handlers or mock service-worker code in any built artifact for `pre`/`production`.
- ❌ Development configuration to `pre`/`production` (dev-mode is for `dev`/`acp` only).
- ❌ Source maps in production builds unless an explicit recorded approval exists — production builds exclude source maps by default (`source_maps_in_production: false`).
- ❌ Locally built `dist/` artifacts, uncommitted code, or artifacts without a build id/commit SHA.
- ❌ `dist/` or coverage output committed to version control.

## Post-Deploy Smoke Checklist

Run after every deploy of the artifact; record results in the release notes.

- [ ] Target URL serves the app; hard reload of a deep link works (SPA fallback active).
- [ ] Build id/version verified against the promoted artifact.
- [ ] Main flows in the release scope work against the real backend (no mocks).
- [ ] Browser console free of errors (`ANG6.4`).
- [ ] Static assets load (fonts, icons, Material theme) with no 404s.
- [ ] Responsive smoke on desktop and mobile viewports (`pre`/`production`).
- [ ] Accessibility smoke on main flows where required by the hop (`ANG6.3`).
- [ ] Rollback decision point recorded (keep or roll back).

## Quick Checklist

- [ ] Builds run in CI; the release artifact is an immutable CI-built `dist/` keyed by commit SHA.
- [ ] Development vs production configurations are used per environment (`dev`/`acp` vs `pre`/`production`).
- [ ] No hardcoded URLs; mock flag is `false` outside `dev`.
- [ ] CI runs install → lint → format check → test → coverage → build → publish artifact.
- [ ] SPA fallback rewrite to `index.html` is configured and documented with hosting.
- [ ] ESLint flat config + Prettier setup exists with `lint`, `format`, `format:check` scripts.
- [ ] Release follows `release-pipeline.yml` hops and approvals; deployment evidence recorded.
- [ ] Build log records commands, results and bundle sizes (`ANG5.6`/`ANG5.7`).
- [ ] Rollback path (previous build id, last 5 builds) identified before production.
- [ ] Post-deploy smoke executed and recorded.
- [ ] No mocks, dev configs or unapproved source maps deployed.
