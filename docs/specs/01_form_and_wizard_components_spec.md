# Form & Wizard Component Layer — Master Spec

**Purpose:** Define a small, reusable component layer that eliminates form/wizard boilerplate across 13+ screens. Build this layer **first**. Every form screen rebuilt afterward (Add Tenant, Onboarding, Move-Out, Add Unit, Settings, etc.) consumes these primitives instead of re-implementing them.

**Audience:** Engineer agents executing this plan in sequence. No prior context assumed.

**Principles applied:**
- **DRY** — bind `react-hook-form` to UI primitives once, reuse 50+ times.
- **SOLID — Single Responsibility** — `FormField` only binds RHF; `Input` only renders the field.
- **KISS** — every component has ≤6 props. No render-prop indirection. No theme injection.
- **Open/Closed** — components extend the underlying primitive's props (e.g. `FormField extends InputProps`); adding new keyboard types or styles to `Input` flows through automatically.

---

## 0. Why this layer exists

### Current pain
A grep across `app/` shows **13 screens** using `useForm` or raw `useState` for form state. Each one repeats:
```tsx
<Controller
  control={control}
  name="fieldX"
  render={({ field }) => (
    <Input
      label="..."
      value={field.value}
      onChangeText={field.onChange}
      onBlur={field.onBlur}
      error={errors.fieldX?.message}
    />
  )}
/>
```
That's 8 lines per field × ~6 fields per screen × 13 screens = ~600 lines of identical boilerplate. Same for `Select`, `DateInput`, `SegmentedControl`.

Multi-step wizards (Add Tenant, Onboarding) additionally repeat:
- Step state machine
- Per-step validation via `trigger()`
- Step-aware back navigation
- Discard-confirm dialog on dirty exit
- Bottom CTA dock with dynamic label
- Progress indicator wiring
- Tab-bar hide/show

That's another ~80 lines of boilerplate per wizard.

### After this layer
A typical form field becomes:
```tsx
<FormField name="fullName" label="Full Name *" placeholder="Maria Santos" />
```

A 5-step wizard becomes:
```tsx
<WizardShell steps={STEPS} onSubmit={onSubmit}>
  <WizardStep fields={['fullName', 'phone']}>{renderStep1()}</WizardStep>
  <WizardStep fields={['idFrontUri', 'idBackUri']}>{renderStep2()}</WizardStep>
  ...
</WizardShell>
```

---

## 1. Component inventory

| # | Component | Tier | Purpose | LOC est. | New / Existing |
|---|---|---|---|---|---|
| 1 | `Toggle` | UI primitive | iOS-style switch | ~50 | NEW |
| 2 | `SectionLabel` | UI primitive | Uppercase tracked group label | ~15 | NEW |
| 3 | `InfoNote` | UI primitive | Elevated muted hint card | ~20 | NEW |
| 4 | `FormField` | Form binder | Controller wrapper for `Input` | ~30 | NEW |
| 5 | `FormSelect` | Form binder | Controller wrapper for `Select` | ~25 | NEW |
| 6 | `FormDateInput` | Form binder | Controller wrapper for `DateInput` | ~25 | NEW |
| 7 | `FormSegmentedControl` | Form binder | Controller wrapper for `SegmentedControl` (with value/label mapping) | ~35 | NEW |
| 8 | `FormToggleRow` | Form binder | Labeled row + `Toggle`, RHF-bound | ~35 | NEW |
| 9 | `FormCameraCapture` | Form binder | Controller wrapper for `CameraCapture` | ~25 | NEW |
| 10 | `WizardShell` | Layout | Multi-step state machine + inline CTA + back + discard | ~120 | NEW |
| 11 | `WizardStep` | Layout | Declarative step container (validates own fields) | ~30 | NEW |
| 12 | `useDiscardGuard` | Hook | Confirm-on-back when form is dirty | ~40 | NEW |
| 13 | `lib/emergency-contact.ts` | Domain helper | Serialize/parse emergency contact JSON | ~20 | NEW |

**Total new code:** ~470 LOC across 13 small files. Replaces ~700+ LOC of duplicated boilerplate across consumer screens.

