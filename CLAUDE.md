# Project Guidelines

## How to Use This File
This file is required reading before every session. Do not skip it.
- Before touching any screen: check `docs/screenshots/` for the reference image
- Before touching any component: check `docs/plans/component_plan.md` for the spec
- Before fixing a specific screen bug: check `docs/specs/` for a detailed spec if one exists
- When a new spec or plan is created, add it to `docs/plans/` or `docs/specs/` immediately
- When a bug is fixed, add it to the **Known Bugs Fixed** section below

---

## Package First — Do Not Reinvent the Wheel

**Rule:** If a package already implements the logic, use the package. No exceptions for "it's only a few lines" or "I can write it cleaner."

**Before writing any non-trivial utility, hook, or component:**
1. Check `package.json` — is something already installed that covers it?
2. If not, search npm/expo ecosystem.
3. If a maintained package exists, install via `npx expo install <pkg>` (Expo-managed) or `npm i <pkg>` (plain) and use it.
4. Only write custom logic when no package fits — and explicitly note the search result in the PR/commit description.

**Categories that ALWAYS go to a package first** — never hand-roll:
- Date/time formatting and parsing → `dayjs`
- Form state + validation → `react-hook-form` + `zod`
- Schema validation → `zod`
- Animations → `react-native-reanimated`
- Gestures → `react-native-gesture-handler`
- Image picking / camera → `expo-image-picker` / `expo-camera`
- Date pickers → `@react-native-community/datetimepicker`
- Lists → `@shopify/flash-list`
- Charts → `react-native-svg` + chart libs
- Toast / snackbar → `sonner-native`
- Haptics → `expo-haptics`
- Local auth / biometrics → `expo-local-authentication`
- Async storage → `expo-sqlite` (project-specific) or `@react-native-async-storage/async-storage`
- Icons → `@expo/vector-icons`
- Safe area → `react-native-safe-area-context`
- Routing → `expo-router`
- ID generation → `nanoid/non-secure`
- HTTP / data fetching → `@tanstack/react-query`

**Package selection criteria (in order):**
1. Expo-compatible (Expo-managed workflow constraint)
2. Actively maintained (commits within last 12 months)
3. Widely adopted (>10k weekly downloads, real usage)
4. TypeScript-ready (types shipped or @types available)
5. **Bundle-size sanity check** — for any non-trivial new dep, run `npx bundle-phobia <pkg>` (or check on bundlephobia.com) before installing. Mobile bundle bloat compounds; reject anything >100KB minified+gzipped unless its value is overwhelming.

**Anti-pattern — explicitly forbidden:**
- Reimplementing date math because "we only need to format months."
- Writing a custom toast because "the existing one is overkill."
- Building a custom switch when `Switch` from `react-native` or a wrapper exists.
- Hand-rolling form validation with regex when `zod` is already a dependency.

If unsure whether a package fits, **ask** before writing custom code. Don't guess.

---

## Component Extraction

Always extract reusable components — especially when:
- A UI pattern appears more than once
- A screen section has self-contained logic (form state, data fetching, calculations, conditional rendering)
- A component would be independently testable

Place components in `components/ui/` for generic UI primitives, or `components/` subdirectories grouped by domain (e.g. `components/billing/`, `components/tenants/`).

**Hard size cap — 200 LOC.** Component or screen files ≤ 200 lines. If a file approaches 200, **stop and extract** sub-components or move logic to a hook. Larger files become unreviewable and breed duplicate logic.

**Two-uses rule — extract immediately.** When a UI pattern appears in a 2nd screen, extract it to `components/` **in the same PR** that introduces the second use. Not "later." Variant drift (slightly different versions of the "same" card) is the failure mode this prevents — visible across `BillCard` / `PaymentRow` / `BillingRow` already in this codebase.

Prefer small, focused components over large monolithic screens.

**Chip pattern:** static labels use `<Chip>`; interactive selectable pill rows use `<ChipBar>`. There is no third chip primitive. New "chip-like" needs MUST extend one of these two — do not create a sibling component. (Consolidation lives in spec 11.)

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

