# Property Detail — Design Alignment

**Trigger:** User reviewed the current Property Detail screen against `dark_19_property_detail.png` and reported it "does not match at all."
**Audience:** Engineer agent.
**Skills consulted:** `using-superpowers`, `ui-ux-pro-max` (rules §4 `consistency`, `elevation-consistent`, §5 `visual-hierarchy`, `content-priority`, §6 `whitespace-balance`).
**Reference:** `dark_19_property_detail.png` per design audit; `docs/design-audit-output.md` §dark_19.

---

## 0. TL;DR

The current screen has the right **structure** (summary card + section header + 2-col unit grid + FAB) but several details diverge from the design audit:

1. Stats card semantics are wrong — chip labeled "N issues" actually counts **overdue payments**, not maintenance issues.
2. Redundant FAB + "Add unit" section action — pick one. Design audit shows the section-header link, not a FAB.
3. Engineering-rule violations: raw `<Text>` from `react-native`, `<TouchableOpacity>` instead of `<Pressable>`, inline `style={{...}}` with `colors.*`, raw hex `#3b82f6` in icon color, manual `paddingBottom: 120`.
4. Single-unit case looks awkward — 2-col grid leaves the right column empty when only 1 unit exists. (Acceptable per design but worth noting.)
5. PropertySummaryCard's progress bar is too thin (`h-1` = 4px) and the layout may not match `dark_19` reference. Engineer to verify against image.

This spec rebuilds Property Detail to match the design audit, fixes the rule violations, and removes the redundant FAB.

---

## 1. Reference breakdown (`dark_19`)

Per `docs/design-audit-output.md` §dark_19:

> Missing vs reference:
> - Occupancy % + revenue collected progress bar in header card
> - Alert chips row (e.g. "3 issues" danger, "1 expiring" warning)
> - **FloorTabSelector: Floor 1 | Floor 2 | Floor 3** ← **CUT in v1** per `CLAUDE.md` "What's Cut in v1"
> - Unit 2-column grid (UnitGridCard) with colored left border by status

```
┌────────────────────────────────────────────────────────┐
│ [<]              Property Name              [✏︎]      │   ← header
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────┐     │
│  │  82%      ₱28,000 / ₱34,000 collected        │     │   ← PropertySummaryCard
│  │  occupied ████████████░░░░░░ 82%             │     │     (occupancy% + bar
│  │           [3 issues]  [1 expiring]           │     │      + alert chips)
│  └──────────────────────────────────────────────┘     │
│                                                        │
│  All units (12)                       Add unit  ➜     │   ← SectionHeader
│                                                        │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │ │ Unit 1A    │  │ │ Unit 1B    │                   │   ← UnitGridCard 2-col
│  │ │ Maria S.   │  │ │ Vacant     │                   │     colored left border
│  │ │ [PAID]     │  │ │ [VACANT]   │                   │     by status
│  └──────────────┘  └──────────────┘                   │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │ │ Unit 2A    │  │ │ Unit 2B    │                   │
│  │ │ J. Cruz    │  │ │ Vacant     │                   │
│  │ │ [OVERDUE]  │  │ │ [VACANT]   │                   │
│  └──────────────┘  └──────────────┘                   │
│                                                        │
│  ───── floating pill nav clears ─────                  │   ← pb-[88px]
└────────────────────────────────────────────────────────┘
```

**No FAB.** Add Unit happens via the section-header "Add unit" link. (The current implementation has both — drop the FAB.)

---

## 2. Audit — current screen vs design

### 2.1 Issues (functional / semantic)

