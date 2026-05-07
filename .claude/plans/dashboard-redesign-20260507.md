# Plan: Redesign Home Dashboard to spec (small inline report cards + 4-tab layout)

## Goal
Rebuild `app/(admin)/index.tsx` to match the supplied component spec: small inline report cards with live metric values, KPI cards with corrected typography, non-uppercase section labels, a redesigned collection card, attention/vacant/units lists, and a 4-tab tab bar (Reports tab removed). Fix two latent bugs uncovered during exploration.

## Context

### Files to modify
- `/Users/admin/Documents/personal/apartment-manager/app/(admin)/index.tsx` (lines 1–508) — full rewrite
- `/Users/admin/Documents/personal/apartment-manager/components/home/KPICard.tsx` (34 L)
- `/Users/admin/Documents/personal/apartment-manager/components/ui/SectionHeader.tsx` (25 L)
- `/Users/admin/Documents/personal/apartment-manager/components/reports/ReportMenuCard.tsx` (50 L) — full rewrite
- `/Users/admin/Documents/personal/apartment-manager/components/billing/CollectionProgressBar.tsx` (71 L) — extend for label/value variant

### Files to create
- `/Users/admin/Documents/personal/apartment-manager/components/home/QuickActionBar.tsx`
- `/Users/admin/Documents/personal/apartment-manager/components/home/AttentionRow.tsx`
- `/Users/admin/Documents/personal/apartment-manager/components/home/VacantRow.tsx`
- `/Users/admin/Documents/personal/apartment-manager/components/home/UnitCell.tsx`
- `/Users/admin/Documents/personal/apartment-manager/components/home/ReportCard.tsx` (new file alongside ReportMenuCard, kept distinct from existing menu card so other call sites don't break)

### Files to read-only reference (no changes needed)
- `app/(admin)/_layout.tsx` (already has `reports` route hidden via `href: null` at line 30 — confirm this stays; FloatingTabBar correctly filters them out at line 36 of `FloatingTabBar.tsx`).
- `hooks/useReports.ts` — exports `useMonthlyCollection`, `usePerUnitIncome`, `useAnnualSummary`, `useMaintenanceCosts`, `useOccupancyReport`, `useOutstandingBalances`.
- `lib/api/reports.ts:97, 162, 256, 337, 384, 460` — confirms return shapes: `MonthlyCollectionReport.stats.{totalCollected,totalBilled,paidCount,partialCount,unpaidCount}`, `OutstandingBalancesReport.{totalOutstanding,tenantCount}`, `MaintenanceCostsReport.thisMonthCost`, `PerUnitIncomeReport.totalCollected`, `AnnualSummaryReport.ytdIncome`.
- `hooks/useUnits.ts:36` — `useUnitStatusCounts()` returns `{ occupied, available, maintenance }` (correct shape). `useUnitCounts()` at line 32 actually returns `Record<string,number>` per `lib/api/units.ts:137` — current home screen uses the wrong hook (silent bug).
- `tailwind.config.js` — `bg-surface=#171717`, `text-text-{primary,secondary,muted}`, `bg-primary=#3B82F6`. `rounded-xl=24px` per config — but NativeWind also exposes default Tailwind `rounded-2xl=16px` and `rounded-xl=12px`. Confirm by using literal `rounded-[16px]` / `rounded-[12px]` to be unambiguous.
- `constants/theme.ts` — `colors.textPrimary`, `colors.textSecondary`, `colors.textMuted` exist (confirmed at theme.ts:12-14).

### Latent bugs found during exploration
1. **`useUnitCounts()` misuse** — `app/(admin)/index.tsx:72,85-87` reads `unitCounts.occupied/available/maintenance` but `fetchUnitCounts()` (`lib/api/units.ts:137`) returns `Record<string,number>` keyed by `propertyId`. So `kpis.occupancy` is always `0%` and `kpis.vacancies` is always `0`. Fix by switching to `useUnitStatusCounts()`.
2. **`/(admin)/maintenance/new` is a dead route** — confirmed by `ctx_tree`. Replace `Log Issue` target with `/(admin)/reports/maintenance-costs` (graceful) until a maintenance creation screen exists.

## Trade-offs

**Option A — Full rewrite of `index.tsx`, all sub-components extracted (recommended).**
Pros: matches the spec's component breakdown 1:1, each row/card is independently reusable, screen file stays under ~200 lines per `CLAUDE.md` extraction rule.
Cons: 5 new files.

**Option B — Inline subcomponents in `index.tsx`.**
Pros: fewer files.
Cons: violates `CLAUDE.md` "extract reusable components" guideline; current screen is already 508 lines.

**Option C — Reuse `ReportMenuCard.tsx` by adding `value`/`sub` props.**
Pros: one less file.
Cons: existing prop shape (`icon`, `iconBg`, `label`, `onPress`) is referenced from `components/ui/index.ts:65` and may be reused on `app/(admin)/reports/index.tsx`. Mutating it risks regressions on other screens. Safer to add `ReportCard.tsx` as a separate, explicit "data-bearing" variant. **Choose this isolation path.**

**Recommendation: A + isolated new `ReportCard.tsx`.** Keep `ReportMenuCard` untouched to avoid breaking `app/(admin)/reports/index.tsx` (uses the icon-only variant). Only the home screen needs the inline-data variant.

Verify before starting (executor): run `ctx_search "ReportMenuCard" /Users/admin/Documents/personal/apartment-manager` — confirm callers; if only the home screen uses it, repurpose it; otherwise create the new `ReportCard.tsx` per spec.

## Steps

### 1. [low] Fix `SectionHeader` typography
File: `/Users/admin/Documents/personal/apartment-manager/components/ui/SectionHeader.tsx`

Change line 14 from `className="text-[13px] font-semibold text-text-secondary uppercase tracking-wide"` to `className="text-[11px] font-semibold text-text-secondary"` (drops `uppercase`, `tracking-wide`, downsizes to 11px). Change action text on line 19 from `text-[13px] text-primary` to `text-[11px] font-medium text-primary`. Reduce header padding from `px-4 py-3` to `px-4 py-2` to match denser layout. Add an optional `actionLabel?: string` prop (default `"View all"`) so the home screen can render `"See all"` for Reports.

Verify: `npx tsc --noEmit`

### 2. [low] Update `KPICard` typography & shape
File: `/Users/admin/Documents/personal/apartment-manager/components/home/KPICard.tsx`

Replace card className with `bg-surface rounded-[16px] border-t-2` and inline style padding `{ paddingTop: 14, paddingHorizontal: 14, paddingBottom: 12 }`. Label: `text-[10px] font-medium text-text-muted` (was `text-xs text-text-secondary mb-1`). Value: `text-[22px] font-bold text-text-primary` (was `text-xl font-bold`). Subtitle: `text-[11px] font-normal text-text-muted` (was `text-xs text-text-muted mt-0.5`). Remove `accentBg` prop branch (no longer used per spec). Keep `accentColor` flowing into `borderTopColor`.

Verify: `npx tsc --noEmit`

### 3. [low] Create `QuickActionBar`
File: `/Users/admin/Documents/personal/apartment-manager/components/home/QuickActionBar.tsx`

Functional component with no props (uses `useRouter` + `useTenantSearch` internally). Renders a `<View className="flex-row gap-2 px-4">` of 4 `Pressable`s, each `flex-1 rounded-[12px] items-center justify-center` with `paddingVertical: 11, paddingHorizontal: 4`. First button bg `bg-primary` with white icon (16×16 stroke `cash-outline`) and white 9px label `Record Payment`. Other 3 use `bg-surface` with `text-text-muted` icon/label: `Add Tenant` (`person-add-outline` → `/(admin)/tenants/new`), `Add Unit` (`home-outline` → `/(admin)/properties`), `Log Issue` (`construct-outline` → `/(admin)/reports/maintenance-costs`).

Verify: `npx tsc --noEmit`

### 4. [low] Create `AttentionRow`
File: `/Users/admin/Documents/personal/apartment-manager/components/home/AttentionRow.tsx`

Props: `{ tenantName: string; unitNumber?: string | null; status: 'overdue' | 'pending'; amount: number; onPress?: () => void }`. Card: `bg-surface rounded-[12px]` with inline style `padding: 12, paddingHorizontal: 14`. Layout: `flex-row items-center justify-between`. Left column: name `text-[13px] font-semibold text-text-primary`, sub `text-[11px] font-normal text-text-muted` (omit if unitNumber null). Right column `items-end gap-1`: `StatusChip` (overdue=danger, pending=warning) then amount `text-[13px] font-bold` color `#FF5C6A` if overdue else `#FFB020`.

Verify: `npx tsc --noEmit`

### 5. [low] Create `VacantRow`
File: `/Users/admin/Documents/personal/apartment-manager/components/home/VacantRow.tsx`

Props: `{ unitName: string; propertyName: string; daysVacant: number; monthlyRate?: number | null; onPress?: () => void }`. Same card surface as AttentionRow. Left: top `Unit ${unitName} · ${propertyName}` (13/600/text-text-primary), bottom `Vacant ${daysVacant} days` (11/400/text-text-muted). Right: if monthlyRate truthy compute `lost = Math.round(daysVacant * (monthlyRate / 30))` and render `~${formatPHP(lost)} lost` 10/700 color `#FF5C6A`; else `<View />`.

Verify: `npx tsc --noEmit`

### 6. [med] Create `UnitCell`
File: `/Users/admin/Documents/personal/apartment-manager/components/home/UnitCell.tsx`

Props: `{ unitNumber: string; tenantName?: string | null; status: 'occupied-paid' | 'occupied-overdue' | 'vacant'; onPress?: () => void }`. Status color map: paid=#22C98A, overdue=#FF5C6A, vacant=#424860. Card class `bg-surface rounded-[12px]` with inline `paddingTop: 11, paddingBottom: 11, paddingHorizontal: 12, borderLeftWidth: 3, borderLeftColor: <statusColor>`. Line 1: unit number 12/700/text-text-primary. Line 2: tenant or "Vacant" 10/400/text-text-muted. Bottom chip: when overdue show `StatusChip danger OVERDUE`; when vacant show `StatusChip neutral VACANT`; when paid omit.

Verify: `npx tsc --noEmit`

### 7. [med] Create `ReportCard` (data-bearing variant)
File: `/Users/admin/Documents/personal/apartment-manager/components/home/ReportCard.tsx`

Props: `{ label: string; value: string; sub: string; iconName: ComponentProps<typeof Ionicons>['name']; iconBg: string; iconColor: string; onPress: () => void }`. AnimatedPressable className `bg-surface rounded-[16px]` with inline padding `{ paddingVertical: 14, paddingHorizontal: 12 }`, gap 10. Icon container: 32×32 `rounded-[8px] items-center justify-center` with inline `backgroundColor: iconBg` containing `<Ionicons size={15} color={iconColor} />`. Below stack: label 11/500 text-text-secondary; value 11/700 inline color iconColor; sub 10/400 text-text-muted. Mirrors Reanimated press-scale pattern from ReportMenuCard.

Verify: `npx tsc --noEmit`

### 8. [low] Extend `CollectionProgressBar` with month-summary variant
File: `/Users/admin/Documents/personal/apartment-manager/components/billing/CollectionProgressBar.tsx`

Extend props with optional `monthLabel?: string`, `collectedAmount?: number`, `billedAmount?: number`, `pct?: number`. When `monthLabel` provided, render top section: line 1 monthLabel (11/400/text-text-muted), line 2 `${formatPHP(collectedAmount)} of ${formatPHP(billedAmount)} — ${pct}%` (14/700/text-text-primary). Change bar height from h-[6px] to h-[4px]. Keep backwards compatibility: existing callers that don't pass `monthLabel` get original layout.

Verify: `npx tsc --noEmit`; `ctx_search "<CollectionProgressBar" /Users/admin/Documents/personal/apartment-manager/app` — confirm existing usages don't pass monthLabel.

### 9. [low] Re-export new home components from `components/ui/index.ts`
File: `/Users/admin/Documents/personal/apartment-manager/components/ui/index.ts`

Append:
```
export { QuickActionBar } from '../home/QuickActionBar'
export { AttentionRow } from '../home/AttentionRow'
export { VacantRow } from '../home/VacantRow'
export { UnitCell } from '../home/UnitCell'
export { ReportCard } from '../home/ReportCard'
```

Verify: `npx tsc --noEmit`

### 10. [low] Add shared `formatPHP` helper
File: `/Users/admin/Documents/personal/apartment-manager/lib/format.ts` (new)

Export `formatPHP(n: number): string` returning `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`. Update all 5 new home subcomponents to import from `lib/format`.

Verify: `npx tsc --noEmit`

### 11. [high] Rewrite `HomeScreen`
File: `/Users/admin/Documents/personal/apartment-manager/app/(admin)/index.tsx`

Full rewrite. Key points:
1. Drop `useUnitCounts`, use `useUnitStatusCounts` instead (bug fix — useUnitCounts returns per-property map, not global counts).
2. Add 6 report hooks: `useMonthlyCollection(monthPrefix)`, `useOutstandingBalances()`, `useMaintenanceCosts(monthPrefix)`, `usePerUnitIncome(monthPrefix)`, `useAnnualSummary(currentYear)`.
3. KPI grid: 2×2, gap 8px, each KpiCard with spec colors (#22C98A green / #4B7BFF accent / #FF5C6A red / #FFB020 amber).
4. QuickActionBar after KPI grid.
5. CollectionProgressBar with monthLabel/collectedAmount/billedAmount/pct props.
6. Attention section: max 2 rows of AttentionRow, "View all" → `/(admin)/payments`.
7. Vacant section: max 2 rows of VacantRow, "View all" → `/(admin)/properties`.
8. Units section: 2-col grid, up to 4 UnitCell. Build from vacantUnits + overdue bills. If bills don't include unit info, use vacantUnits only.
9. Reports section: 6 ReportCard in 2-col grid with live data.
10. Remove all `border border-border` from wrapper Views (surface elevation only).
11. Remove dead alert strip (moved into Attention section).
12. formatPHP: integer only (no decimals) per spec.
13. Check `lib/api/reports.ts` for exact return shapes before wiring data — confirm field names before using.

Verify: `npx tsc --noEmit`; manual on iOS simulator.

### 12. [low] Confirm tab bar filtering — `app/(admin)/_layout.tsx`
No code change required: `href: null` on reports route already filters it from FloatingTabBar. Verify the reports route is still accessible via `router.push('/(admin)/reports')` from home screen.

Add a one-line comment in `_layout.tsx` documenting that reports is non-tab.

Verify: `npx tsc --noEmit`

### 13. [low] Cleanup dead route reference
After step 11 rewrite, verify `maintenance/new` route is gone. `ctx_search "maintenance/new" /Users/admin/Documents/personal/apartment-manager/app` should return zero matches in `index.tsx`.

## Risks
- **`useBills()` shape for unit number** — UnitCell data composition assumes bills include unit.unit_number. Read `hooks/useBills.ts` and `lib/api/bills.ts` first; if unit info absent, scope UnitGrid to vacant units only.
- **`tailwind.config.js` radius overrides** — project redefines `rounded-xl=24px`. Use literal `rounded-[12px]` / `rounded-[16px]` to avoid ambiguity.
- **`CollectionProgressBar` backwards compat** — opt-in via presence of `monthLabel`.
- **6 simultaneous report hooks** — show "—" placeholders when query.data is undefined.
- **`fetchPerUnitIncome` "best unit"** — compute `bestIncome = max(entries.map(e => e.collected))` from `perUnitIncome` entries array.

## Out of scope
- Maintenance creation screen
- Refactoring `ReportMenuCard.tsx` / `app/(admin)/reports/index.tsx`
- Test files
