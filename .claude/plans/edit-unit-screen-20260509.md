# Plan: Edit Unit Screen

## Goal
Build the missing `Edit Unit` route at `app/(admin)/properties/[propertyId]/units/[id]/edit.tsx` so the pencil icon on Unit Detail (currently 404s) leads to a working react-hook-form + zod edit form with a Delete action gated by tenant occupancy.

## Context

### Why this exists
`app/(admin)/properties/[propertyId]/units/[id]/index.tsx:78` already pushes to `/(admin)/properties/${propertyId}/units/${id}/edit`, but no file matches that route. The unit stack layout at `app/(admin)/properties/[propertyId]/units/[id]/_layout.tsx` only auto-discovers screens in that directory; we need a file plus an explicit `<Stack.Screen name="edit" ... />` line per the project pattern (per-screen registration is implicit via Expo Router file-based routing — the existing `_layout.tsx:6` uses bare `<Stack screenOptions=...>` without explicit `Stack.Screen` children, so adding a new file is sufficient).

### Sibling reference (DO NOT refactor)
`app/(admin)/properties/[propertyId]/units/new.tsx` — useState-based "Add Unit". We mirror copy, fields, layout, but use react-hook-form + zod per the project's "Form schemas live next to the form" rule (`CLAUDE.md` line 142).

### Data layer
- `hooks/useUnits.ts:60-94` — `useUnitDetail(id)`, `useUpdateUnit(propertyId)`, `useDeleteUnit(propertyId)` are already exported with correct cache invalidation.
- `lib/api/units.ts:140-149` — `updateUnit(id, input)` accepts `Partial<Omit<Unit, 'id'|'property_id'|'created_at'>>`. So our payload shape is `{ unit_number, monthly_rate, billing_day, notes }` (and optionally `status`, but we leave status alone — moveout flow handles that).
- `lib/api/units.ts:151-153` — `deleteUnit(id)` is a hard delete (no FK cascade). Schema in `db/schema` allows tenants to FK-reference unit. Hence the gate: never delete an occupied unit.
- `useUnitDetail` returns `UnitDetail` (`types/index.ts:42-`) with `tenant: { id, full_name, ... } | null`; `unit.status === 'occupied' && unit.tenant != null` is the canonical "occupied" check (matches `index.tsx:64`).
- `Property.name` + `Property.address` come from `useProperty(propertyId)` (`hooks/useProperties.ts:21-28`). Subtitle "Building A — Palo" = `${property.name} — ${property.address}`.

### Form pattern precedent
- `app/(admin)/settings/rates.tsx:1-150` — canonical `useForm` + `zodResolver` + `Controller` + `Input` pattern in this codebase. We replicate this style (Controller-per-field) since our schema is simple — no need for `FormProvider` / `FormField` context since this screen has no nested sub-components.
- `reset(...)` in a `useEffect([data, reset])` rehydrates the form once `useUnitDetail` resolves (rates.tsx:74-81 is the precedent).

### Existing primitives
- `layouts/ScreenLayout.tsx:15-25` — accepts `title`, `backHref`, `headerRight: React.ReactNode`. Self-suppresses native header.
- `components/ui/ScreenHeader.tsx:51-58` — `right` slot renders inside `min-w-[44px] h-[44px]` container.
- `components/ui/Input.tsx`, `components/ui/Button.tsx` (variants `primary`, `danger`, `ghost`), `components/ui/AppText.tsx`, `components/ui/AvatarInitials.tsx`, `components/ui/StatusChip.tsx` — all available.
- `tailwind.config.js:42` — `danger.DEFAULT: '#EF4444'` and `danger.text: '#FCA5A5'` already exist. No token additions needed.
- Packages confirmed in `package.json:13,28,33,46`: `react-hook-form ^7.75.0`, `zod ^4.4.3`, `@hookform/resolvers ^5.2.2`, `sonner-native ^0.25.0`. No installs needed.

## Trade-offs

**Option A — Controller-per-field (recommended).** Mirrors `rates.tsx`. Self-contained: no `FormProvider`, no `FormField` context wrapper. 4 fields, ~120 LOC for the screen.