| # | Current behavior | Problem | Fix |
|---|---|---|---|
| 1 | `overdueCount` chip labeled `"{N} issues"` | Says "issues" but counts overdue payments. The design's "issues" chip means **maintenance** issues. | Rename or split: `overdueCount` → "{N} overdue" (danger chip); add separate `openIssueCount` from `useMaintenance(propertyId)` for "{N} issues" (also danger). Both can show simultaneously. |
| 2 | FAB at bottom-right + "Add unit" link in section header | Two affordances for the same action. | Remove the `<FAB>`. Keep only the `<SectionHeader actionLabel="Add unit" onViewAll={...} />`. |
| 3 | "Add unit" link uses `onViewAll` prop on `SectionHeader` | Semantic mismatch — `onViewAll` is conventionally for "View all → list screen", not "Add new". | Add a dedicated `actionLabel` + `onAction` prop to `SectionHeader` if not present, OR render the action separately via the `headerRight`-like slot. Engineer's call. **KISS:** if `actionLabel` already maps to `onViewAll`, leave it; just rename the prop in TSDoc. |
| 4 | FAB import + render still in file | Unused import after FAB removal. | Drop import. |

### 2.2 Engineering-rule violations

| # | Violation | Location | Rule (CLAUDE.md) | Fix |
|---|---|---|---|---|
| 1 | `<Text>` from `react-native` | error fallback, "No units yet" empty state, "Add Unit" button label | "Tech Stack" — use `<AppText>` | Replace |
| 2 | `<TouchableOpacity>` (×3) | error fallback back link, header right edit, empty state Add button | RN 0.74+ Pressable preference (project convention) | Replace with `<Pressable>` (Reanimated for press feedback if scaled) |
| 3 | Inline `style={{ ... }}` with `colors.*` | header right edit, error fallback, empty state, FlatList container | "Color tokens — no raw hex outside tailwind.config.js" + NativeWind-only convention | Replace with NativeWind classes (`bg-primary`, `text-text-muted`, etc.) |
| 4 | Raw hex `"#3b82f6"` in `Ionicons color` | settings/units AddUnitButton — same pattern lives elsewhere | "no raw hex" rule | Use `colors.primary` (the JS-accessible token), not the literal |
| 5 | `paddingBottom: 120` inline | FlatList contentContainerStyle | "ScrollBody pb-[88px]" rule | Use `contentContainerClassName="pb-[88px]"` (matches floating pill clearance) |
| 6 | `<Text style={{ color: colors.primary }}>← Go back</Text>` | error fallback | All of the above | Replace with `<Pressable>` + `<AppText className="text-primary">Go back</AppText>` |

### 2.3 Header chrome — apply spec 04

The pencil edit icon currently uses `<TouchableOpacity>` with inline padding/margin. Replace with the same pattern used elsewhere:

```tsx
const headerRight = (
  <Pressable
    onPress={() => router.push(`/(admin)/properties/${propertyId}/edit`)}
    hitSlop={8}
    accessibilityLabel="Edit property"
  >
    <Ionicons name="create-outline" size={22} color={colors.textSecondary} />
  </Pressable>
)
```

Also: this screen relies on `ScreenLayout`. Once spec 04 (`04_double_header_audit_and_fix_spec.md`) ships, the parent `app/(admin)/properties/[propertyId]/_layout.tsx` (already `headerShown: false`) and `ScreenLayout`'s self-suppression align — no further change needed here.

### 2.4 PropertySummaryCard refinements

The component already exists and handles the right data. Verify against `dark_19`:

| Aspect | Current | Likely target | Action |
|---|---|---|---|
| Occupancy % font size | 22px bold success green | 24–28px per design hierarchy | Engineer to bump if comparison shows it small. Spec range: `text-[26px] font-bold`. |
| Progress bar height | `h-1` (4px) | Heavier (6–8px) per design audit "progress bar" emphasis | Bump to `h-1.5` (6px) or `h-2` (8px). |
| Progress bar track | `bg-elevated` | Match design — likely `bg-border` or `bg-surface` for contrast | Engineer to verify against `dark_19`. |
| Alert chips | `overdueCount` → "{N} issues" | Should be **two separate counts**: maintenance issues (red) + overdue payments (amber/red) + expiring (warning) | Restructure (see §3.1 below). |
| Layout | Horizontal: `[occ%] | [bar+chips]` | Match `dark_19` — verify it's not stacked (occ on top, bar below) | Engineer to verify against image; default is keep current horizontal layout. |

