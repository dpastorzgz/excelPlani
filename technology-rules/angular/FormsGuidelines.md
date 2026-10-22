# Forms Guidelines

Forms capture and validate user input before it reaches the backend. Default to typed
reactive forms; treat client-side validation as UX guidance only — the server remains the
single source of truth for business rules.

## Default: Typed Reactive Forms

Use `NonNullableFormBuilder` with fully typed `FormGroup<T>` / `FormControl<T>` models. Never
declare untyped form groups: type inference is what prevents silent `any` leaks into templates
and validators. Template-driven (`ngModel`) forms are acceptable ONLY for a single trivial
input that is never saved, has no cross-field or async validation and is consumed locally;
everything else is reactive.

❌ BAD — untyped group: `this.formBuilder.group({ fullName: '', email: '' })` (values degrade to `any`).

✅ GOOD — typed model, non-nullable controls (realistic Pelayo customer contact form):

```ts
// customer-form.ts
type CustomerContactForm = {
  fullName: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  preferredChannel: FormControl<ContactChannel>;
};

@Component({
  selector: 'pelayo-customer-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './customer-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerForm {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  protected readonly form: FormGroup<CustomerContactForm> = this.formBuilder.group<CustomerContactForm>(
    {
      fullName: this.formBuilder.control('', [Validators.required, Validators.maxLength(120)]),
      email: this.formBuilder.control('', [Validators.required, Validators.email]),
      phone: this.formBuilder.control(''),
      preferredChannel: this.formBuilder.control<ContactChannel>('email', Validators.required),
    },
    { validators: [phoneRequiredForPhoneChannel] },
  );

  protected readonly emailControl = this.form.controls.email;
}
```

- Keep the form in the component that owns the workflow; one form model per workflow.

## Validators

- Prefer built-in validators (`Validators.required`, `Validators.email`, `Validators.maxLength`).
- Custom sync validators are pure functions returning `ValidationErrors | null`; keep them
  framework-free so they can be unit-tested without a DOM.
