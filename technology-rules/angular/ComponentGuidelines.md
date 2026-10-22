# Component Guidelines

Components are the unit of composition in this frontend: every screen is built from standalone, single-responsibility components that are easy to read, test and reuse. This file covers the component model, signal APIs, template rules and smart/presentational separation; runtime tuning lives in `PerformanceGuidelines.md` and accessibility requirements in `AccessibilityGuidelines.md`.

## Component Model

- Write **standalone components only** — never create or import NgModules in new code.
- Set `changeDetection: ChangeDetectionStrategy.OnPush` on every component.
- Inject dependencies with `inject()`; never use constructor parameter injection.
- One component = one file trio (`contract-card.ts` / `.html` / `.scss`) plus its co-located `.spec.ts`; naming details in `NamingConventions.md`.

```typescript
// Good: standalone, OnPush, signal inputs/outputs
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Contract } from '../contract';

@Component({
  selector: 'pelayo-contract-card',
  templateUrl: './contract-card.html',
  styleUrl: './contract-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractCard {
  readonly contract = input.required<Contract>();
  readonly selected = output<string>();

  protected selectContract(): void {
    this.selected.emit(this.contract().id);
  }
}
```

## Signal Inputs, Outputs and Models

- Declare inputs with `input()` / `input.required()`; outputs with `output()`; two-way bindings with `model()`. Never `@Input` / `@Output` decorators in new code.
- Read inputs as signals and derive from them with `computed()` — ❌ never copy an input into a local signal via `effect()`.
- Outputs are named for the event they emit — no `on` prefix (`saved`, not `onSaved`).

```typescript
// Good: signal input/output APIs, including a transform
readonly customer = input.required<Customer>();
readonly compact = input(false, { transform: booleanAttribute });
readonly status = input<CustomerStatus>('active');

readonly saved = output<Customer>();
```

```typescript
// Good: two-way binding — the child can write the value back
readonly searchTerm = model('');
// Parent: <pelayo-customer-search [(searchTerm)]="currentTerm" />
```

## Signal Queries

- Use `viewChild()` / `viewChildren()` / `contentChild()` signal queries — never `@ViewChild` / `@ContentChild` decorators.
- Query only when a Material/CDK API or DOM library needs a reference; prefer template bindings over DOM access.

```typescript
// Good: signal queries
readonly chartHost = viewChild.required<ElementRef<HTMLElement>>('usageChart');
readonly rowTemplate = contentChild<TemplateRef<RowContext>>('rowTemplate');
```

## Host Bindings and Listeners

- Declare host bindings and listeners in the decorator's `host: {}` object. ❌ Never `@HostBinding` / `@HostListener` in new code.

```typescript
// Good: host object with a binding and a listener
@Component({
  selector: 'pelayo-status-badge',
  templateUrl: './status-badge.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.status-badge--inactive]': "status() === 'inactive'",
    '(click)': 'selectStatus()',
  },
})
export class StatusBadge {
  readonly status = input.required<CustomerStatus>();
  readonly selected = output<CustomerStatus>();

  protected selectStatus(): void {
    this.selected.emit(this.status());
  }
}
```

## Lifecycle

- Implement the interface for every hook you use (`implements OnInit`); keep hooks thin — they should read as a list of intentions.
- Use `afterNextRender` for DOM-touching initialization (charts, third-party widgets): it runs after the view renders and is safe with zoneless change detection.
- ❌ Never call `markForCheck()` / `detectChanges()` to patch missing updates — state must flow through signals (see `StateManagementGuidelines.md`).

```typescript
// Good: thin hooks, DOM init in afterNextRender
export class CustomerDetail implements OnInit {
  private readonly customerStore = inject(CustomerStore);
  private readonly chartHost = viewChild.required<ElementRef<HTMLElement>>('usageChart');

  constructor() {
    afterNextRender(() => renderUsageChart(this.chartHost().nativeElement));
  }

  ngOnInit(): void {
    this.customerStore.loadSelectedCustomer();
  }
}
```

## Template Rules

- Use the native control flow blocks `@if` / `@for` / `@switch`. ❌ Never `*ngIf`, `*ngFor`, `*ngSwitch`.
- Every `@for` **must** declare `track` with a stable identity (`contract.id`) and provide an `@empty` block. Avoid `track $index` unless the list never reorders.
- ❌ No function calls in templates — they run on every change detection cycle. Reading a signal (`address()`) is fine; calling a method (`formatAddress(...)`) is not. Derive values with `computed()`.
- Prefer native `class` / `style` bindings over `ngClass` / `ngStyle`; mark template-only members `protected readonly`.

