# Performance Guidelines

Performance rules for Angular Pelayo projects: change detection cost, template efficiency, deferred
loading, bundle budgets and runtime rendering. Budgets are enforced on every build (ANG5.6) and
bundle sizes are recorded as evidence in the build log.

## Change Detection

- `ChangeDetectionStrategy.OnPush` on every component — no exceptions (see `ComponentGuidelines.md`).
- Prefer signals for state: signal reads mark only the consuming views dirty; do not rely on
  zone.js patching (Angular 21 apps are zoneless by default).
- ❌ Do not call `detectChanges()`/`markForCheck()` to fix stale views — find the state update that
  should have notified the view.
- Keep inputs cheap: heavy derivations belong in `computed()`, never in input setters.
- Move heavy work (sorting, mapping, parsing) into pure functions or computed state, not into
  templates or getters.

## Templates

- ❌ No function or method calls in templates; precompute values with `computed()`.
- `@for` requires `track` on a stable unique id — untracked loops re-render the whole list on any
  change (rule details in `ComponentGuidelines.md`).
- Avoid allocating `ngClass`/`ngStyle` objects per cycle; use `class`/`style` bindings with computed
  signals.
- Keep pipes lightweight; memoize non-trivial transformations with `computed()`.

## Deferred Loading

- Use `@defer` for heavy, below-the-fold sections: history tables, charts, maps, secondary panels.
- Choose explicit triggers:
  - `on viewport` — content far below the fold in a scrollable page;
  - `on idle` — non-critical work after the first render;
  - `on interaction` — content behind a user action (tab, expansion panel).
- Always provide a `@placeholder` with reserved dimensions to prevent layout shift.

```html
@defer (on viewport) {
  <pelayo-contract-history [contractId]="contractId()" />
} @placeholder {
  <div class="contract-history__skeleton" aria-hidden="true"></div>
} @loading (minimum 200ms) {
  <pelayo-loading />
}
```

- ❌ Do not defer above-the-fold content; the initial view must render without deferral.

## Routing and Code Splitting

- Load features lazily (`loadChildren`/`loadComponent`) by default — see `RoutingGuidelines.md`.
- Keep the initial bundle to: shell, shared UI and the first rendered route.
- ❌ Never import feature code from `core/` or across features — it silently pulls lazy chunks into
  the initial bundle.

## Images

- Use `NgOptimizedImage` (`ngSrc`) for static images; it enforces sizing and loading best practices.
- Always set `width`/`height` (or `fill`) to avoid layout shift; use `sizes` for responsive images.
- `priority` only for above-the-fold hero/brand images; everything else lazy-loads by default.
- Prefer SVG for icons and illustrations; serve photos as WebP at the size actually displayed.

```html
<!-- GOOD: sized, prioritized above-the-fold image -->
<img ngSrc="assets/alarm-hero.webp" width="640" height="360" priority alt="Instalación de alarma" />

<!-- GOOD: lazy below-the-fold image with responsive sizes -->
<img
  ngSrc="assets/contract-scanner.webp"
  width="480"
  height="320"
  sizes="(max-width: 600px) 100vw, 480px"
  alt="Escáner de contratos"
/>
```

## Bundle Budgets

- Budgets are configured in `angular.json` and are blocking: **initial** (startup JS/CSS) and
  **anyComponentStyle** (any single component stylesheet). Set explicit values per configuration.
- `npm run build` must pass with budgets respected; a budget failure is a defect to fix at the
  source (ANG5.6).
- ❌ Never raise or remove a budget to make a build pass.

```json
"budgets": [
  { "type": "initial", "maximumWarning": "400kB", "maximumError": "600kB" },
  { "type": "anyComponentStyle", "maximumWarning": "4kB", "maximumError": "8kB" }
]
```

- Values above are a starting point; the project sets and records its own.

## Budget-Failure Analysis Workflow

When a budget fails:

1. Produce build stats: `ng build --stats-json` (production configuration).
2. Inspect the output with `source-map-explorer` to attribute weight to modules.
3. Identify the cause: oversized dependency, barrel import pulling a whole library, duplicated code
   in the initial chunk, or a bloated component stylesheet.
4. Fix the cause (tree-shakable import, lazy route, dependency removal, style split) — not the
   budget.
5. Rebuild, confirm the budget passes, and record before/after sizes in the build log.

## Dependency Discipline

- ❌ No `lodash` — use native array/object/string methods or small shared helpers.
- ❌ No `moment` — use native `Intl`/`Date` APIs; `date-fns` only with recorded approval and
  per-function imports.
- Import only the Material standalone components/directives the template uses; ❌ no barrel imports
  that drag the whole library into a chunk.
- New runtime dependencies require an ADR and a size check first (see `GeneralGuidelines.md`).
- Prefer CDK primitives (`@angular/cdk/*`) over writing custom behavior code.

## Long Lists and User Input

- Lists beyond ~100 rows: use CDK virtual scrolling (`cdk-virtual-scroll-viewport` +
  `*cdkVirtualFor`) instead of rendering every row.
- Match `itemSize` to the real row height to avoid re-measurement.

```html
<cdk-virtual-scroll-viewport itemSize="56" class="customer-list__viewport">
  <pelayo-customer-row *cdkVirtualFor="let customer of customers()" [customer]="customer" />
</cdk-virtual-scroll-viewport>
```

- Debounce text inputs that trigger search or filtering (typically 300 ms) — operator guidance in
  `RxJSGuidelines.md`.

```typescript
// GOOD: debounced search feed
protected readonly customers = toSignal(
  this.searchControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => this.customerApi.search(term)),
  ),
  { initialValue: [] },
);
```

## Runtime Rendering

- Avoid layout thrash: batch DOM reads (`offsetHeight`, `getBoundingClientRect`) before writes;
  never measure inside a loop that also mutates the DOM.
- Perform DOM measurements in `afterNextRender` (see `ComponentGuidelines.md`), not during render.
- Animate only `transform` and `opacity`; ❌ never animate `width`, `height`, `top` or `margin`.
- Prefer CSS transitions/animations over JS-driven frame loops.

## Performance Evidence

- Record bundle sizes (initial + component styles) in the build log on every task loop and at
  closeout — required by ANG5.6 (`templates/build-log-angular.md`).
- Phase 6 smoke: capture a Lighthouse or DevTools Performance note for the main flows (initial load
  timing, long tasks) and confirm a clean console (ANG6.4).
- Any budget adjustment is a recorded decision with before/after evidence — never a silent edit.

## Quick Checklist

- [ ] `OnPush` on every component; signals used for reactive state.
- [ ] No function/method calls in templates; `computed()` for derived values.
- [ ] `@for` loops use `track` (see `ComponentGuidelines.md`).
- [ ] Heavy below-the-fold sections use `@defer` with viewport/idle triggers.
- [ ] Routes are lazy-loaded (see `RoutingGuidelines.md`).
- [ ] Images use `NgOptimizedImage` with dimensions; `priority` only above the fold.
- [ ] Budgets set in `angular.json` (initial + `anyComponentStyle`) and passing (ANG5.6).
- [ ] No `lodash`/`moment`; Material imported tree-shakably.
- [ ] Long lists use CDK virtual scrolling; inputs debounced (see `RxJSGuidelines.md`).
- [ ] No layout thrash; animations limited to `transform`/`opacity`.
- [ ] Bundle sizes recorded in the build log; Phase 6 performance note captured.
