# Session 06 — Billing Screens

**Prerequisites:** Sessions 01, 02, 03.

**Screens:**
- `app/(admin)/billing/index.tsx` — Billing Overview (partial fix)
- `app/(admin)/billing/new.tsx` — Record Payment (partial fix)
- `app/(admin)/billing/[id].tsx` — Bill Detail (partial fix)
- `app/(admin)/billing/receipt.tsx` — Receipt Preview (new)
- `app/(admin)/billing/utility.tsx` — Utility Reading (new)
- `app/(admin)/billing/payments/[id].tsx` — Payment Detail (new)
- `app/(admin)/billing/generate.tsx` — Generate Bills (new)

---

## Locked Design Decisions

- Follow `references/dark/` images. Dark only. Blue primary `#3B82F6`.
- `colors.*` tokens only. `Pressable` + Reanimated. Ionicons.

---

## Screen: Billing Overview

**File:** `app/(admin)/billing/index.tsx`  
**Reference:** `dark_09_billing_overview.png`

### Header
"Billing" title. Bell icon right (→ notifications). Property selector below title (same as Tenant List — "All properties ▾").

### Month tabs
`MonthTabSelector` — scrollable months, current month selected. Data: last 6 months + next 1 month.

### KPI row (4 cards, 2×2 grid)
```
Collected  |  Billed
Rate %     |  Overdue (count)
```
Use `KPICard` or inline — each is a mini card `backgroundColor: colors.surface`, `borderRadius: 10`, `padding: 12`. Overdue count uses `colors.danger`.

### FilterChipBar
Options: All | Unpaid | Partial | Paid

### Billing list
`FlatList` of `ListRow`:
- title: tenant name
- subtitle: "Unit 1A · ₱3,500/mo"
- trailingChip: `StatusChip` (UNPAID/PAID/PARTIAL)
- trailingAmount: `AmountText` (amount paid this month)

Tapping row → `router.push('/(admin)/billing/[billId]')`

### FAB
`+` FAB bottom right → `router.push('/(admin)/billing/generate')`

### Data
`useBillingOverview(month, propertyId)` — per-tenant billing records for selected month.

---

## Screen: Record Payment

**File:** `app/(admin)/billing/new.tsx`  
**Reference:** `dark_10_record_payment.png`

`ScreenHeader` title "Record Payment". Back button.

**Fields (ScrollView):**

1. **Tenant / Unit** — read-only display row (pre-filled from query param `?tenantId=` or selectable if navigated directly). `backgroundColor: colors.elevated`, `borderRadius: 10`, `padding: 14`.

2. **Amount received (₱)** — large `Input`, `keyboardType: 'numeric'`, fontSize 28. Autofocused.

3. **Date** — `DateInput`, default today.

4. **Covers month** — read-only auto-detected ("May 2026 (auto-detected)"), `colors.textSecondary`.

5. **Notes (optional)** — `Input`, placeholder "e.g. paid at door".

6. **Balance preview row:**
   - "Balance before": right-aligned `AmountText` (owed variant, red)
   - "Balance after": right-aligned `AmountText` — computed live as (balance_before − amount_entered). Color: owed if positive, success if zero, info if negative (credit).

**BottomCTABar:**
- "Save & Generate Receipt" — primary pill button
- "Save without receipt" — text link below, `colors.textSecondary`

Both actions insert payment record. "Save & Generate Receipt" → `router.push('/(admin)/billing/receipt?paymentId=[id]')`.

### Data
`useTenant(id)` → current balance. `useCreatePayment()` → insert + recalculate balance.

---

## Screen: Bill Detail

**File:** `app/(admin)/billing/[id].tsx`  
**Reference:** `dark_29_bill_detail.png`

`ScreenHeader` title "May 2026 Bill". Back button.

**Tenant header card:**
`AvatarInitials`, tenant name, "Unit 1A · Due May 1, 2026", `StatusChip` (UNPAID/PAID/PARTIAL). `backgroundColor: colors.surface`, `borderRadius: 12`, `marginHorizontal: 16`, `padding: 16`.

**Bill breakdown section:**
Title "Bill breakdown". `InfoRow` list:
- Base rent: right `AmountText` neutral
- Electricity (N kWh): right `AmountText` neutral
- Water (N cu.m): right `AmountText` neutral
- Late fee (Day 5+): right `AmountText` danger color (red)
- **Total due:** `InfoRow` bold=true, total amount

**Payment status section:**
`InfoRow` list:
- Total paid: right `AmountText` success (green) or zero
- Balance due: right `AmountText` danger (red) or success if zero

**BottomCTABar:**
- "Record Payment" — primary pill CTA → `router.push('/(admin)/billing/new?tenantId=[tenantId]&billId=[id]')`
- Two secondary buttons side-by-side below: "Waive Late Fee" (border style) + "Add Charge" (border style)
  - Waive: removes late_fee from bill, recalculates
  - Add Charge: opens modal with description + amount fields, adds as extra line item

### Data
`useBill(id)` — bill record with line items (base_rent, utilities, fees).

---

## Screen: Receipt Preview

**File:** `app/(admin)/billing/receipt.tsx` *(new)*  
**Reference:** `dark_11_receipt_preview.png`