## Safe area

Always wrap screen content in `<ScreenView>` from `components/ui`. It uses
`<SafeAreaView edges={...}>` from `react-native-safe-area-context` internally —
no manual inset math required.

```tsx
// Screen with ScreenLayout (default — header owns top inset):
<ScreenLayout title="…">
  {/* content */}
</ScreenLayout>

// Standalone (lock, onboarding, modals with no ScreenLayout):
<ScreenView>          {/* edges defaults to ['top','bottom'] */}
  {/* content */}
</ScreenView>
```

**Forbidden:**
- `useSafeAreaInsets()` in screen files. The hook is only acceptable inside
  primitives (`ScreenView`, `ScreenHeader`, `BottomCTABar`). If you find
  yourself reaching for it in `app/**/*.tsx`, you are doing it wrong — wrap in
  `ScreenView` or `ScreenLayout` instead.
- `paddingTop: insets.top` / `paddingBottom: insets.bottom` anywhere. Manual
  inset math is unreliable on Android edge-to-edge (returns 0). Use
  `<SafeAreaView edges={...}>` always.
- `<SafeAreaView>` from `react-native` (the deprecated one). Always import from
  `react-native-safe-area-context`.

**Rule of thumb:** if a screen does not use `ScreenLayout`, it must wrap in
`<ScreenView>` (default `edges`). Both edges are handled.

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

### Color tokens — no raw hex outside `tailwind.config.js`

All colors must come from NativeWind classes (`bg-primary`, `text-text-secondary`, etc.) or `colors.*` exported from `constants/theme.ts`. **Raw `#RRGGBB` literals are forbidden in component, screen, and hook files.** Add tokens to `tailwind.config.js` (and mirror in `constants/theme.ts` if needed for JS access) before using them. Drift across mismatched hex values has already produced 14+ partial-state screens — this rule prevents recurrence.

### Form schemas live next to the form

Every multi-field form has a schema file at `lib/schemas/<domain>-<screen>.schema.ts` (e.g. `lib/schemas/unit-edit.schema.ts`). **Do NOT place schema files inside `app/`** — expo-router v6 treats every `.ts`/`.tsx` file under `app/` as a route (underscore prefix does NOT exclude files; only `_layout.tsx` is special). Putting a schema there causes a "missing default export" route error.

Canonical pattern:
- `lib/schemas/<domain>-<screen>.schema.ts` — import via `~/lib/schemas/<name>`

**Forbidden:** any `*.schema.ts` inside `app/` — regardless of prefix. See `docs/specs/23_DONE_schema_file_route_collision_spec.md`.

### TanStack Query keys are exported constants

Never inline a string array as a query key. Each hook file exports a `XYZ_KEY` constant (already done for `TENANTS_KEY` — replicate for every resource). Prevents typo'd cache misses on `invalidateQueries`.

### Multi-table mutations belong in `lib/api/`, not screens

When an action writes to ≥ 2 tables (e.g. Add Tenant: tenants → units → documents → bills), the orchestration goes in `lib/api/<domain>.ts`. The screen calls a single hook. Keeps screens declarative and the side-effect order auditable in one place.

### Header ownership rule

Each screen has exactly **one** header. Two patterns, never mixed:

- **Pattern A — native stack header.** Parent `_layout.tsx` keeps `headerShown: true` and sets `title`. Screen does NOT use `ScreenLayout` / `ScreenHeader`.
- **Pattern B — `ScreenLayout` (default for this project).** Screen wraps content in `<ScreenLayout title="…">`. The component self-suppresses the native header via `<Stack.Screen options={{ headerShown: false }} />`. Parent layout's `headerShown` value is irrelevant but should be `false` for clarity.

**Forbidden combinations:**
- `ScreenLayout` + parent `headerShown: true` (without an override) → renders two headers.
- Inline `<Stack.Screen options={{ title }} />` inside a screen that also uses `ScreenLayout` → duplicates the title source. Pass `title` as a prop instead.
- Mixing `AppHeader` (deleted) and `ScreenLayout` in one tree.