**Option B — `FormProvider` + `<FormField name=...>` shorthand.** Used in `app/(admin)/tenants/add/new.tsx`. Saves a few lines per field but adds an extra wrapper for a small form. Worth it for ≥5 fields or nested step components — overkill here.

**Option C — Reuse a shared `<UnitForm>` component for both new and edit.** Best DRY but explicitly out of scope per task constraint ("DO NOT refactor `new.tsx` in this PR"). Defer.

**Recommendation: Option A.** Simplest, matches nearest precedent (`rates.tsx`), keeps file under the 200 LOC cap, no refactor risk.

### Delete-gating decision
"Active tenant" = `unit.status === 'occupied' || unit.tenant != null`. Use `||` not `&&` to be defensive — if either signal indicates occupancy, block delete. The block path uses an `Alert.alert` ("Cannot delete unit", "This unit has an active tenant. Move them out first.") with a single OK. The allow path uses two-button `Alert.alert` confirm. This matches the pattern in `index.tsx` rather than building a custom modal.

## Steps

### 1. [low] Create the zod schema sibling file — `app/(admin)/properties/[propertyId]/units/[id]/edit.schema.ts`

Why: project rule "Form schemas live next to the form" (`CLAUDE.md:142`).

Contents:
- `import { z } from 'zod'`
- Export `editUnitSchema = z.object({...})`:
  - `unit_number`: `z.string().trim().min(1, 'Unit number / name is required')`
  - `monthly_rate`: `z.string().refine(v => { const n = parseFloat(v); return !isNaN(n) && n >= 0 }, 'Monthly rent must be 0 or more')` — string field bound to a `decimal-pad` input, parsed on submit. Mirrors `rates.tsx:14-22`.
  - `billing_day`: `z.string().refine(v => { if (!v) return true; const n = parseInt(v, 10); return !isNaN(n) && n >= 1 && n <= 31 }, 'Billing day must be 1–31')` — empty allowed (defaults to 1 on submit).
  - `notes`: `z.string()` (no min — multiline notes are optional, empty becomes `null`).
- Export `EditUnitFormData = z.infer<typeof editUnitSchema>`.

Verify: `npx tsc --noEmit` (file referenced in next step compiles).

### 2. [med] Create the screen — `app/(admin)/properties/[propertyId]/units/[id]/edit.tsx`

Why: route currently 404s. This is the bulk of the work.

Imports:
- React, `useEffect`
- RN: `View`, `ScrollView`, `KeyboardAvoidingView`, `Platform`, `Pressable`, `Alert`
- expo-router: `useLocalSearchParams`, `useRouter`
- `@expo/vector-icons/Ionicons`
- react-hook-form: `useForm`, `Controller`
- `@hookform/resolvers/zod`: `zodResolver`
- sonner-native: `toast`
- Hooks: `useUnitDetail`, `useUpdateUnit`, `useDeleteUnit` from `~/hooks/useUnits`; `useProperty` from `~/hooks/useProperties`
- Primitives: `ScreenLayout`, `Input`, `Button`, `AppText`, `AvatarInitials`, `StatusChip`, `LoadingSpinner`
- `editUnitSchema`, `EditUnitFormData` from `./edit.schema`

Component body:
1. `const { propertyId, id } = useLocalSearchParams<{ propertyId: string; id: string }>()`
2. `const router = useRouter()`
3. `const { data: unit, isLoading } = useUnitDetail(id)`
4. `const { data: property } = useProperty(propertyId)`
5. `const { mutateAsync: update, isPending: isSaving } = useUpdateUnit(propertyId)`
6. `const { mutateAsync: remove, isPending: isDeleting } = useDeleteUnit(propertyId)`
7. `useForm<EditUnitFormData>({ resolver: zodResolver(editUnitSchema), defaultValues: { unit_number: '', monthly_rate: '', billing_day: '', notes: '' } })` — destructure `control`, `handleSubmit`, `reset`, `formState: { errors }`.
8. `useEffect(() => { if (!unit) return; reset({ unit_number: unit.unit_number, monthly_rate: unit.monthly_rate != null ? String(unit.monthly_rate) : '', billing_day: unit.billing_day != null ? String(unit.billing_day) : '', notes: unit.notes ?? '' }) }, [unit, reset])` — rehydrate once data arrives.
9. `const isOccupied = unit ? (unit.status === 'occupied' || unit.tenant != null) : false`
10. `onSubmit(data)`:
    ```ts
    await update({
      id,
      input: {
        unit_number: data.unit_number.trim(),
        monthly_rate: parseFloat(data.monthly_rate),
        billing_day: data.billing_day ? parseInt(data.billing_day, 10) : 1,
        notes: data.notes.trim() || null,
      },
    })
    toast.success('Unit updated')
    router.back()
    ```
    Wrap in try/catch — on error `toast.error('Could not update unit')`.