**Background:** `colors.background` (`#0D0D0D`).

**Header:** `ScreenHeader` title "Receipt". Right: "Done" text button → `router.back()`.

**Receipt card** (centered, `marginHorizontal: 16`):
Use `ReceiptDocument` component — white card, all dark text on white.

**Bottom action row** (above safe area, not in `BottomCTABar` — just a row):
Three equal buttons in `colors.surface` card: "Share" (primary, `colors.primary` bg), "Print" (border style), "Done" (border style).

- Share: `Share.share({ message: receiptText })` or share PNG via `react-native-view-shot`
- Print: `expo-print` or note as TODO if not installed
- Done: `router.back()`

### Data
`usePayment(paymentId)` — full payment record to populate `ReceiptDocument` props.

---

## Screen: Utility Reading

**File:** `app/(admin)/billing/utility.tsx` *(new)*  
**Reference:** `dark_12_utility_reading.png`

`ScreenHeader` title "Utility Reading". Back button.

**Context label:** "Unit 1A · May 2026" — `colors.textSecondary`, `fontSize: 13`, below header.

**Utility type tabs:**
`FilterChipBar` (or custom pill row) with "Electricity" and "Water". Selected pill = `colors.primary` bg.

**Fields:**
- Previous reading (kWh or cu.m) — pre-filled from last reading, read-only
- Current reading — `Input`, `keyboardType: 'numeric'`, autofocused
- Rate per kWh/cu.m — `Input`, `keyboardType: 'numeric'`, pre-filled from settings

**Computed charge card:**
`backgroundColor: colors.successBg` (`#052E16`), `borderRadius: 12`, `padding: 16`, `marginHorizontal: 16`. Label "Computed charge" (`colors.textMuted`, uppercase, caption). Large amount `AmountText` size=large color=success. Subtitle "N kWh × ₱R.00" (`colors.textMuted`). Updates live as user types.

**BottomCTABar:**
"Add to May 2026 Bill" — primary pill CTA. Inserts `utility_reading` record and adds line item to current month's bill for this unit.

### Data
`useUtilityReading(unitId, month, type)` — last reading. `useAddUtilityCharge()` — inserts.

---

## Screen: Payment Detail

**File:** `app/(admin)/billing/payments/[id].tsx` *(new)*  
**Reference:** `dark_30_payment_detail.png`

`ScreenHeader` title "Payment Detail". Back button.

**Amount header card:**
`backgroundColor: colors.successBg` (`#052E16`), `borderRadius: 12`, `marginHorizontal: 16`, `padding: 20`. "AMOUNT PAID" label (uppercase, caption, `colors.textMuted`). `AmountText` size=large success variant. Date + time subtitle (`colors.textSecondary`).

**Payment info section:**
`backgroundColor: colors.surface`, `borderRadius: 12`, `marginHorizontal: 16`. `InfoRow` list:
- Receipt #: monospace font, receipt number
- Tenant: tenant name
- Unit: "Unit 1A — Bldg A"
- For month: "April 2026"
- Method: "Cash"
- Balance after: `AmountText` (success if zero, danger if still owed)

**BottomCTABar:**
- "View Receipt" — primary → `router.push('/(admin)/billing/receipt?paymentId=[id]')`
- "Void Payment" — secondary border style (destructive — confirm dialog before voiding)

### Data
`usePayment(id)`.

---

## Screen: Generate Bills

**File:** `app/(admin)/billing/generate.tsx` *(new)*  
**Reference:** `dark_31_bulk_bill_generate.png`

`ScreenHeader` title "Generate Bills". Back button.

**Month selector:** `MonthTabSelector` — Apr | May | Jun (current ± 1 month range).

**Scope toggle:** `SegmentedControl` — "All properties" / "Building A only" / etc.

**Preview card:**
`backgroundColor: colors.surface`, `borderRadius: 12`, `marginHorizontal: 16`, `padding: 16`. Title "Preview — [Month] [Year]". `InfoRow` list:
- Active tenants: count
- Bills to generate: count
- Already generated: count (success color green)
- Total billed: `AmountText`

**Warning banner:** `WarningBanner` variant=info: "Existing bills will not be overwritten."

**BottomCTABar:**
- "Generate N Bills for May 2026" — primary CTA (N updates live with preview data)
- "Cancel" text link below

On generate: bulk-insert billing records for all active tenants in scope for selected month, skip if bill already exists. → `router.back()`.

### Data
`useBillPreview(month, propertyId?)` — preview stats. `useGenerateBills()` — bulk insert.

---

## Done Criteria

- [ ] Billing overview: month tabs scroll, 4-KPI row, filter chips filter list correctly
- [ ] Record payment: balance-after preview updates live as amount is typed
- [ ] Bill detail: late fee row shown in red, secondary Waive/Add Charge buttons present
- [ ] Receipt preview: white card on dark background, Share/Print/Done actions
- [ ] Utility reading: computed charge card updates live, success green bg
- [ ] Payment detail: success green header card matches dark_30
- [ ] Generate bills: preview stats update when month/scope changes, warning banner visible
- [ ] TypeScript compiles clean
