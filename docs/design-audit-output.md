# Design Audit Output — Dark Mode Reference vs Codebase

> Generated: 2026-05-06  
> Reference set: `references/dark/` (35 images, dark_01–dark_35)  
> Spec: `design-system/apartment-manager/MASTER.md`

---

## ✅ Confirmed Decisions (follow reference images — these override MASTER.md)

1. **Tab bar**: `Home | Tenants | Billing | Reports | [Search icon]` — 4 tabs + search. No Properties tab, no Payments tab.
   - Properties navigated from within Tenants stack (dark_18/19: Tenants tab active while viewing properties)
   - Billing promoted from `href: null` to visible tab
   - Payments tab removed — payment recording/viewing lives in Billing
   - Search icon opens `TenantQuickSearchModal`
2. **Primary color**: `#3B82F6` (blue) — reference images win over MASTER.md teal
3. **Dark mode only** — no light-mode tokens needed; all tokens are dark values

**Tab restructure is Phase 0 and blocks everything.**

---

## 1. Gap Analysis

| # | Image | Screen Name | Route | Status | Missing Components |
|---|-------|-------------|-------|--------|--------------------|
| 01 | dark_01_home_dashboard | Home Dashboard | `app/(admin)/index.tsx` | 🟡 Partial | KPICard (dark variant + colored top border), CollectionProgressBar, Attention rows with swipe-right, Vacant section with View all |
| 02 | dark_02_notifications | Notifications | `app/(admin)/notifications.tsx` | ❌ Missing | NotificationRow, FilterChipBar (All/Unpaid/Expiring/Vacancy) |
| 03 | dark_03_settings | Settings | `app/(admin)/settings/index.tsx` | 🟡 Partial | ProfileCard at top (avatar initials, name, phone, role), SettingsRow with toggle, consolidated single-screen layout |
| 04 | dark_04_quick_search | Quick Search Modal | `components/admin/TenantQuickSearchModal.tsx` | 🟡 Partial | Result card layout differs from MASTER.md spec — reference omits inline Record Payment button; shows "TAP A RESULT TO OPEN" hint |
| 05 | dark_05_tenant_list | Tenant List | `app/(admin)/tenants/index.tsx` | 🟡 Partial | FilterChipBar (All/Active/Overdue/Expiring), AvatarInitials, property selector dropdown |
| 06 | dark_06_tenant_detail | Tenant Detail | `app/(admin)/tenants/[id].tsx` | 🟡 Partial | BalanceCard (dark danger bg ≈ #200c0c), ACTIVE chip in header, move-out action, full payment history section |
| 07 | dark_07_add_tenant | Add Tenant (Steps 1–5) | `app/(admin)/tenants/new.tsx` | 🟡 Partial | ProgressStepIndicator (5 steps), multi-step wizard, CameraCapture for ID |
| 08 | dark_08_move_out | Move-Out Settlement | `app/(admin)/tenants/[id]/move-out.tsx` | ❌ Missing | SettlementRow, WarningBanner, settlement calc (deposit − deductions = refund) |
| 09 | dark_09_billing_overview | Billing Overview | `app/(admin)/billing/index.tsx` | 🟡 Partial | MonthTabSelector, KPI row (Collected/Billed/Rate%/Overdue), FilterChipBar (All/Unpaid/Partial/Paid) |
| 10 | dark_10_record_payment | Record Payment | `app/(admin)/billing/new.tsx` | 🟡 Partial | Balance before/after live preview, "Save without receipt" secondary action |
| 11 | dark_11_receipt_preview | Receipt Preview | `app/(admin)/billing/receipt.tsx` | ❌ Missing | ReceiptDocument (white card on dark), Share/Print/Done actions |
| 12 | dark_12_utility_reading | Utility Reading | `app/(admin)/billing/utility.tsx` | ❌ Missing | UtilityTabSelector (Electricity/Water), computed charge card (green bg) |
| 13 | dark_13_report_menu | Reports Menu | `app/(admin)/reports/index.tsx` | 🟡 Partial | ReportMenuCard 2×3 grid with unique icons per report; 7 items (Deposit Summary not yet in code) |
| 14 | dark_14_monthly_collection | Monthly Collection | `app/(admin)/reports/monthly-collection.tsx` | ❌ Missing | MonthTabSelector, CollectionProgressBar, ListRow with UNPAID/PAID/PARTIAL chips, Export button |
| 15 | dark_15_outstanding_balances | Outstanding Balances | `app/(admin)/reports/outstanding-balances.tsx` | ❌ Missing | DangerSummaryCard (total amount + tenant count), AvatarInitials rows sorted by amount |
| 16 | dark_16_app_lock | App Lock / PIN | `app/lock.tsx` | ✅ Built | Verify biometric integration matches reference |
| 17 | dark_17_onboarding | Onboarding Wizard | `app/onboarding.tsx` | ❌ Missing | ProgressStepIndicator (4 steps), property setup form (name/address/province/floors/units) |
| 18 | dark_18_property_list | Property List | `app/(admin)/properties/index.tsx` | 🟡 Partial | PropertyCard with unit-count chips + progress bar + monthly income, FAB (+), dashed Add Property card |
| 19 | dark_19_property_detail | Property Detail | `app/(admin)/properties/[id].tsx` | 🟡 Partial | FloorTabSelector, UnitGridCard (2-col grid, colored left border by status), alert chips (Issues/Expiring) in header |
| 20 | dark_20_unit_detail | Unit Detail | `app/(admin)/properties/[propertyId]/units/[id].tsx` | 🟡 Partial | BalanceCard (danger bg), amenity chips row, MaintenanceRow list (open count), DocumentRow chips (Contract/ID/Photo) |
| 21 | dark_21_add_edit_unit | Add / Edit Unit | `app/(admin)/properties/[propertyId]/units/new.tsx` | 🟡 Partial | SegmentedControl (Studio/1BR/2BR/Bedspacer), AmenityChipSelector multi-select |
| 22 | dark_22_bed_map | Bed Map | `app/(admin)/properties/[propertyId]/units/[id]/bed-map.tsx` | ❌ Missing | BedSlotCard grid (colored by paid/overdue/vacant), legend, bed income summary |
| 23 | dark_23_maintenance_log | Maintenance Log | `app/(admin)/maintenance/index.tsx` | ❌ Missing | MaintenanceRow (dot, title, unit, category, date, status chip), FilterChipBar, FAB |
| 24 | dark_24_add_maintenance | Log Issue | `app/(admin)/maintenance/new.tsx` | ❌ Missing | CategoryChips (6 options), PriorityChips (Low/Medium/High/Urgent), photo attach |
| 25 | dark_25_unit_documents | Unit Documents | `app/(admin)/properties/[propertyId]/units/[id]/documents.tsx` | ❌ Missing | DocumentRow (type icon, name, category, date), filter tabs (All/Contract/Photos/Permits), dashed Add row |
| 26 | dark_26_tenant_id_capture | Tenant ID Capture (Step 2) | (within `tenants/new.tsx`) | 🟡 Partial | CameraCapture dashed zone (front + back), accepted ID types hint |
| 27 | dark_27_payment_history | Payment History | `app/(admin)/tenants/[id]/payment-history.tsx` | ❌ Missing | Tenant header card, FilterChipBar, monthly grouped payment rows, ADVANCE chip variant |
| 28 | dark_28_tenant_documents | Tenant Documents | `app/(admin)/tenants/[id]/documents.tsx` | ❌ Missing | DocumentRow, filter tabs (All/Contract/Gov ID/Other), dashed Add row |
| 29 | dark_29_bill_detail | Bill Detail | `app/(admin)/billing/[id].tsx` | 🟡 Partial | InfoRow breakdown table, Waive Late Fee + Add Charge secondary buttons, late fee row (red amount) |
| 30 | dark_30_payment_detail | Payment Detail | `app/(admin)/billing/payments/[id].tsx` | ❌ Missing | GreenAmountHeader, InfoRow payment info table, View Receipt + Void Payment CTAs |
| 31 | dark_31_bulk_bill_generate | Generate Bills | `app/(admin)/billing/generate.tsx` | ❌ Missing | MonthTabSelector, ScopeToggle, PreviewStats table, warning banner, generate CTA |
| 32 | dark_32_occupancy_report | Occupancy Rate | `app/(admin)/reports/occupancy.tsx` | ❌ Missing | OccupancyBarChart (6-month, react-native-svg or similar), by-property progress bars, vacant list |
| 33 | dark_33_per_unit_income | Per-Unit Income | `app/(admin)/reports/per-unit-income.tsx` | ❌ Missing | UnitIncomeRow (colored left border by status), MonthTabSelector, best-unit callout |
| 34 | dark_34_annual_summary | Annual Summary | `app/(admin)/reports/annual-summary.tsx` | ❌ Missing | YTD income card (green bg), monthly breakdown table, summary stats section |
| 35 | dark_35_maintenance_cost | Maintenance Costs | `app/(admin)/reports/maintenance-costs.tsx` | ❌ Missing | KPI row (this month / YTD), issue stats table, cost-by-unit list |
| — | (no image) | Deposit Summary | `app/(admin)/reports/deposit-summary.tsx` | ❌ Missing | No reference image; build after other reports ship |

**Totals: ✅ 1 Built · 🟡 14 Partial · ❌ 21 Missing**

---

## 2. Token Mismatch Findings

### 2a. `constants/theme.ts` vs reference images (dark mode)

`theme.ts` is light-mode only and not used by NativeWind. It can be replaced or deleted; all tokens move to `tailwind.config.js` (see §3).

| Token | `theme.ts` value | Reference dark value | Action |
|-------|-----------------|----------------------|--------|
| `primary` | `#2563EB` | `#3B82F6` | Replace |
| `danger` | `#EF4444` | `#EF4444` | Keep |
| `success` | `#10B981` | `#10B981` | Keep |
| `warning` | `#F59E0B` | `#F59E0B` | Keep |
| `background` | `#F8FAFC` | `#0D0D0D` | Replace |
| `surface` | `#FFFFFF` | `#171717` | Replace |
| `border` | `#E2E8F0` | `#2A2A2A` | Replace |
| `textPrimary` | `#0F172A` | `#F1F5F9` | Replace |
| `textSecondary` | `#64748B` | `#94A3B8` | Replace |
| `textMuted` | `#94A3B8` | `#64748B` | Replace |
| All bg/text status variants | missing | see §3 | Add |

### 2b. `tailwind.config.js` vs reference images

| Config key | Current value | Reference value | Action |
|------------|---------------|-----------------|--------|
| `app` | `#0d0d0d` | `#0D0D0D` ✓ | Rename to `background` |
| `surface` | `#171717` | `#171717` ✓ | Keep value, expand to object |
| `elevated` | `#1f1f1f` | `#1F1F1F` ✓ | Rename to `elevated` (keep) |
| `border` | `#2a2a2a` | `#2A2A2A` ✓ | Keep |
| `primary.DEFAULT` | `#3b82f6` | `#3B82F6` ✓ | Keep, add `pressed` / `subtle` |
| `success` | `#22c55e` | `#10B981` | Fix shade |
| `danger` | `#ef4444` | `#EF4444` ✓ | Keep |
| All status bg/text | missing | see §3 | Add |
| Typography scale | missing | see §3 | Add |
| Spacing scale | missing | see §3 | Add |
| Border radius | missing | see §3 | Add |

### 2c. Missing Token Groups (No Coverage Anywhere)

- Dark-mode text colors (dark-primary, dark-secondary, dark-muted)
- Dark-mode status chip bg + text (dark-bg, dark-text per status)
- Typography scale (`fontSize`, `lineHeight`, `letterSpacing` per role)
- Spacing scale (4dp base grid)
- Border radius scale
- Shadow system (JS-only in MASTER.md — no Tailwind equivalent)

---

## 3. Full `tailwind.config.js` Token Spec

Dark mode only. All values from reference images. Primary = blue.

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ── Brand ────────────────────────────────────────────────
        primary: {
          DEFAULT: '#3B82F6',   // blue — CTAs, active tabs, active chips (from reference)
          pressed: '#2563EB',   // pressed state
          muted:   '#1D4ED8',   // lower-emphasis blue
          subtle:  '#0C1A3D',   // blue tint bg (selected states, info bg)
        },

        // ── Surfaces ─────────────────────────────────────────────
        background: '#0D0D0D',          // screen bg (extracted: dark_01, dark_16)
        surface:    '#171717',          // cards, list items, input fields
        elevated:   '#1F1F1F',          // modals, bottom sheets, popovers
        overlay:    'rgba(0,0,0,0.6)',  // scrim behind modals (quick search)

        // ── Borders ───────────────────────────────────────────────
        border:     '#2A2A2A',          // card borders, dividers, input borders
        'border-focus': '#3B82F6',      // focused input border (blue)

        // ── Text ──────────────────────────────────────────────────
        text: {
          primary:   '#F1F5F9',   // headings, primary labels
          secondary: '#94A3B8',   // metadata, subtitles
          muted:     '#64748B',   // placeholders, disabled, captions
          inverse:   '#0F172A',   // text on light surfaces (receipt card)
          link:      '#3B82F6',   // tappable text links ("View all", "Export", "Clear all")
        },

        // ── Status chips — bg is dark; text is light tint ─────────
        // PAID, Occupied, Resolved
        success: {
          DEFAULT: '#10B981',   // amount text, progress bar fill
          bg:      '#052E16',   // chip / balance card bg
          text:    '#6EE7B7',   // chip label
        },
        // PARTIAL, Expiring, Notice
        warning: {
          DEFAULT: '#F59E0B',   // amount text, dot indicators
          bg:      '#1C1005',   // chip bg
          text:    '#FCD34D',   // chip label
        },
        // OVERDUE, High balance, Destructive, Critical
        danger: {
          DEFAULT: '#EF4444',   // amount text, status dot
          bg:      '#200C0C',   // chip bg / balance card bg (extracted dark_06)
          text:    '#FCA5A5',   // chip label
        },
        // CREDIT, ADVANCE, info alerts, primary tint
        info: {
          DEFAULT: '#3B82F6',   // same as primary — info = blue in dark
          bg:      '#0C1A3D',   // chip bg
          text:    '#93C5FD',   // chip label
        },
        // VACANT, Inactive, Under Repair, neutral states
        neutral: {
          DEFAULT: '#64748B',   // status dot, muted amount
          bg:      '#1E2533',   // chip bg
          text:    '#94A3B8',   // chip label
        },
        // IN PROGRESS chip (maintenance — amber/orange style)
        progress: {
          DEFAULT: '#F59E0B',
          bg:      '#292200',
          text:    '#FCD34D',
        },

        // ── Financial balance colors ───────────────────────────────
        balance: {
          zero:   '#10B981',   // ₱0.00 / fully paid — green
          owed:   '#EF4444',   // positive balance — red
          credit: '#3B82F6',   // negative balance / credit — blue
        },

        // ── Muted surfaces ────────────────────────────────────────
        muted: '#242424',       // disabled inputs, skeleton bg, section dividers
      },

      // ── Typography (MASTER.md §3 — unchanged) ────────────────────
      fontSize: {
        'screen-title':   ['24px', { lineHeight: '29px', letterSpacing: '-0.5px' }],
        'section-header': ['18px', { lineHeight: '24px', letterSpacing: '-0.3px' }],
        'card-title':     ['16px', { lineHeight: '22px', letterSpacing: '-0.2px' }],
        'body':           ['15px', { lineHeight: '22px', letterSpacing: '0px'    }],
        'label':          ['13px', { lineHeight: '18px', letterSpacing: '0.2px'  }],
        'caption':        ['12px', { lineHeight: '16px', letterSpacing: '0.1px'  }],
        'amount-large':   ['28px', { lineHeight: '34px', letterSpacing: '-0.5px' }],
        'amount-medium':  ['20px', { lineHeight: '26px', letterSpacing: '-0.3px' }],
        'amount-small':   ['15px', { lineHeight: '20px', letterSpacing: '0px'    }],
        'chip-label':     ['11px', { lineHeight: '14px', letterSpacing: '0.5px'  }],
        'tab-label':      ['10px', { lineHeight: '13px', letterSpacing: '0.3px'  }],
      },

      // ── Spacing (4dp grid, MASTER.md §4) ─────────────────────────
      spacing: {
        1:  '4px',
        2:  '8px',
        3:  '12px',
        4:  '16px',
        5:  '20px',
        6:  '24px',
        8:  '32px',
        10: '40px',
        12: '48px',
      },

      // ── Border Radius (MASTER.md §5) ─────────────────────────────
      borderRadius: {
        sm:   '6px',    // chips, badges
        md:   '12px',   // cards, list items, inputs
        lg:   '16px',   // bottom sheets, modals
        xl:   '24px',   // large modal headers
        pill: '999px',  // primary CTAs, avatar pills
      },

      // ── Font Weights ──────────────────────────────────────────────
      fontWeight: {
        regular:   '400',
        medium:    '500',
        semibold:  '600',
        bold:      '700',
        extrabold: '800',
      },
    },
  },
}
```

---

## 4. Shared Component Inventory

| Component | File path | Key props | Used in screens | Priority |
|-----------|-----------|-----------|-----------------|----------|
| `StatusChip` | `components/ui/StatusChip.tsx` | `variant` (success/warning/danger/info/neutral/advance), `label: string` | ALL screens with tenant/bill rows | **P0** |
| `AvatarInitials` | `components/ui/AvatarInitials.tsx` | `name: string`, `size?` (sm/md/lg) — color deterministic from name | Tenant list, quick search, outstanding balances, payment history, bill detail | **P0** |
| `ScreenHeader` | `components/ui/ScreenHeader.tsx` | `title`, `left?` (back/close), `right?` (actions array) | All screens | **P0** |
| `AmountText` | `components/ui/AmountText.tsx` | `amount: number`, `variant` (owed/credit/paid/zero/muted), `size?` (large/medium/small) | Tenant detail, billing, reports, quick search | **P0** |
| `BalanceCard` | `components/ui/BalanceCard.tsx` | `amount: number`, `breakdown?: string`, `variant` (danger/success/neutral), `onRecordPayment?` | Tenant detail (dark_06), unit detail (dark_20) | **P0** |
| `ListRow` | `components/ui/ListRow.tsx` | `leading?`, `title`, `subtitle?`, `trailingChip?`, `trailingAmount?`, `onPress` | Tenant list, billing, reports, maintenance | **P0** |
| `SectionHeader` | `components/ui/SectionHeader.tsx` | `title`, `count?`, `onViewAll?` | Home (Attention, Vacant), tenant detail, unit detail | **P0** |
| `FilterChipBar` | `components/ui/FilterChipBar.tsx` | `options: { label, value }[]`, `selected`, `onChange` | Tenant list, billing, maintenance, notifications, reports | **P0** |
| `BottomCTABar` | `components/ui/BottomCTABar.tsx` | `children` — wraps above safe area inset | All form/detail screens | **P0** |
| `KPICard` | `components/ui/KPICard.tsx` | `label`, `value`, `subtitle?`, `accentColor`, `accentBg` | Home (dark_01), property detail (dark_19) | **P0** |
| `CollectionProgressBar` | `components/ui/CollectionProgressBar.tsx` | `paid: number`, `partial: number`, `unpaid: number`, `total: number` | Home (dark_01), monthly collection (dark_14) | **P0** |
| `MonthTabSelector` | `components/ui/MonthTabSelector.tsx` | `months: string[]`, `selected`, `onChange` | Billing (dark_09), monthly collection (dark_14), per-unit income (dark_33), annual summary (dark_34), maintenance costs (dark_35) | **P1** |
| `PropertyCard` | `components/ui/PropertyCard.tsx` | `name`, `address`, `unitChips: Chip[]`, `monthlyIncome`, `progressPct` | Property list (dark_18) | **P1** |
| `FloorTabSelector` | `components/ui/FloorTabSelector.tsx` | `floors: number[]`, `selected`, `onChange` | Property detail (dark_19) | **P1** |
| `UnitGridCard` | `components/ui/UnitGridCard.tsx` | `unitName`, `tenantName?`, `variant` (paid/overdue/vacant/partial) — colored left border | Property detail grid (dark_19) | **P1** |
| `SegmentedControl` | `components/ui/SegmentedControl.tsx` | `options: string[]`, `selected`, `onChange` | Add unit type (dark_21), generate bills scope (dark_31) | **P1** |
| `DocumentRow` | `components/ui/DocumentRow.tsx` | `icon`, `title`, `category`, `date`, `onPress` | Unit docs (dark_25), tenant docs (dark_28) | **P1** |
| `MaintenanceRow` | `components/ui/MaintenanceRow.tsx` | `title`, `unit`, `category`, `status`, `date`, `cost?` | Maintenance log (dark_23), unit detail section (dark_20) | **P1** |
| `SettingsRow` | `components/ui/SettingsRow.tsx` | `label`, `value?`, `type` (navigate/toggle/info), `onPress?` | Settings (dark_03) | **P1** |
| `NotificationRow` | `components/ui/NotificationRow.tsx` | `iconVariant` (danger/warning/neutral/success), `title`, `subtitle`, `timestamp` | Notifications (dark_02) | **P1** |
| `InfoRow` | `components/ui/InfoRow.tsx` | `label`, `value`, `valueColor?` — two-column label/value | Bill detail (dark_29), payment detail (dark_30) | **P1** |
| `AmenityChipSelector` | `components/ui/AmenityChipSelector.tsx` | `options: string[]`, `selected: string[]`, `onToggle` | Add unit (dark_21) | **P1** |
| `ReportMenuCard` | `components/ui/ReportMenuCard.tsx` | `icon`, `iconBg`, `label`, `onPress` | Reports menu grid (dark_13) | **P1** |
| `SettlementRow` | `components/ui/SettlementRow.tsx` | `label`, `amount`, `variant` (deduction/credit/neutral) | Move-out (dark_08) | **P2** |
| `BedSlotCard` | `components/ui/BedSlotCard.tsx` | `bedLabel`, `tenantName?`, `status` (paid/overdue/vacant) — colored bg | Bed map (dark_22) | **P2** |
| `ReceiptDocument` | `components/ui/ReceiptDocument.tsx` | `building`, `address`, `receiptNo`, `tenant`, `unit`, `date`, `amount`, `balanceAfter`, `receivedBy` | Receipt preview (dark_11) | **P2** |
| `PINKeypad` | `components/ui/PINKeypad.tsx` | `onDigit`, `onBackspace`, `length` (current PIN dots), `onBiometric?` | App lock (dark_16) | **P2** |
| `OccupancyBarChart` | `components/ui/OccupancyBarChart.tsx` | `data: { month, pct }[]` — wraps react-native-svg | Occupancy report (dark_32) | **P2** |
| `ProgressStepIndicator` | `components/ui/ProgressStepIndicator.tsx` | `steps: number`, `current: number` | Add tenant (dark_07), onboarding (dark_17) | **P2** |
| `CameraCapture` | `components/ui/CameraCapture.tsx` | `label`, `onCapture`, `captured?: ImageURI` — dashed frame zone | Tenant ID capture (dark_26) | **P2** |
| `WarningBanner` | `components/ui/WarningBanner.tsx` | `message`, `variant` (warning/danger/info) | Move-out (dark_08), generate bills (dark_31) | **P2** |

**Existing components that map to the above:**
- `Badge` → rename/extend to `StatusChip` (add dark-mode bg/text tokens)
- `Button` → keep; wrap in `BottomCTABar` where needed
- `Input`, `Select`, `DateInput` → keep, add dark-mode token application
- `Card` → keep for generic containers
- `EmptyState`, `LoadingSpinner`, `AppText` → keep

---

## 5. Missing / Partial Route Specs

### ❌ dark_02 — Notifications

```
Screen:       dark_02_notifications
Route file:   app/(admin)/notifications.tsx
Navigation:   pushed from Home header bell icon
Key sections:
  - Screen header: "Notifications" title, "Clear all" right action
  - FilterChipBar: All(count) | Unpaid | Expiring | Vacancy
  - Notification list: NotificationRow for each entry