When introducing a new screen group, default the parent `_layout.tsx` to `screenOptions={{ ...darkStackOptions, headerShown: false }}`.

### No bare `// TODO:` comments

Every TODO needs either:
- A linked issue: `// TODO(#123): ...`
- A future-version marker: `// FIXME(v2): ...` (matches existing convention in `add_tenant_wizard_spec.md`)
- A removal date: `// TODO(2026-06-01): ...`

Bare `// TODO:` rots into permanent ambiguity. Either link it, version-gate it, or do it now.

---

## Engineering Discipline

### Inline CTA rule

Primary submit/save/confirm actions render **inline** at the end of the form's
`ScrollView`, with `mt-4` above the button. The button is the last child of the
ScrollView. No `BottomCTABar`, no chromed footer.

Floating pill nav stays visible. ScrollView uses `contentContainerClassName="px-4 pt-3 pb-[88px]"`
to clear the pill.

**Two-action footer (e.g. Save + Cancel):** primary `Button` then secondary
`Pressable` text below with `mt-3`. Both inside the ScrollView.

**Two primary actions (e.g. Record Payment + Add Charge):** stack vertically with
`mt-2` between. Both inside the ScrollView.

**Destructive action (Delete):** placed in a "Danger zone" group below the primary
Save, separated by `border-t border-border` and `mt-8 pt-4`. Inside the ScrollView.

**Wizards:** `WizardShell` renders the Next/Skip controls inline at the end of each
step's content. No docked footer.

**Forbidden:**
- `BottomCTABar` — deleted from the codebase. Do not reintroduce.
- Header-right submit buttons (iOS-style "Save" in the top-right) — design uses
  inline body buttons exclusively.
- Side-by-side primaries.

### Always run `npx tsc --noEmit` before declaring a task done

Every implementation task ends with a clean type-check. Cheap (~3s), catches silent breakage from type drift across edited files. If the run flags errors, fix them — do not declare the task complete with red type errors, even if the screen "looks fine" in Expo.

### Hooks are pure orchestration

A function named `useX` should only call other hooks (`useState`, `useEffect`, `useMemo`, `useCallback`, `useQuery`, etc.) or compute memoized values. **Side effects belong in event handlers or `useEffect` bodies, not at the top level of a hook.**

Anti-pattern that has bitten this project:
```ts
// ❌ Don't — side effect runs on every call
function useThing() {
  fetchSomething()  // fires every render
  return ...
}

// ✅ Do — effect is gated
function useThing() {
  useEffect(() => { fetchSomething() }, [])
  return ...
}
```

If a hook fires "4 times when I expected 1," this rule is being violated.

### No `console.log` in committed code

`console.log` is for local debugging only. Strip before committing. `console.error` is acceptable for actual error paths (e.g. inside a `catch` block where the error is otherwise swallowed). `console.warn` only for genuine deprecation warnings.

When a future ESLint config exists, add `no-console` (with `{allow: ['error', 'warn']}`) to enforce this. Until then, the rule is manual.

### Animation duration ceiling — 300ms

No Reanimated `withTiming` or `withSpring` longer than 300ms for UI feedback (presses, segment switches, modal opens). Per `motion-meaning` UX rule and the design audit, longer animations feel sluggish on mobile and block subsequent input. Exit animations should be ~70% of enter (e.g. 150ms in / 100ms out).

Hard exceptions allowed for:
- Hero / onboarding splash transitions (one-time, ~500ms acceptable)
- Skeleton/shimmer loaders (loop indefinitely; duration is per-cycle, not user-perceived total)

---

## Accessibility

