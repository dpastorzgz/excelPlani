# Technology Rules — Standalone Web

> Baseline for local-first browser applications delivered as static HTML, CSS and JavaScript.

## Phase 01 — Proposal

- State supported browsers, offline expectations, licensing constraints and whether local files require a localhost launcher.
- Do not promise automatic neighbour-file access from `file://`; modern browsers commonly use opaque file origins.

## Phase 02 — Specs

- Define measurable browser compatibility, performance, accessibility and offline criteria.
- Specify whether source files are read-only, whether network transmission is forbidden and what fallback exists for permission-gated browser APIs.

## Phase 03 — Design

- Use explicit layers for configuration, source loading, parsing/normalization, domain rules, state/filtering, presentation and export.
- Keep the domain model independent of workbook coordinates and browser rendering objects.
- Resolve all relative resources from a same-origin localhost base; never rely on direct `file://` fetch.
- Pin and vendor runtime dependencies locally with license notices; runtime CDN dependencies are forbidden.
- Treat spreadsheet text as untrusted input: render with safe text APIs and never inject it as HTML.
- Provide keyboard semantics, focus behavior, non-color status cues and reduced-motion behavior in the component contracts.
- Define deterministic export dimensions and a fallback when Clipboard API permission or support is unavailable.
- Record ADRs for local serving, spreadsheet parsing, UI rendering and presentation export.

## Phase 04 — Tasks

- Decompose by independently testable module or vertical behavior; each task lists paths, requirement IDs, tests and evidence.
- Keep launcher, parser, domain rules, UI, accessibility and export work explicit rather than hiding them in a single “build dashboard” task.
- Dependency order must flow from contracts/domain to adapters and UI; no task may depend on an undefined later contract.

## Phase 05 — Construction

- Use ES modules, semantic HTML and standards-based CSS. Keep business calculations in pure JavaScript modules.
- `npm run lint`, `npm test` and `npm run build` are mandatory build checks.
- The release build must contain all runtime assets locally and must not write to the source workbook.
- Record commands, versions, outputs and the produced `dist/` artifact in the build log.

## Phase 06 — Verification

- Run lint, dependency/license inventory, offline network inspection, accessibility analysis and a release-build smoke test.
- Reconcile diagram components, module inventory and delivered files. Verify filename configuration has one authoritative definition.
- Verify the release contains no runtime references to public CDNs or analytics endpoints.

## Phase 07 — Testing

- Minimum line/statement coverage: **85%** for executable application modules; generated/vendor files are excluded and documented.
- Vitest covers pure units and integration boundaries; Playwright covers supported-browser workflows; axe-core covers automated accessibility checks.
- Positive, negative, boundary and malformed-workbook cases are mandatory. Test 0 and 1,000 task boundaries.
- E2E tests must cover offline use, keyboard use, PNG fallback and protection against workbook mutation.

## Phase 08 — Commit / PR

- Branches use `codex/<short-description>` unless the project requests another name.
- Required checks: lint, unit/integration tests, coverage, build and browser smoke tests.
- Use squash merge after at least one approval.

## Phase 09 — Release

- Release the exact Phase 5 `dist/` artifact after validation; do not rebuild it in Phase 9.
- Include dependency licenses, configuration instructions, launcher and rollback instructions.
- Post-release smoke must run from a clean local directory containing a representative workbook.

## Phase 10 — Archive

- Retain source, lockfile, test reports, release checksum, dependency notices and the released archive reference.

## Forbidden Patterns

```text
❌ Runtime CDN dependencies — break offline/privacy guarantees and reproducibility
❌ Automatic spreadsheet fetch from file:// — unreliable and blocked by common browser security behavior
❌ innerHTML with workbook-derived content — creates injection risk
❌ Business rules coupled to worksheet cell addresses — prevents validation and testing
❌ Workbook filename duplicated outside the authoritative configuration — violates maintainability
❌ Silent exclusion of malformed tasks — produces misleading metrics
```

## Required Tools and Versions

| Tool | Version | Purpose |
| --- | --- | --- |
| Node.js | >=22 | Build and test runtime only |
| npm | compatible with Node.js | Reproducible dependency installation and scripts |
| ESLint | project lockfile | Static analysis |
| Vitest | project lockfile | Unit and integration tests |
| Playwright | project lockfile | Browser workflow tests |
| axe-core | project lockfile | Automated accessibility checks |

## External References

- MDN same-origin policy: https://developer.mozilla.org/docs/Web/Security/Defenses/Same-origin_policy
- SheetJS local file access: https://docs.sheetjs.com/docs/demos/local/file/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Guidelines: `technology-rules/web-standalone/GeneralGuidelines.md` and `NamingConventions.md`
