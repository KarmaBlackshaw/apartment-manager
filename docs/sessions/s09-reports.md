# Session 09 — Report Screens

**Prerequisites:** Sessions 01, 02, 03.

**Screens:**
- `app/(admin)/reports/index.tsx` — Reports Menu (partial fix)
- `app/(admin)/reports/monthly-collection.tsx` — Monthly Collection (new)
- `app/(admin)/reports/outstanding-balances.tsx` — Outstanding Balances (new)
- `app/(admin)/reports/occupancy.tsx` — Occupancy Rate (new)
- `app/(admin)/reports/per-unit-income.tsx` — Per-Unit Income (new)
- `app/(admin)/reports/annual-summary.tsx` — Annual Summary (new)
- `app/(admin)/reports/maintenance-costs.tsx` — Maintenance Costs (new)
- `app/(admin)/reports/deposit-summary.tsx` — Deposit Summary (new, no reference image)

---

## Locked Design Decisions

- Follow `references/dark/` images. Dark only. Blue primary `#3B82F6`.
- `colors.*` tokens only. No hardcoded hex. All screens: Export button in header.
- Report screens are read-only — no mutations.

---

## Screen: Reports Menu

**File:** `app/(admin)/reports/index.tsx`  
**Reference:** `dark_13_report_menu.png`  
**Status:** 🟡 Partial

`ScreenHeader` title "Reports". Property selector below (same "All properties ▾" pill as Tenant List).

**2-column grid of `ReportMenuCard`** (`FlatList numColumns={2}`, `gap: 12`, `padding: 16`):

| label | icon | iconBg | route |
|-------|------|--------|-------|
| Monthly collection | `briefcase-outline` | `#052E16` | `reports/monthly-collection` |
| Outstanding balances | `alert-circle-outline` | `#200C0C` | `reports/outstanding-balances` |
| Occupancy rate | `home-outline` | `#0C1A3D` | `reports/occupancy` |
| Per-unit income | `stats-chart-outline` | `#1A1040` | `reports/per-unit-income` |
| Annual summary | `calendar-outline` | `#052E16` | `reports/annual-summary` |
| Maintenance costs | `construct-outline` | `#2A1A00` | `reports/maintenance-costs` |
| Deposit summary | `wallet-outline` | `#1E2533` | `reports/deposit-summary` |

7 items — last item occupies left column only (no right partner in last row).

---

## Screen: Monthly Collection

**File:** `app/(admin)/reports/monthly-collection.tsx` *(new)*  
**Reference:** `dark_14_monthly_collection.png`

`ScreenHeader` title = "[Month] [Year]" (e.g. "May 2026"). Right: "Export" text button → share CSV.

**MonthTabSelector** — scrollable, current month selected.

**Summary card:**
`backgroundColor: colors.surface`, `borderRadius: 12`, `marginHorizontal: 16`, `padding: 16`.
- "Total collected" label + `AmountText` size=large success: "₱18,500"
- "of ₱24,000" + percentage right: "77%"
- `CollectionProgressBar`
- Counts: "● Paid: 14   ● Partial: 3   ● Unpaid: 5"

**FlatList of `ListRow`** — one row per tenant:
- title: tenant name
- subtitle: "Unit 1A · ₱3,500/mo"
- trailingChip: `StatusChip`
- trailingAmount: `AmountText`

### Data
`useMonthlyCollection(month, propertyId)`.

---

## Screen: Outstanding Balances

**File:** `app/(admin)/reports/outstanding-balances.tsx` *(new)*  
**Reference:** `dark_15_outstanding_balances.png`

`ScreenHeader` title "Outstanding". Right: "Export".

**Summary card (danger style):**
`backgroundColor: colors.dangerBg` (`#200C0C`), `borderRadius: 12`, `marginHorizontal: 16`, `padding: 16`. Two columns: left = "TOTAL OUTSTANDING" label + large `AmountText` danger; right = "TENANTS" label + large count number in `colors.danger`.

**FlatList of `ListRow`** (sorted by balance desc):
- leading: `AvatarInitials`
- title: tenant name
- subtitle: "Unit 2C · 2+ months overdue" or "Bed A2 · Partial"
- trailingAmount: `AmountText` — danger color for large balances, warning for smaller

Tapping row → `router.push('/(admin)/tenants/[id]')`.

### Data
`useOutstandingBalances(propertyId)` — tenants with `balance > 0`, ordered desc.

---

## Screen: Occupancy Rate

**File:** `app/(admin)/reports/occupancy.tsx` *(new)*  
**Reference:** `dark_32_occupancy_report.png`

`ScreenHeader` title "Occupancy Rate". Right: "Export".

**Summary row (2 mini cards, side by side):**
- Overall %: `colors.success` large number, "Overall" label
- Vacant count: `colors.danger` large number, "Vacant" label

**6-month trend section:**
`SectionHeader` "6-month trend". `OccupancyBarChart` component — 6 bars, current month highlighted blue, others muted blue.

**By property section:**
`SectionHeader` "By property". Per-property row: name left, progress bar center, % right. Progress bar fill = `colors.success`.

