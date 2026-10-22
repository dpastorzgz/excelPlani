# Accessibility Guidelines

Every screen targets **WCAG 2.2 AA**. Accessibility is part of "done": it is verified during the
Phase 6 smoke (keyboard pass + automated check, see `quality-gates.md` ANG6.3), never retrofitted
at the end.

## Semantic HTML First

- Prefer native elements over ARIA: `button`, `a`, `nav`, `main`, `table`, `label`, `fieldset`.
- One `<main>` per view, one `h1` per route; never skip heading levels.
- Use `button` for actions and `a`/`routerLink` for navigation; ❌ never attach `(click)` to a
  `div`/`span`.
- Add ARIA only when no native element expresses the semantics — a wrong role is worse than none.

## Angular Material as the Baseline

- Material components ship roles, focus management and contrast — keep those behaviors.
- ❌ Do not strip Material behaviors: no `tabindex="-1"` on dialog content, no removing `aria-*`
  attributes, no disabling the focus trap to "simplify".
- Prefer Material/CDK widgets (`mat-dialog`, `mat-menu`, `mat-table`, `mat-select`, `@angular/cdk/a11y`)
  over hand-rolled replacements.
- Any deliberate deviation from Material behavior needs a recorded justification plus a keyboard pass.

## Forms and Labels

- Every input has a visible label (`mat-label`); when the design truly has no room, use `aria-label`.
- ❌ Placeholders never replace labels.
- Errors: render with `mat-error` inside `mat-form-field` — Material links it via `aria-describedby`
  automatically. Display rules (dirty/touched) belong to `FormsGuidelines.md`.
- Mark required fields; put format hints in `mat-hint` or the label, not only in the error message.
- Group related controls with `fieldset`/`legend` or `role="group"` + `aria-labelledby`.

```html
<!-- GOOD: labeled field with an announced error -->
<mat-form-field>
  <mat-label>Número de contrato</mat-label>
  <input matInput formControlName="contractNumber" />
  @if (contractNumber.invalid && contractNumber.touched) {
    <mat-error>El número de contrato es obligatorio</mat-error>
  }
</mat-form-field>
```

## Icons and Images

- Decorative `mat-icon`: `aria-hidden="true"`, no text alternative — adjacent text carries the meaning.
- Meaningful icons: give an accessible name (`role="img"` + `aria-label`).
- Icon-only buttons always carry `aria-label`.

```html
<!-- GOOD: decorative icon inside a labeled button -->
<button mat-flat-button (click)="saveCustomer()">
  <mat-icon aria-hidden="true">save</mat-icon>
  Guardar cambios
</button>

<!-- GOOD: icon-only button with accessible name -->
<button mat-icon-button aria-label="Eliminar contrato" (click)="removeContract()">
  <mat-icon aria-hidden="true">delete</mat-icon>
</button>

<!-- GOOD: standalone status icon with accessible name -->
<mat-icon role="img" aria-label="Alarma activa">alarm_on</mat-icon>
```

- Images: meaningful images get a concise `alt`; decorative images get `alt=""`.
- ❌ No `alt` text starting with "image of"/"imagen de", and no file names as alt text.
- Optimized images (`NgOptimizedImage`) still require `alt` — see `PerformanceGuidelines.md`.

## Keyboard Operability

- Every flow must complete with keyboard only: `Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`,
  arrow keys where the widget expects them.
- Keep focus indicators visible; ❌ never `outline: none` without an equally visible replacement.
- ❌ No positive `tabindex` values — DOM order must match visual order.
- Dialogs and drawers keep focus inside: `MatDialog`/`MatDrawer` include a focus trap; use
  `cdkTrapFocus` (`@angular/cdk/a11y`) for custom overlays (AutoCapture enabled).
- `Escape` closes overlays (Material default) — keep it and verify it in the keyboard pass.
- Touch targets: minimum 24×24 CSS px (WCAG 2.2); do not shrink Material control hit areas.

```html
<!-- GOOD: custom overlay traps and later restores focus -->
<section
  cdkTrapFocus
  [cdkTrapFocusAutoCapture]="true"
  role="dialog"
  aria-modal="true"
  aria-labelledby="filter-panel-title"
>
  <h2 id="filter-panel-title">Filtros</h2>
</section>
```

## Focus Management

- On route change, move focus to the view heading (or main container) so the new screen is
  announced to assistive technology.
- After a destructive confirmation dialog, return focus to the triggering control — Material
  restores focus by default; do not disable `restoreFocus`.
- After removing a row or item, move focus to a logical neighbor (next row or the section
  heading); never leave focus on a removed node.

```typescript
// GOOD: announce the new view by focusing its heading after navigation
this.router.events
  .pipe(
    filter(event => event instanceof NavigationEnd),
    takeUntilDestroyed(),
  )
  .subscribe(() => this.pageHeading()?.nativeElement.focus());
```

- Make the heading focus target programmatically focusable (`tabindex="-1"`) so it stays out of
  the tab order.

## Async Feedback and Live Regions

- Announce asynchronous results (save, delete, error) with `LiveAnnouncer` or `MatSnackBar`
  (snackbars announce politely by default).
- Use `polite` by default; reserve `assertive` for critical, time-sensitive errors.
- Loading states: mark the updating region `aria-busy="true"` (or use the shared loading component);
  a silent spinner communicates nothing to screen readers.

```typescript
private readonly liveAnnouncer = inject(LiveAnnouncer);

saveCustomer(): void {
  // ...after a successful save
  this.liveAnnouncer.announce('Cliente guardado correctamente', 'polite');
}
```

## Color and Contrast

- Theme tokens (M3 system variables) keep Material components at AA contrast — do not hardcode
  colors to "fix" a look.
- Custom colors (defined in token files only — see `StylingGuidelines.md`) must be verified:
  4.5:1 for normal text, 3:1 for large text and UI components.
- ❌ Never convey information by color alone — status chips carry text or an icon, not just red/green.
- Focus indicators, error and disabled states also need sufficient contrast.

## Tables

- Use `MatTable` with `matColumnDef`; render real `<th>` headers with `scope="col"` when building
  markup manually.
- Give non-obvious tables an accessible name (`aria-label` or a caption).
- Keep `mat-sort-header` button semantics for sortable columns; do not replace them with custom
  click handlers.
- Empty state: visible message inside the table area, announced like other async feedback.

## Verification (Phase 6 Smoke)

- Automated: run an axe (`axe-core`) check on every main flow; zero critical/serious issues (ANG6.3).
- Manual: keyboard-only pass of each main flow — complete the flow, check focus order, focus
  visibility and `Escape` behavior in overlays.
- Recommended: screen-reader spot check (VoiceOver or NVDA) on the primary flow.
- Record results in the verification report (`work-item/[project-slug]/06-verification/verification-report.md`).

## Quick Checklist

- [ ] Semantic elements used before ARIA; one `h1` per route, no skipped levels.
- [ ] Every input has a visible label or `aria-label`; errors use `mat-error`.
- [ ] Decorative icons use `aria-hidden="true"`; icon-only buttons have `aria-label`.
- [ ] Every flow is operable with keyboard only; focus indicator always visible.
- [ ] Overlays trap focus (`cdkTrapFocus`) and restore it on close.
- [ ] Focus moves to the view heading on route change.
- [ ] Async feedback announced (`LiveAnnouncer`/snackbar); loading regions use `aria-busy`.
- [ ] Custom colors verified at 4.5:1 / 3:1; no color-only meaning.
- [ ] Tables use proper headers and an accessible name.
- [ ] axe check + keyboard-only pass recorded for main flows (ANG6.3).