Unique components:
  - NotificationRow (P1 — icon colored by type, title, subtitle, timestamp)
  - FilterChipBar (P0 — shared)
Reused:
  - ScreenHeader, AppText, EmptyState
Hooks/data:
  - useNotifications — returns [{id, type, title, subtitle, timestamp}]
  - type drives: icon (alert-circle/time-outline/home-outline/person-outline), icon bg color
DB:
  - notifications table: id, type (OVERDUE|EXPIRING|VACANT|HIGH_BALANCE|RESOLVED), title, body, ref_id, ref_type, created_at, read_at
```

### ❌ dark_08 — Move-Out Settlement

```
Screen:       dark_08_move_out
Route file:   app/(admin)/tenants/[id]/move-out.tsx
Navigation:   pushed from TenantDetail via "Move Out" action button
Key sections:
  - WarningBanner: "Review settlement before confirming. This cannot be undone."
  - "SETTLEMENT BREAKDOWN" section label
  - SettlementRow list: deposit held (+), open balance (−), damage deductions (−), prorated rent (−)
  - Refund to tenant total row (green amount if positive, red if negative)
  - Move-out notes textarea
  - "Confirm Move-Out" pill CTA
  - "Cancel" text link
Unique components:
  - SettlementRow (P2 — label + amount, variant deduction=red / credit=green)
  - WarningBanner (P2 — amber background, warning text)