---

## 2. Component specs

### 2.1 `Toggle` — UI primitive

**File:** `components/ui/Toggle.tsx`

iOS-style switch. Track 44×26pt, thumb 22pt circle.

```tsx
interface ToggleProps {
  value: boolean
  onValueChange: (next: boolean) => void
  disabled?: boolean
  accessibilityLabel?: string
}
```

**Behavior:**
- Animate thumb position with Reanimated `withTiming(150ms, Easing.out)`.
- Track color: `bg-primary` when on, `bg-elevated` when off.
- Thumb color: always `bg-white` (high contrast in dark mode).
- Border: 1px `border-border` when off, none when on.
- Disabled: opacity 0.5, no press.
- Haptics: `Haptics.selectionAsync()` on toggle.
- Min hit-area: 44×44 (use `hitSlop` to extend).

**Used in:**
- `FormToggleRow` (this spec)
- `app/(admin)/settings/index.tsx` — biometrics, notifications toggles
- `app/(admin)/tenants/new.tsx` — Include Internet
- Any future setting toggle.

---

### 2.2 `SectionLabel` — UI primitive

**File:** `components/ui/SectionLabel.tsx`

Uppercase tracked label used for form section dividers and wizard step headers.

```tsx
interface SectionLabelProps {
  children: React.ReactNode
  className?: string
}
```

**Implementation (1 line of body):**
```tsx
<Text className={cn(
  "text-text-secondary text-[12px] uppercase tracking-wider mb-2 mt-4",
  className,
)}>
  {children}
</Text>
```

**Usage examples:**
- `<SectionLabel>Step 1 of 5 — Personal Info</SectionLabel>`
- `<SectionLabel>Initial Meter Readings (optional)</SectionLabel>`
- `<SectionLabel>Notifications</SectionLabel>`

**Used in:**
- All wizard steps
- Settings groups
- Move-out: "SETTLEMENT BREAKDOWN"
- Tenant detail: "Contract"
- Anywhere the design audit calls for an uppercase muted label.

---

### 2.3 `InfoNote` — UI primitive

**File:** `components/ui/InfoNote.tsx`

Elevated muted card for inline hints/disclaimers.

```tsx
interface InfoNoteProps {
  children: React.ReactNode
  variant?: 'neutral' | 'warning' | 'danger'   // default 'neutral'
  className?: string
}
```

**Visuals:**
- `neutral`: `bg-elevated`, no border, `text-text-muted`, caption size, padding 12.
- `warning`: `bg-warning-bg`, `text-warning-text`, optional `alert-circle` icon left.
- `danger`: `bg-danger-bg`, `text-danger-text`.

**Usage example:**
```tsx
<InfoNote>
  Accepted: UMID · Driver's License · Passport · PhilHealth · Voter's ID
</InfoNote>
```

**Used in:**
- Add Tenant step 2 (accepted IDs hint)
- Move-out (top warning) — `variant="warning"`
- Generate Bills (overwrite warning) — `variant="warning"`
- Any inline contextual hint where a full `WarningBanner` is overkill.

---

### 2.4 `FormField` — RHF binder for `Input`

**File:** `components/form/FormField.tsx`

```tsx
import { useFormContext, Controller } from 'react-hook-form'
import { Input } from '~/components/ui/Input'

interface FormFieldProps extends Omit<React.ComponentProps<typeof Input>, 'value' | 'onChangeText' | 'onBlur' | 'error'> {
  name: string                        // RHF field path
  label?: string
  hint?: string
  transform?: 'trim' | 'uppercase' | 'numeric'   // optional value transform on blur
}
```

**Implementation:**
```tsx
export function FormField({ name, label, hint, transform, ...inputProps }: FormFieldProps) {
  const { control, formState: { errors } } = useFormContext()
  const error = (errors as any)[name]?.message as string | undefined

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Input
          {...inputProps}
          label={label}
          hint={hint}
          error={error}
          value={field.value ?? ''}
          onChangeText={field.onChange}
          onBlur={() => {
            if (transform === 'trim' && typeof field.value === 'string') {
              field.onChange(field.value.trim())
            }
            field.onBlur()
          }}
        />
      )}
    />
  )
}
```