11. `handleDelete()`:
    - If `isOccupied`: `Alert.alert('Cannot delete unit', 'This unit has an active tenant. Move them out first, then delete.', [{ text: 'OK' }])` and return.
    - Else: `Alert.alert('Delete unit?', 'This action cannot be undone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { try { await remove(id); toast.success('Unit deleted'); router.replace(`/(admin)/properties/${propertyId}` as never) } catch { toast.error('Could not delete unit') } } }])`.
12. Early returns: if `isLoading` → `<LoadingSpinner />`; if `!unit` → `<View className="flex-1 items-center justify-center p-8 bg-background"><AppText className="text-danger">Unit not found.</AppText></View>` (mirrors `index.tsx:57`).

JSX:
```tsx
<ScreenLayout
  title="Edit Unit"
  backHref={`/(admin)/properties/${propertyId}/units/${id}`}
  headerRight={
    <Pressable
      onPress={handleDelete}
      disabled={isDeleting}
      hitSlop={8}
      accessibilityLabel="Delete unit"
      accessibilityRole="button"
      className="flex-row items-center gap-1 px-2 h-[44px] justify-center"
    >
      <Ionicons name="trash-outline" size={18} color="#FCA5A5" />
      <AppText className="text-danger-text font-semibold text-sm">Delete</AppText>
    </Pressable>
  }
>
  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
    <ScrollView
      contentContainerClassName="px-4 pt-3 pb-[88px]"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
    >
      {/* Summary card */}
      <View className="rounded-xl bg-surface p-4 flex-row items-center mb-4">
        <AvatarInitials name={unit.unit_number} size="md" />
        <View className="ml-3 flex-1">
          <AppText variant="body" className="font-semibold">Unit {unit.unit_number}</AppText>
          {property && (
            <AppText variant="caption" color="muted" className="mt-0.5">
              {property.name}{property.address ? ` — ${property.address}` : ''}
            </AppText>
          )}
        </View>
        <StatusChip
          variant={isOccupied ? 'success' : 'neutral'}
          label={isOccupied ? 'OCCUPIED' : 'VACANT'}
        />
      </View>

      <Controller control={control} name="unit_number" render={({ field }) => (
        <Input label="Unit number / name" value={field.value} onChangeText={field.onChange}
               error={errors.unit_number?.message} placeholder="Unit 1A" />
      )} />
      <Controller control={control} name="monthly_rate" render={({ field }) => (
        <Input label="Monthly rent (₱)" value={field.value} onChangeText={field.onChange}
               keyboardType="decimal-pad" placeholder="3500" error={errors.monthly_rate?.message} />
      )} />
      <Controller control={control} name="billing_day" render={({ field }) => (
        <Input label="Billing day" value={field.value} onChangeText={field.onChange}
               keyboardType="number-pad" placeholder="1" error={errors.billing_day?.message} hint="Day of month (1–31)" />
      )} />
      <Controller control={control} name="notes" render={({ field }) => (
        <Input label="Notes (optional)" value={field.value} onChangeText={field.onChange}
               multiline numberOfLines={3} className="text-align-vertical-top h-24" />
      )} />

      <Button
        label="Save Changes"
        onPress={handleSubmit(onSubmit)}
        loading={isSaving}
        className="mt-6"
      />
    </ScrollView>
  </KeyboardAvoidingView>
</ScreenLayout>
```