- Async validators (`AsyncValidatorFn`) only for genuine asynchronous checks (e.g. "is this
  email already registered?"); keep them debounced and cheap, and account for `control.pending`.
- Cross-field rules are validator functions applied to the `FormGroup` — never scattered
  imperative checks across component methods.

✅ GOOD — cross-field validator on the group (phone required when the preferred channel is phone):

```ts
// customer-contact-validator.ts
export const phoneRequiredForPhoneChannel: ValidatorFn = (
  group: AbstractControl,
): ValidationErrors | null => {
  const channel = group.get('preferredChannel')?.value;
  const phone: string = group.get('phone')?.value?.trim() ?? '';
  return channel === 'phone' && phone.length === 0 ? { phoneRequired: true } : null;
};
```

### Server Is the Validation Authority

- Client validation is a UX optimization: fast feedback, fewer round trips. It is NEVER the
  source of truth; keep only a UX-level copy (format, length, required for the happy path) —
  a client/server mismatch must never block a valid save.

```ts
applyServerErrors(fieldErrors: Record<string, string>): void {
  for (const [field, message] of Object.entries(fieldErrors)) {
    this.form.get(field)?.setErrors({ server: message });
  }
  this.form.markAllAsTouched();
}
```

## Error Display (Material)

- Use `MatFormField` + `mat-error`; Material wires the error to the control for screen
  readers (see `AccessibilityGuidelines.md`).
- Never show an error before the user interacted with the control: gate the message on
  `touched` (or `dirty`), or on a `submitted` flag after a failed submit attempt.
- Error messages are Spanish user-facing strings; error keys and code stay English.
- Validate on submit with `markAllAsTouched()` instead of disabling the submit button; keep
  the button disabled only while a save is in flight, and read `form.getRawValue()` to include
  disabled controls.

```html
<form [formGroup]="form" (ngSubmit)="saveCustomer()">
  <mat-form-field appearance="outline">
    <mat-label>Correo electrónico</mat-label>
    <input matInput type="email" formControlName="email" autocomplete="email" />
    @if (emailControl.invalid && emailControl.touched) {
      <mat-error>
        @if (emailControl.hasError('required')) { El correo electrónico es obligatorio }
        @else if (emailControl.hasError('email')) { Introduce un correo electrónico válido }
      </mat-error>
    }
  </mat-form-field>
  <button mat-flat-button type="submit">Guardar cambios</button>
</form>
```

❌ Never render `mat-error` unconditionally or with English text (`<mat-error>Invalid email</mat-error>`).

## Reacting to Value Changes

- Template-consumed derived state: convert to signals with `toSignal(...)` — no subscription
  to manage:

```ts
protected readonly emailValue = toSignal(this.form.controls.email.valueChanges, {
  initialValue: this.form.controls.email.value,
});
```

- Side effects and operator pipelines (debounce, `distinctUntilChanged`, `switchMap`):
  subscribe with `takeUntilDestroyed` — never leave an open subscription:

```ts
this.form.controls.phone.valueChanges
  .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
  .subscribe((phone) => this.phoneLookup.set(phone));
```

- Do not derive form values through `effect()`; effects are for side effects only (see
  `StateManagementGuidelines.md`). Operator discipline lives in `RxJSGuidelines.md`.

## Patch, Reset, Disable

- `patchValue` for partial updates (e.g. loading an existing customer); `setValue` only when
  setting every control.
- `reset()` returns controls to their initial value — with `NonNullableFormBuilder` that is
  `''` defaults, never `null`.
- Disable the form while a save is in flight and re-enable on error; use `{ emitEvent: false }`
  when toggling must not fire `valueChanges` listeners.
- `FormGroup.value` omits disabled controls — read `form.getRawValue()` when you need the
  complete model.

```ts
this.form.patchValue({ fullName: customer.fullName, email: customer.email });
this.form.reset();
this.form.disable({ emitEvent: false }); // during save; re-enable on error
```

## ControlValueAccessor (Shared Controls)

Implement `ControlValueAccessor` only when building a genuinely reusable control in `shared/`.
For everything else, use Angular Material inputs. A CVA plugs into reactive forms like a
native control.

```ts
// phone-input.ts
@Component({
  selector: 'pelayo-phone-input',
  templateUrl: './phone-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PhoneInput), multi: true }],
})
export class PhoneInput implements ControlValueAccessor {
  protected readonly value = signal('');
  protected readonly isDisabled = signal(false);
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void { this.value.set(value ?? ''); }
  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled.set(isDisabled); }

  protected updateValue(rawValue: string): void { this.value.set(rawValue); this.onChange(rawValue); }
  protected markTouched(): void { this.onTouched(); }
}
```

- The control must behave identically under `formControl`, `formControlName` and `ngModel`.
- Forward validation and disabled state; never keep a second canonical value beyond `writeValue`.

## Signal Forms

`@angular/forms/signals` is EXPERIMENTAL in Angular 21 — NOT allowed in Pelayo projects.
Using it requires a recorded approval (ADR or design decision) per ANG3.5. Absent that
approval, typed reactive forms are the only accepted default.

## Testability

- Unit-test validators as pure functions — no `TestBed` needed — and test form logic
  (mapping, patch/reset, server errors) by instantiating the form model directly.
- Component tests assert user-visible behavior and wait with `await fixture.whenStable()`;
  all HTTP in form flows goes through MSW — see `TestingGuidelines.md`.

## Quick Checklist

- [ ] Form uses `NonNullableFormBuilder` with typed `FormGroup<T>` / `FormControl<T>`.
- [ ] Template-driven `ngModel` used only for a single trivial local input.
- [ ] Cross-field rules implemented as group validators, not scattered control checks.
- [ ] Server remains the validation authority; no duplicated business rules as source of truth.
- [ ] Errors (Spanish) shown via `MatFormField`/`mat-error` only after `dirty`/`touched`
      (or a failed submit); every control has a label.
- [ ] `valueChanges` consumed via `toSignal` or `takeUntilDestroyed`; no open subscriptions.
- [ ] `patchValue` / `reset()` / `disable()` used correctly; `getRawValue()` for full reads.
- [ ] `ControlValueAccessor` implemented only for shared reusable controls, with tests.
- [ ] No Signal Forms usage without a recorded approval.
- [ ] Form tests co-located and behavior-oriented (`TestingGuidelines.md`).
