# Project Guidelines

## How to Use This File
This file is required reading before every session. Do not skip it.
- Before touching any screen: check `docs/screenshots/` for the reference image
- Before touching any component: check `docs/plans/component_plan.md` for the spec
- Before fixing a specific screen bug: check `docs/specs/` for a detailed spec if one exists
- When a new spec or plan is created, add it to `docs/plans/` or `docs/specs/` immediately
- When a bug is fixed, add it to the **Known Bugs Fixed** section below

---

## Package First

Always install an npm/expo package when one exists for the task. Do not reinvent functionality that a well-maintained package already provides — date pickers, form validation, animations, image handling, etc.

Check npm/expo ecosystem before writing custom logic. Prefer packages that are:
- Expo-compatible (expo-*, react-native-* with Expo support)
- Actively maintained
- Widely adopted

---

## Component Extraction

Always extract reusable components — especially when:
- A UI pattern appears more than once
- A screen section has self-contained logic (form state, data fetching, calculations, conditional rendering)
- A component would be independently testable

Place components in `components/ui/` for generic UI primitives, or `components/` subdirectories grouped by domain (e.g. `components/billing/`, `components/tenants/`).

Prefer small, focused components over large monolithic screens. If a screen file grows beyond ~200 lines, extract sections into sub-components.

---

## Tech Stack

- Expo Router v3 (file-based routing)
- NativeWind v4 / Tailwind CSS for styling — **never use the `style` prop or `StyleSheet`**
- If a value can't be expressed in Tailwind utilities, extend `tailwind.config.js` with a custom token
- Dark mode + light mode — reference `docs/screenshots/` for visual targets
- Drizzle ORM + expo-sqlite (offline-first, no backend)
- react-hook-form + zod for all forms — never local useState for inputs
- FlashList for all lists — never FlatList or ScrollView for lists
- Date formatting/manipulation: `dayjs` (not date-fns)
- Bottom tab bar: 4 tabs (Home · Tenants · Billing · Properties)

---

## Safe Area

Always wrap screen content in `<ScreenView>` from `components/ui`. It handles `bg-app`, `flex-1`, and safe-area insets automatically.

```tsx
import { ScreenView } from '../components/ui'

// Screen with AppHeader (top handled by native stack header):
<ScreenView edges={['bottom']}>
  ...
</ScreenView>

// Full-screen custom layout (no AppHeader — lock, onboarding, modals):
<ScreenView>   {/* defaults to edges={['top', 'bottom']} */}
  ...
</ScreenView>
```

For scrollable content inside `ScreenView`, always add `contentContainerClassName="pb-[88px]"` on ScrollView/FlashList to clear the floating pill nav. Never reduce or remove this value.

**Do NOT use `<SafeAreaView>` from `react-native`** — it ignores the dark theme. Never call `useSafeAreaInsets()` directly in screen files; use `ScreenView` instead.

---

## Conventions

- TypeScript strict mode
- Functional components with hooks only
- No class components
- API calls go in `lib/api/`
- Shared types in `types/index.ts`
- Currency: always format with `formatPeso()` from `lib/currency.ts` — never hardcode ₱ formatting
- Dates: always format with `formatDate()` from `lib/date.ts` — never hardcode date formatting
- `cn()` utility lives in `lib/utils.ts` — use for all conditional className logic

---

## Design System

