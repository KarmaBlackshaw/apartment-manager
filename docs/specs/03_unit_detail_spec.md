# Unit Detail — Implementation Spec

**Route:** `app/(admin)/properties/[propertyId]/units/[id]/index.tsx`
**Reference image:** `dark_20_unit_detail.png` (per design audit)
**Status:** 🟡 Partial — wired to data, but layout is sparse, sections are missing, and the file violates several engineering rules from `CLAUDE.md`.
**Audience:** Engineer agent picking up this spec cold.

> **Prerequisite:** None blocking. Existing components (`BalanceCard`, `MaintenanceRow`,
> `DocumentRow`, `InfoRow`, `StatusChip`, `AvatarInitials`, `AmountText`, `SectionHeader`,
> `ScreenLayout`) are reused as-is. **No new reusable components required** unless the
> tenant-summary row pattern is generalized (see §11 — flagged optional).

---

## 0. Why this spec exists — audit of current screen

Reference: the screenshot the user shared (Pixel 6 emulator) shows the screen as it stands
today. Compared against `dark_20_unit_detail.png` and `CLAUDE.md`:

### Layout gaps (vs design)
1. **Top info card is near-empty.** Just shows unit number again (already in header) and notes. Design calls for a metadata block: rent, billing day, status, lease type when occupied.
2. **No `BalanceCard`** when occupied → user can't see the balance prominently or record a payment.
3. **Maintenance section shows count only.** Design calls for the **top 2–3 `MaintenanceRow` items** below the count, with "View all" → log screen.
4. **Documents section uses bare chips**, not `DocumentRow`. Design audit reads: "chip links (Contract, ID Front, Unit Photo)" — current chips are styled poorly and don't show recency. Decision below in §5.
5. **No edit action** on a unit screen. User cannot change rent, billing day, or notes from here. Design audit doesn't explicitly call for it but it is required functionally.
6. **No tenant action** — design pattern is "tap tenant row → tenant detail." That works today; verify it still works after rebuild.

### Rule violations (`CLAUDE.md`)
1. **Raw hex / inline style** — `style={{ backgroundColor: colors.surface }}`, `style={{ color: colors.textPrimary }}`, `style={{ fontSize: 13, marginTop: 4 }}` everywhere. Violates "no raw hex outside `tailwind.config.js`" and the NativeWind-only rule (CLAUDE.md "Tech Stack").
2. **`<Text>` from `react-native`** instead of `<AppText>` (CLAUDE.md "Component Map" implies `AppText` is the typography primitive).
3. **`<TouchableOpacity>`** — should be `<Pressable>` everywhere; `TouchableOpacity` is legacy on Expo 54+.
4. **Inconsistent vertical rhythm** — `mt-4`, `mt-3`, `mt-2` mixed within the same scroll. Rule: 4/8dp grid; pick one section gap (recommend `mt-3` = 12dp consistently).
5. **`paddingBottom: 120`** as inline style — should be a NativeWind class (`pb-[120px]` or, better, the standard `pb-[88px]` for floating tab clearance).
6. **Status chip semantics overload.** Today's chip mixes occupancy (`VACANT`) with payment state (`PAID`/`OVERDUE`). Design audit shows the chip as occupancy-only; payment state lives in `BalanceCard`. Fix below in §4.

### What stays
- Routing back to `/(admin)/properties/{propertyId}/units` is correct.
- `useUnitDetail(id)` hook is the right data source.
- Empty-state messages ("No open maintenance issues", "No documents") are correct copy; just need styling fix.

---

## 1. Reference image breakdown (dark_20)