**Constraint:** must be rendered inside a `<FormProvider>`. Throws clear error otherwise (RHF default).

**All `Input` props pass through:** `keyboardType`, `autoCapitalize`, `autoComplete`, `placeholder`, `secureTextEntry`, `multiline`, `numberOfLines`, etc. The binder is transparent.

**Used in:** every form screen. **~80 instances across the app.**

---

### 2.5 `FormSelect` — RHF binder for `Select`

**File:** `components/form/FormSelect.tsx`

```tsx
import type { SelectOption } from '~/components/ui/Select'

interface FormSelectProps {
  name: string
  label?: string
  placeholder?: string
  options: SelectOption[]
  searchable?: boolean
  disabled?: boolean
  onChange?: (value: string) => void  // optional side-effect callback (e.g. reset dependent field)
}
```

**Behavior:**
- Reads `errors[name]?.message`.
- Calls `field.onChange(value)` then optional `onChange?.(value)` for cascading effects.
- `disabled` greys out and ignores tap (extend `Select` if not already supported).

**Usage:**
```tsx
<FormSelect
  name="propertyId"
  label="Property *"
  placeholder="Select property…"
  options={propertyOptions}
  onChange={() => setValue('unitId', '')}   // reset dependent field
/>
```

**Used in:** Add Tenant (property/unit), Add Unit, Generate Bills (scope), Reports filters.

---

### 2.6 `FormDateInput` — RHF binder for `DateInput`

**File:** `components/form/FormDateInput.tsx`

```tsx
interface FormDateInputProps {
  name: string
  label?: string
  minimumDate?: Date
  maximumDate?: Date
}
```

Wires `value`, `onChange`, `error` from RHF. Pass-through for `minimumDate` / `maximumDate`.

**Used in:** Add Tenant (move-in, contract end), Move-Out (move-out date), Bill generation (period).

---

### 2.7 `FormSegmentedControl` — RHF binder for `SegmentedControl`

**File:** `components/form/FormSegmentedControl.tsx`

The underlying `SegmentedControl` takes `string[]` only (display labels). This binder accepts `{value, label}` pairs and handles the mapping internally.

```tsx
interface SegmentedOption<V extends string> {
  value: V
  label: string
}

interface FormSegmentedControlProps<V extends string> {
  name: string
  label?: string
  options: SegmentedOption<V>[]
  fullWidth?: boolean
}
```

**Behavior:**
- Internally maps `field.value` (V) to display label, and the `onChange(label)` back to V.
- If `field.value` is not in the options, default-selects `options[0]`.

**Usage:**
```tsx
<FormSegmentedControl
  name="contractType"
  label="Contract Type"
  options={[
    { value: 'monthly', label: 'Month-to-month' },
    { value: 'fixed', label: 'Fixed term' },
  ]}
/>
```

**Used in:** Add Tenant (contract type, billing type), Add Unit (unit type), Generate Bills (scope), Maintenance (priority).

---

### 2.8 `FormToggleRow` — labeled row with `Toggle`, RHF-bound

**File:** `components/form/FormToggleRow.tsx`

```tsx
interface FormToggleRowProps {
  name: string                        // boolean field
  label: string
  sublabel?: string
  disabled?: boolean
}
```

**Layout (44pt min-height row):**
```
┌──────────────────────────────────────────────────────┐
│ Include Internet (₱500/mo)                  [○──]  │
│ Adds a flat charge to each monthly bill              │
└──────────────────────────────────────────────────────┘
```

**Visuals:**
- Container: full-width row, `py-3`, `px-4`, `bg-surface`, `rounded-md`, `mb-3`.
- Label left, `Toggle` right, label/toggle vertically centered.
- Sublabel (if present) renders under label, caption muted.
- Tapping anywhere on the row (not just the toggle) flips the value.

**Used in:** Add Tenant (Include Internet), Settings (biometrics, notifications, dark mode if added later).

---

### 2.9 `FormCameraCapture` — RHF binder for `CameraCapture`