```html
<!-- Good: native control flow with track and @empty -->
@if (customer(); as customer) {
  <h1>{{ customer.fullName }}</h1>
}

@for (contract of contracts(); track contract.id) {
  <pelayo-contract-card [contract]="contract" (selected)="openContract($event)" />
} @empty {
  <p>No hay contratos activos para este cliente.</p>
}
```

```html
<!-- Bad: legacy structural directives, missing track -->
<div *ngIf="customer">...</div>
<li *ngFor="let contract of contracts">{{ contract.reference }}</li>
```

```html
<!-- Bad: the method call recomputes on every cycle -->
<span class="address">{{ formatAddress(customer()) }}</span>
<!-- Good: computed() derives from state changes only -->
<span class="address">{{ address() }}</span>
<!-- Good: a direct binding instead of ngClass/ngStyle -->
<span class="badge" [class.badge--inactive]="!customer().active">{{ customer().status }}</span>
```

## Deferred Loading

- Wrap heavy below-the-fold subtrees (history, charts, document previews) in `@defer` with an explicit trigger (`on viewport`, `on idle`).
- Always provide a layout-stable `@placeholder` and a `@loading` block with `minimum` to avoid flicker.
- Do not defer above-the-fold content or small components — every deferred chunk has a cost. Budgets: `PerformanceGuidelines.md`.

```html
<!-- Good: load contract history when it scrolls into view -->
@defer (on viewport) {
  <pelayo-contract-history [contractId]="contract().id" />
} @placeholder (minimum 100ms) {
  <div class="history-placeholder" aria-hidden="true"></div>
} @loading (minimum 200ms) {
  <pelayo-loading-indicator />
}
```

## Component Communication

- Data flows down through inputs; changes flow up through outputs. A child never reaches into its parent's state.
- ❌ Do not use a shared service as a shortcut between parent and child; shared feature state belongs to a store (`StateManagementGuidelines.md`).
- Name handlers for what they do (`saveCustomer()`), never `onSave` / `handleClick`; a child emits what happened (`contractSaved`) and the parent decides.

## Content Projection

- Use `ng-content` for layout shells (cards, panels, page headers); add `select` when the component defines more than one slot.
- Use `ng-template` + `ngTemplateOutlet` when the consumer supplies markup the component renders in a loop (table rows, list items).

```html
<!-- Good: a shell with a titled slot and default content -->
<mat-card class="panel">
  <ng-content select="[panelTitle]" />
  <ng-content />
</mat-card>
```

## Smart and Presentational Components

- **Smart (container)**: one per feature screen; injects the feature store or data-access service; owns loading, navigation and state wiring; passes plain data down.
- **Presentational (dumb)**: receives inputs and emits outputs; no store / HttpClient / routing injection.
- Feature screens live under `features/[feature]/[screen]/`; reusable presentational components under `shared/` (see `rules.md` project structure and `NamingConventions.md`).

```typescript
// Good: smart container wires state to presentational children
@Component({
  selector: 'pelayo-customer-list',
  imports: [ContractCard, LoadingIndicator],
  templateUrl: './customer-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerList {
  private readonly customerStore = inject(CustomerStore);

  protected readonly customers = this.customerStore.customers;
  protected readonly loading = this.customerStore.loading;

  protected selectCustomer(id: string): void {
    this.customerStore.selectCustomer(id);
  }
}
```

## Quick Checklist

- [ ] Standalone component, `OnPush`, `inject()` — no NgModule, no constructor injection.
- [ ] Signal APIs: `input()` / `output()` / `model()`; outputs without `on` prefix.
- [ ] Signal queries (`viewChild` / `contentChild`); host bindings via `host: {}` only.
- [ ] Lifecycle interfaces implemented; hooks thin; DOM init in `afterNextRender`.
- [ ] Native `@if` / `@for` / `@switch`; `track` and `@empty` on every `@for`.
- [ ] No function calls in templates; derived data via `computed()`; `class`/`style` bindings over `ngClass`/`ngStyle`.
- [ ] Heavy below-the-fold subtrees deferred with explicit triggers.
- [ ] Inputs down / outputs up; no service shortcuts between parent and child.
- [ ] Smart/presentational separation; template-only members `protected readonly`.
- [ ] Co-located spec covering loading, error, empty and happy paths (`TestingGuidelines.md`).