Reused:
  - ScreenHeader, BottomCTABar, AmountText, Input (notes)
Hooks/data:
  - useTenant(id) — deposit_held, open_balance, contract details
  - useMoveOut(id) — calculates settlement; damage rows user-editable
  - onConfirm: marks tenant INACTIVE, unit VACANT, records settlement
DB:
  - move_out_records: tenant_id, move_out_date, deposit_held, damage_total, prorated_rent, refund_amount, notes
```

### ❌ dark_11 — Receipt Preview

```
Screen:       dark_11_receipt_preview
Route file:   app/(admin)/billing/receipt.tsx
Navigation:   pushed from RecordPayment after "Save & Generate Receipt"; also from PaymentDetail "View Receipt"
Key sections:
  - Dark bg with centered white receipt card (ReceiptDocument component)
  - Receipt card: building name, address, receipt #, received-from table, amount paid (large), balance remaining (colored), received by, signature line
  - Bottom action row: Share | Print | Done
Unique components:
  - ReceiptDocument (P2 — white card on dark, full receipt layout; must use bundled Inter TTF per MASTER.md §13)
Reused:
  - ScreenHeader (Done right action), Button (Share, Print)
Hooks/data:
  - usePayment(id) — receipt data
  - useReceipt — generates shareable PNG via react-native-view-shot