### 2.5 Single-unit case

When the property has 1 unit, the 2-col grid leaves the right column empty. **Acceptable** per the design (the grid is the consistent pattern). Don't switch to 1-col conditionally — it would create variance the user has to learn.

---

## 3. Component contract changes

### 3.1 `PropertySummaryCard` — extend props

Current:
```ts
interface PropertySummaryCardProps {
  occupancyPct: number
  collectedThisMonth: number
  expectedMonthlyIncome: number
  overdueCount: number          // overdue payments — current name is fine
  expiringContracts: number
}
```

Add:
```ts
  openIssueCount: number        // NEW — maintenance issues, distinct from overdue payments
```

Render rule:
- If `openIssueCount > 0` → render `<StatusChip variant="danger" label={`${openIssueCount} issues`} />`
- If `overdueCount > 0` → render `<StatusChip variant="danger" label={`${overdueCount} overdue`} />`
- If `expiringContracts > 0` → render `<StatusChip variant="warning" label={`${expiringContracts} expiring`} />`
- Render in that order (highest impact first), wrap with `gap: 5` row.

### 3.2 `usePropertyStats` — return `openIssueCount`

Extend `PropertyStats` type and `fetchPropertyStats` query:

```ts
interface PropertyStats {
  totalUnits: number
  occupiedUnits: number
  vacantUnits: number
  expectedMonthlyIncome: number
  collectedThisMonth: number
  expiringContracts: number
  openIssueCount: number          // NEW
}
```

Implementation: query `maintenance_issues` table for issues where `unit_id IN (SELECT id FROM units WHERE property_id = ?)` AND `status IN ('REPORTED', 'IN_PROGRESS')`. Return count.

Engineer to add this to `lib/api/properties.ts` (or wherever `fetchPropertyStats` lives). One additional small query; acceptable — KISS over a JOIN.

### 3.3 `SectionHeader` — verify `actionLabel` prop

Current usage:
```tsx
<SectionHeader title="All units" count={units.length} actionLabel="Add unit" onViewAll={...} />
```

If `actionLabel` is not yet a prop (only `onViewAll` exists), add it. The label should override "View all" when present. Otherwise keep as is.

---

## 4. Rebuilt screen (consumer skeleton)