```
┌────────────────────────────────────────────────────────┐
│ [<]            Unit 1A             [✏︎]    [OCCUPIED] │   ← header
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────┐     │
│  │ Unit 1A                                      │     │   ← Unit info card
│  │ ──────────────────────────────────────────── │     │     (InfoRow list)
│  │ Rent              ₱3,500 / mo                │     │
│  │ Billing day       1st                        │     │
│  │ Notes             Quiet, no pets             │     │
│  └──────────────────────────────────────────────┘     │
│                                                        │
│  ┌──────────────────────────────────────────────┐     │
│  │ ⓘ  Maria Santos                          ╲   │     │   ← Tenant card
│  │    Move-in Mar 2024 · Month-to-month     ₱0  │     │     (only if occupied)
│  │                                       balance│     │
│  └──────────────────────────────────────────────┘     │
│                                                        │
│  ┌──────────────────────────────────────────────┐     │
│  │  CURRENT BALANCE                             │     │   ← BalanceCard
│  │  ₱3,500.00                                   │     │     (only if occupied
│  │  May rent · 5-day grace                      │     │      AND balance != 0,
│  │  ────────────────────────────────────────── │     │      OR always show
│  │            [ Record Payment ]                │     │      with success state)
│  └──────────────────────────────────────────────┘     │
│                                                        │
│  Maintenance · 2 open               View all  ➜       │   ← SectionHeader
│  ─────────────────────────────────────────────         │
│  ●  Leaking faucet                                     │   ← MaintenanceRow ×2
│     Plumbing · May 4                  IN PROGRESS      │
│  ●  Aircon not cooling                                 │
│     Appliance · May 6                  REPORTED        │
│                                                        │
│  Documents                          View all  ➜       │   ← SectionHeader
│  ─────────────────────────────────────────────         │
│  📄  Lease Agreement                                   │   ← DocumentRow ×N
│      Contract · Mar 2024                               │
│  🪪  ID Front                                          │
│      Gov ID · Mar 2024                                 │
│  📷  Unit Photo                                        │
│      Other · Apr 2026                                  │
│                                                        │
│                                                        │
│  ───── floating pill nav clears ─────                  │   ← pb-[88px]
└────────────────────────────────────────────────────────┘
```

---

## 2. Layout & spacing rules

- **Outer scroll padding:** `contentContainerClassName="px-4 pt-3 pb-[88px]"`. Never `paddingBottom` inline; never less than `pb-[88px]` (floating pill clearance, per CLAUDE.md).
- **Section gap:** every standalone section after the first uses `mt-3` (12dp) as the **only** vertical separator. No `mt-2`, `mt-4`, `mt-5` mixed in. Single rhythm.
- **Card radius:** `rounded-xl` (12dp) for all surface cards; matches existing `BalanceCard` and tenant card.
- **Card bg:** `bg-surface` only. Never `bg-elevated` for the primary content cards (per `CLAUDE.md` design system: cards = Surface 1).
- **Inner padding:** `p-4` (16dp) for all cards.
- **Text:** **no raw `<Text>`.** `<AppText variant="…">` for everything. Variants: `title` for unit number heading, `body` for primary metadata, `caption` for muted secondary, `label` for the "balance" subtitle.

---

## 3. Header (`ScreenLayout` configuration)

```tsx
<ScreenLayout
  title={`Unit ${unit.unit_number}`}                        // prefix "Unit "
  backHref={`/(admin)/properties/${propertyId}`}      // already correct
  headerRight={
    <View className="flex-row items-center gap-2">
      <IconButton icon="create-outline" onPress={() => router.push(
        `/(admin)/properties/${propertyId}/units/${id}/edit` as never
      )} accessibilityLabel="Edit unit" />
      <StatusChip variant={occupancyVariant} label={occupancyLabel} />
    </View>
  }
>
```

### 3.1 Occupancy chip (header right) — **occupancy only, not payment**

```ts
function occupancyChip(unit: UnitDetail): { variant: StatusChipVariant; label: string } {
  switch (unit.status) {
    case 'occupied':    return { variant: 'success', label: 'OCCUPIED' }
    case 'available':   return { variant: 'neutral', label: 'VACANT' }
    case 'maintenance': return { variant: 'warning', label: 'MAINTENANCE' }
  }
}
```

Payment status (PAID/OVERDUE/PARTIAL) lives in `BalanceCard`, **not** in the header chip. This separates "is the unit rented?" from "did the tenant pay?" — they are independent concerns and the current screen conflates them.

### 3.2 Edit action

The pencil icon next to the chip routes to a not-yet-existing edit screen at
`app/(admin)/properties/[propertyId]/units/[id]/edit.tsx`. **This screen is out of
scope for this spec** — see §10. Until that screen exists, the engineer should:

- **Option A (recommended):** route to the existing `units/new.tsx` form with a `?editId={id}` query param. The unit form must support edit mode (likely already does — verify).
- **Option B:** stub the edit screen as a 404 / "coming soon" placeholder.

Pick A. If the form doesn't support edit, the engineer files a follow-up spec; do not block this rebuild.

---

## 4. Sections (top → bottom)

### 4.1 Unit info card

Always shown. Uses `InfoRow` list inside a `bg-surface rounded-xl p-4` container.