DB: read-only
```

### ❌ dark_12 — Utility Reading

```
Screen:       dark_12_utility_reading
Route file:   app/(admin)/billing/utility.tsx
Navigation:   pushed from BillDetail "Add Charge" or from billing new-bill flow
Key sections:
  - Context header: "Unit 1A · May 2026"
  - UtilityTabSelector: Electricity | Water
  - Previous reading input (pre-filled from last reading)
  - Current reading input
  - Rate per kWh/cu.m input
  - Computed charge card: green bg, large amount, "N kWh × ₱R.00" subtitle
  - "Add to May 2026 Bill" CTA
Unique components:
  - UtilityTabSelector (P1 — Electricity/Water pill tabs)
  - Computed charge card (inline, not a named component — green surface.dark-raised bg)
Reused:
  - ScreenHeader, Input, BottomCTABar, AmountText
Hooks/data:
  - useUtilityReading(unitId, month) — last reading
  - computed: (current − previous) × rate
  - onSave: creates utility_reading record, adds charge line to bill
DB:
  - utility_readings: id, unit_id, month, type (ELECTRICITY|WATER), prev_reading, curr_reading, rate, computed_amount
```

### ❌ dark_14 — Monthly Collection Report

```
Screen:       dark_14_monthly_collection
Route file:   app/(admin)/reports/monthly-collection.tsx
Navigation:   pushed from Reports menu (dark_13)
Key sections:
  - ScreenHeader: month/year title, Export right action
  - MonthTabSelector: scrollable month tabs
  - Summary card: total collected / of total billed, % right-aligned, CollectionProgressBar, Paid/Partial/Unpaid counts
  - Tenant list: ListRow per tenant (name, unit, amount/mo, status chip, amount collected)