```tsx
// app/(admin)/properties/[propertyId]/index.tsx
import React from 'react'
import { View, FlatList, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'

import { useProperty, usePropertyStats } from '~/hooks/useProperties'
import { useUnitsWithStatus } from '~/hooks/useUnits'

import { LoadingSpinner } from '~/components/ui/LoadingSpinner'
import { AppText } from '~/components/ui/AppText'
import { Button } from '~/components/ui/Button'
import { SectionHeader } from '~/components/ui/SectionHeader'
import { ScreenLayout } from '~/layouts/ScreenLayout'
import { UnitGridCard } from '~/components/properties/UnitGridCard'
import { PropertySummaryCard } from '~/components/properties/PropertySummaryCard'
import { colors } from '~/constants/theme'

export default function PropertyDetailScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>()
  const router = useRouter()
  const { data: property, isLoading, isError } = useProperty(propertyId)
  const { data: stats } = usePropertyStats(propertyId)
  const { data: units = [] } = useUnitsWithStatus(propertyId)

  if (isLoading) return <LoadingSpinner />
  if (isError || !property) {
    return (
      <View className="flex-1 items-center justify-center p-8 bg-background">
        <AppText color="danger" className="text-center mb-4">Property not found.</AppText>
        <Pressable onPress={() => router.back()} className="px-3 py-2">
          <AppText className="text-primary">← Go back</AppText>
        </Pressable>
      </View>
    )
  }

  const occupancyPct = stats && stats.totalUnits > 0
    ? Math.round((stats.occupiedUnits / stats.totalUnits) * 100)
    : 0

  const overduePayments = units.filter(
    (u) => u.paymentStatus === 'overdue' || u.paymentStatus === 'partial'
  ).length

  const headerRight = (
    <Pressable
      onPress={() => router.push(`/(admin)/properties/${propertyId}/edit`)}
      hitSlop={8}
      accessibilityLabel="Edit property"
      className="px-1"
    >
      <Ionicons name="create-outline" size={22} color={colors.textSecondary} />
    </Pressable>
  )

  return (
    <ScreenLayout title={property.name} headerRight={headerRight} backHref="/(admin)/properties">
      <FlatList
        data={units}
        keyExtractor={(u) => u.id}
        numColumns={2}
        contentContainerClassName="px-4 pb-[88px]"
        columnWrapperClassName="gap-2.5"
        ItemSeparatorComponent={() => <View className="h-2.5" />}
        ListHeaderComponent={
          <>
            <View className="pt-3">
              <PropertySummaryCard
                occupancyPct={occupancyPct}
                collectedThisMonth={stats?.collectedThisMonth ?? 0}
                expectedMonthlyIncome={stats?.expectedMonthlyIncome ?? 0}
                overdueCount={overduePayments}
                expiringContracts={stats?.expiringContracts ?? 0}
                openIssueCount={stats?.openIssueCount ?? 0}
              />
            </View>
            <SectionHeader
              title="All units"
              count={units.length}
              actionLabel="Add unit"
              onAction={() => router.push(`/(admin)/properties/${propertyId}/units/new`)}
            />
          </>
        }
        renderItem={({ item }) => (
          <View className="flex-1">
            <UnitGridCard
              unitName={item.unit_number}
              tenantName={item.tenantName}
              status={
                item.paymentStatus === 'vacant' ? 'vacant'
                  : item.paymentStatus === 'overdue' ? 'overdue'
                  : item.paymentStatus === 'partial' ? 'partial'
                  : 'paid'
              }
              onPress={() => router.push(`/(admin)/properties/${propertyId}/units/${item.id}`)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <AppText color="muted" variant="caption">No units yet</AppText>
            <Button
              label="Add Unit"
              className="mt-4"
              onPress={() => router.push(`/(admin)/properties/${propertyId}/units/new`)}
            />
          </View>
        }
      />
      {/* No FAB — Add Unit lives in the section-header link. */}
    </ScreenLayout>
  )
}
```

**Approx LOC: ~100.** Comfortably under the 200-LOC cap.

---

## 5. Engineering-rule compliance checklist

The rebuild must pass the following before declaring done:

- [ ] `grep -n "from 'react-native'" app/(admin)/properties/\[propertyId\]/index.tsx` — only `View`, `FlatList`, `Pressable`. No `Text`, no `TouchableOpacity`.
- [ ] `grep -n "style={{" app/(admin)/properties/\[propertyId\]/index.tsx` — zero hits except inside Reanimated `useAnimatedStyle` (none in this file).
- [ ] `grep -n "#[0-9a-fA-F]\{6\}" app/(admin)/properties/\[propertyId\]/index.tsx` — zero hits.
- [ ] No `<FAB>` import or render.
- [ ] `contentContainerClassName="px-4 pb-[88px]"` (not inline `paddingBottom: 120`).
- [ ] `columnWrapperClassName="gap-2.5"` (or equivalent NativeWind class). No inline `columnWrapperStyle={{ gap: 10 }}`.
- [ ] `accessibilityLabel` on the header right pencil + the empty-state Add Unit Pressable (already covered by `<Button>`).
- [ ] `tsc --noEmit` clean.

---

## 6. Acceptance criteria (functional + visual)