```
Font:           Plus Jakarta Sans (body), JetBrains Mono (receipt numbers/codes only)

Dark mode:
  Page bg:      #0C0E14
  Surface 1:    #13161F   ← cards, use this not Surface 2
  Surface 2:    #191D28   ← inputs, pill nav bg
  Surface 3:    #1F2433   ← progress track, avatar bg
  Border:       #252A38
  Border 2:     #2E3448
  Text 1:       #F0F3FF   primary
  Text 2:       #7A82A0   secondary
  Text 3:       #424860   tertiary / labels
  Accent:       #4B7BFF
  Green:        #22C98A
  Red:          #FF5C6A
  Amber:        #FFB020
  Purple:       #9B6FFF
  Teal:         #18C9C9

Light mode:
  Page bg:      #F5F6FA
  Surface 1:    #FFFFFF
  Surface 2:    #ECEEF5
  Border:       #D0D3E3
  Text 1:       #0E1120
  Text 2:       #5A6080
  Text 3:       #9299B8
  Accent:       #3A6AFF
  Green:        #16A86E
  Red:          #E8394A
  Amber:        #D4900A

Cards:          NO borders — surface elevation only (Surface 1 on page bg)
Border radius:  8px / 12px / 16px / 999px
Spacing:        16px horizontal padding, 14px top, 12px gap between sections
```

---

## Floating Pill Navigation

```
position:       absolute, bottom 16, left 16, right 16
height:         54px
border-radius:  999px   ← full pill, never rounded rect
background:     Surface 2
border:         1px solid Border2
tabs:           Home · Tenants · Billing · Properties + divider + Search icon
active tab:     accent color only — NO background highlight
ScrollBody:     always pb-[88px] to clear the pill
```

---

## Navigation Structure

```
app/
  (tabs)/
    index.tsx             Home / Dashboard
    tenants.tsx           Tenant List
    billing.tsx           Billing Overview
    properties.tsx        Property List
  tenants/
    [id].tsx              Tenant Detail
    add.tsx               Add Tenant (5-step wizard)
    [id]/payment-history.tsx
    [id]/documents.tsx
    [id]/id-capture.tsx
  properties/
    [id].tsx              Property Detail
    [id]/[unitId].tsx     Unit Detail
    add-unit.tsx          Add / Edit Unit
    [id]/maintenance.tsx  Maintenance Log
    [id]/add-issue.tsx    Add Maintenance Issue
    [id]/documents.tsx    Unit Documents
  billing/
    [billId].tsx          Bill Detail
    record-payment.tsx    Record Payment
    receipt.tsx           Receipt Preview
    utility-reading.tsx   Utility Reading
    bulk-generate.tsx     Bulk Bill Generate
    [paymentId].tsx       Payment Detail
  reports/
    monthly-collection.tsx
    outstanding-balances.tsx
    occupancy.tsx
    per-unit-income.tsx
    annual-summary.tsx
    maintenance-costs.tsx
  (system)/
    app-lock.tsx
    onboarding.tsx
  search.tsx
```

Reports have NO tab — accessed by tapping KPI cards on the Home screen.

---

## Component Map

```
components/
  ui/
    Text.tsx              Typography scale (h1/h2/title/body/label/caption/mono)
    Chip.tsx              Status badges (paid/unpaid/partial/overdue/expiring/advance/neutral)
    Avatar.tsx            Initials, always neutral Surface 3 bg — never colored
    IconButton.tsx        28×28px header icon buttons
    BackButton.tsx        28×28px chevron-only, Surface 2 bg
    FAB.tsx               Floating action button, accent bg, bottom 82 right 16
    ProgressBar.tsx       4px bar, green fill, Surface 3 track
    Divider.tsx           1px horizontal, Border color
    Toggle.tsx            iOS-style switch
  form/
    FormField.tsx         Label + input, react-hook-form Controller
    FormSelect.tsx        Label + picker, react-hook-form Controller
    SegmentedPicker.tsx   Grid of tap-to-select options
    TagPicker.tsx         Wrap-row toggleable tags
    PrimaryButton.tsx     Full-width CTA — flows in normal document flow only
    SecondaryButton.tsx   Text-only tertiary button
    StepIndicator.tsx     Multi-step wizard progress
  layout/
    Screen.tsx            Root wrapper, bg color, safe area
    Header.tsx            3-col grid: left / center title / right
    ScrollBody.tsx        Scrollable body, always pb-[88px], gap-3
    SectionLabel.tsx      Section header + optional action link
    FilterRow.tsx         Horizontal scroll filter pills
    MonthStrip.tsx        Month selector pills
    TabBar.tsx            Floating pill nav
  cards/
    KpiCard.tsx           Metric card, 2px colored top border, Surface 1 bg
    TenantCard.tsx        Tenant list row
    UnitCell.tsx          2-col grid cell, 3px colored left border
    PropertyCard.tsx      Property list card
    BillingRow.tsx        Billing overview row
    PaymentRow.tsx        Payment history row
    IssueRow.tsx          Maintenance issue row
    DocumentRow.tsx       Document list row
    InfoRow.tsx           Key-value table row
    BalanceHero.tsx       Large balance display + Record Payment CTA
    SummaryGrid.tsx       2-col stat strip
    ReportCard.tsx        Compact report shortcut, icon + value + sub inline
    NotificationCard.tsx  Notification row
    QuickActionBar.tsx    4-button action grid
    SearchBar.tsx         Search input
    SettingsRow.tsx       Settings list row
    ReceiptView.tsx       Full receipt layout
lib/
  utils.ts                cn() utility
  currency.ts             formatPeso()
  date.ts                 formatDate()
  receipt.ts              generateReceiptNumber()
```

