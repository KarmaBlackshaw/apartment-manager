# Dashboard Reports Deduplication

**Trigger:** User reported the Home dashboard shows the same reports twice. Direction confirmed: **delete the top 4 KPI strip; keep the bottom 6 ReportCards as the canonical entry to detail reports.**
**Audience:** Engineer agent.
**Skills consulted:** `using-superpowers`, `ui-ux-pro-max` (rule §5 `content-priority`, `visual-hierarchy`).

---

## 0. TL;DR

The dashboard has two parallel blocks for the same data:

- **Top:** 2×2 grid of `<KPICard>` (4 cards: Monthly income, Occupancy, Outstanding, Vacancies). Colored accent border. Non-interactive.
- **Bottom:** 2×3 grid of `<ReportCard>` (6 cards: Monthly Collection, Occupancy, Outstanding, Maintenance, Per-Unit Income, Annual Summary). Icon-based. Tappable → opens detail report.

**Decision:** delete the top KPI strip. The bottom ReportCard grid becomes the canonical "tap to open report" surface. Move it **up** to occupy the space the KPI strip vacated, so dashboard hierarchy is preserved.

CLAUDE.md "Navigation Structure" already mandates "Reports have NO tab — accessed by tapping cards on the Home screen." ReportCards satisfy that role; KPIs are redundant.

---

## 1. The duplication

| Metric | KPI strip (delete) | ReportCard (keep) |
|---|---|---|
| Monthly Collection | "Monthly income" | "Monthly Collection" |
| Occupancy | "Occupancy" | "Occupancy" |
| Outstanding | "Outstanding" | "Outstanding" |
| Vacancies | "Vacancies" — count + lost rent | (not in reports) |
| Maintenance | — | "Maintenance" |
| Per-Unit Income | — | "Per-Unit Income" |
| Annual Summary | — | "Annual Summary" |

3 metrics duplicated. Vacancies is the only KPI without a corresponding report — its data folds into the existing Vacant section below.

---

## 2. Target dashboard layout

```
┌──────────────────────────────────────────────┐
│ [bell] Home                       [⚙︎]       │   ← header
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────┐  ┌────────────┐             │
│  │ 💰 Monthly │  │ 🏠 Occup.  │             │   ← Reports block (moved up
│  │ Collection │  │ 82%        │             │      from former bottom)
│  └────────────┘  └────────────┘             │      6 ReportCards, 2-col
│  ┌────────────┐  ┌────────────┐             │
│  │ ⚠ Outstand │  │ 🔧 Maint   │             │
│  └────────────┘  └────────────┘             │
│  ┌────────────┐  ┌────────────┐             │
│  │ 📊 Per-Un. │  │ 📅 Annual  │             │
│  └────────────┘  └────────────┘             │
│                                              │
│  [Quick action bar]                          │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ May 2026 collection      82%         │   │   ← CollectionProgressBar
│  │ ████████████░░░░░░                    │   │     (kept)
│  │ 9 paid · 1 partial · 1 unpaid        │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  Attention (2)                  View all →  │
│  [...]                                       │
│                                              │
│  Vacant (3) · ~₱28,000/mo lost  View all →  │   ← lost-rent moved here from
│  [...]                                       │     deleted Vacancies KPI
│                                              │
│  Units                          View all →  │
│  [...]                                       │
│                                              │
└──────────────────────────────────────────────┘
```

### Differences from current
- **2×2 KPI strip removed** (top 4 cards: Monthly income, Occupancy, Outstanding, Vacancies).
- **Bottom Reports grid moved to top** of scroll (right under the header, before QuickActionBar).
- **Section header `"Reports"` removed** — the grid is the first thing on the dashboard, no header needed.
- **Vacancies' "lost rent" subtitle** absorbed into the Vacant section header (e.g. `Vacant (3) · ~₱28,000/mo lost`) so the data isn't lost.
- CollectionProgressBar, Attention, Vacant, Units sections unchanged in position and content.

---

## 3. Why this direction

| Consideration | Result |
|---|---|
| CLAUDE.md says reports are reached via "cards on Home" | ReportCards already tap to open reports — purpose-built for this. KPIs were never wired up. |
| ReportCard surfaces 6 reports vs KPI's 4 | Wider coverage. Maintenance, Per-Unit Income, and Annual Summary become reachable inline (currently only via the deleted "See all" link). |
| Visual hierarchy at top | Moving the ReportCard grid up gives the dashboard a clear first action: "tap a report." Matches a financial-dashboard idiom. |
| Vacancies tile loses its home | Drop entirely. The Vacant section already shows the unit count + per-unit rent rates; aggregate "lost rent" was nice-to-have, not load-bearing. |

