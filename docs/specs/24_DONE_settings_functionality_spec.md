# Settings Functionality + `router.back()` Purge

## TL;DR

Two related changes, one PR:

**Phase A — `router.back()` project-wide purge.** New project rule: every navigation uses an explicit href path string. Audit found **15 hits across 10 screen files**. Migrate each to `router.replace('/(admin)/<destination>')` (save flows) or `router.push('/(admin)/<destination>')` (cancel flows). Primitives (`ScreenHeader`, `ScreenLayout`) keep their fallback as defense-in-depth.

**Phase B — Settings functionality.** The Settings screen is mostly non-functional — every row has `onPress={() => {}}`. Wire 4 rows to focused edit screens, delete the Notifications section entirely, and clean up the orphaned `general.tsx`.

The phases share infrastructure: phase B's new sub-screens use the explicit-href pattern from phase A. Doing them together means one consistent codebase pass.

**Wire functional in Settings:**
1. Apartment Name → single-field edit (`apartment_name` setting key)
2. Address → single-field multiline edit (NEW `address` key)
3. Billing day → numeric edit, 1–28 (NEW `billing_day` key)
4. Late fee → 2-field form, amount + grace days (NEW `late_fee_amount`, `late_fee_grace_days` keys)

**Delete from Settings:**
- Notifications section entirely (4 rows + label)
- 3 `notif_*` keys from `AppSettings` type, `DEFAULTS`, `fetchSettings`
- `Switch` import from the index
- Orphaned `app/(admin)/settings/general.tsx`

**Total scope:** ~12 files migrated for phase A + 4 new sub-screens + 2 schema siblings + 1 type/api/screen rewrite for phase B + 1 deletion. ~75 minutes combined.

## Agent prompt

```
Implement docs/specs/24_settings_functionality_spec.md exactly. Two
phases — execute Phase A first (foundational rule), then Phase B
(consumer of the rule).

Read first:
1. docs/specs/24_settings_functionality_spec.md (this spec)
2. CLAUDE.md (conventions: RHF + zod, schema sibling files,
   inline-CTA pattern, "Form schemas live next to the form" with
   underscore prefix)
3. Memory: feedback_explicit_href.md (the router.back rule)

Phase A — router.back() project-wide purge (section 2):
  Audit:
    grep -rn "router\.back()\|navigation\.goBack" app/ components/ layouts/
  Expected: 15 hits in 10 screen files + 2 primitives.

  For each screen-file hit, classify per section 2.3 decision table:
    - Save and return  → router.replace('/(admin)/<destination>')
    - Delete and return → router.replace('/(admin)/<list>')
    - Cancel without saving → router.push('/(admin)/<parent>')
    - Header chevron → drop the inline call; pass backHref to ScreenLayout
  Migration list at section 2.2 names every callsite + destination.

  Add a TSDoc note above the navigation.goBack fallback in
  components/ui/ScreenHeader.tsx and layouts/ScreenLayout.tsx
  explaining the rule (section 2.4).

Phase B — Settings functionality (section 3 onward):
  Step 1. Extend types/index.ts AppSettings (section 4.1):
    - ADD: address, billing_day, late_fee_amount, late_fee_grace_days
    - REMOVE: notif_rent_reminders, notif_contract_expiry,
      notif_vacancy_alerts
  Step 2. Update lib/api/settings.ts DEFAULTS + fetchSettings
    (section 4.2)
  Step 3. Create app/(admin)/settings/apartment-name.tsx (section 5.1)
  Step 4. Create app/(admin)/settings/address.tsx (section 5.2)
  Step 5. Create app/(admin)/settings/billing-day.tsx +
    _billing-day.schema.ts (section 5.3) — schema file MUST start
    with underscore (per spec 23 / CLAUDE.md "Form schemas")
  Step 6. Create app/(admin)/settings/late-fee.tsx +
    _late-fee.schema.ts (section 5.4)
  Step 7. Update app/(admin)/settings/_layout.tsx (section 6) — register
    the 4 new routes; drop general
  Step 8. Rewrite app/(admin)/settings/index.tsx (section 7):
    - Drop Notifications section + 3 notif state vars + Switch import
    - Replace placeholder onPress on the 4 target rows with
      router.push to their respective sub-screens
    - Add display helpers: ordinal, formatBillingDay, formatLateFee
    - Read address / billing_day / late_fee_* from useSettings()
  Step 9. Delete app/(admin)/settings/general.tsx (orphan after step 8)
  Step 10. `npx tsc --noEmit` clean
  Step 11. Smoke test on iOS + Android — every flow lands at the
    correct explicit destination, save/back works.

Constraints:
- Do NOT commit.
- Schema files inside app/ MUST start with `_`.
- Forms use react-hook-form + zod.
- Primary CTA inline at end of ScrollView (no BottomCTABar).
- ScreenLayout for chrome on every sub-screen with backHref.
- After save/delete: router.replace('/(admin)/<href>') — no router.back().
- No raw hex; no <Text> from react-native; no <TouchableOpacity>;
  no inline style={{...}}.
- pb-[88px] on ScrollView contentContainerClassName.

Verify section 9 acceptance (combined checklist, ~25 items). ~75 min total.

After verification passes, mark this spec done:
  git mv docs/specs/24_settings_functionality_spec.md docs/specs/24_DONE_settings_functionality_spec.md
```

