# Session 05 — Tenant Screens

**Prerequisites:** Sessions 01, 02, 03.

**Screens:**
- `app/(admin)/tenants/index.tsx` — Tenant List (partial fix)
- `app/(admin)/tenants/[id].tsx` — Tenant Detail (partial fix)
- `app/(admin)/tenants/new.tsx` — Add Tenant wizard (partial fix — 5-step)
- `app/(admin)/tenants/[id]/move-out.tsx` — Move-Out Settlement (new)
- `app/(admin)/tenants/[id]/payment-history.tsx` — Payment History (new)
- `app/(admin)/tenants/[id]/documents.tsx` — Tenant Documents (new)

---

## Locked Design Decisions

- Follow `references/dark/` images. Dark only. Blue primary.
- `Pressable` + Reanimated. `colors.*` tokens. No hardcoded hex.

---

## Screen: Tenant List

**File:** `app/(admin)/tenants/index.tsx`  
**Reference:** `dark_05_tenant_list.png`

### Header area
- Screen title "Tenants" centered, bell icon right (routes to notifications)
- Property selector dropdown below header: "All properties ▾" pill button, `colors.elevated` bg. Right-aligned tenant count label: "22 tenants", `colors.textMuted`.
- Search bar: full-width, `backgroundColor: colors.elevated`, `borderRadius: pill`, placeholder "Search name, unit, phone...", `search-outline` icon left.

### FilterChipBar
Options: `['All (N)', 'Active', 'Overdue', 'Expiring']`. Filter drives the list query.

### Tenant list
`FlatList` of `ListRow`:
- leading: `AvatarInitials`
- title: tenant full name
- subtitle: "Unit 1A · Since Mar 2024" or "Bed A2 · Bldg B"
- trailingChip: `StatusChip` (OVERDUE/EXPIRING/PAID/PARTIAL)
- trailingAmount: `AmountText` (owed amount, or "₱0" in success color)

Tapping row → `router.push('/(admin)/tenants/[id]')`

### Data
`useTenants({ propertyId?, filter })` — returns tenants with current balance and status.

---

## Screen: Tenant Detail

**File:** `app/(admin)/tenants/[id].tsx`  
**Reference:** `dark_06_tenant_detail.png`

### Screen header
`ScreenHeader` title = tenant name. Right: `StatusChip` (ACTIVE/INACTIVE/BLACKLISTED). Back button left.

### Profile card
`backgroundColor: colors.surface`, `borderRadius: 12`, `marginHorizontal: 16`, `padding: 16`. `AvatarInitials` (lg). Full name bold. Unit + move-in date + contract type chip ("Month-to-month" or "Fixed term").

### Balance card
`BalanceCard` component. Variant based on balance:
- balance > 0 → `danger` (dark red bg)
- balance = 0 → `success`
- balance < 0 (credit) → `info`

`onRecordPayment` → `router.push('/(admin)/billing/new?tenantId=[id]')`

### Contract section
`backgroundColor: colors.surface`, `borderRadius: 12`, `marginHorizontal: 16`, `padding: 16`. Title "Contract" (section label). `InfoRow` list:
- Rent: "₱3,500 / mo · due 1st"
- Deposit: "₱3,500 held"
- Advance: "1 month (applied)"
- Late fee: "₱200 · 5-day grace"

### Payment history section
`SectionHeader` "Payment history" + "View all" → `router.push('/(admin)/tenants/[id]/payment-history')`.
Show last 2 payment rows (`ListRow` style): date + receipt #, status chip, amount.

### Actions (overflow menu or bottom)
- "Move Out" → `router.push('/(admin)/tenants/[id]/move-out')`
- "View Documents" → `router.push('/(admin)/tenants/[id]/documents')`

### Data
`useTenant(id)` — tenant record, current balance, contract terms, last 2 payments.

---

## Screen: Add Tenant (5-step wizard)

**File:** `app/(admin)/tenants/new.tsx`  
**References:** `dark_07_add_tenant.png` (steps 1–2), `dark_26_tenant_id_capture.png` (step 2 detail)

Wrap all steps in a single screen component. State managed locally via `useState`. `ProgressStepIndicator` (5 steps) always visible at top. `BottomCTABar` with "Next — [Step Name]" CTA. Back button navigates to previous step (step 1 back = `router.back()`).

**Step 1 — Personal Info** (`dark_07`)
- "STEP 1 OF 5 — PERSONAL INFO" section label
- Fields: Full name* (focused on mount), Nickname (optional), Phone*, Email (optional), Occupation, Home province
- CTA: "Next — ID Capture"

**Step 2 — ID Capture** (`dark_26`)
- "STEP 2 OF 5 — ID CAPTURE" section label
- Two `CameraCapture` zones: "Front of valid ID" and "Back of ID"
- Accepted types hint: "Accepted: UMID · Driver's License · Passport · PhilHealth · Voter's ID"
- CTA: "Next — Emergency Contact"
- "Skip (not recommended)" text link below CTA

