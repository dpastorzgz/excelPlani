# Styling Guidelines

Styling rules for Angular Pelayo projects: SCSS architecture, Material 21 (M3) theming, design
tokens, responsive layout and encapsulation. Visual decisions must be token-driven and
component-scoped so screens stay consistent, accessible and cheap to maintain.

## SCSS Architecture

- Global styles live in `src/styles/`; component styles live next to their component file
  (`customer-list/customer-list.scss`).
- Use `@use` (Sass modules) — ❌ never `@import` (deprecated; it will be removed from Sass).

| File | Responsibility |
| --- | --- |
| `src/styles.scss` | Entry point: reset, theme, tokens, typography, global utilities |
| `src/styles/_material-theme.scss` | Material theme configuration (`mat.theme` mixin) |
| `src/styles/_tokens.scss` | Project design tokens as CSS custom properties |
| `src/styles/_typography.scss` | Font stacks, type scale, text utilities |
| `<feature>/<component>/<component>.scss` | Component styles, encapsulated by default |

- Keep global CSS minimal (reset + theme + tokens + a few utilities) and never style another
  feature's components from it; extract a shared component instead (`shared/`).

## Angular Material Theming (Material 21, M3)

- Configure the theme once in `_material-theme.scss` using the `mat.theme` mixin with M3 tokens.
- Customize Material components through theme tokens and system variables (`--mat-sys-*`), never by
  overriding their internal DOM.
- Overlays (select panels, dialogs, menus, tooltips) render outside the component host — component
  SCSS cannot reach them; fix via theme tokens instead.

```scss
// GOOD: theme configured once, consumed everywhere via system variables
// src/styles/_material-theme.scss
@use '@angular/material' as mat;

html {
  @include mat.theme((
    color: (
      primary: mat.$azure-palette,
      tertiary: mat.$blue-palette,
    ),
    typography: Roboto,
    density: 0,
  ));
}
```

```scss
// BAD: reaching into Material internals globally
::ng-deep .mat-mdc-form-field .mdc-notched-outline__leading {
  border-color: #004481;
}
```

- ❌ Never restyle `.mat-*` / `.mdc-*` internals globally.
- ❌ Avoid `::ng-deep`; if unavoidable, scope it with `:host`, add a comment with the reason and
  record the justification. Re-check on every Material upgrade.

```scss
// ACCEPTABLE escape hatch: documented and scoped to this component only
:host ::ng-deep .mat-datepicker-content {
  // Reason: match the compact density used by the contract form; recorded in the design notes.
  font-size: 0.875rem;
}
```

## Design Tokens

- Define spacing, radius, z-index and layout tokens in `_tokens.scss` as CSS custom properties on
  `:root`.
- Colors and elevation come from the Material theme (`--mat-sys-primary`, `--mat-sys-on-surface`,
  `--mat-sys-level1`, ...). Do not redeclare them.
- ❌ No raw color values (`#hex`, `rgb()`, `hsl()`) outside the token/theme files.
- ❌ No magic numbers in component styles (`margin: 13px`); use the nearest token.

```scss
// src/styles/_tokens.scss
:root {
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem;  /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem;    /* 16px */
  --space-6: 1.5rem;  /* 24px */
  --space-8: 2rem;    /* 32px */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --layout-gap: var(--space-4);
  --layout-max-width: 75rem;
}
```

## Naming: BEM-light

- Use `block__element--modifier` for component styles; the block is the component name
  (`customer-card`, `contract-list`).
- Keep specificity flat: one nesting level, no chained selectors in feature styles.
- Full file and symbol naming rules live in `NamingConventions.md`.

```scss
// GOOD
.customer-card {
  padding: var(--space-4);

  &__header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  &--compact {
    padding: var(--space-2);
  }
}
```

```scss
// BAD: deep nesting, element selectors, magic values
.customer-card div span.title {
  margin-bottom: 13px;
  color: #333;
}
```

## Responsive Layout

- Mobile-first: base rules target mobile; add progressive enhancement with `@media (min-width: ...)`.
- Use CSS grid/flexbox for layout; ❌ avoid fixed widths and float-based layouts.
- Use CDK `BreakpointObserver` only when behavior (not merely appearance) changes with viewport —
  hiding markup, switching a component mode.

| Breakpoint | Range | Layout expectation |
| --- | --- | --- |
| mobile | < 600px | single column, stacked actions, full-width dialogs |
| tablet | 600–1024px | one/two columns, condensed tables |
| desktop | > 1024px | full layout, persistent side navigation |

```typescript
// GOOD: BreakpointObserver drives behavior; CSS drives appearance
protected readonly isMobile = toSignal(
  this.breakpointObserver
    .observe('(max-width: 599.98px)')
    .pipe(map(result => result.matches)),
  { initialValue: false },
);
```

## Encapsulation

- Keep the default `ViewEncapsulation.Emulated` on every component. Changing it requires a
  recorded justification (ADR) — `None` opens the door to global style leakage.
- ❌ No static inline `style="..."` attributes; only dynamic bindings
  (`[style.width.px]="width()"`, `[style.transform]`).
- ❌ No global element selectors (`button { ... }`, `h2 { ... }`) — they leak across the app.
- Use `:host` for the component's own positioning and layout.

```scss
// GOOD: host-scoped layout using tokens
:host {
  display: block;
  padding-block: var(--space-4);
}
```

## Dark Mode (Future)

- Not in the current scope, but the architecture must not block it: colors come from M3 system
  variables and project tokens, so enabling it later is a theme-level `color-scheme` switch plus
  dark values for custom color tokens — not a component-by-component refactor.
- Define every custom color token as a variable from day one; hardcoded colors break this path.

## Prohibited Patterns

- ❌ `::ng-deep` without documented justification; raw color values outside token files.
- ❌ Material `.mat-*`/`.mdc-*` overrides; static inline styles; global element selectors; `@import`.
- ✅ Tokens, `:host`, BEM-light, `@use`, `--mat-sys-*` system variables.

## Quick Checklist

- [ ] Theme configured once via `mat.theme` in `_material-theme.scss`.
- [ ] Spacing/radius/layout tokens defined in `_tokens.scss`; components consume tokens only.
- [ ] No raw hex/rgb values or magic numbers in component styles.
- [ ] BEM-light classes (`block__element--modifier`) in feature styles.
- [ ] Mobile-first media queries; `BreakpointObserver` used only for behavioral changes.
- [ ] No inline static styles; only dynamic style bindings.
- [ ] `ViewEncapsulation.Emulated` untouched (or change justified in an ADR).
- [ ] No global element selectors; `:host` used for component layout.
- [ ] Any `::ng-deep` usage is `:host`-scoped and documented.
- [ ] Custom color tokens defined as variables (dark-mode path preserved).