---

## 1. Why merge these two

`router.back()` is the legacy navigation pattern; it's brittle when:

1. **Deep link entry.** User taps a notification → opens deep into the app at, say, Bill Detail. Stack is shallow. `router.back()` falls off the stack root and behaves unpredictably.
2. **Multi-source push.** Screen X can be pushed from multiple parents. `router.back()` returns to whichever predecessor pushed them — usually NOT what the screen's "Save" intent wants.
3. **Hot-reload state.** Stack restoration sometimes leaves the back stack empty. Back becomes a no-op.

Phase B's new Settings sub-screens MUST use the new pattern. Migrating the 15 existing callers in the same PR keeps the codebase coherent — no half-migrated state where some screens use `router.back()` and others use explicit hrefs. Merging the two specs is the right scope.

---

## 2. Phase A — `router.back()` project-wide purge

### 2.1 Audit

```bash
grep -rn "router\.back()\|navigation\.goBack" app/ components/ layouts/
```

Expected today: **15 hits in 10 screen files + 2 primitives** (`ScreenHeader.tsx`, `ScreenLayout.tsx`).

### 2.2 Migration list (12 lines across 10 files)

| # | File | Context | Replacement |
|---|---|---|---|
| 1 | `app/(admin)/properties/new.tsx` | After successful create | `router.replace('/(admin)/properties')` |
| 2 | `app/(admin)/properties/[propertyId]/edit.tsx` | After save | `router.replace('/(admin)/properties/${propertyId}')` |
| 3 | `app/(admin)/properties/[propertyId]/edit.tsx` | After delete | `router.replace('/(admin)/properties')` |
| 4 | `app/(admin)/properties/[propertyId]/index.tsx` | Error fallback "Go back" link | `router.replace('/(admin)/properties')` |
| 5 | `app/(admin)/properties/[propertyId]/units/new.tsx` | After create | `router.replace('/(admin)/properties/${propertyId}')` |
| 6 | `app/(admin)/properties/[propertyId]/units/[id]/edit.tsx` | After save | `router.replace('/(admin)/properties/${propertyId}/units/${id}')` |
| 7 | `app/(admin)/properties/[propertyId]/units/[id]/edit.tsx` | After delete | `router.replace('/(admin)/properties/${propertyId}')` |
| 8 | `app/(admin)/billing/new.tsx` | After payment recorded | `router.replace('/(admin)/billing')` (or to receipt screen if that's the design intent — verify) |
| 9 | `app/(admin)/billing/generate.tsx` | After bills generated | `router.replace('/(admin)/billing')` |
| 10 | `app/(admin)/billing/utility.tsx` | After utility reading saved | `router.replace('/(admin)/billing')` |
| 11 | `app/(admin)/billing/payments/[id].tsx` | After void payment | `router.replace('/(admin)/billing')` |
| 12 | `app/(admin)/tenants/[id]/move-out.tsx` | After confirm move-out | `router.replace('/(admin)/tenants')` |

(Some files contain 2 calls — count is 15 total, file count 10.)

For each callsite, the engineer must:
1. Read the surrounding context to understand intent (save vs cancel vs delete).
2. Pick the destination per the decision table at section 2.3.
3. Replace `router.back()` with `router.replace('<href>')` or `router.push('<href>')`.

### 2.3 Decision table — which call to use

| Situation | Replace with |
|---|---|
| **Save and return** (form submit succeeded) | `router.replace('/(admin)/<parent-list-or-detail>')` — `replace` removes the form from the back stack so a subsequent system-back doesn't return to the just-submitted form |
| **Delete and return** (record destroyed) | `router.replace('/(admin)/<list>')` — never return to the deleted record's path |
| **Cancel without saving** | `router.push('/(admin)/<parent>')` OR rely on `ScreenLayout` header chevron with `backHref` |
| **Error fallback "Go back"** | `router.replace('/(admin)/<sensible-default>')` — pick the parent list for that domain |
| **Header chevron** | Don't write code; pass `backHref="/(admin)/<parent>"` to `ScreenLayout` |

**Why `replace` for save/delete?** After successful submit, the form is no longer meaningful. If we kept `back` (or used `push`), the user could back-arrow into a stale form. `replace` removes it cleanly.

**Why `push` for cancel?** Preserves the back stack for "user changed their mind" recovery — they can back into the form they just left.

### 2.4 Primitives — preserve fallback, document the rule

`ScreenHeader.tsx` and `ScreenLayout.tsx` both contain a `navigation.goBack()` fallback for when no `backHref` / `onLeftPress` is provided. **Keep these.** They're defense-in-depth; if a consumer forgets to pass `backHref`, the system-level back still works rather than crashing.

Add a TSDoc note above the fallback explaining the rule:

```tsx
/**
 * Fallback to system back when no `backHref` is provided.
 *
 * Per project rule (memory: feedback_explicit_href.md), consumers
 * MUST pass `backHref` so this fallback never fires in practice.
 * It exists as defense-in-depth only.
 */
```

That's the only primitive change. Do NOT remove the fallback.

---

## 3. Phase B — Settings functionality

### 3.1 What's broken today

- Apartment Name row: `onPress={() => {}}` — does nothing
- Address row: `onPress={() => {}}` — does nothing; `address` key doesn't exist in settings
- Billing day row: hard-coded value "1st of month"; `billing_day` key doesn't exist
- Late fee row: hard-coded value "₱200 · 5 days"; `late_fee_*` keys don't exist
- Quiet hours row: dead — DELETE per user
- Rent reminders / Contract expiry / Vacancy alerts toggles: 3 keys mutate but nothing reads them downstream — DELETE per user
- App lock row: `onPress={() => {}}` — out of scope (security screen exists; not in this spec)
- Back up now / Restore from backup: out of scope (v2)

### 3.2 Orphaned file

`app/(admin)/settings/general.tsx` was the original Apartment Name + Owner Name edit screen. Nothing routes to it after the spec 22 redesign. Delete in this spec.

---

## 4. Data layer changes

### 4.1 `types/index.ts` — `AppSettings` interface

```ts
// BEFORE
interface AppSettings {
  water_rate: number
  electricity_rate: number
  internet_rate: number
  apartment_name: string
  owner_name: string
  owner_phone: string
  notif_rent_reminders: string         // DELETE
  notif_contract_expiry: string        // DELETE
  notif_vacancy_alerts: string         // DELETE
}

// AFTER
interface AppSettings {
  water_rate: number
  electricity_rate: number
  internet_rate: number
  apartment_name: string
  owner_name: string
  owner_phone: string
  address: string                      // NEW
  billing_day: number                  // NEW (1–28; 1 default)
  late_fee_amount: number              // NEW (PHP; 0 default)
  late_fee_grace_days: number          // NEW (0–30; 0 default)
}
```

### 4.2 `lib/api/settings.ts` — `DEFAULTS` + `fetchSettings`

```ts
const DEFAULTS = {
  water_rate: 35,
  electricity_rate: 13,
  internet_rate: 0,
  apartment_name: 'Apartment Manager',
  owner_name: '',
  owner_phone: '',
  address: '',
  billing_day: 1,
  late_fee_amount: 0,
  late_fee_grace_days: 0,
}

export async function fetchSettings(): Promise<AppSettings> {
  const rows = await db.select().from(appSettings)
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  return {
    water_rate:          parseFloat(map['water_rate']          ?? String(DEFAULTS.water_rate)),
    electricity_rate:    parseFloat(map['electricity_rate']    ?? String(DEFAULTS.electricity_rate)),
    internet_rate:       parseFloat(map['internet_rate']       ?? String(DEFAULTS.internet_rate)),
    apartment_name:      map['apartment_name']                 ?? DEFAULTS.apartment_name,
    owner_name:          map['owner_name']                     ?? DEFAULTS.owner_name,
    owner_phone:         map['owner_phone']                    ?? DEFAULTS.owner_phone,
    address:             map['address']                        ?? DEFAULTS.address,
    billing_day:         parseInt(map['billing_day']           ?? String(DEFAULTS.billing_day), 10),
    late_fee_amount:     parseFloat(map['late_fee_amount']     ?? String(DEFAULTS.late_fee_amount)),
    late_fee_grace_days: parseInt(map['late_fee_grace_days']   ?? String(DEFAULTS.late_fee_grace_days), 10),
  }
}
```

The `notif_*` rows in the `app_settings` table linger as orphan key-value pairs — harmless for SQLite. No migration deletion needed.

`updateSetting()` is unchanged; single-key mutation works for all new keys.

---

## 5. Sub-screen specs (4 new screens)

All four follow the same pattern: `ScreenLayout` wrapper, `KeyboardAvoidingView` + `ScrollView`, `react-hook-form` + zod, single inline `Button` at end of scroll. Saves use `router.replace('/(admin)/settings')` per Phase A's rule.

### 5.1 `app/(admin)/settings/apartment-name.tsx`

Single-field form. Inline schema (one trivial validator).

```tsx
import React, { useEffect } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { ScreenLayout } from '~/layouts/ScreenLayout'
import { Input } from '~/components/ui/Input'
import { Button } from '~/components/ui/Button'
import { useSettings, useUpdateSetting } from '~/hooks/useSettings'

const schema = z.object({
  apartmentName: z.string().trim().min(1, 'Required').max(60),
})
type FormData = z.infer<typeof schema>

export default function ApartmentNameScreen() {
  const router = useRouter()
  const { data: settings } = useSettings()
  const { mutateAsync: save, isPending } = useUpdateSetting()

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { apartmentName: '' },
  })

  useEffect(() => {
    if (settings) reset({ apartmentName: settings.apartment_name })
  }, [settings, reset])

  async function onSubmit(values: FormData) {
    await save({ key: 'apartment_name', value: values.apartmentName.trim() })
    router.replace('/(admin)/settings')
  }

  return (
    <ScreenLayout title="Apartment Name" backHref="/(admin)/settings">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerClassName="px-4 pt-3 pb-[88px]" keyboardShouldPersistTaps="handled">
          <Controller
            control={control}
            name="apartmentName"
            render={({ field }) => (
              <Input
                label="Apartment Name"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={errors.apartmentName?.message}
                placeholder="My Apartment"
                autoCapitalize="words"
                autoFocus
              />
            )}
          />
          <Button label="Save" onPress={handleSubmit(onSubmit)} loading={isPending} className="mt-4" />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  )
}
```

### 5.2 `app/(admin)/settings/address.tsx`

Single-field multiline. Same pattern as 5.1, with:
- `multiline` + `numberOfLines={3}` on Input
- `placeholder="123 Main St, Quezon City"`
- `autoCapitalize="sentences"`
- Save key: `'address'`
- Validation: `z.string().trim().max(200)` (allow empty — address is optional)
- `router.replace('/(admin)/settings')` after save

### 5.3 `app/(admin)/settings/billing-day.tsx`

Single-field numeric with bounded validation. Schema sibling required because of the bounded range.

**`_billing-day.schema.ts`** (underscore prefix mandatory per spec 23 / CLAUDE.md):

```ts
import { z } from 'zod'

export const billingDaySchema = z.object({
  billingDay: z
    .string()
    .refine((v) => {
      const n = parseInt(v, 10)
      return Number.isInteger(n) && n >= 1 && n <= 28
    }, 'Must be a day between 1 and 28'),
})

export type BillingDayFormData = z.infer<typeof billingDaySchema>
```

**Screen:**
- `Input` with `keyboardType="number-pad"`, `placeholder="1"`, `maxLength={2}`
- Caption below input: `<AppText variant="caption" color="muted">Used as the default billing day for new units. Range 1–28 to avoid month-end edge cases.</AppText>`
- Save key: `'billing_day'`, value: `String(parseInt(values.billingDay, 10))`
- `router.replace('/(admin)/settings')` after save

### 5.4 `app/(admin)/settings/late-fee.tsx`

2-field form (amount + grace days).

**`_late-fee.schema.ts`:**

```ts
import { z } from 'zod'

export const lateFeeSchema = z.object({
  amount: z
    .string()
    .refine((v) => {
      const n = parseFloat(v)
      return !isNaN(n) && n >= 0
    }, 'Must be 0 or more'),
  graceDays: z
    .string()
    .refine((v) => {
      const n = parseInt(v, 10)
      return Number.isInteger(n) && n >= 0 && n <= 30
    }, 'Must be 0–30 days'),
})

export type LateFeeFormData = z.infer<typeof lateFeeSchema>
```

**Screen:**
- Two `<Controller>` blocks wrapping `<Input>`:
  - Amount: `keyboardType="decimal-pad"`, label `"Late fee amount (₱)"`, placeholder `"200"`
  - Grace period: `keyboardType="number-pad"`, label `"Grace period (days)"`, placeholder `"5"`
- Caption below: `<AppText variant="caption" color="muted">Charged once after the grace period. Set amount to 0 to disable.</AppText>`
- Save: two sequential `save()` calls — `late_fee_amount` then `late_fee_grace_days`. If either fails, show alert; do not partially commit.

```tsx
async function onSubmit(values: LateFeeFormData) {
  try {
    await save({ key: 'late_fee_amount', value: String(parseFloat(values.amount)) })
    await save({ key: 'late_fee_grace_days', value: String(parseInt(values.graceDays, 10)) })
    router.replace('/(admin)/settings')
  } catch {
    Alert.alert('Error', 'Could not save. Try again.')
  }
}
```

---

## 6. `_layout.tsx` updates

Edit `app/(admin)/settings/_layout.tsx` to register the 4 new routes. Drop the `general` registration if present.

```tsx
<Stack screenOptions={darkStackOptions}>
  <Stack.Screen name="index"          options={{ headerShown: false }} />
  <Stack.Screen name="rates"          options={{ title: 'Rates' }} />
  <Stack.Screen name="security"       options={{ title: 'Security' }} />
  <Stack.Screen name="apartment-name" options={{ headerShown: false }} />
  <Stack.Screen name="address"        options={{ headerShown: false }} />
  <Stack.Screen name="billing-day"    options={{ headerShown: false }} />
  <Stack.Screen name="late-fee"       options={{ headerShown: false }} />
</Stack>
```

`headerShown: false` on the new screens because each uses `ScreenLayout` (which owns its own header per spec 04).

---

## 7. Index changes (`app/(admin)/settings/index.tsx`)

### 7.1 Diff (high-level)

**Drop:**
- `import { Switch } from 'react-native'`
- `import { colors } from '~/constants/theme'` if it becomes unused (verify)
- The 3 derived booleans: `rentReminders`, `contractExpiry`, `vacancyAlerts`
- The entire Notifications section (label + 4 cards)

**Read:**
- `address`, `billing_day`, `late_fee_amount`, `late_fee_grace_days` from `useSettings()`

**Update each working row:**

```tsx
const router = useRouter()

// Apartment
<SettingsCard
  label="Apartment Name"
  value={apartmentName || 'Not set'}
  chevron
  onPress={() => router.push('/(admin)/settings/apartment-name')}
/>
<SettingsCard
  label="Address"
  value={address || 'Not set'}
  chevron
  onPress={() => router.push('/(admin)/settings/address')}
/>

// Billing defaults
<SettingsCard
  label="Billing day"
  value={formatBillingDay(billing_day)}
  chevron
  onPress={() => router.push('/(admin)/settings/billing-day')}
/>
<SettingsCard
  label="Late fee"
  value={formatLateFee(late_fee_amount, late_fee_grace_days)}
  chevron
  onPress={() => router.push('/(admin)/settings/late-fee')}
/>
```

### 7.2 Display helpers

Define inline at the bottom of `index.tsx` (or extract to `lib/settings-format.ts` if reused):

```ts
import { formatPeso } from '~/lib/currency'

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function formatBillingDay(day: number | null | undefined): string {
  if (day == null) return 'Not set'
  return `${ordinal(day)} of month`
}

function formatLateFee(amount: number | null | undefined, graceDays: number | null | undefined): string {
  if (amount == null || amount === 0) return 'Not set'
  const grace = graceDays != null && graceDays > 0 ? ` · ${graceDays} days` : ''
  return `${formatPeso(amount)}${grace}`
}
```

Use `formatPeso()` from `lib/currency.ts` — never hardcode `₱`.

### 7.3 Imports needed in index.tsx (final)

```tsx
import { useRouter } from 'expo-router'
import { formatPeso } from '~/lib/currency'
// Switch is GONE; colors may also be unused after Switch removal — verify and drop
```

---

## 8. Implementation steps

| # | Phase | Task | Complexity | Files |
|---|---|---|---|---|
| 1 | A | Audit `router.back()` callsites; confirm 15 hits + 2 primitives | XS | — |
| 2 | A | Migrate the 12 callsites per section 2.2 | M | 10 |
| 3 | A | Add TSDoc note to `ScreenHeader.tsx` and `ScreenLayout.tsx` fallback | XS | 2 |
| 4 | A | Re-run audit grep — must return only the 2 primitive lines | XS | — |
| 5 | B | Extend `AppSettings` type per section 4.1 | XS | `types/index.ts` |
| 6 | B | Update `DEFAULTS` + `fetchSettings` per section 4.2 | S | `lib/api/settings.ts` |
| 7 | B | Create `apartment-name.tsx` per section 5.1 | S | 1 (new) |
| 8 | B | Create `address.tsx` per section 5.2 | S | 1 (new) |
| 9 | B | Create `_billing-day.schema.ts` + `billing-day.tsx` per section 5.3 | S | 2 (new) |
| 10 | B | Create `_late-fee.schema.ts` + `late-fee.tsx` per section 5.4 | S | 2 (new) |
| 11 | B | Update `_layout.tsx` per section 6 | XS | 1 |
| 12 | B | Rewrite index per section 7 — drop Notifications, drop Switch import, wire 4 working rows, add display helpers | M | 1 |
| 13 | B | Delete `app/(admin)/settings/general.tsx` (orphan after step 12) | XS | 1 |
| 14 | A+B | `npx tsc --noEmit` clean | XS | — |
| 15 | A+B | Smoke test on iOS + Android — every flow lands at correct destination; deep-link entries also tested | M | — |

**Estimate:** ~75 minutes total.

---

## 9. Acceptance criteria

### Phase A
- [ ] `grep -rn "router\.back()\|navigation\.goBack" app/` returns empty.
- [ ] `grep -rn "router\.back()\|navigation\.goBack" components/ui/ScreenHeader.tsx layouts/ScreenLayout.tsx` returns the existing fallback lines (kept).
- [ ] Save flows use `router.replace('<explicit href>')`.
- [ ] Delete flows use `router.replace('<list href>')`.
- [ ] `ScreenHeader.tsx` and `ScreenLayout.tsx` have a TSDoc note above the fallback documenting the rule.
- [ ] Smoke test: open each migrated screen via deep link AND via normal nav; save → lands at known destination either way.

### Phase B
- [ ] Settings index has **5 sections** (Apartment, Billing defaults, Security, Data, About) — Notifications **deleted**.
- [ ] No `Switch` import in the index file.
- [ ] Apartment Name row → opens edit screen, save persists, index reflects.
- [ ] Address row → opens edit screen, save persists, index reflects.
- [ ] Billing day row → opens numeric edit screen, validates 1–28, save persists, index displays "Nth of month".
- [ ] Late fee row → opens 2-field screen, validates ≥0 amount and 0–30 grace, save persists both keys, index displays "₱X · Y days" (or "Not set" when amount is 0).
- [ ] `AppSettings` type has the 4 new keys; the 3 `notif_*` keys are gone.
- [ ] `DEFAULTS` and `fetchSettings` return the new shape.
- [ ] `app/(admin)/settings/general.tsx` deleted.
- [ ] All 4 new sub-screens use `ScreenLayout`, `react-hook-form` + `zod`, inline `Button` CTA at end of scroll, `pb-[88px]`.
- [ ] Schema sibling files (`_billing-day.schema.ts`, `_late-fee.schema.ts`) start with `_`.
- [ ] `_layout.tsx` registers the 4 new screens, does not reference `general`.
- [ ] All 4 sub-screens use `router.replace('/(admin)/settings')` on save (not `router.back()`).

### Combined
- [ ] No raw hex; no `<Text>` from `react-native`; no `<TouchableOpacity>`; no inline `style={{...}}`.
- [ ] `npx tsc --noEmit` clean.

---

## 10. Out of scope

- **Owner Name / Owner Phone editing** — currently displayed in profile header but not editable. Plan a separate spec when the user wants the profile header tappable.
- **App lock row** — security flow already exists at `settings/security.tsx`. Wire `onPress={() => router.push('/(admin)/settings/security')}` if trivial; otherwise leave for a separate spec.
- **Data section (Last backup / Back up now / Restore)** — feature not built. Stays with `// FIXME(v2):` markers.
- **About / Version row** — read-only, already correct.
- **Quiet hours, Rent reminders, etc.** — DELETED per user. Do not migrate elsewhere.
- **Migrating the orphan `notif_*` keys out of the `app_settings` table** — harmless leftover key-value rows.
- **Adding a settings-defaults migration** so existing tenants apply the new `billing_day` / `late_fee_*` values retroactively — out of scope; new units use the defaults going forward.
- **Wiring `late_fee_amount` / `late_fee_grace_days` into actual bill generation logic** — separate concern. This spec only persists the values.
- **Building a `usePersistentNav` hook or any nav abstraction** — explicit hrefs are sufficient.
- **Removing the primitive fallbacks** (`navigation.goBack` in `ScreenHeader` / `ScreenLayout`) — keep as defense-in-depth.
- **ESLint rule to flag `router.back()`** — defer until ESLint is set up.

---

## 11. Open questions / verification

1. **Late fee `0` display** — spec uses "Not set" when amount is 0. If the user wants explicit "₱0" display, change `formatLateFee`.
2. **Billing day 29–31 support?** Spec rejects 29–31 to avoid month-end edge cases. If the user wants the full 1–31 range with "rolls back to last day of month" behavior, expand the validator and document the rollback in a sub-screen caption.
3. **Schema sibling vs inline schema for the single-field screens?** Spec inlines for `apartment-name.tsx` and `address.tsx`; uses sibling files for the 2 multi-field/bounded screens. Confirm this split is fine; alternatively make all four use sibling files for consistency.
4. **Migration to apply the new defaults to existing units?** Spec says no (fresh installs and new units only). Separate one-shot migration if needed later.
5. **Billing/new.tsx after-payment destination** — spec routes to `/(admin)/billing` (list). If the design intends "go to receipt screen", use that path instead. Engineer should verify by reading the existing flow comments.
6. **Move-out destination** — spec routes to `/(admin)/tenants` (list). If the intent is the now-former tenant's detail, use `/(admin)/tenants/${id}` instead.
7. **Error-fallback "Go back" links** — for screens where the parent isn't obvious (e.g. property-detail error fallback), the spec uses the domain's tab root: `/(admin)/properties`. Confirm.