- **`accessibilityLabel` on every interactive element without text content.** Required on `Pressable`, `Touchable*`, icon-only buttons, swipe rows, and custom toggles. Without it, VoiceOver / TalkBack announces "button" with no context.
- **`accessibilityRole`** when the element's purpose isn't obvious (`role="button"`, `"link"`, `"checkbox"`, `"tab"`, etc.). The form binders in `01_form_and_wizard_components_spec.md` should set these by default.
- **Touch targets ≥ 44×44pt.** Use `hitSlop` to extend tap area when the visual is smaller (icon buttons, toggle thumbs).
- **Color contrast ≥ 4.5:1** for body text on any background — already enforced by the dark-mode token pairs. Verify when adding new color combinations.
- **Respect `useReducedMotion()`** — wrap any new Reanimated animation in a check and either disable or shorten it under reduced motion.

---

## Process

### New screens: spec first, code second

When adding a new screen, the spec lives at `docs/specs/NN_<name>_spec.md` **before** any code is written, where `NN` is the next sequence number (currently `01`, `02`; see existing files). Code follows the spec; subsequent edits update both. The numbered prefix gives reviewers and future agents a clear build order.

### Spec lifecycle
- Spec drafted → user reviews → engineer implements → spec retitled `... — Implemented` (or moved to `docs/specs/done/`) once shipped.
- If implementation diverges from spec, update the spec in the same PR. Drift between spec and code is worse than no spec.

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

### Card system — atom + molecules (spec 26)

**One atom, many molecules.** `Card` owns chrome only (bg-surface, rounded-xl, padding, press animation, accentBorder). Molecules own layout.

```
Card usage:
  <Card size="sm|md|lg" onPress={...} accentBorder={{side,color,width}} className accessibilityLabel>
    {molecule layout}
  </Card>

sizes:  sm = px-4 py-3  |  md = px-4 py-3.5 (default)  |  lg = p-4
press:  onPress present → AnimatedPressable scale 0.97; absent → plain View
accent: accentBorder adds borderLeftColor/Width or borderTopColor/Width (inline style, dynamic)
```

Row-pattern molecules (wrap `<Card>`, own internal layout):
- `components/ui/ListRow.tsx`          — generic leading/title/subtitle/trailing row
- `components/ui/InfoRow.tsx`          — chrome-less key/value row; sits INSIDE another Card, no Card wrapper
- `components/cards/SettingsCard.tsx`  — label + value/right + optional chevron
- `components/documents/DocumentRow.tsx` — icon + title + category + date + chevron
- `components/home/AttentionRow.tsx`   — tenant name + status chip + amount
- `components/home/VacantRow.tsx`      — unit + days vacant + lost revenue
- `components/home/ReportCard.tsx`     — icon + label + value + sub (compact KPI shortcut)
- `components/maintenance/MaintenanceRow.tsx` — dot + title + meta + status chip
- `components/notifications/NotificationRow.tsx` — icon + title + subtitle + timestamp
- `components/reports/UnitIncomeRow.tsx` — left accent border + unit + tenant + amount
- `components/form/FormToggleRow.tsx`  — label + Toggle (RHF-bound), bg-elevated
- `components/tenants/TenantCard.tsx`  — avatar + name + email + badges

Specialized molecules (wrap `<Card>`, keep rich internal layout):
- `components/billing/BalanceCard.tsx`           — variant bg (danger/success/neutral) + amount + CTA
- `components/billing/BillCard.tsx`              — bill row with tenant + amount + status
- `components/billing/SwipeablePaymentRow.tsx`   — Swipeable outside, Card inside
- `components/billing/SettlementRow.tsx`         — move-out breakdown row, bg-elevated for non-total
- `components/properties/PropertyCard.tsx`       — property name + address + unit count
- `components/properties/PropertySummaryCard.tsx` — occupancy % + collection bar + chips
- `components/properties/PropertyOverviewCard.tsx` — name + address + chips + progress bar + income
- `components/properties/UnitCard.tsx`           — unit number + rate + status badge
- `components/properties/UnitGridCard.tsx`       — left accent border + name + tenant + chip
- `components/properties/BedSlotCard.tsx`        — status-tinted bg + bed label + tenant
- `components/reports/ReportMenuCard.tsx`        — icon tile in 2-col grid

