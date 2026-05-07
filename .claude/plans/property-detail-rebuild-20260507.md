# Plan: Property Detail Screen Rebuild

## Goal
Rebuild the property detail screen to match the exact design spec by extracting a new `PropertySummaryCard`, refining shared UI primitives, and rewiring the screen to use a FAB for add-unit.

## Steps

### 1. [low] Add `'xs'` size to `StatusChip`
**File:** `components/ui/StatusChip.tsx`

Extend the `size` prop union to `'xs' | 'sm' | 'md'`. Add `xs` branch: container `px-[6px] py-[2px]`, text `text-[8px]`. Keep variant→color logic untouched.

Verify: `cd /Users/admin/Documents/personal/apartment-manager && npx tsc --noEmit`

---

### 2. [low] Make `ScreenHeader` background transparent
**File:** `components/ui/ScreenHeader.tsx`

On the root header `View`, replace `bg-surface border-b border-border` with `bg-app`. Leave title typography and back-button logic alone.

Verify: `npx tsc --noEmit`

---

### 3. [low] Tighten `SectionHeader` padding
**File:** `components/ui/SectionHeader.tsx`

Replace `px-4 py-2` with `py-1` (drop horizontal padding — the screen already provides it). Title/action colors and props API unchanged.

Verify: `npx tsc --noEmit`

---

### 4. [low] Resize `FAB` to 44px and reposition to 82px
**File:** `components/ui/FAB.tsx`

- `w-[56px] h-[56px]` → `w-11 h-11`
- Default `bottomOffset` `100` → `82`
- Icon size `28` → `20`

**Risk:** grep for `<FAB` usages and explicitly pass `bottomOffset={100}` at any existing call site that relied on the old default.

Verify: `npx tsc --noEmit`

---

### 5. [low] Refine `UnitGridCard` corner radius and chip size
**File:** `components/properties/UnitGridCard.tsx`

- `rounded-[10px]` → `rounded-xl`
- `<StatusChip size='sm'` → `<StatusChip size='xs'`

Verify: `npx tsc --noEmit`

---

### 6. [med] Create `PropertySummaryCard`
**File:** `components/properties/PropertySummaryCard.tsx` (new)

Props:
```ts
interface PropertySummaryCardProps {
  occupancyPct: number
  collectedThisMonth: number
  expectedMonthlyIncome: number
  overdueCount: number
  expiringContracts: number
}
```

Layout:
- Outer `View`: flex-row, items-center, `bg-surface rounded-2xl`, padding 14px vertical / 16px horizontal, gap 14. NO border.
- **Left col** (`minWidth: 52`, `items-center`): `Text` `text-[22px] font-bold text-success` showing `${occupancyPct}%`, then `Text` `text-[9px] text-text-muted` showing `occupied`.
- **Vertical divider**: `View` `bg-border`, width=1, `alignSelf: 'stretch'`.
- **Right col** (`flex-1`):
  - `Text` `text-[10px] text-text-muted mb-1` — `₱{collected} / ₱{expected} collected`
  - Track `View` `h-1 bg-elevated rounded-sm` (marginBottom 5) with fill `View` `h-full bg-success rounded-sm` width = `${pct}%`
  - Chips `View` flex-row gap-5 — `<StatusChip variant="danger" size="xs" label="{N} issues" />` if `overdueCount > 0`; `<StatusChip variant="warning" size="xs" label="{N} expiring" />` if `expiringContracts > 0`. Omit row entirely if both are 0.
- Use `₱` + `.toLocaleString('en-PH')` for currency.

Verify: `npx tsc --noEmit`

---

### 7. [med] Rewire property detail screen
**File:** `app/(admin)/properties/[propertyId]/index.tsx`

Changes:
1. Add imports for `PropertySummaryCard`, `SectionHeader`, `FAB`.
2. `headerRight` — remove the `+` (add-unit) icon button; keep only the edit pencil icon.
3. Compute `overdueCount` from units: `units.filter(u => u.paymentStatus === 'overdue' || u.paymentStatus === 'partial').length`.
4. Replace inline summary block in `ListHeaderComponent` with:
   ```tsx
   <PropertySummaryCard
     occupancyPct={occupancyPct}
     collectedThisMonth={stats?.collectedThisMonth ?? 0}
     expectedMonthlyIncome={stats?.expectedMonthlyIncome ?? 0}
     overdueCount={overdueCount}
     expiringContracts={stats?.expiringContracts ?? 0}
   />
   <SectionHeader
     title="All units"
     count={units.length}
     actionLabel="Add unit"
     onViewAll={() => router.push(`/(admin)/properties/${propertyId}/units/new` as never)}
   />
   ```
5. Add `<FAB onPress={() => router.push(`/(admin)/properties/${propertyId}/units/new` as never)} />` after the FlatList (no `bottomOffset` prop — use new default 82).
6. Keep FlatList `numColumns={2}`, `UnitGridCard`, `contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}`.

Verify: `npx tsc --noEmit`

---

### 8. [low] Lint pass
`cd /Users/admin/Documents/personal/apartment-manager && npm run lint` (or `npx tsc --noEmit` if no lint script).

---

## Risks
- **FAB default offset change**: grep for `<FAB` before step 4 and patch existing call sites.
- **SectionHeader padding removal is global**: if other screens rely on SectionHeader providing its own horizontal padding, they'll shift. Grep first.
- **ScreenHeader bg change is global**: confirm dark-mode-only app is fine with flat transparent header everywhere.
- **Currency locale**: always pass `'en-PH'` to `toLocaleString`.

## Files touched
- `components/ui/StatusChip.tsx`
- `components/ui/ScreenHeader.tsx`
- `components/ui/SectionHeader.tsx`
- `components/ui/FAB.tsx`
- `components/properties/UnitGridCard.tsx`
- `components/properties/PropertySummaryCard.tsx` (new)
- `app/(admin)/properties/[propertyId]/index.tsx`