**Vacant units section:**
`SectionHeader` "Vacant units". `FlatList` of `ListRow`:
- title: "Studio 2A · Bldg A"
- subtitle: "Vacant 45 days"
- trailingAmount: `AmountText` danger variant ("₱2,250 lost")

### Data
`useOccupancyReport(propertyId)`.

---

## Screen: Per-Unit Income

**File:** `app/(admin)/reports/per-unit-income.tsx` *(new)*  
**Reference:** `dark_33_per_unit_income.png`

`ScreenHeader` title "Per-Unit Income". Right: "Export".

**MonthTabSelector.**

**Summary row (2 mini cards):**
- Total collected: `AmountText` success
- Best unit: unit name in `colors.primary`

**FlatList of unit income rows:**
Custom row (not standard `ListRow`) — has **left border strip** (3dp, colored by status):
- 100% collected → `colors.success`
- 40–99% → `colors.warning`
- 0–39% → `colors.danger`
- Vacant → `colors.neutral`

Row content:
- Left border colored strip
- `backgroundColor: colors.surface`, `borderRadius: 10`, `padding: 12`
- Title: "Unit 2B — Studio", subtitle: tenant name + " · Paid" or "· Partial" or "· Unpaid"
- Right: `AmountText` + `colors.textMuted` percentage "100%"

### Data
`usePerUnitIncome(month, propertyId)`.

---

## Screen: Annual Summary

**File:** `app/(admin)/reports/annual-summary.tsx` *(new)*  
**Reference:** `dark_34_annual_summary.png`

`ScreenHeader` title "Annual Summary". Right: "Export".

**Year selector:** Row of year chips (2026, 2025) — pill style, same as `FilterChipBar`.

**YTD income card:**
`backgroundColor: colors.successBg`, `borderRadius: 12`, `marginHorizontal: 16`, `padding: 20`.
- "YTD INCOME (JAN–MAY)" label uppercase caption `colors.textMuted`
- Large `AmountText` success: "₱274,800"
- Projected full year: "Projected full year: ₱659,520" `colors.textMuted` caption

**Monthly breakdown section:**
`SectionHeader` "Monthly breakdown". `InfoRow` list per month:
- label: month name
- value: `AmountText` — color by performance (green if near target, amber if partial, red if significantly under)

**Summary section:**
`SectionHeader` "Summary". `InfoRow` list:
- Total billed: neutral
- Total collected: success green
- Collection rate: success green + "%" suffix
- Maintenance spend: warning amber

### Data
`useAnnualSummary(year, propertyId)`.

---

## Screen: Maintenance Costs

**File:** `app/(admin)/reports/maintenance-costs.tsx` *(new)*  
**Reference:** `dark_35_maintenance_cost_report.png`

`ScreenHeader` title "Maintenance Costs". Right: "Export".

**MonthTabSelector.**

**KPI row (2 mini cards):**
- This month: `AmountText` warning amber
- YTD total: `AmountText` neutral

**Issues this month section:**
`SectionHeader` "Issues this month". 3 `InfoRow` items:
- Open: count in `colors.danger`
- Resolved: count in `colors.success`
- Charged to tenant: count in `colors.neutral`

**Cost by unit section:**
`SectionHeader` "Cost by unit". `FlatList` of rows:
- Unit name bold
- Categories + issue count subtitle
- Right: total cost `AmountText` warning or neutral
- Below cost: "₱X from tenant" (success) or "pending" (muted) — smaller caption

### Data
`useMaintenanceCosts(month, propertyId)`.

---

## Screen: Deposit Summary

**File:** `app/(admin)/reports/deposit-summary.tsx` *(new)*  
**No reference image available** — design based on patterns from other report screens.

`ScreenHeader` title "Deposit Summary". Right: "Export".

**Summary card:**
Total deposits held: `AmountText` neutral. Count of tenants.

**FlatList of deposit rows (ListRow):**
- leading: `AvatarInitials`
- title: tenant name
- subtitle: "Unit 1A · ₱3,500 deposit"
- trailingChip: `StatusChip` (ACTIVE/FORMER)
- trailingAmount: amount held `AmountText` neutral

### Data
`useDepositSummary(propertyId)` — all active leases with deposit_held.

---

## Export Functionality (shared pattern for all reports)

"Export" button in `ScreenHeader` right → `Share.share()` with CSV string. Format:

```ts
function buildCSV(headers: string[], rows: string[][]): string {
  return [headers, ...rows].map(r => r.join(',')).join('\n')
}
```

Each report implements its own `buildCSV` call based on its data shape. No external library needed.

---

## Done Criteria

- [ ] Reports menu: 7 cards in 2-column grid, all navigate to correct screens
- [ ] Monthly collection: summary card with CollectionProgressBar, tenant rows with chips
- [ ] Outstanding balances: danger-bg summary card, rows sorted by balance desc
- [ ] Occupancy: OccupancyBarChart renders, by-property progress bars, vacant list
- [ ] Per-unit income: left border strip color matches collection status
- [ ] Annual summary: YTD income card with success green bg, monthly breakdown
- [ ] Maintenance costs: KPI row (amber/neutral), issues-this-month counts
- [ ] Deposit summary: compiles and renders (no reference, basic list)
- [ ] All "Export" buttons produce a shareable CSV
- [ ] TypeScript compiles clean