**Rows:**
| Label | Value | Notes |
|---|---|---|
| Rent | `formatPeso(unit.monthly_rate)` + ` / mo` | Hide row if `monthly_rate` is null |
| Billing day | "Every 1st" / "Every 15th" / etc. | Via `dayjs.ordinal()`-style helper or hand-written for 1–28; only show if `billing_day` set |
| Status | "Occupied · Maria Santos" / "Vacant" / "Under maintenance" | Computed |
| Notes | `unit.notes` | Only show row if notes is non-empty; multiline ok |

Use `<InfoRow label="Rent" value="₱3,500 / mo" />`. The component already handles divider lines and label/value layout.

**Title above InfoRow list:** `<AppText variant="title">{`Unit ${unit.unit_number}`}</AppText>` — repeats the header title intentionally for visual anchoring (matches dark_20).

### 4.2 Tenant card (only if `isOccupied`)

A tappable row that routes to `/(admin)/tenants/${tenant.id}`.

**Layout (single row, `bg-surface rounded-xl p-4`):**
- Left: `<AvatarInitials name={tenant.full_name} size="md" />`
- Center (`flex-1 ml-3`): name (variant `body`, semibold); meta line (variant `caption`, muted) reading `Move-in {formatDate(move_in_date)} · {billingTypeLabel}`
- Right: `<AmountText amount={balance} variant={balance > 0 ? 'owed' : 'zero'} />` over `<AppText variant="caption" color="muted">balance</AppText>`

**Use `<Pressable>`** with the standard scale-on-press animation (Reanimated, ≤200ms). **Do not** use `TouchableOpacity`.

`billingTypeLabel`:
- `'monthly'` → `'Month-to-month'`
- `'daily'` → `'Daily'`

### 4.3 BalanceCard (only if `isOccupied`)

```tsx
<BalanceCard
  amount={balance}
  variant={balance > 0 ? 'danger' : balance < 0 ? 'info' : 'success'}
  breakdown={balanceBreakdown}                         // see below
  onRecordPayment={() => router.push({
    pathname: '/(admin)/billing/new',
    params: { tenantId: unit.tenant!.id, unitId: id },
  })}
/>
```

**`balanceBreakdown` (string):** a one-line summary that varies with state:
- `balance > 0`: `"{monthLabel} rent · {daysOverdue} days overdue"` if overdue, else `"{monthLabel} rent · due {dueDate}"`
- `balance < 0`: `"₱{Math.abs(balance)} credit"`
- `balance === 0`: `"All paid through {paidThroughMonth}"`

Implementation: derive in a small `getBalanceBreakdown(unit, today)` pure function in `lib/balance.ts`. Engineer to add this helper if it doesn't exist (verify first via `grep`). Pure logic, no side effects, ≤30 LOC.

**Pass `tenantId` AND `unitId`** as query params so the Record Payment screen pre-selects both. Current code only passes nothing — verify Record Payment honors these params.

### 4.4 Maintenance section

```
┌────────────────────────────────────────────────┐
│ Maintenance · 2 open              View all ➜  │   ← SectionHeader (count + link)
├────────────────────────────────────────────────┤
│ ● Leaking faucet                                │   ← MaintenanceRow ×min(2, openCount)
│   Plumbing · May 4         IN PROGRESS          │
│ ● Aircon not cooling                            │
│   Appliance · May 6        REPORTED             │
└────────────────────────────────────────────────┘
```

- `<SectionHeader title="Maintenance" count={openCount} onViewAll={...} />` → routes to `/(admin)/maintenance?unitId={id}`.
- Below the header, render up to **2 most-recent open** rows using `<MaintenanceRow>`. Tap → navigate to maintenance detail (or back to log filtered).
- **Empty state:** when `openCount === 0`, render `<EmptyState>` (existing component) or a single `<AppText variant="caption" color="muted">No open maintenance issues</AppText>` line. Keep it tight.

### 4.5 Documents section

**Decision: render as `<DocumentRow>` list, not chips.**

Rationale:
- Existing `<DocumentRow>` already exists with a polished design.
- Chips lose the date and category icon, which the design audit lists as part of the document semantic.
- Consistent with Tenant Documents and Unit Documents screens — same component everywhere.

```tsx
<SectionHeader title="Documents" count={docs.length} onViewAll={() =>
  router.push(`/(admin)/properties/${propertyId}/units/${id}/documents`)
} />
{docs.slice(0, 3).map((d) => (
  <DocumentRow
    key={d.id}
    title={d.title}
    category={d.category}
    date={d.created_at}
    onPress={() => router.push(`...documents` /* TODO(v2): individual doc viewer */)}
  />
))}
{docs.length === 0 && <AppText variant="caption" color="muted" className="px-4 py-2">No documents</AppText>}
```