**Step 3 — Emergency Contact**
- Fields: Emergency contact name*, Relationship, Phone*
- CTA: "Next — Unit Assignment"

**Step 4 — Unit Assignment**
- Property selector (dropdown)
- Unit/bed selector (dropdown — filtered by selected property, vacant only)
- Move-in date (DateInput)
- Contract type: SegmentedControl (Month-to-month / Fixed term)
- If fixed term: contract end date field
- CTA: "Next — Billing Setup"

**Step 5 — Billing Setup**
- Monthly rent (pre-filled from unit rate, editable)
- Security deposit amount
- Advance payment
- Billing day (inherited from settings, editable)
- CTA: "Save Tenant"

On save: insert tenant, lease, and initial billing record into SQLite → `router.replace('/(admin)/tenants/[id]')`.

---

## Screen: Move-Out Settlement

**File:** `app/(admin)/tenants/[id]/move-out.tsx` *(new)*  
**Reference:** `dark_08_move_out.png`

`ScreenHeader` title "Move-Out". Back = cancel (confirm discard dialog).

Layout (ScrollView):
1. `WarningBanner` variant=warning: "Review settlement before confirming. This cannot be undone."
2. "SETTLEMENT BREAKDOWN" section label
3. List of `SettlementRow`:
   - Deposit held: `credit` variant (positive, green)
   - Open balance: `deduction` (red, prefixed "−")
   - Damage rows (user-addable, each editable): `deduction`
   - Prorated rent (auto-calculated from days used): `deduction`
4. `SettlementRow` variant=`total`: "Refund to tenant" — green if positive, red if landlord is owed

**Add damage row:** "Add damage deduction" tappable row → inline text + amount inputs appear.

5. "Move-out notes" label + multiline `Input` textarea
6. `BottomCTABar`:
   - "Confirm Move-Out" primary CTA (pill button, `colors.primary`)
   - "Cancel" text link below

On confirm:
- Mark tenant `status = 'FORMER'`
- Mark unit `status = 'VACANT'`
- Insert `move_out_record`
- `router.replace('/(admin)/tenants')` (or property detail)

### Data
`useMoveOutSettlement(tenantId)`: deposit_held, open_balance, days used in current period → prorated rent.

---

## Screen: Payment History

**File:** `app/(admin)/tenants/[id]/payment-history.tsx` *(new)*  
**Reference:** `dark_27_payment_history.png`

`ScreenHeader` title "Payment History". Right: "Export" text button (`colors.textLink`).

**Tenant header card:** `AvatarInitials`, tenant name, unit, "₱3,500/mo · Due 1st", balance due (`AmountText` owed variant). `backgroundColor: colors.surface`, `borderRadius: 12`, `marginHorizontal: 16`, `padding: 16`.

**FilterChipBar:** All | Paid | Partial | Overdue

**Payment rows** (FlatList, sorted newest first):

Each row (use `ListRow`):
- title: month label ("May 2026")
- subtitle: "Due May 1 · overdue" or "Paid Apr 3"
- trailingChip: `StatusChip` (PAID/PARTIAL/UNPAID/OVERDUE/ADVANCE)
- trailingAmount: `AmountText`

Note: ADVANCE is a valid chip variant (info color). Shown when payment made before billing period.

Tapping a row → `router.push('/(admin)/billing/payments/[paymentId]')`

### Data
`usePaymentHistory(tenantId)` — returns billing records with payment status, sorted by month desc.

---

## Screen: Tenant Documents

**File:** `app/(admin)/tenants/[id]/documents.tsx` *(new)*  
**Reference:** `dark_28_tenant_documents.png`

`ScreenHeader` title "[LastName] — Docs". Back button.

**FilterChipBar:** All(N) | Contract | Gov ID | Other

**FlatList of `DocumentRow`** items. Below list: dashed "Add document or photo" row (tap → `ImagePicker` or camera).

Document categories for filter mapping:
- contract → Contract
- gov-id → Gov ID (UMID Front/Back, Passport, etc.)
- other → Other (Barangay Clearance, etc.)

### Data
`useTenantDocuments(tenantId)` — reads `documents` table where `ref_type = 'TENANT'` and `ref_id = tenantId`.

---

## Done Criteria

- [ ] Tenant list: FilterChipBar filters correctly, AvatarInitials visible, chips + amounts correct
- [ ] Tenant detail: BalanceCard danger variant matches dark_06 (very dark red bg)
- [ ] Tenant detail: ACTIVE chip in header
- [ ] Tenant detail: Contract + payment history sections present
- [ ] Add tenant: 5-step wizard, ProgressStepIndicator, ID capture zones in step 2
- [ ] Move-out: Warning banner visible, settlement calc correct (deposit − deductions = refund)
- [ ] Move-out: Confirm action marks tenant FORMER + unit VACANT
- [ ] Payment history: ADVANCE chip renders (info color)
- [ ] Documents: DocumentRow items with correct category icons
- [ ] TypeScript compiles clean