```
components/
  ui/
    Card.tsx              ATOM — chrome only: bg-surface rounded-xl, padding sizes, press animation, accentBorder
    AppText.tsx           Typography scale (body/subheading/caption/mono/label)
    Chip.tsx              Static badge — variant: success|warning|danger|info|neutral|advance, size: xs|sm|md. Non-interactive.
    ChipBar.tsx           Interactive horizontal scroll of single-select pills.
    Avatar.tsx            Initials, always neutral Surface 3 bg — never colored
    IconButton.tsx        28×28px header icon buttons
    BackButton.tsx        28×28px chevron-only, Surface 2 bg
    FAB.tsx               Floating action button, accent bg, bottom 82 right 16
    Toggle.tsx            iOS-style switch
    InfoRow.tsx           Chrome-less key/value row — NO Card wrapper, sits inside parent Card
    ListRow.tsx           Generic row molecule wrapping Card
  form/
    FormField.tsx         Label + input, react-hook-form Controller
    FormSelect.tsx        Label + picker, react-hook-form Controller
    FormToggleRow.tsx     Label + Toggle, RHF-bound, wraps Card (bg-elevated)
    SegmentedControl.tsx  Segmented tab control
  layout/
    ScreenView.tsx        Root wrapper, safe area
    ScreenHeader.tsx      3-col grid: left / center title / right
    SectionLabel.tsx      Section header + optional action link
    FloatingTabBar.tsx    Floating pill nav (4 tabs)
  cards/
    SettingsCard.tsx      Settings row molecule — label + value + chevron, wraps Card
  billing/
    BalanceCard.tsx       Hero balance molecule — variant bg, wraps Card
    BillCard.tsx          Bill row molecule, wraps Card
    SwipeablePaymentRow.tsx  Swipeable gesture + Card inside
    SettlementRow.tsx     Settlement breakdown row, wraps Card
  home/
    AttentionRow.tsx      Dashboard attention row, wraps Card
    VacantRow.tsx         Dashboard vacant row, wraps Card
    ReportCard.tsx        Compact report KPI tile, wraps Card
  maintenance/
    MaintenanceRow.tsx    Maintenance issue row, wraps Card
  notifications/
    NotificationRow.tsx   Notification row, wraps Card
  properties/
    PropertyCard.tsx      Property list card, wraps Card
    PropertySummaryCard.tsx  Multi-section summary, wraps Card
    PropertyOverviewCard.tsx  Overview with progress bar, wraps Card
    UnitCard.tsx          Unit list row, wraps Card
    UnitGridCard.tsx      Grid cell with left accent border, wraps Card
    BedSlotCard.tsx       Bed slot with status bg, wraps Card
  reports/
    UnitIncomeRow.tsx     Per-unit income row with left accent border, wraps Card
    ReportMenuCard.tsx    Report menu icon tile, wraps Card
  tenants/
    TenantCard.tsx        Tenant list row molecule, wraps Card
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

### Schema migrations — `ALTER TABLE` with try/catch on duplicate-column

expo-sqlite has no `ADD COLUMN IF NOT EXISTS` syntax. The project's standard migration pattern (also documented in `docs/superpowers/specs/2026-05-04-phase2-design.md` §6) is:

```ts
try {
  await db.run(sql`ALTER TABLE tenants ADD COLUMN nickname TEXT`)
} catch (e: any) {
  if (!String(e?.message ?? '').includes('duplicate column')) throw e
  // column already exists — safe to ignore
}
```

Use this every time. Don't write idempotent migration helpers from scratch; reuse the pattern.

### Schema changes require a migration entry

Never modify `db/schema.ts` without adding the corresponding `ALTER TABLE` block to the project's migration runner (currently inline in `db/index.ts`'s init). When dedicated migration tooling is added (drizzle-kit / a `db/migrations/` directory), every schema delta gets its own numbered migration file. Until then, the inline ALTER TABLE pattern above is the substitute — but the rule remains: **schema delta and migration code ship in the same commit**, never separately.

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