Reused:
  - MonthTabSelector, CollectionProgressBar, ListRow, StatusChip, AmountText, ScreenHeader
Hooks/data:
  - useMonthlyCollection(month, propertyId) — per-tenant billing summary
  - useExport — generates shareable CSV/PDF
```

### ❌ dark_15 — Outstanding Balances Report

```
Screen:       dark_15_outstanding_balances
Route file:   app/(admin)/reports/outstanding-balances.tsx
Navigation:   pushed from Reports menu
Key sections:
  - ScreenHeader: "Outstanding", Export right action
  - DangerSummaryCard: "TOTAL OUTSTANDING" + "TENANTS" count (danger bg with red border)
  - Tenant rows sorted by balance desc: AvatarInitials, name, unit, overdue detail, amount (red=large/danger, amber=partial)
Unique components:
  - DangerSummaryCard (P1 — full-width card, danger.dark-bg, total amount large, tenant count)
Reused:
  - ScreenHeader, AvatarInitials, AmountText, ListRow
Hooks/data:
  - useOutstandingBalances(propertyId) — tenants with balance > 0, sorted desc
```

### ❌ dark_17 — Onboarding Wizard

```
Screen:       dark_17_onboarding
Route file:   app/onboarding.tsx  (outside (admin) group — runs before admin layout)
Navigation:   shown on first launch (no properties in DB); redirects to /(admin) on complete
Key sections:
  - ProgressStepIndicator: 4 steps shown at top
  - Step 1 shown: property setup (name, address, province, floors, total units)
  - Step icon: house outline in rounded dark card
  - "Continue" full-width CTA
  - "Step 1 of 4" caption below
Unique components:
  - ProgressStepIndicator (P2 — horizontal step dots/bars)
Reused:
  - Input, BottomCTABar, AppText
Hooks/data:
  - Steps: 1) Property info, 2) Owner profile, 3) Billing defaults, 4) Add first unit
  - onComplete: seeds DB with first property, redirects
DB:
  - properties: name, address, province, floors, total_units
  - owner: name, phone, role
```

### ❌ dark_22 — Bed Map

```
Screen:       dark_22_bed_map
Route file:   app/(admin)/properties/[propertyId]/units/[id]/bed-map.tsx
Navigation:   pushed from UnitDetail when unit type = Bedspacer
Key sections:
  - ScreenHeader: "Room B1 — Beds" title
  - Room summary chips: "5 occupied" (green), "1 vacant" (neutral)
  - Bed grid: 2–3 column grid of BedSlotCard (green=paid, dark-red=overdue, dark-grey=vacant)
  - Legend: Paid · Overdue · Vacant
  - "Bed income" section: Monthly total (green amount), Revenue lost (red amount, vacant days)
Unique components:
  - BedSlotCard (P2 — colored bg, bed label, tenant name or "Vacant")
Reused:
  - ScreenHeader, SectionHeader, AmountText
Hooks/data:
  - useBedMap(unitId) — beds with tenant and payment status
  - Revenue lost = days_vacant × (monthly_rate / 30)
```

### ❌ dark_23 — Maintenance Log

```
Screen:       dark_23_maintenance_log
Route file:   app/(admin)/maintenance/index.tsx
Navigation:   pushed from UnitDetail "Maintenance" section "View all"; also potentially a tab-level route
Key sections:
  - ScreenHeader: "Maintenance"
  - FilterChipBar: All(count) | Open | In Progress | Resolved
  - Maintenance list: MaintenanceRow per entry
  - FAB (+) → navigates to add-maintenance
Unique components:
  - MaintenanceRow (P1 — colored status dot, issue title, unit, category · date, status chip, cost if resolved)
Reused:
  - ScreenHeader, FilterChipBar, StatusChip, EmptyState
Hooks/data:
  - useMaintenance(propertyId?, unitId?) — list of issues
DB:
  - maintenance_issues: id, unit_id, category, priority, description, status, reported_at, resolved_at, cost, charged_to_tenant
```

### ❌ dark_24 — Log Issue (Add Maintenance)

```
Screen:       dark_24_add_maintenance
Route file:   app/(admin)/maintenance/new.tsx
Navigation:   pushed from MaintenanceLog FAB or Home "Log Issue" quick action
Key sections:
  - ScreenHeader: "Log Issue"
  - Unit selector (dropdown or pre-filled)
  - CategoryChips: Plumbing | Electrical | Structural | Pest | Appliance | Other
  - PriorityChips: Low | Medium | High | Urgent (Urgent has danger chip style)
  - Description textarea
  - Repair cost input (optional — fill after)
  - Photo attachment zone (optional)
  - "Log Issue" CTA
Unique components:
  - CategoryChips, PriorityChips (variants of FilterChipBar / SegmentedControl, single-select)
Reused:
  - ScreenHeader, Input, BottomCTABar, Select
Hooks/data:
  - useCreateIssue — inserts into maintenance_issues
```

### ❌ dark_25 — Unit Documents

```
Screen:       dark_25_unit_documents
Route file:   app/(admin)/properties/[propertyId]/units/[id]/documents.tsx
Navigation:   pushed from UnitDetail "Documents" section "View all"
Key sections:
  - ScreenHeader: "Unit 1A — Docs"
  - Filter tabs: All(count) | Contract | Photos | Permits
  - DocumentRow list per file
  - Dashed "Add document or photo" row