**File:** `components/form/FormCameraCapture.tsx`

```tsx
interface FormCameraCaptureProps {
  name: string                        // string-or-null field
  label: string
  hint?: string
}
```

Wires `captured` from `field.value`, calls `field.onChange(uri)` on capture. Trivially small but worth extracting because Add Tenant uses it twice and Maintenance "Log Issue" will use it once.

**Used in:** Add Tenant (ID front, ID back), Maintenance Log Issue (photo).

---

### 2.10 `WizardShell` — multi-step orchestrator

**File:** `components/form/WizardShell.tsx`

The big one. Takes a list of step definitions and manages: state machine, validation, back behavior, discard guard, progress indicator, and inline Next/Skip CTAs at the end of step content.

> **Spec rev (per `06_inline_cta_pattern_spec.md`).** `WizardShell` no longer renders `BottomCTABar`. The CTA flows inline at the end of the step's `ScrollView`. The floating pill nav stays visible during wizards — `useHideTabBar` is not called.

```tsx
interface WizardStepDef<TForm extends FieldValues> {
  key: string                          // stable identifier, e.g. 'personal', 'id-capture'
  title: string                        // for header AND label, e.g. 'New Tenant'
  shortTitle: string                   // for CTA "Next — {shortTitle}", e.g. 'ID Capture'
  fields: (keyof TForm)[]              // fields validated when leaving this step
  optional?: boolean                   // if true, shows "Skip (not recommended)" link below CTA
  render: () => React.ReactNode        // step content
}

interface WizardShellProps<TForm extends FieldValues> {
  form: UseFormReturn<TForm>
  steps: WizardStepDef<TForm>[]
  onSubmit: SubmitHandler<TForm>
  submitLabel?: string                 // default 'Save'
  isSubmitting?: boolean
  discardConfirm?: { title: string; message: string }
  // The shell renders inside ScreenLayout — caller passes the title-per-step rule:
  screenTitle?: (step: WizardStepDef<TForm>) => string
  backHrefOnFirstStep?: string         // optional fallback if user has nothing dirty
}
```

**Behavior:**
1. Renders `ScreenLayout` with title computed from current step. `headerLeft` is custom — see (3).
2. Renders `KeyboardAvoidingView` + `ScrollView` whose `contentContainerClassName` is `px-4 pt-3 pb-[88px]`. Inside, in order:
   - `ProgressStepIndicator` `steps={steps.length} current={currentIdx+1}`
   - `SectionLabel` "Step N of M — {title}"
   - `step.render()`
   - **Inline CTA** — `Button` (label = if last step, `submitLabel`, else `Next — {nextStep.shortTitle}`). `mt-4` above.
   - If `step.optional`, "Skip (not recommended)" `Pressable` below the Button with `mt-3`.
