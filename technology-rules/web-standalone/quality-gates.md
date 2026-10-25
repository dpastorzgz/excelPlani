# Quality Gates — Standalone Web Extensions

These gates extend the framework gates for `web-standalone` work items.

## Phase 3 — Design

- WSG3.1 — Local-source feasibility is validated: same-origin serving, supported browsers and file-loading constraints are documented with primary sources.
- WSG3.2 — Design freezes offline dependency policy, safe rendering of workbook text, accessibility contracts and export fallback.
- WSG3.3 — A deployability proof or documented equivalent confirms the designed static artifact can be served locally without a backend or public network dependency.

## Phase 4 — Tasks

- WSG4.1 — Each task names expected paths, requirement IDs, dependency layer, tests and evidence.
- WSG4.2 — Parser, domain rules, accessibility, launcher, export and release validation have explicit tasks.

## Phase 5 — Construction

- WSG5.1 — `npm run lint`, `npm test` and `npm run build` pass; the exact `dist/` artifact is recorded.
- WSG5.2 — Runtime assets and dependency notices are local; no CDN, analytics or remote workbook transmission exists.
- WSG5.3 — Source workbook hash and modification time remain unchanged after smoke use and export.

## Phase 6 — Verification

- WSG6.1 — ESLint passes with zero errors and no suppressed blocking rule without recorded approval.
- WSG6.2 — Release artifact runs offline from localhost in supported browsers and contains no unexpected network request.
- WSG6.3 — Automated accessibility checks have zero critical/serious violations and manual keyboard/zoom checks pass.

## Phase 7 — Testing

- WSG7.1 — Coverage meets 85%; positive, negative, boundary and malformed-input cases pass.
- WSG7.2 — Playwright passes on current and previous stable Edge/Chromium-compatible channels available to CI; any manual Edge matrix evidence is recorded.
- WSG7.3 — 1,000-task performance, offline behavior, PNG fallback and workbook immutability tests pass.

## Phase 9 — Release

- WSG9.1 — The released archive is byte-identical to the approved Phase 5 artifact and has a recorded checksum.
- WSG9.2 — Clean-directory local smoke, rollback instructions and dependency licenses are recorded.

## Evidence Requirements

- Build: `work-item/[project-slug]/05-build/build-log.md`
- Verification: `work-item/[project-slug]/06-verification/verification-report.md`
- Testing: `work-item/[project-slug]/07-testing/test-report.md`
- Release: `work-item/[project-slug]/09-release/release-notes.md`