Reused:
  - ScreenHeader, FilterChipBar, DocumentRow, EmptyState
Hooks/data:
  - useUnitDocuments(unitId) — [{id, title, category, created_at, uri}]
  - useDocumentPicker / useCameraCapture → attach
DB:
  - documents: id, ref_type (UNIT|TENANT), ref_id, category, title, uri, created_at
```

### ❌ dark_27 — Payment History (per tenant)

```
Screen:       dark_27_payment_history
Route file:   app/(admin)/tenants/[id]/payment-history.tsx
Navigation:   pushed from TenantDetail "Payment history" section "View all"
Key sections:
  - TenantHeaderCard: avatar, name, unit, rate/mo, due date, balance due
  - FilterChipBar: All | Paid | Partial | Overdue
  - Payment rows sorted by month desc: month label, date/status subtitle, StatusChip, AmountText
  - ADVANCE chip variant visible (dark_27 Dec 2025 row)
  - Export button in header
Reused:
  - AvatarInitials, StatusChip, AmountText, FilterChipBar, ScreenHeader
Hooks/data:
  - usePaymentHistory(tenantId) — grouped by month
Note:
  - "ADVANCE" is a 6th StatusChip variant (use info color) — add to StatusChip
```

### ❌ dark_28 — Tenant Documents

```
Screen:       dark_28_tenant_documents
Route file:   app/(admin)/tenants/[id]/documents.tsx
Navigation:   pushed from TenantDetail documents section
Key sections:
  - ScreenHeader: "Santos — Docs"
  - Filter tabs: All(count) | Contract | Gov ID | Other
  - DocumentRow list
  - Dashed "Add document or photo" row
Reused:
  - ScreenHeader, FilterChipBar, DocumentRow, EmptyState
Hooks/data:
  - useTenantDocuments(tenantId)
