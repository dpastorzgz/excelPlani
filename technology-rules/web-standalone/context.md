# Technology Context — Standalone Web

Standalone Web applications are static HTML/CSS/JavaScript packages executed by a modern browser. They may use a loopback-only local server to establish a predictable same-origin context while keeping all data and runtime assets on the user's machine.

## Core Concepts

1. **Origin** — Browser security boundary defined by scheme, host and port.
2. **Opaque file origin** — `file://` documents commonly cannot fetch neighbouring files reliably.
3. **Local-first** — Data processing and assets remain on the device without public network calls.
4. **Static release** — Deterministic files served without an application backend.
5. **Source adapter** — Boundary translating external workbook structure into stable domain records.
6. **Progressive fallback** — Permission-gated APIs such as clipboard have an observable alternative.
7. **Accessible visualization** — SVG/canvas/DOM graphics require keyboard and text equivalents.

## Platform / Environment

| Property | Value |
| --- | --- |
| Runtime environment | Microsoft Edge / Google Chrome browser |
| Execution model | Client-side event-driven application from localhost |
| Deployment unit | Static `dist/` directory or archive |
| Primary CLI tool | npm for build/test; PowerShell for local launch |

## Key Constraints and Limitations

- Browser JavaScript cannot read an arbitrary local path by filename.
- `file://` resources commonly have opaque origins and fail same-origin reads.
- Clipboard image writing requires support, a secure/eligible context and user activation; PNG download is required as fallback.
- Browser spreadsheet readers consume stored workbook values and do not execute VBA macros or guarantee Excel formula recalculation.

## Common Pitfalls

- Using a successful development fetch as proof that `file://` production use works.
- Mixing worksheet coordinates with business rules, making schema changes unsafe.
- Rendering workbook strings as HTML.
- Treating current percentage complete as historical progress.

## Integration Points

- **Inbound**: Same-origin `fetch` retrieves the configured workbook bytes from localhost.
- **Outbound**: PNG is written to clipboard with user action or downloaded locally.
- **Authentication**: None; operating-system directory permissions govern access.

## Toolchain Overview

| Tool | Purpose | When to use |
| --- | --- | --- |
| SheetJS CE | Parse `.xlsx`/`.xlsm` bytes into workbook values | Source adapter |
| ESLint | Static JavaScript analysis | Build and verification |
| Vitest | Pure unit/integration tests | Domain and adapters |
| Playwright | Browser workflows | E2E, accessibility and performance |
| axe-core | Automated accessibility scan | Verification and E2E |

## Glossary

| Term | Definition |
| --- | --- |
| Same origin | Resources with identical scheme, host and port |
| Localhost launcher | Loopback-only server plus browser opener for the static release |
| Cached formula value | Last calculated value stored in the workbook file |
| Presentation snapshot | Deterministic 1920×1080 representation of the current filtered view |
