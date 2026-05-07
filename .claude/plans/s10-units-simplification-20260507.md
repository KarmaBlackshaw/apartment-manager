# Plan: s10 — Units Simplification

## Goal
Remove unused unit columns (floor/bedrooms/bathrooms/daily_rate/billing_type/unit_type/amenities/size_sqm) and the `beds` table from the schema, types, API, hooks, and UI; add `notes` column on units; flatten property detail (no floor tabs); strip the bed map screen; remove "Number of Floors" from onboarding; hide the Reports tab and surface report links from the Home screen via tappable cards.

## Trade-offs

**A. Migration approach:** Extend the existing pre-refactor wipe block in `db/index.ts` — when old `units` columns or the `beds` table are detected, drop and recreate everything. Matches the existing pattern, deterministic. `ALTER TABLE units ADD COLUMN notes TEXT` handles new installs safely via try/catch.

**B. Reports section on Home:** Reuse existing `ReportMenuCard` component (already used in reports/index.tsx) — DRY, visually consistent.

**C. Existing "Reports" QuickAction on Home:** Keep it pointing to `/(admin)/reports` menu hub. The new cards section provides direct shortcuts; the quick action remains for "see all".

## Steps

### Step 1 [low] — Update `Unit` and friends in types
**File:** `/Users/admin/Documents/personal/apartment-manager/types/index.ts`
- In `Unit` interface: remove `floor`, `bedrooms`, `bathrooms`, `daily_rate`, `billing_type`, `unit_type`, `amenities`, `size_sqm`. Add `notes: string | null`. Keep `monthly_rate`, `status`, `billing_day`.
- Delete `Bed` interface and `BedWithStatus` interface.
- Update `TenantWithUnit`: change `Pick<Unit, 'unit_number' | 'floor' | 'billing_type'>` to `Pick<Unit, 'unit_number'>`.
- Leave `PerUnitIncomeEntry.unit_type: string | null` as-is (report payload, not from `Unit`).

Verify: `npx tsc --noEmit`

---

### Step 2 [med] — Drizzle schema cleanup
**File:** `/Users/admin/Documents/personal/apartment-manager/db/schema.ts`
- In `units` table definition: drop `floor`, `bedrooms`, `bathrooms`, `daily_rate`, `billing_type`, `unit_type`, `amenities`, `size_sqm`. Add `notes: text('notes')`.
- Delete the entire `beds` table export.
- Keep `monthly_rate`, `billing_day`, `status`.

Verify: `npx tsc --noEmit`

---

### Step 3 [high] — Migration logic
**File:** `/Users/admin/Documents/personal/apartment-manager/db/index.ts`
- Extend the schema-drift detector to also trigger a full reset when `units` table has old columns (`floor`, `bedrooms`, `billing_type`) OR the `beds` table exists. Use `PRAGMA table_info(units)` and `SELECT name FROM sqlite_master WHERE type='table' AND name='beds'`.
- In the destructive drop block, also `DROP TABLE IF EXISTS beds;`.
- Update the `CREATE TABLE units` statement to match the new schema: keep `id`, `property_id`, `unit_number`, `monthly_rate`, `status`, `billing_day`, add `notes TEXT`, drop removed columns.
- Remove `CREATE TABLE IF NOT EXISTS beds (...)` block.
- In `alterStatements`: remove entries for `unit_type`, `amenities`, `size_sqm` (baked into new CREATE). Keep `billing_day` removal if it was previously added via ALTER (now in CREATE). Add `"ALTER TABLE units ADD COLUMN notes TEXT"`.

Verify: `npx tsc --noEmit`

---

### Step 4 [med] — Units API cleanup
**File:** `/Users/admin/Documents/personal/apartment-manager/lib/api/units.ts`
- In `fetchVacantUnits`: remove `floor`, `bedrooms`, `bathrooms`, `daily_rate`, `billing_type`, `unit_type`, `amenities`, `size_sqm` from explicit select. Add `notes: units.notes`, `billing_day: units.billing_day`.
- Remove any `BillingType` import if no longer used in this file.