```

### ❌ dark_30 — Payment Detail

```
Screen:       dark_30_payment_detail
Route file:   app/(admin)/billing/payments/[id].tsx
Navigation:   pushed from PaymentHistory rows or BillingOverview
Key sections:
  - Success header card: "AMOUNT PAID" label, large green amount, timestamp
  - "Payment info" section: InfoRow list (Receipt #, Tenant, Unit, For month, Method, Balance after)
  - "View Receipt" primary + "Void Payment" secondary CTAs
Unique components:
  - GreenAmountHeader (inline — success.dark-bg card, amount-large text)
Reused:
  - ScreenHeader, InfoRow, BottomCTABar, AmountText
Hooks/data:
  - usePayment(id) — full payment record
  - onVoid: marks payment voided, recalculates balance
```

### ❌ dark_31 — Generate Bills (Bulk)

```
Screen:       dark_31_bulk_bill_generate
Route file:   app/(admin)/billing/generate.tsx
Navigation:   pushed from BillingOverview action (FAB or header action)
Key sections:
  - ScreenHeader: "Generate Bills"
  - MonthTabSelector: Apr | May | Jun
  - Scope SegmentedControl: All properties | Building X only
  - Preview stats: Active tenants / Bills to generate / Already generated (green) / Total billed
  - WarningBanner: "Existing bills will not be overwritten."
  - "Generate N Bills for May 2026" CTA
  - "Cancel" text link
Reused:
  - MonthTabSelector, SegmentedControl, WarningBanner, BottomCTABar
Hooks/data:
  - useBillPreview(month, scope) — preview stats
  - useGenerateBills — bulk insert billing records
```

### ❌ dark_32 — Occupancy Rate Report

```
Screen:       dark_32_occupancy_report
Route file:   app/(admin)/reports/occupancy.tsx
Navigation:   pushed from Reports menu
Key sections:
  - ScreenHeader: "Occupancy Rate", Export
  - Summary row: Overall % (green), Vacant count (danger)
  - "6-month trend" section: OccupancyBarChart
  - "By property" section: property name + progress bar + % label
  - "Vacant units" section: ListRow (unit name, days vacant, revenue lost in red/amber)
Unique components:
  - OccupancyBarChart (P2 — 6-bar chart, active bar highlighted blue)
Reused:
  - ScreenHeader, AmountText, SectionHeader, ListRow
Hooks/data:
  - useOccupancyReport(propertyId) — overall%, 6-month trend, by-property, vacant list
Note: Chart library must be react-native-svg compatible (no WebView charts — offline-first)
```

### ❌ dark_33 — Per-Unit Income Report

```
Screen:       dark_33_per_unit_income
Route file:   app/(admin)/reports/per-unit-income.tsx
Navigation:   pushed from Reports menu
Key sections:
  - ScreenHeader: "Per-Unit Income", Export
  - MonthTabSelector
  - Summary row: Total collected KPI, Best unit callout
  - Unit rows: colored left border (green=paid/100%, amber=partial, red=unpaid/0%), unit name, tenant, amount, % label
Reused:
  - MonthTabSelector, ScreenHeader, AmountText
Hooks/data:
  - usePerUnitIncome(month, propertyId) — [{unit, tenant, collected, expected, pct, status}]
```

### ❌ dark_34 — Annual Summary Report

```
Screen:       dark_34_annual_summary
Route file:   app/(admin)/reports/annual-summary.tsx
Navigation:   pushed from Reports menu
Key sections:
  - ScreenHeader: "Annual Summary", Export
  - Year tab selector: 2026 | 2025
  - YTD income card (success.dark-bg, large amount, projected full year subtitle)
  - Monthly breakdown table: InfoRow per month (amount colored by pct — green full, amber partial, red low)
  - Summary section: Total billed, Total collected (green), Collection rate (green %), Maintenance spend (amber)
Reused:
  - ScreenHeader, AmountText, InfoRow
Hooks/data:
  - useAnnualSummary(year, propertyId)
```

### ❌ dark_35 — Maintenance Costs Report

```
Screen:       dark_35_maintenance_cost_report
Route file:   app/(admin)/reports/maintenance-costs.tsx
Navigation:   pushed from Reports menu
Key sections:
  - ScreenHeader: "Maintenance Costs", Export
  - MonthTabSelector
  - KPI row: "This month" (amber), "YTD total" (neutral)
  - "Issues this month" section: Open (danger count), Resolved (success count), Charged to tenant (neutral count)
  - "Cost by unit" section: unit name, categories · issue count, total cost, "₱X from tenant" or "pending"
Reused:
  - MonthTabSelector, ScreenHeader, SectionHeader, AmountText, InfoRow
Hooks/data:
  - useMaintenanceCosts(month, propertyId)
```

---

### 🟡 Partial Screen Fix Specs

#### dark_01 — Home Dashboard (Partial)

Missing vs reference:
- KPICards need **colored top border** (3dp, `success` / `info` / `danger` / `warning`) — currently likely plain cards
- "May 2026 collection" section: needs CollectionProgressBar component + Paid/Partial/Unpaid counts
- "Attention" section rows: need status chip (OVERDUE / EXPIRING) + swipe-right to RecordPayment (MASTER.md §7.5)
- "Vacant" section with "View all" → property list filtered to vacant units
- Quick action row: 4 buttons (Record Payment, Add Tenant, Add Unit, Log Issue) — verify all 4 navigate correctly
- **Tab bar restructure required** (see structural finding above)

#### dark_03 — Settings (Partial)

Missing vs reference:
- Profile card at very top: avatar circle (initials), name, phone, role="Owner" — currently absent
- "Billing defaults" group: Billing day row + Late fee row (navigate to sub-screens)
- "Notifications" group: Rent reminders toggle, Contract expiry toggle, Vacancy alerts toggle, Quiet hours row
- "Security" group: App lock row → `settings/security.tsx`
- "Data" group: Last backup (green=recent), Back up now row
- "About" group (below fold)
- All rows use `SettingsRow` component

#### dark_05 — Tenant List (Partial)

Missing vs reference:
- Property dropdown filter at top ("All properties ▾") + tenant count label on right
- Search bar (currently may exist — verify)
- FilterChipBar: All(N) | Active | Overdue | Expiring
- Each ListRow: AvatarInitials circle left, name + unit · tenure subtitle, StatusChip right, AmountText right

#### dark_06 — Tenant Detail (Partial)

Missing vs reference:
- ACTIVE status chip in screen header right
- BalanceCard component (full-width, danger bg with breakdown text, Record Payment CTA inside card)
- Contract section: Rent/mo · due date, Deposit held, Advance, Late fee
- Payment history section (2 rows visible + "View all" → payment-history route)
- Move-out action (accessible from header overflow or bottom of screen)

#### dark_09 — Billing Overview (Partial)

Missing vs reference:
- Month tab strip at top (scrollable, Feb–Jun visible)
- 4-KPI row: Collected | Billed | Rate% | Overdue count
- FilterChipBar: All | Unpaid | Partial | Paid
- Tenant billing rows with UNPAID/PAID/PARTIAL chips

#### dark_13 — Reports Menu (Partial)

Missing vs reference:
- 7 report cards (currently may only have some): Monthly collection, Outstanding balances, Occupancy rate, Per-unit income, Annual summary, Maintenance costs, **Deposit summary**
- Each card: unique colored icon bg, icon, label — use ReportMenuCard
- Layout: 2-column grid with last item (Deposit summary) left-aligned single card

#### dark_18 — Property List (Partial)

Missing vs reference:
- PropertyCard with unit/bed count chips (green=occupied, red=vacant)
- Occupancy progress bar per property
- "₱X,XXX / mo expected" subtitle
- Dashed "Add property" card
- FAB (+) bottom right

#### dark_19 — Property Detail (Partial)

Missing vs reference:
- Occupancy % + revenue collected progress bar in header card
- Alert chips row (e.g. "3 issues" danger, "1 expiring" warning)
- FloorTabSelector: Floor 1 | Floor 2 | Floor 3
- Unit 2-column grid (UnitGridCard) with colored left border by status

#### dark_20 — Unit Detail (Partial)

Missing vs reference:
- Amenity chips row (Aircon, Private CR, WiFi, Furnished)
- BalanceCard (danger variant) with breakdown text
- Maintenance section with "N open" count + MaintenanceRow list
- Documents section: chip links (Contract, ID Front, Unit Photo)

#### dark_21 — Add/Edit Unit (Partial)

Missing vs reference:
- SegmentedControl for unit type (Studio | 1BR | 2BR | Bedspacer) — currently likely plain buttons
- AmenityChipSelector (multi-select: Aircon, WiFi, Private CR, Furnished)

#### dark_29 — Bill Detail (Partial)

Missing vs reference:
- InfoRow breakdown table (Base rent, Electricity kWh, Water cu.m, Late fee in red)
- "Total due" bold summary row
- "Payment status" section (Total paid green, Balance due red)
- **Secondary buttons**: "Waive Late Fee" + "Add Charge" (below main CTA)

---

## 6. Build Sequence

Dependencies flow top to bottom. Nothing starts before its blockers are done.

---

### Phase 0 — Tab Bar Restructure (blocks everything)

| # | Item | File(s) | Complexity | Unblocks |
|---|------|---------|------------|----------|
| 0.1 | Restructure tab layout: 4 tabs (Home/Tenants/Billing/Reports) + search icon | `app/(admin)/_layout.tsx`, `components/admin/FloatingTabBar.tsx` | M | All screens |
| 0.2 | Move Properties navigation under Tenants stack | `app/(admin)/tenants/_layout.tsx` | S | dark_18, 19, 20, 21, 22 |

---

### Phase 1 — Token Unification (blocks all component/screen work)

| # | Item | File(s) | Complexity | Unblocks |
|---|------|---------|------------|----------|
| 1.1 | Resolve primary color conflict (teal vs blue) — pick one per mode | Decision only | S | 1.2, 1.3 |
| 1.2 | Rewrite `tailwind.config.js` with full token spec (Phase 3 above) | `tailwind.config.js` | S | All components |
| 1.3 | Rewrite `constants/theme.ts` to match MASTER.md semantic names + add dark variants | `constants/theme.ts` | S | All components |

---

### Phase 2 — P0 Shared Components

| # | Component | File path | Complexity | Unblocks |
|---|-----------|-----------|------------|---------|
| 2.1 | `StatusChip` (extend existing Badge) | `components/ui/StatusChip.tsx` | S | All screens |
| 2.2 | `AvatarInitials` | `components/ui/AvatarInitials.tsx` | S | Tenant list, quick search, reports |
| 2.3 | `AmountText` | `components/ui/AmountText.tsx` | S | Balance card, list rows, reports |
| 2.4 | `ScreenHeader` | `components/ui/ScreenHeader.tsx` | S | All screens |
| 2.5 | `BottomCTABar` | `components/ui/BottomCTABar.tsx` | S | All forms |
| 2.6 | `FilterChipBar` | `components/ui/FilterChipBar.tsx` | S | Tenant list, billing, maintenance, notifications |
| 2.7 | `SectionHeader` | `components/ui/SectionHeader.tsx` | S | Home, tenant detail, unit detail |
| 2.8 | `ListRow` | `components/ui/ListRow.tsx` | M | Tenant list, billing, reports |
| 2.9 | `BalanceCard` | `components/ui/BalanceCard.tsx` | M | Tenant detail, unit detail |
| 2.10 | `KPICard` | `components/ui/KPICard.tsx` | S | Home, property detail |
| 2.11 | `CollectionProgressBar` | `components/ui/CollectionProgressBar.tsx` | S | Home, monthly collection report |

---

### Phase 3 — P1 Shared Components

| # | Component | File path | Complexity | Unblocks |
|---|-----------|-----------|------------|---------|
| 3.1 | `MonthTabSelector` | `components/ui/MonthTabSelector.tsx` | S | Billing, 5 report screens |
| 3.2 | `SegmentedControl` | `components/ui/SegmentedControl.tsx` | S | Add unit, generate bills |
| 3.3 | `PropertyCard` | `components/ui/PropertyCard.tsx` | M | Property list |
| 3.4 | `FloorTabSelector` | `components/ui/FloorTabSelector.tsx` | S | Property detail |
| 3.5 | `UnitGridCard` | `components/ui/UnitGridCard.tsx` | S | Property detail |
| 3.6 | `DocumentRow` | `components/ui/DocumentRow.tsx` | S | Unit docs, tenant docs |
| 3.7 | `MaintenanceRow` | `components/ui/MaintenanceRow.tsx` | S | Maintenance log, unit detail |
| 3.8 | `SettingsRow` | `components/ui/SettingsRow.tsx` | S | Settings |
| 3.9 | `NotificationRow` | `components/ui/NotificationRow.tsx` | S | Notifications |
| 3.10 | `InfoRow` | `components/ui/InfoRow.tsx` | S | Bill detail, payment detail |
| 3.11 | `AmenityChipSelector` | `components/ui/AmenityChipSelector.tsx` | S | Add unit |
| 3.12 | `ReportMenuCard` | `components/ui/ReportMenuCard.tsx` | S | Reports menu |
| 3.13 | `WarningBanner` | `components/ui/WarningBanner.tsx` | S | Move-out, generate bills |
| 3.14 | `SettlementRow` | `components/ui/SettlementRow.tsx` | S | Move-out |

---

### Phase 4 — P2 Shared Components

| # | Component | File path | Complexity |
|---|-----------|-----------|------------|
| 4.1 | `ProgressStepIndicator` | `components/ui/ProgressStepIndicator.tsx` | S |
| 4.2 | `BedSlotCard` | `components/ui/BedSlotCard.tsx` | S |
| 4.3 | `ReceiptDocument` | `components/ui/ReceiptDocument.tsx` | M |
| 4.4 | `PINKeypad` | `components/ui/PINKeypad.tsx` | M |
| 4.5 | `OccupancyBarChart` | `components/ui/OccupancyBarChart.tsx` | L |
| 4.6 | `CameraCapture` | `components/ui/CameraCapture.tsx` | M |

---

### Phase 5 — Partial Screen Fixes (leaf-first)

| # | Screen | File | Fix items | Complexity |
|---|--------|------|-----------|------------|
| 5.1 | Add/Edit Unit | `properties/[propertyId]/units/new.tsx` | SegmentedControl type selector, AmenityChipSelector | S |
| 5.2 | Bill Detail | `billing/[id].tsx` | InfoRow breakdown, late-fee red row, Waive/Add Charge buttons | M |
| 5.3 | Billing Overview | `billing/index.tsx` | MonthTabSelector, 4-KPI row, FilterChipBar | M |
| 5.4 | Tenant List | `tenants/index.tsx` | FilterChipBar, AvatarInitials, property dropdown | M |
| 5.5 | Reports Menu | `reports/index.tsx` | ReportMenuCard 2×3 grid, add Deposit Summary item | S |
| 5.6 | Property List | `properties/index.tsx` | PropertyCard, FAB, dashed add card | M |
| 5.7 | Property Detail | `properties/[id].tsx` | FloorTabSelector, UnitGridCard grid | M |
| 5.8 | Unit Detail | `properties/[propertyId]/units/[id].tsx` | BalanceCard, amenity chips, MaintenanceRow, DocumentRow chips | M |
| 5.9 | Tenant Detail | `tenants/[id].tsx` | BalanceCard, status chip in header, contract section, payment history section | M |
| 5.10 | Settings | `settings/index.tsx` | ProfileCard, SettingsRow groups, toggles | M |
| 5.11 | Quick Search Modal | `components/admin/TenantQuickSearchModal.tsx` | Align card layout with reference (tapping opens tenant detail directly) | S |
| 5.12 | Home Dashboard | `index.tsx` | KPICard top-border colors, CollectionProgressBar, Attention swipe rows, Vacant section | L |
| 5.13 | Add Tenant (Step 1) | `tenants/new.tsx` | ProgressStepIndicator, multi-step wizard scaffold (5 steps) | L |

---

### Phase 6 — Missing Screens (leaf screens first)

| # | Screen | Route | Complexity |
|---|--------|-------|------------|
| 6.1 | Utility Reading | `billing/utility.tsx` | M |
| 6.2 | Receipt Preview | `billing/receipt.tsx` | M |
| 6.3 | Payment Detail | `billing/payments/[id].tsx` | M |
| 6.4 | Notifications | `notifications.tsx` | M |
| 6.5 | Unit Documents | `properties/[propertyId]/units/[id]/documents.tsx` | M |
| 6.6 | Tenant Documents | `tenants/[id]/documents.tsx` | M |
| 6.7 | Payment History | `tenants/[id]/payment-history.tsx` | M |
| 6.8 | Log Issue | `maintenance/new.tsx` | M |
| 6.9 | Maintenance Log | `maintenance/index.tsx` | M |
| 6.10 | Generate Bills | `billing/generate.tsx` | M |
| 6.11 | Move-Out Settlement | `tenants/[id]/move-out.tsx` | L |
| 6.12 | Bed Map | `properties/[propertyId]/units/[id]/bed-map.tsx` | M |
| 6.13 | Onboarding Wizard | `app/onboarding.tsx` | L |

---

### Phase 7 — Missing Report Sub-Screens

| # | Screen | Route | Complexity |
|---|--------|-------|------------|
| 7.1 | Monthly Collection | `reports/monthly-collection.tsx` | M |
| 7.2 | Outstanding Balances | `reports/outstanding-balances.tsx` | M |
| 7.3 | Per-Unit Income | `reports/per-unit-income.tsx` | M |
| 7.4 | Annual Summary | `reports/annual-summary.tsx` | M |
| 7.5 | Maintenance Costs | `reports/maintenance-costs.tsx` | M |
| 7.6 | Occupancy Rate | `reports/occupancy.tsx` | L |
| 7.7 | Deposit Summary | `reports/deposit-summary.tsx` | M |

---

### Summary

| Phase | Items | Total Complexity |
|-------|-------|-----------------|
| 0 — Tab bar restructure | 2 | ~3hr |
| 1 — Token unification | 3 | ~2hr |
| 2 — P0 components | 11 | ~8hr |
| 3 — P1 components | 14 | ~6hr |
| 4 — P2 components | 6 | ~6hr |
| 5 — Partial screen fixes | 13 | ~16hr |
| 6 — Missing screens | 13 | ~18hr |
| 7 — Report screens | 7 | ~10hr |
| **Total** | **69** | **~69hr** |