3. **Back behavior:** intercepts header back AND Android hardware back via `useNavigation().addListener('beforeRemove', ...)`. If `currentIdx > 0`, prevent default and `setCurrentIdx(currentIdx - 1)`. If on step 0 AND form is dirty, show `Alert` with `discardConfirm` copy. If on step 0 AND clean, allow back.
4. **Next handler:** runs `form.trigger(step.fields)`. If passes, advances. If on last step, calls `form.handleSubmit(onSubmit)()`.
5. **Skip handler (optional steps only):** advances without validation; clears any `errors` for the step's fields.
6. **Tab bar:** stays visible. The shell does not call `useHideTabBar`. `pb-[88px]` clears the floating pill nav.
7. **Auto-focus:** when step changes, focuses the first field-bound input via a registered ref system (or skip — accept that the user must tap; engineer's call). **Recommendation: skip auto-focus in v1**; add later if requested.

**Usage example (Add Tenant):**
```tsx
const form = useForm<TenantWizardForm>({
  resolver: zodResolver(tenantWizardSchema),
  defaultValues: { ...initial },
  mode: 'onTouched',
})

const steps: WizardStepDef<TenantWizardForm>[] = [
  { key: 'personal', title: 'New Tenant', shortTitle: 'ID Capture',
    fields: ['fullName', 'phone', 'email'], render: () => <PersonalInfoStep /> },
  { key: 'id', title: 'Capture ID', shortTitle: 'Emergency Contact',
    fields: [], optional: true, render: () => <IdCaptureStep /> },
  { key: 'emergency', title: 'Emergency Contact', shortTitle: 'Unit Assignment',
    fields: ['emergencyName', 'emergencyPhone'], render: () => <EmergencyContactStep /> },
  { key: 'unit', title: 'Assign Unit', shortTitle: 'Billing Setup',
    fields: ['propertyId', 'unitId', 'moveInDate', 'contractType', 'contractEndDate'],
    render: () => <UnitAssignmentStep /> },
  { key: 'billing', title: 'Billing Setup', shortTitle: '',
    fields: ['billingType', 'monthlyRent', 'dailyRate', 'numberOfDays', 'billingDay'],
    render: () => <BillingStep /> },
]

return (
  <FormProvider {...form}>
    <WizardShell
      form={form}
      steps={steps}
      onSubmit={onSubmit}
      submitLabel="Save Tenant"
      isSubmitting={isPending}
      discardConfirm={{ title: 'Discard new tenant?', message: 'Your changes will be lost.' }}
    />
  </FormProvider>
)
```

**Used in:**
- `app/(admin)/tenants/new.tsx` — 5-step Add Tenant
- `app/onboarding.tsx` — 4-step first-launch wizard
- `app/(admin)/tenants/[id]/move-out.tsx` — 2-step (review + confirm) — could collapse to single screen, but the shell still cleanly handles the discard guard. Engineer's choice.
- Future: Edit Tenant (if multi-step), import wizard.

---

### 2.11 `WizardStep` — declarative wrapper (optional sugar)

**File:** `components/form/WizardStep.tsx`

Optional companion to `WizardShell`. If the consumer prefers JSX-as-config:

```tsx
<WizardShell form={form} onSubmit={onSubmit}>
  <WizardStep title="New Tenant" shortTitle="ID Capture" fields={['fullName', 'phone']}>
    <FormField name="fullName" label="Full Name *" />
    <FormField name="phone" label="Phone *" keyboardType="phone-pad" />
  </WizardStep>
  ...
</WizardShell>
```

The shell collects step defs by reading children of type `WizardStep` via `Children.toArray`. Pure sugar — the array form (§2.10) remains supported.

**Recommendation:** ship the **array form first** (§2.10). Skip `WizardStep` until a second consumer asks for it. KISS.

---

### 2.12 `useDiscardGuard` — hook

**File:** `hooks/useDiscardGuard.ts`

Used standalone on **non-wizard** dirty forms (Add Unit, Settings, etc.). Not needed in wizards — `WizardShell` already calls into the same logic.

```ts
function useDiscardGuard(opts: {
  isDirty: boolean
  title?: string
  message?: string
  onDiscard?: () => void
}): void
```

**Behavior:** subscribes to `navigation.addListener('beforeRemove', ...)`. If `isDirty`, prevents default and shows `Alert` with [Cancel, Discard]. On Discard, calls `onDiscard?.()` then `navigation.dispatch(e.data.action)`.

**Used in:** Add Unit, Add/Edit Property, Settings General, Settings Rates, Add Maintenance Issue, Record Payment.

---

### 2.13 `lib/emergency-contact.ts` — domain helper

**File:** `lib/emergency-contact.ts`

```ts
export interface EmergencyContact {
  name: string
  relation: string | null
  phone: string
}

export function serializeEmergencyContact(c: EmergencyContact): string {
  return JSON.stringify(c)
}

export function parseEmergencyContact(stored: string | null | undefined): EmergencyContact | null {
  if (!stored) return null
  try {
    const v = JSON.parse(stored)
    if (typeof v?.name === 'string' && typeof v?.phone === 'string') {
      return { name: v.name, relation: v.relation ?? null, phone: v.phone }
    }
  } catch {
    // Legacy "name (relation) — phone" string — best-effort parse
    const m = stored.match(/^(.+?)(?:\s*\((.+?)\))?\s*—\s*(.+)$/)
    if (m) return { name: m[1].trim(), relation: m[2]?.trim() ?? null, phone: m[3].trim() }
  }
  return null
}

export function formatEmergencyContact(c: EmergencyContact): string {
  return c.relation ? `${c.name} (${c.relation}) — ${c.phone}` : `${c.name} — ${c.phone}`
}
```

Bidirectional with legacy fallback so older tenant rows still display.

**Used in:** Add Tenant (write), Tenant Detail (read+display), Edit Tenant (read+write), Move-Out (read).

---

## 3. Usage matrix

Which screens consume which components. Drives prioritization — if a screen is high-priority, build the components it needs first.

| Screen | FormField | FormSelect | FormDate | FormSeg | FormToggleRow | FormCamera | InfoNote | SectionLabel | Toggle | WizardShell | useDiscardGuard |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Add Tenant `tenants/new.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | (via Row) | ✅ | (via Shell) |
| Onboarding `onboarding.tsx` | ✅ | — | — | — | — | — | ✅ | ✅ | — | ✅ | (via Shell) |
| Move-Out `tenants/[id]/move-out.tsx` | ✅ | — | ✅ | — | — | — | ✅ | ✅ | — | optional | ✅ |
| Add Unit `properties/[propertyId]/units/new.tsx` | ✅ | — | — | ✅ | — | — | — | — | — | — | ✅ |
| Add/Edit Property `properties/new.tsx`, `[propertyId]/edit.tsx` | ✅ | — | — | — | — | — | — | — | — | — | ✅ |
| Record Payment `billing/new.tsx` | ✅ | ✅ | ✅ | ✅ | — | — | — | ✅ | — | — | ✅ |
| Utility Reading `billing/utility.tsx` | ✅ | ✅ | — | ✅ | — | — | — | ✅ | — | — | ✅ |
| Generate Bills `billing/generate.tsx` | — | ✅ | — | ✅ | — | — | ✅ | ✅ | — | — | — |
| Add Maintenance `maintenance/new.tsx` | ✅ | ✅ | — | ✅ | — | ✅ | — | ✅ | — | — | ✅ |
| Settings General `settings/general.tsx` | ✅ | — | — | — | — | — | — | ✅ | — | — | ✅ |
| Settings Rates `settings/rates.tsx` | ✅ | — | — | — | — | — | — | ✅ | — | — | ✅ |
| Settings Security `settings/security.tsx` | — | — | — | — | ✅ | — | — | ✅ | ✅ | — | — |
| App Lock / Setup PIN | — | — | — | — | — | — | — | — | — | — | — |

**Read:** `FormField` is the highest-leverage component (12+ consumers). Build it before any screen rebuild.

---

## 4. Build order

Strict sequential. Each phase must compile before the next starts.

### Phase 0 — Domain helpers (no UI deps)
| # | File | Output |
|---|---|---|
| 0.1 | `lib/emergency-contact.ts` | `serialize`, `parse`, `format` |

### Phase 1 — UI primitives (no RHF deps)
| # | File | Output |
|---|---|---|
| 1.1 | `components/ui/Toggle.tsx` | `Toggle` |
| 1.2 | `components/ui/SectionLabel.tsx` | `SectionLabel` |
| 1.3 | `components/ui/InfoNote.tsx` | `InfoNote` |

### Phase 2 — Form binders (depend on RHF + UI primitives)
| # | File | Depends on |
|---|---|---|
| 2.1 | `components/form/FormField.tsx` | existing `Input` |
| 2.2 | `components/form/FormSelect.tsx` | existing `Select` (verify `disabled` prop) |
| 2.3 | `components/form/FormDateInput.tsx` | existing `DateInput` |
| 2.4 | `components/form/FormSegmentedControl.tsx` | existing `SegmentedControl` |
| 2.5 | `components/form/FormToggleRow.tsx` | `Toggle` (1.1) |
| 2.6 | `components/form/FormCameraCapture.tsx` | existing `CameraCapture` |

### Phase 3 — Discard guard hook
| # | File | Depends on |
|---|---|---|
| 3.1 | `hooks/useDiscardGuard.ts` | none (pure RN nav listener) |

### Phase 4 — Wizard scaffold
| # | File | Depends on |
|---|---|---|
| 4.1 | `components/form/WizardShell.tsx` | all of phase 1+2+3, existing `ProgressStepIndicator`, `ScreenLayout`, `Button` |

### Phase 5 — First consumer: Add Tenant rebuild
See companion spec `02_add_tenant_wizard_spec.md` (rev 2 — engineer should reread; consumer code is now ~⅓ of the original size).

### Phase 6 — Migrate other dirty-form screens (incremental, one PR each)
Order by impact:
1. `app/onboarding.tsx` (only currently uses `useState` — high payoff)
2. `app/(admin)/billing/new.tsx` (Record Payment) — 6 fields × Controller boilerplate
3. `app/(admin)/properties/[propertyId]/units/new.tsx` (Add Unit)
4. `app/(admin)/billing/utility.tsx` (Utility Reading)
5. `app/(admin)/maintenance/new.tsx` (Log Issue) — when built
6. `app/(admin)/settings/rates.tsx` & `settings/general.tsx` — small wins
7. `app/(admin)/tenants/[id]/move-out.tsx` — when built

Each migration is a self-contained PR. Forms can stay as-is until touched. **No big-bang refactor.**

---

## 5. Component contracts (testing approach)

### 5.1 What to verify per component

| Component | Verification |
|---|---|
| `Toggle` | Tap flips value; haptic fires; disabled state ignores tap; min hit-area 44×44. |
| `SectionLabel` | Renders text with uppercase + tracked styling; accepts `className` override. |
| `InfoNote` | All 3 variants render with correct bg + text tokens. |
| `FormField` | Inside `FormProvider`, calls `field.onChange` on text input; surfaces `errors[name].message`; `transform="trim"` trims on blur. |
| `FormSelect` | `onChange` callback runs after `field.onChange`; cascading reset works. |
| `FormDateInput` | Date picker round-trips through `YYYY-MM-DD` format. |
| `FormSegmentedControl` | Value/label mapping bidirectional; default-selects `options[0]` when value is unknown. |
| `FormToggleRow` | Tapping anywhere on the row flips value (not just the toggle thumb). |
| `FormCameraCapture` | Captured URI flows back to form state; clearing field clears the image. |
| `useDiscardGuard` | Dirty form blocks back nav; confirm "Discard" allows back; clean form passes through. |
| `WizardShell` | Per-step validation; back step navigation; final step submit; discard guard on step 0; pill nav stays visible; CTA scrolls inline at end of step. |

### 5.2 Test surface (recommended, not required for v1)

If the project has a Jest/RN-Testing-Library setup, write **one** smoke test per component (~10 LOC each). If not, defer — the rebuilt Add Tenant screen exercises every component end-to-end and serves as integration test.

---

## 6. Migration policy for existing screens

**Incremental.** Do **not** open a single PR that rewrites all 13 form screens.

**Per-screen migration checklist:**
1. Wrap screen body in `<FormProvider {...form}>`.
2. Replace each `<Controller …><Input …/></Controller>` with `<FormField name="…" label="…" {...passthrough} />`.
3. Replace `useState`-driven forms with `useForm` + zod (only if the screen has ≥3 fields; below that it's not worth it).
4. Add `useDiscardGuard({ isDirty: form.formState.isDirty })` at top of component.
5. Run `tsc --noEmit`, smoke-test the screen, commit.

**Stop conditions** — do not migrate a screen if any apply:
- Screen has ≤2 fields and no validation rules (boilerplate is already minimal).
- Screen is scheduled for deletion or major redesign per `docs/superpowers/plans/`.

---

## 7. KISS enforcement — what this layer is **not**

To keep the surface tight, explicitly reject the following extensions in v1:

| Tempting feature | Rejected because |
|---|---|
| Theme prop on every component | Tokens are global; no per-instance theming. |
| Render-prop API on `FormField` | Pass-through props cover 100% of cases. |
| Schema-driven form generator | Premature abstraction. Each form's JSX stays explicit. |
| Built-in i18n | Project is single-locale (en-PH). Defer. |
| Built-in autosave | Adds complexity; only Move-Out and onboarding may want it later. |
| Wizard branching (skip step N if condition X) | Add only when a second wizard needs it. Add Tenant has zero branching. |
| `WizardStep` JSX wrapper | Sugar; ship array-of-steps API only (§2.10). |

---

## 8. Acceptance criteria (for this layer, before consuming in Add Tenant)

Engineer must verify before starting Phase 5.

- [ ] All 13 files in §1 inventory exist and compile (`tsc --noEmit` clean).
- [ ] `Toggle` animates between states under reduced-motion (no jank).
- [ ] `FormField`, `FormSelect`, `FormDateInput`, `FormSegmentedControl`, `FormToggleRow`, `FormCameraCapture` each have a 5-line usage example in their TSDoc.
- [ ] `WizardShell` smoke test: build a throwaway 2-step demo screen at `app/_demo/wizard-demo.tsx` (delete after); verify back nav, validation gating, discard guard, and submit. **Delete the demo screen before merging.**
- [ ] No raw hex anywhere in the new files (Tailwind tokens only).
- [ ] No `StyleSheet.create` (NativeWind className only — except inside Reanimated `useAnimatedStyle`).
- [ ] `lib/emergency-contact.ts` has a unit-style smoke verification: feed it a structured object, serialize, parse, assert equality; feed it a legacy `"Name (Spouse) — 09171234567"` string and assert it parses correctly.
- [ ] All 6 form binders correctly surface `errors[name].message`.
- [ ] `useDiscardGuard` works on iOS swipe-back AND Android hardware back.

---

## 9. File tree after this layer is built

```
components/
  ui/
    Toggle.tsx                          ← NEW
    SectionLabel.tsx                    ← NEW
    InfoNote.tsx                        ← NEW
    Input.tsx                           (existing)
    Select.tsx                          (existing — confirm `disabled` prop)
    DateInput.tsx                       (existing)
    SegmentedControl.tsx                (existing)
    CameraCapture.tsx                   (existing)
    ProgressStepIndicator.tsx           (existing)
    Button.tsx                          (existing)
  form/                                 ← NEW DIRECTORY
    FormField.tsx                       ← NEW
    FormSelect.tsx                      ← NEW
    FormDateInput.tsx                   ← NEW
    FormSegmentedControl.tsx            ← NEW
    FormToggleRow.tsx                   ← NEW
    FormCameraCapture.tsx               ← NEW
    WizardShell.tsx                     ← NEW
hooks/
  useDiscardGuard.ts                    ← NEW
lib/
  emergency-contact.ts                  ← NEW
```

10 new files, 1 new directory.

---

## 10. What to hand to the executor agent

Three sequential prompts, one per agent run:

**Prompt 1 — Domain & UI primitives**
> Implement Phases 0 + 1 + 3 of `docs/specs/01_form_and_wizard_components_spec.md`. That's 5 small files: `lib/emergency-contact.ts`, `components/ui/Toggle.tsx`, `components/ui/SectionLabel.tsx`, `components/ui/InfoNote.tsx`, `hooks/useDiscardGuard.ts`. Run `npx tsc --noEmit` after. Do not modify any other files.

**Prompt 2 — Form binders + Wizard shell**
> Implement Phases 2 + 4 of `docs/specs/01_form_and_wizard_components_spec.md`. That's 7 files in `components/form/`. Verify by writing a throwaway 2-step demo at `app/_demo/wizard-demo.tsx`, smoke-testing in Expo, then deleting the demo. Run `npx tsc --noEmit`. Commit only the 7 component files.

**Prompt 3 — Add Tenant rebuild (Phase 5)**
> Rewrite `app/(admin)/tenants/new.tsx` per `docs/specs/02_add_tenant_wizard_spec.md`, consuming the components from `docs/specs/01_form_and_wizard_components_spec.md`. Verify §11 acceptance checklist of the Add Tenant spec.

**Prompt 4+ — Per-screen migrations** (one PR each, see §6).