Verify: `npx tsc --noEmit`

---

### Step 5 [low] — Tenants API cleanup
**File:** `/Users/admin/Documents/personal/apartment-manager/lib/api/tenants.ts`
- Drop `unit_floor` and `unit_billing_type` from row mapping and selectFields — leave only `unit_number`.

Verify: `npx tsc --noEmit`

---

### Step 6 [med] — Reports API cleanup
**File:** `/Users/admin/Documents/personal/apartment-manager/lib/api/reports.ts`
- In `fetchPerUnitIncome`: drop `unit_type: units.unit_type` from select. Replace `unit_type: u.unit_type ?? null` with `unit_type: null` in returned entry.

Verify: `npx tsc --noEmit`

---

### Step 7 [low] — Delete bed data layer
- Delete `/Users/admin/Documents/personal/apartment-manager/lib/api/beds.ts`
- Delete `/Users/admin/Documents/personal/apartment-manager/hooks/useBeds.ts`

Verify: `npx tsc --noEmit`

---

### Step 8 [low] — Remove dead component re-exports
**File:** `/Users/admin/Documents/personal/apartment-manager/components/ui/index.ts`
- Remove the `BedSlotCard` re-export line.
- Check with `grep -r "BedSlotCard"` before deleting the component file.
- Remove `FloorTabSelector` re-export (no remaining importers after step 11).
- Check with `grep -r "AmenityChipSelector"` — if only imported by new.tsx and unit detail (both cleaned in steps 12/14), remove that re-export too.

Verify: `npx tsc --noEmit`

---

### Step 9 [low] — Hooks: drop floor filter
**File:** `/Users/admin/Documents/personal/apartment-manager/hooks/useUnits.ts`
- Change `useUnitsWithStatus(propertyId: string, floor?: number | null)` to `useUnitsWithStatus(propertyId: string)`.
- Remove floor from query key and the filter line.

Verify: `npx tsc --noEmit`

---

### Step 10 [low] — Delete bed-map screen
- Delete `/Users/admin/Documents/personal/apartment-manager/app/(admin)/properties/[propertyId]/units/[id]/bed-map.tsx`

Verify: `npx tsc --noEmit`

---

### Step 11 [med] — Property detail: flatten units list
**File:** `/Users/admin/Documents/personal/apartment-manager/app/(admin)/properties/[propertyId]/index.tsx`
- Remove `selectedFloor` state, the second `useUnitsWithStatus` call for `allUnits`, and the `floors` useMemo.
- Change the remaining `useUnitsWithStatus` call to single-arg `useUnitsWithStatus(propertyId)`.
- Remove the "Floor tabs" block from `ListHeaderComponent`.
- Remove `FloorTabSelector` from imports.
- Update empty state text: remove floor-specific copy.

Verify: `npx tsc --noEmit`

---

### Step 12 [med] — Add Unit form: simplified
**File:** `/Users/admin/Documents/personal/apartment-manager/app/(admin)/properties/[propertyId]/units/new.tsx`
- Remove imports: `AmenityChipSelector`, `UnitType`.
- Remove state: `floor`, `sizeSqm`, `unitType`, `amenities`, `UNIT_TYPES`.
- Add state: `notes`.
- Remove the Floor/Size row, unit-type chips, and amenities selector from JSX.
- Add a multiline `<Input label="Notes (optional)" ...>` for notes.
- Update `handleSubmit` payload to: `{ property_id, unit_number, billing_type: 'monthly', monthly_rate, billing_day, notes: notes.trim() || null }`.

Verify: `npx tsc --noEmit`

---