- [ ] Header shows property name + edit pencil; chip removed from header right (it never was — but confirm).
- [ ] Stats card shows: occupancy %, "₱X / ₱Y collected" line, progress bar, and **up to 3** alert chips (issues / overdue / expiring) when their counts are > 0.
- [ ] "All units (N)" + "Add unit" link section header renders below the stats card.
- [ ] 2-col `UnitGridCard` grid with colored left border by status.
- [ ] No FAB visible.
- [ ] Tapping a unit card → `/(admin)/properties/{propertyId}/units/{id}`.
- [ ] Tapping "Add unit" → `/(admin)/properties/{propertyId}/units/new`.
- [ ] Empty state: "No units yet" + Add Unit button (inline, per spec 06 inline-CTA pattern).
- [ ] Property without `expectedMonthlyIncome` (zero) shows "₱0 / ₱0 collected" with empty progress bar — no crash.
- [ ] Property with no maintenance issues, no overdue, no expiring shows the stats card without chip row (no empty whitespace).
- [ ] Smoke-test on Android (Pixel emulator) AND iOS — no double-header (per spec 04), no safe-area issues (per spec 07).

---

## 7. Implementation steps (one PR)

| # | Task | Complexity | Files |
|---|---|---|---|
| 1 | Extend `PropertyStats` type with `openIssueCount` | XS | `types/index.ts` |
| 2 | Extend `fetchPropertyStats` to query open maintenance issues count for the property | S | `lib/api/properties.ts` (or wherever the query lives) |
| 3 | Extend `PropertySummaryCard` props with `openIssueCount`; render the new chip per §3.1 | S | `components/properties/PropertySummaryCard.tsx` |
| 4 | Verify `SectionHeader` accepts `actionLabel` + `onAction` props; add if not present | XS | `components/ui/SectionHeader.tsx` |
| 5 | Rewrite `app/(admin)/properties/[propertyId]/index.tsx` per §4 skeleton | M | screen file |
| 6 | Drop the `<FAB>` import; remove from render | XS | — |
| 7 | Verify spec 04 fix is in place (or apply now if not). Spec 07 likewise | XS | `layouts/ScreenLayout.tsx`, `components/ui/ScreenView.tsx` |
| 8 | Run rule-compliance grep checks per §5 | XS | — |
| 9 | `npx tsc --noEmit` | XS | — |
| 10 | Smoke test §6 on Android + iOS | M | — |

**Estimate:** ~45 minutes.

---

## 8. Out of scope

- **Floor tabs** — cut in v1 per `CLAUDE.md` "What's Cut in v1". Do not add `FloorTabSelector`.
- **Amenity chips per unit** — cut in v1.
- **Bed Map link** — cut in v1.
- **Property Edit screen rebuild** — separate spec if needed; this only touches the pencil-icon route, not the destination.
- **Single-unit layout variation** — the 2-col grid stays even when only 1 unit exists. Engineer should not switch to 1-col conditionally.
- **PropertySummaryCard visual fine-tuning beyond §2.4** — if the engineer cannot access `dark_19.png` directly (the screenshots dir is missing per audit), apply the spec audit text faithfully and flag any pixel-level uncertainty for follow-up.

---

## 9. Open questions / verification notes

1. **`dark_19.png` location.** The earlier session search confirmed `docs/screenshots/dark/` does not exist on disk. Engineer should:
   - Check if the user has the image elsewhere (`find . -name "dark_19*"`, `~/Downloads/`, etc.).
   - If unavailable, defer pixel-perfect tweaks to a follow-up after user reviews this rebuild.
2. **`SectionHeader` actionLabel slot.** Verify the current API supports an "Add unit" link separate from a "View all" semantic. If `onViewAll` is the only action prop, either repurpose it OR add `onAction` and update both this consumer and any other.
3. **`useMaintenance(propertyId)` exists?** If not, the `openIssueCount` extension to `usePropertyStats` is the only path. Either way, that's where the count lives — not in the screen.
4. **PropertySummaryCard layout.** Engineer to compare against `dark_19` and decide between horizontal (current) and stacked layouts. Default: keep horizontal; tweak only if the user flags it.