Notes on tokens used (all exist in `tailwind.config.js`): `bg-surface`, `text-danger`, `text-danger-text` (`danger.text` -> `text-danger-text` per Tailwind nested-color convention). The Pressable header-right uses `text-danger-text` for the soft-red foreground per the design (red-on-surface pill, not solid red). Confirm `text-danger-text` resolves at runtime; if not, fall back to importing `colors` from `~/constants/theme` and passing via `style` (the explicit escape hatch used by `StatusChip.tsx:50,55`).

File size budget: ~140 LOC, comfortably under the 200 LOC cap.

Verify: `npx tsc --noEmit` exits clean.

### 3. [low] Visually verify route registration — `app/(admin)/properties/[propertyId]/units/[id]/_layout.tsx`

Why: confirm no edit needed. The current layout (`_layout.tsx:1-8`) uses `<Stack screenOptions={{ ...darkStackOptions, headerShown: false }} />` with no explicit children — Expo Router auto-discovers `edit.tsx` next to `index.tsx` and `documents.tsx`. **No edit required.** This step is just a confirmation read; if for any reason routes need explicit registration in this codebase, add `<Stack.Screen name="edit" options={{ headerShown: false }} />` (defensively matching the file-based-discovery pattern, but should not be necessary).

Verify: `npx expo start` and tap the pencil icon on Unit Detail; confirm the new screen mounts without "Unmatched Route".

### 4. [low] Manual smoke test — Expo runtime

Why: the spec mandates a manual flow check.

Steps to walk through in the running app:
1. Properties → tap a property with units → tap a unit → tap pencil icon (top-right). Screen titled "Edit Unit" mounts; back arrow returns to Unit Detail.
2. Form pre-populates with current unit_number / monthly_rate / billing_day / notes.
3. Edit `monthly_rate` to a new value, tap "Save Changes". Toast "Unit updated" appears; navigates back; Unit Detail shows the new rent.
4. Edit a unit with no tenant: tap "Delete" → confirm dialog → Delete → toast "Unit deleted" → lands on Property Detail with the unit removed.
5. Edit an occupied unit: tap "Delete" → blocking alert "Cannot delete unit" with single OK → no deletion occurs.
6. Submit with empty `unit_number` → inline error "Unit number / name is required" appears below the field.
7. Submit with `billing_day = 99` → inline error "Billing day must be 1–31".
8. Floating pill nav remains visible at the bottom throughout.

Verify: each of the above steps passes by direct observation in Expo.

### 5. [low] Final type check

Run `npx tsc --noEmit` from the project root. Must exit with no errors. If any appear (likely candidates: `accessibilityRole` literal, the `as never` cast on `router.replace`, or `text-danger-text` not being recognized as a class — but className types are loose), fix before declaring done.

Verify: `npx tsc --noEmit` returns clean.

## Risks

- **`text-danger-text` resolution.** NativeWind v4 should resolve nested color tokens (`danger.text` → `bg-danger-text` / `text-danger-text`), but unconfirmed in this codebase. If it fails to render at runtime, fall back to the `style={{ color: colors.dangerText }}` escape hatch used by `StatusChip.tsx:50,55`. Does not violate no-raw-hex (color comes from `constants/theme`).
- **`useProperty` may return null transiently.** Guarded with `{property && ...}` so subtitle hides until query resolves; no crash.
- **`router.back()` after update.** If user reached this screen by deep link rather than from Unit Detail, `router.back()` may pop to an unrelated screen. Recommend `router.replace(\`/(admin)/properties/${propertyId}/units/${id}\`)` instead for deterministic navigation, mirroring delete path.
- **Hard-delete with FK references.** `lib/api/units.ts:151-153` does a raw `db.delete(units)`. If historical bills/maintenance/documents reference unit_id by FK, SQLite may reject the delete. Occupancy gate only blocks active tenants. Out of scope to fix here.
- **Status field not edited.** Design references "Occupied" as a read-only chip. Status changes owned by tenant move-in / move-out flow.

## Out of scope

- Refactoring `new.tsx` to share a `<UnitForm>` component (deferred).
- Adding cascading-delete or soft-delete logic to `deleteUnit`.
- Editing unit `status` from this screen.
- Tests / spec files (per task rules).
- Adding new tailwind tokens (existing `danger.text` covers the design).
- Bottom-sheet or in-screen confirm modal (using native `Alert.alert` per spec).