This requires `useUnitDetail` to return up to 3 documents (currently it returns `documentCategories: string[]` only — see §6 data layer changes).

---

## 5. Visual tokens cheat sheet

All colors via NativeWind classes. **No `style={{ backgroundColor: colors.X }}` allowed.**

| Use | Class |
|---|---|
| Card bg | `bg-surface` |
| Page bg | `bg-background` (handled by `ScreenLayout` / `ScreenView`) |
| Primary text | `<AppText variant="body">` (default color) |
| Muted text | `<AppText variant="caption" color="muted">` |
| Section spacing | `mt-3` (12dp) |
| Card padding | `p-4` (16dp) |
| Card radius | `rounded-xl` |
| Tap scale | Reanimated `withTiming(0.98, {duration: 100})` |

---

## 6. Data layer changes

### 6.1 Extend `useUnitDetail` return shape

Current `UnitDetail`:
```ts
{
  ...Unit,
  tenant: { id, full_name, move_in_date, billing_type } | null,
  balance: number,
  openMaintenanceCount: number,
  documentCategories: string[],
}
```

**Add:**
- `recentMaintenance: MaintenanceIssue[]` — top 2 by `reported_at desc`, status ∈ {`REPORTED`, `IN_PROGRESS`}.
- `recentDocuments: Document[]` — top 3 by `created_at desc`.
- Replace `documentCategories: string[]` with `recentDocuments` (consumers updated). If anything else consumes `documentCategories`, keep both during migration; otherwise delete it in the same PR.

### 6.2 `lib/api/units.ts` — `fetchUnitDetail(id)`

