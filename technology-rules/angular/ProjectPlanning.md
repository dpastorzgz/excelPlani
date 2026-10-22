# Project Planning (Angular)

Estimation and sizing guidance for Angular work items. Loaded in Phase 3 (feasibility and design
planning) and Phase 4 (task breakdown) — see the mandatory files table in `rules.md`. It does not
restate process rules; it explains how to size Angular work realistically, especially when the
backend is not yet available.

## Sizing Units

Estimate in these units; each unit is also a valid Phase 4 task with its own evidence (ANG4.1,
ANG4.2). Use a relative S/M/L scale and keep it consistent across the work item.

| Unit | Typical size | Size drivers |
| --- | --- | --- |
| Component (standalone, OnPush) | S–M | Template complexity, Material composition, inputs/outputs, state branches |
| Route integration (`*-routes.ts`, guards, titles) | S | Route count, guards, resolvers, redirects |
| Data-access service (+ DTO mappers) | M | Endpoint count, DTO↔model mapping, error normalization |
| Signal store | M–L | State shape, computed state, consumers, persistence |
| Form (typed reactive, validation) | M–L | Field count, cross-field rules, error display, CVA when shared |
| MSW mock set (handlers + fixtures) | S–M | Endpoint count, success/failure/empty variants, fixture realism |
| Test suite per unit | S–M each | Required scenario classes (positive, negative, boundary, state) |
| Styling / responsive pass | S–M | Breakpoint-specific layouts, Material theming overrides |
| A11y pass (per flow) | S–M | Keyboard flows, focus management, labels, axe checks |

- Style and a11y passes are units too — estimate them explicitly instead of hiding them inside
  "component done". WCAG 2.2 AA is a target requirement (ANG3.7, ANG6.3).

## Complexity Factors (Multipliers)

Apply roughly ×1.2–1.5 per factor present; cap the total around ×2.5 — beyond that, split.

- **State interactions**: store shared across features, optimistic updates, cache invalidation.
- **Material customization**: theming beyond M3 tokens, `::ng-deep` needs, custom form controls
  (see `StylingGuidelines.md`).
- **A11y requirements**: dialogs and drawers with focus management, data tables, live regions,
  complex keyboard flows (see `AccessibilityGuidelines.md`).
- **API contract availability**: no frozen contract → add design time, mock design and rework
  risk; MSW-first iteration is mandatory (no real backend calls in iteration 1).
- **MSW mock effort**: realistic fixtures per endpoint and per state; every screen state needs a
  deterministic handler.
- **Responsive complexity**: distinct desktop/mobile layouts rather than simple reflow (breakpoints
  are frozen in `StylingGuidelines.md`).
- **Forms depth**: cross-field and async validation, server-error mapping (see
  `FormsGuidelines.md`).
- **New third-party dependency** in the critical path — requires an ADR first (see
  `GeneralGuidelines.md`).

## Effort Bands

| Band | Typical content |
| --- | --- |
| Small | One component or one mock set; no new state; single async path |
| Medium | Component + data-access + tests; 2–3 async states; a simple form or store |
| Large | Feature slice: store + 3–5 components + routes + mocks + tests |
| Beyond large | Not a work item — split it (below) |

## Splitting Rule

- Split the work item when it exceeds **~5–6 components** or **more than 2 features/screens**.
- Each split item must remain vertically deliverable and respect dependency order: models →
  data-access → state → components → routes → styles (ANG4.3).
- Split when more than one "Large" band item sits on the critical path, or when mock-first scope
  mixes with real-backend scope in the same item.

## Risks to Record During Planning

| Risk | Mitigation |
| --- | --- |
| Backend not available | MSW-first iteration with agreed mock contracts; no real calls in iteration 1 |
| Experimental Angular APIs (Signal Forms, Angular Aria) | Not allowed by default; plan the stable alternative; record approval before design freeze (see `rules.md`) |
| Designs undefined or incomplete | Timebox UX input; Phase 2 Material prototype if needed; record deferrals in the Spec vs Design register (ANG3.2) |
| New third-party dependency | ADR + dependency policy review before it enters the critical path; prefer built-ins |
| API contract drift | DTO→model mapping behind data-access; deterministic MSW fixtures as a living contract |
| Responsive/a11y surprises late | Estimate both passes up front; verify at Phase 6 with recorded viewports and axe results |

## Planning Checklist

- [ ] Every screen and flow is mapped to sizing units; no "misc" buckets.
- [ ] Complexity factors applied and documented (state, Material, a11y, API availability, mocks,
      responsive).
- [ ] Test suite effort estimated per unit, including the four scenario classes from
      `TestingGuidelines.md`.
- [ ] MSW mock work estimated per endpoint and included in the first iteration.
- [ ] Each task lists exact deliverable paths and expected evidence commands (ANG4.2).
- [ ] Dependency order respected; no task depends on a later task (ANG4.3).
- [ ] Splitting rule applied when limits are exceeded; split items stay vertically deliverable.
- [ ] Risks recorded with mitigation; experimental APIs and new dependencies flagged for approval.