### Step 13 [med] — Edit Unit screen parity (if it exists)
- Search for `useUpdateUnit` usage to determine if an edit screen exists.
- If yes, mirror the same simplifications as step 12 (remove floor/sizeSqm/unitType/amenities, add notes).
- If no edit screen exists, this step is a no-op.

Verify: `npx tsc --noEmit`

---

### Step 14 [med] — Unit detail: remove metadata
**File:** `/Users/admin/Documents/personal/apartment-manager/app/(admin)/properties/[propertyId]/units/[id]/index.tsx`
- Remove imports: `AmenityChipSelector`, `UNIT_TYPE_LABELS` constant.
- Remove `amenities`, `unitTypeLabel` derivations.
- Replace the unit name with just `unit.unit_number` (no floor suffix).
- Remove unit type/sqm text block, right-side type badge, amenities view.
- Optionally show `unit.notes` as a small caption when truthy.
- Delete the entire "Bed map row (Bedspacer only)" block.

Verify: `npx tsc --noEmit`

---

### Step 15 [low] — UnitCard: remove floor reference
**File:** `/Users/admin/Documents/personal/apartment-manager/components/properties/UnitCard.tsx`
- Remove the `Floor {unit.floor}` conditional text line and any wrapping conditional.

Verify: `npx tsc --noEmit`

---

### Step 16 [low] — Onboarding: remove floors field
**File:** `/Users/admin/Documents/personal/apartment-manager/app/onboarding.tsx`
- Remove `floors: string` from `FormState`.
- Remove the "Number of Floors" `<Field>` block.
- Remove `floors: ''` from initial state.
- Update `description` in `handleComplete` to use only `totalUnits`.

Verify: `npx tsc --noEmit`

---

### Step 17 [low] — Hide Reports tab
**File:** `/Users/admin/Documents/personal/apartment-manager/app/(admin)/_layout.tsx`
- Change `<Tabs.Screen name="reports" options={{ title: 'Reports' }} />` to `<Tabs.Screen name="reports" options={{ href: null, title: 'Reports' }} />`.
- Also pass `tabBarButton: () => null` if `FloatingTabBar` doesn't already exclude `href: null` routes.

Verify: `npx expo start --clear` → tab bar shows 4 tabs only.

---

### Step 18 [med] — Home screen: Reports cards section
**File:** `/Users/admin/Documents/personal/apartment-manager/app/(admin)/index.tsx`
- Import `ReportMenuCard` from `../../components/reports/ReportMenuCard`.
- After the Quick Actions row, insert a `<SectionHeader title="Reports" />` and a 2-column grid of `ReportMenuCard` for 6 reports (same icon/iconBg as reports/index.tsx): Monthly Collection, Outstanding Balances, Occupancy, Per-unit Income, Annual Summary, Maintenance Costs. Each navigates to its respective `/(admin)/reports/...` route.
- Keep the existing "Reports" QuickAction pointing at `/(admin)/reports`.

Verify: `npx tsc --noEmit`

---

### Step 19 [low] — Final type & lint sweep
- Run `npx tsc --noEmit` and resolve any straggler imports referencing `UnitType`, `BedWithStatus`, `unit.floor`, `unit.billing_type`, `unit.unit_type`.
- Run `npm run lint` if defined.

Verify: `npx tsc --noEmit && npm run lint`

## Risks
- **Data loss on migration** — intentional, matches spec. Dev data will be wiped on next launch.
- **`FloatingTabBar` and `href: null`** — verify it excludes the route or pass `tabBarButton: () => null` as a safety net.
- **`PerUnitIncomeReport.unit_type` always null** — renders silently as empty string in `UnitIncomeRow`. No UI breakage.
- **Drizzle schema drift** — if a DB already has new `units` shape but is missing `notes`, the ALTER handles it.

## Out of scope
- Renaming existing columns (`unit_number`, `monthly_rate`, etc.)
- Adding an Edit Unit screen if one doesn't exist
- Removing the standalone `UnitType` enum (cleanup, not required)
- Writing tests