The current "two parallel views" pattern violates `ui-ux-pro-max` rule §5 `content-priority` (show core content first; don't repeat). One block, well-positioned, beats two competing ones.

---

## 4. Implementation

Edit `app/(admin)/index.tsx`:

### 4.1 Delete the top KPI strip

Remove the entire `<View className="gap-2">` block that contains the 2×2 `<KPICard>` grid (currently lines ~166–203 in `index.tsx`). That's:

```tsx
// DELETE entire block:
<View className="gap-2">
  <View className="flex-row gap-2">
    <View className="flex-1">
      <KPICard label="Monthly income" ... />
    </View>
    <View className="flex-1">
      <KPICard label="Occupancy" ... />
    </View>
  </View>
  <View className="flex-row gap-2">
    <View className="flex-1">
      <KPICard label="Outstanding" ... />
    </View>
    <View className="flex-1">
      <KPICard label="Vacancies" ... />
    </View>
  </View>
</View>
```

### 4.2 Move the Reports grid up

Move the existing Reports block (currently at the bottom) to the top of the ScrollView, **immediately after the header and before** the QuickActionBar.

Also: drop the SectionHeader; the grid stands alone:

```tsx
// BEFORE — bottom of file
<SectionHeader
  title="Reports"
  onViewAll={() => router.push('/(admin)/reports' as any)}
  actionLabel="See all"
/>
<View className="flex-row flex-wrap gap-2">
  {reportCards.map((card) => (
    <View key={card.route} className="w-[48.5%]">
      <ReportCard ... />
    </View>
  ))}
</View>

// AFTER — top of ScrollView (right after the opening `<ScrollView>`)
<View className="flex-row flex-wrap gap-2">
  {reportCards.map((card) => (
    <View key={card.route} className="w-[48.5%]">
      <ReportCard ... />
    </View>
  ))}
</View>
```

The "See all" link is no longer needed — every report is reachable via its card.

### 4.3 Delete the Reports menu screen

`/(admin)/reports/index.tsx` exists today as a 6-card menu listing every report. After this spec, every report is reachable directly from Home via the moved-up ReportCard grid. The menu becomes redundant.

**Delete:** `app/(admin)/reports/index.tsx`

**Keep:**
- `app/(admin)/reports/_layout.tsx` — Stack wrapper for the surviving report screens.
- `app/(admin)/reports/monthly-collection.tsx`, `outstanding-balances.tsx`, `occupancy.tsx`, `per-unit-income.tsx`, `annual-summary.tsx`, `maintenance-costs.tsx`, `deposit-summary.tsx` — destination screens, all unchanged.

After deletion, expo-router will not match the bare `/(admin)/reports` URL. Verify nothing routes there:

```bash
grep -rn "router.push.*['\"]/(admin)/reports['\"]\|router.push.*['\"]/(admin)/reports[ )]" app/ components/ 2>/dev/null
```

Expected: empty (the only previous consumer was the "See all" link, which is also being deleted in §4.2).

The `_layout.tsx` for `reports` stays. Its parent (admin) `Tabs` already lists `<Tabs.Screen name="reports" options={{ href: null, title: 'Reports' }} />` — `href: null` means it's not in the tab bar, just a non-tab route. That stays correct.

### 4.4 Delete unused imports / hooks

After the KPI strip is gone, audit and remove the now-unused symbols. **Verify before deleting** — some are shared with the report cards' data.

```bash
grep -n "KPICard\|monthlyStats\|collectionPct\|outstanding\|lostPerMonth\|occupied\|available\|maintenance\|total\|occupancyPct\|unitCounts" app/\(admin\)/index.tsx
```

Likely deletable after the KPI strip removal:
- Import: `import { KPICard } from '~/components/home/KPICard'`
- Local computed: `monthlyStats` (still used by CollectionProgressBar — KEEP), `collectionPct` (still used — KEEP), `outstanding` (only used by Outstanding KPI — DELETE), `occupied/available/maintenance/total/occupancyPct` (still used by reportCards via the `useMemo` — KEEP).

The `reportCards` `useMemo` is unchanged.

The `lostPerMonth` calculation moves to be referenced inside the Vacant section title (or stays at the top of the component as a simple local — it's already defined there).

### 4.5 Consider deleting `<KPICard>` if zero remaining callers

```bash
grep -rn "KPICard" app/ components/
```

If only `index.tsx` referenced it and now doesn't, delete `components/home/KPICard.tsx` per CLAUDE.md "Component Extraction" two-uses rule (zero-uses → delete).

### 4.6 Engineering-rule violations to fix while editing

The `reportCards` array (currently bottom of `index.tsx`) contains:

```tsx
iconBg: 'rgba(34,201,138,0.12)',       // raw rgba
iconColor: '#22C98A',                   // raw hex
// ... etc for every card
```

Replace with `colors.*` tokens from `~/constants/theme`:

```tsx
iconBg: `${colors.success}1F`,         // 1F = ~12% alpha; or define `colors.successSubtle` if you want a named token
iconColor: colors.success,
```

Or, if `colors.*` doesn't have an alpha helper, add semantic `successSubtle / dangerSubtle / warningSubtle / infoSubtle / accentSubtle / tealSubtle` keys to `constants/theme.ts` AND `tailwind.config.js`. Pick the cleaner path; engineer's call.

Same for header right `Ionicons color="#94A3B8"` → `colors.textSecondary`.

---

## 5. Implementation steps

| # | Task | Complexity | Files |
|---|---|---|---|
| 1 | Edit `app/(admin)/index.tsx`: delete the 2×2 KPI strip block (§4.1) | XS | 1 |
| 2 | Move the Reports grid to the top of the ScrollView; drop the `SectionHeader` (§4.2) | S | 1 |
| 3 | Delete `app/(admin)/reports/index.tsx` (Reports menu screen) (§4.3) | XS | 1 |
| 4 | Verify no remaining references to `/(admin)/reports` bare path via grep (§4.3) | XS | — |
| 5 | Drop unused imports + computed values per §4.4 (`KPICard` import, `outstanding`, `lostPerMonth` if no longer referenced, `available` / `maintenance` / `total` / `occupancyPct` if only KPI-strip used them) | XS | 1 |
| 6 | Audit `<KPICard>` usage project-wide; delete the file if zero callers (§4.5) | XS | 0–1 |
| 7 | Replace raw rgba/hex in `reportCards` array and header right `Ionicons` with `colors.*` tokens (§4.6) | S | 1, plus `constants/theme.ts` if adding subtle tokens |
| 8 | `npx tsc --noEmit` clean | XS | — |
| 9 | Smoke test on iOS + Android: dashboard renders with Reports at top, no KPI strip; tap each ReportCard → routes to its detail report; navigating to `/(admin)/reports` bare path no longer matches | M | — |

**Estimate:** ~25 minutes.

---

## 6. Acceptance criteria

- [ ] No 2×2 KPI strip on the Home dashboard.
- [ ] No `<KPICard>` rendered on Home (file deleted if zero remaining callers project-wide).
- [ ] 2×3 ReportCard grid is the **first** content block under the header — before QuickActionBar.
- [ ] No "Reports" SectionHeader on Home.
- [ ] Each of the 6 ReportCards remains tappable and routes to its detail screen.
- [ ] Vacant section header is unchanged (no lost-rent subtitle added).
- [ ] `app/(admin)/reports/index.tsx` deleted; navigating to `/(admin)/reports` bare path no longer matches.
- [ ] CollectionProgressBar, Attention, Vacant, Units sections unchanged in position and content.
- [ ] No raw hex / `rgba(...)` literals in `app/(admin)/index.tsx` — all colors from `colors.*` or NativeWind classes.
- [ ] `npx tsc --noEmit` clean.
- [ ] Visual: dashboard hierarchy reads top-to-bottom — reports → quick actions → collection summary → attention → vacant → units.

---

## 7. Out of scope

- **`<ReportCard>` redesign** — keep its current visual.
- **Adding more reports** — 6 stays.
- **CollectionProgressBar redesign** — keep as-is.
- **QuickActionBar changes** — separate concern.
- **Header icons** (bell, settings) — keep current colors after token migration.
- **`<SectionHeader>` API changes** — not needed in this spec; the Vacant section uses the existing API. (Future note: when a subtitle is genuinely needed elsewhere, add an optional `subtitle` prop on `<SectionHeader>` rather than rendering separate `<AppText>` lines outside it.)

---

## 8. Decisions locked in (was: open questions)

1. **Vacancies "lost rent"** — dropped entirely. No subtitle added to the Vacant section. The aggregate number isn't load-bearing; per-unit rates are still visible inside the Vacant section's rows.
2. **`/(admin)/reports/index.tsx`** — deleted in this spec (§4.3). Every report is reachable from Home; the menu is redundant.
3. **`SectionHeader` subtitle** — when a subtitle becomes necessary in a future screen, use a prop on `<SectionHeader>` (not a separate `<AppText>` line). Not in scope here.