---

## Database Schema (Drizzle + expo-sqlite)

```
properties       id, name, address, province, created_at
units            id, property_id, name, rent_amount, billing_day, status, notes, created_at
                 ← NO floor, sqm, type, amenities — removed in v1
tenants          id, unit_id, first_name, last_name, phone, email, move_in_date,
                 lease_type, lease_end_date, deposit_amount, status, emergency_contact, created_at
documents        id, ref_type, ref_id, type, label, file_uri, created_at
bills            id, tenant_id, unit_id, month, year, base_rent, electricity, water,
                 other_charges, late_fee, discount, total_amount, status, generated_at
payments         id, bill_id, tenant_id, amount, payment_date, method, notes,
                 receipt_number, voided_at, created_at
utility_readings id, unit_id, type, month, year, previous_reading, current_reading,
                 rate_per_unit, computed_amount, read_at
maintenance      id, unit_id, category, priority, description, status, cost,
                 charged_to_tenant, photo_uri, reported_at, resolved_at
```

---

## What's Cut in v1 — Do Not Build These

- Bed Map screen
- Floor tabs on Property Detail
- Unit fields: floor, sqm, type, amenities
- `beds` table in schema
- Reports tab (reports live on Home as tappable KPI cards)
- Move-Out as a separate screen (bottom sheet triggered from Tenant Detail)
- Add/Edit Property as a separate screen (handled in Onboarding + Property List FAB)

---

## Design Reference

```
docs/
  designs/
    apartment_manager_flat.html   full mockup, all 33 screens, dark + light toggle
  screenshots/
    dark/   01_home_dashboard.png → 33_maintenance_cost_report.png
    light/  01_home_dashboard.png → 33_maintenance_cost_report.png
  plans/
    component_plan.md             47 components, 5 layers, build order
    simplification_plan.md        what's cut in v1, what's deferred to v2
    claude_code_prompt.md         full implementation prompt with design tokens
  specs/
    dashboard_spec.md             Home screen, all 7 components, exact pixel values
    property_detail_spec.md       Property Detail, UnitCell grid, PropertySummaryCard
```

---

## Known Bugs Fixed

- **PrimaryButton**: never use `flex-1`, `justify-between`, `mt-auto`, or `absolute` — button flows in normal document flow with `mt-3` only. Fix in `ScrollBody` contentContainerClassName, not per-screen.
- **KpiCard**: background must be Surface 1 (`#13161F`) not Surface 2 (`#191D28`) — card must contrast against page bg
- **UnitCell**: always 2-column grid (`grid-cols-2 gap-1.5`), never full-width single column
- **ScrollBody**: `contentContainerClassName` must include `pb-[88px]` — never use `flex-1` or `justify-between` here
- **ReportCard**: compact card with icon + value + sub-text inline — NOT a large icon-only navigation tile