Extend the existing query to:
1. Join + filter `maintenance_issues` for `unit_id`, status open, order by `reported_at desc`, limit 2.
2. Join + filter `documents` for `ref_type='unit' AND ref_id={id}` (and tenant docs if you want them surfaced here — engineer's call; spec says **unit-only** for now, since tenant docs have their own screen), order by `created_at desc`, limit 3.

If the existing query fans out badly with joins, run two extra small queries — readability beats one mega-query for this volume. KISS.

### 6.3 `lib/balance.ts` — `getBalanceBreakdown(unit, today)`

New helper file. Pure function. Unit-tested via the screen rebuild's manual checklist.

```ts
export function getBalanceBreakdown(
  unit: UnitDetail,
  today: dayjs.Dayjs = dayjs(),
): string {
  // Implementation per §4.3
}
```

Exports: `getBalanceBreakdown`. Nothing else.

---

## 7. Engineering rule compliance — checklist

The rebuild must satisfy every applicable rule from `CLAUDE.md`. Engineer verifies before declaring done:

- [ ] **No raw hex** in the file. Search `grep -n "#[0-9a-fA-F]\\{6\\}\\|colors\\." app/(admin)/properties/.../units/[id]/index.tsx` returns zero matches in JSX/style props.
- [ ] **No `<Text>` from `react-native`.** Replace with `<AppText>`.
- [ ] **No `<TouchableOpacity>`.** Replace with `<Pressable>` (Reanimated for press feedback).
- [ ] **No inline `style={{ ... }}`** except inside Reanimated `useAnimatedStyle`.
- [ ] **Section spacing uniform** — every section uses `mt-3`.
- [ ] **`pb-[88px]`** on the scroll container (floating pill clearance).
- [ ] **File ≤ 200 LOC.** If approaching, extract `<UnitInfoCard>`, `<TenantSummaryRow>`, `<BalanceSection>` into co-located components in `components/properties/` (see §11).
- [ ] **`accessibilityLabel`** on the pencil edit `IconButton` and the tenant `Pressable`.
- [ ] **`tsc --noEmit` clean.**
- [ ] **No `console.log` / bare `// TODO:`.**
- [ ] **Currency via `formatPeso()`** in every monetary string. **Dates via `formatDate()`**.
- [ ] **`MaintenanceRow` and `DocumentRow` used as-is** — do not duplicate their layout inline.

---

## 8. Acceptance criteria (functional)

- [ ] Header shows `Unit {N}` title; pencil edit icon left of status chip.
- [ ] Status chip is occupancy-only: OCCUPIED / VACANT / MAINTENANCE.
- [ ] Unit info card shows rent, billing day, status, notes (rows hidden when null/empty).
- [ ] Vacant unit: tenant card and `BalanceCard` are NOT rendered.
- [ ] Occupied unit: tenant card visible; tapping it routes to tenant detail.
- [ ] Occupied unit: `BalanceCard` rendered with correct variant by balance sign.
- [ ] `BalanceCard` "Record Payment" routes with `tenantId` AND `unitId` params.
- [ ] Maintenance section renders count in header; up to 2 rows below; "View all" routes to maintenance log filtered by unit.
- [ ] Empty maintenance state shows muted "No open maintenance issues" line.
- [ ] Documents section renders up to 3 `DocumentRow` items; "View all" routes to unit-documents screen.
- [ ] Empty documents state shows muted "No documents" line.
- [ ] Pencil icon routes to unit edit form (or `units/new.tsx?editId=…`).
- [ ] Tested on small phone (375pt) — no horizontal scroll, all sections reachable.
- [ ] Tested with VoiceOver — pencil icon, tenant row, "View all" links, and Record Payment CTA announced clearly.

---

## 9. Implementation order (sequential)

| # | Task | Complexity | Files |
|---|---|---|---|
| 1 | Add `getBalanceBreakdown` helper | S | `lib/balance.ts` (new) |
| 2 | Extend `UnitDetail` type with `recentMaintenance`, `recentDocuments` | S | `types/index.ts` |
| 3 | Extend `fetchUnitDetail` to populate the two new arrays | S | `lib/api/units.ts` |
| 4 | Verify unit edit route exists OR confirm `units/new.tsx?editId={id}` works | S | `app/(admin)/properties/[propertyId]/units/new.tsx` |
| 5 | Rewrite `units/[id]/index.tsx` per §3 + §4 + §5 | M | `app/(admin)/properties/[propertyId]/units/[id]/index.tsx` |
| 6 | Run `tsc --noEmit`; manual smoke (vacant unit + occupied unit + maintenance unit) | S | — |
| 7 | Verify §7 rule checklist + §8 functional checklist | S | — |

---

## 10. Out of scope (explicit cuts)

- **Amenity chips row** (cut per `CLAUDE.md` "What's Cut in v1": no `floor`, `sqm`, `type`, `amenities`).
- **Bed Map link** (cut per `CLAUDE.md`).
- **Edit unit form changes** — if `units/new.tsx` doesn't support edit mode, that's a separate spec.
- **Individual document viewer** (tap on `DocumentRow` opens unit-documents screen for now; native PDF/image viewer is v2).
- **Maintenance row tap behavior** — for now route to filtered maintenance log; per-issue detail screen is a separate spec.
- **Unit history / activity log** — not in design audit; deferred.

---

## 11. New reusable components (optional — only if file > 200 LOC)

If the rebuild exceeds the 200-LOC cap (per `CLAUDE.md` "Component Extraction"), extract:

| Component | Path | Props sketch |
|---|---|---|
| `UnitInfoCard` | `components/properties/UnitInfoCard.tsx` | `unit: UnitDetail` |
| `TenantSummaryRow` | `components/tenants/TenantSummaryRow.tsx` | `tenant: {id, full_name, move_in_date, billing_type}, balance: number, onPress: () => void` |
| `UnitMaintenanceSection` | `components/properties/UnitMaintenanceSection.tsx` | `items: MaintenanceIssue[], openCount: number, onViewAll: () => void` |
| `UnitDocumentsSection` | `components/properties/UnitDocumentsSection.tsx` | `docs: Document[], onViewAll: () => void` |

`TenantSummaryRow` is the most likely to recur — Bill Detail and Payment Detail both want this layout. Engineer's call to extract pre-emptively (per "two-uses rule" in `CLAUDE.md`); if this is the first use, leave inline.

---

## 12. Open questions for the user

1. **Edit unit route** — confirm `units/new.tsx` supports edit mode via `?editId={id}`, or should the spec block on building a dedicated edit screen?
2. **BalanceCard always visible vs only-if-balance-nonzero** — spec assumes always visible when occupied (with success variant on zero balance, matching dark_06 tenant detail pattern). Confirm.
3. **Tenant docs surfaced on unit detail?** Currently §6.2 limits to unit-scoped documents. If a tenant's ID front should appear here too, expand the query.
4. **Pencil icon vs overflow menu** — single edit action goes to a header pencil. If more actions land later (Mark Under Maintenance, Delete Unit, etc.), upgrade to a `...` overflow. Confirm pencil is fine for now.
5. **"View all" maintenance route** — current code routes to `/(admin)/maintenance?unitId={id}`. The maintenance index screen does not yet exist (per design audit dark_23 status: ❌ Missing). Should the spec block on it, or stub the route to a placeholder?
