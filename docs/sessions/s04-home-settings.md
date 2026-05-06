# Session 04 — Home, Settings, Notifications, Quick Search, Onboarding

**Prerequisites:** Sessions 01, 02, 03 (all tokens + components).

**Screens in this session:**
- `app/(admin)/index.tsx` — Home Dashboard (partial fix)
- `app/(admin)/settings/index.tsx` — Settings (partial fix)
- `app/(admin)/notifications.tsx` — Notifications (new)
- `components/admin/TenantQuickSearchModal.tsx` — Quick Search (partial fix)
- `app/onboarding.tsx` — Onboarding Wizard (new)

---

## Locked Design Decisions

- Follow `references/dark/` images. Dark mode only. Blue `#3B82F6` primary.
- `Pressable` + Reanimated. Ionicons. `colors.*` tokens only.
- All screens: `backgroundColor: colors.background` (`#0D0D0D`).

---

## Screen: Home Dashboard

**File:** `app/(admin)/index.tsx`  
**Reference:** `dark_01_home_dashboard.png`  
**Status:** 🟡 Partial — fix the following sections.

### Section: KPI Grid (2×2)

Replace existing cards with `KPICard` component. 2-column `FlatList` or `View` grid, `gap: 12`, `paddingHorizontal: 16`.

```ts
const kpiCards = [
  { label: 'Monthly income', value: '₱18,500', subtitle: 'of ₱24,000 – 77%', accentColor: colors.success },
  { label: 'Occupancy',      value: '88%',      subtitle: '22 / 25 units',     accentColor: colors.primary },
  { label: 'Outstanding',    value: '₱6,200',   subtitle: '4 tenants',         accentColor: colors.danger  },
  { label: 'Vacancies',      value: '3 units',  subtitle: '~₱4,500/mo lost',   accentColor: colors.warning },
]
```

Data driven by: `useHomeStats()` hook — queries SQLite for current-month aggregates.

### Section: Quick Actions Row

4 equal-width buttons in a row. Each: icon (24dp) + label (fontSize 11). `backgroundColor: colors.elevated`, `borderRadius: 12`, `paddingVertical: 14`.

| Button | Icon | Action |
|--------|------|--------|
| Record Payment | `cash-outline` | `router.push('/(admin)/billing/new')` |
| Add Tenant | `person-add-outline` | `router.push('/(admin)/tenants/new')` |
| Add Unit | `home-outline` | `router.push('/(admin)/properties')` |
| Log Issue | `construct-outline` | `router.push('/(admin)/maintenance/new')` |

### Section: Collection Progress

Label: "May 2026 collection" (current month). Amount + percentage. `CollectionProgressBar`. Paid/Partial/Unpaid counts.

Data: `useCollectionSummary(currentMonth)`.

### Section: Attention

`SectionHeader` with count + "View all" link. `ListRow` per tenant requiring attention. Each row: `AvatarInitials`, tenant name, unit, `StatusChip` (OVERDUE or EXPIRING), `AmountText`. Swipe-right action (see MASTER.md §7.5): `backgroundColor: colors.warning`, "Record Payment" label.

Data: tenants where `status = 'OVERDUE'` or `lease_end` within 30 days, ordered by severity.

### Section: Vacant

`SectionHeader` with count + "View all". List of vacant unit rows: unit name, property, days vacant, revenue lost. "View all" → `router.push('/(admin)/properties')` (filtered to vacant).

### Header

Title: "Home". Right actions: bell icon (notifications badge) + settings gear.
- Bell → `router.push('/(admin)/notifications')`
- Gear → `router.push('/(admin)/settings')`

---

## Screen: Settings

**File:** `app/(admin)/settings/index.tsx`  
**Reference:** `dark_03_settings.png`  
**Status:** 🟡 Partial — full rebuild to match reference.

### Profile Card (top)

`backgroundColor: colors.surface`, `borderRadius: 12`, `marginHorizontal: 16`, `padding: 16`. `AvatarInitials` (size lg, 48dp). Name: fontSize 16, weight 700. Subtitle: phone + " · Owner", `colors.textSecondary`.

Data: `useOwnerProfile()` — from `owner` table.

### Section Groups (use `SettingsRow`)

**Billing defaults**
- Billing day → value "1st of month" → `router.push('/(admin)/settings/general')`
- Late fee → value "₱200 · 5 days" → `router.push('/(admin)/settings/rates')`

**Notifications**
- Rent reminders → toggle
- Contract expiry → toggle
- Vacancy alerts → toggle
- Quiet hours → value "10pm–7am" → navigate to quiet hours screen

**Security**
- App lock → value "Biometric" → `router.push('/(admin)/settings/security')`

**Data**
- Last backup → value colored green if recent (today/yesterday), amber if >7 days, red if >14 days
- Back up now → navigate action

**About**
- Version row (info type, no chevron)

---

## Screen: Notifications

**File:** `app/(admin)/notifications.tsx` *(new file)*  
**Reference:** `dark_02_notifications.png`

```
ScreenHeader: title "Notifications", right="Clear all" (text button, colors.textLink)
FilterChipBar: options ['All (6)', 'Unpaid', 'Expiring', 'Vacancy']
ScrollView of NotificationRow items
EmptyState if no notifications
```

### Notification types + icons

| type | icon | iconBg |
|------|------|--------|
| overdue | `alert-circle` | `colors.dangerBg` |
| expiring | `time-outline` | `colors.warningBg` |
| vacant | `home-outline` | `colors.neutralBg` |
| high-balance | `person-outline` | `colors.dangerBg` |
| resolved | `checkmark-circle` | `colors.successBg` |

### Data

`useNotifications()` — reads `notifications` table. `onClearAll`: marks all `read_at = now()` (or deletes, per schema).

---

## Component: TenantQuickSearchModal

**File:** `components/admin/TenantQuickSearchModal.tsx`  
**Reference:** `dark_04_quick_search.png`  
**Status:** 🟡 Partial — align layout with reference.

Reference shows a simplified modal — no inline "Record Payment" button per result (differs from MASTER.md §7.8 spec). Follow the **reference image**.

Layout:
```
Full screen modal, backgroundColor: overlay rgba(0,0,0,0.6)
Sheet container: backgroundColor: colors.elevated, borderRadius: lg at top
Header: "Quick Search" title, Cancel text button (colors.textLink)
Search TextInput: autofocused, backgroundColor: colors.surface, colors.border border
"RESULTS FOR 'X'" section label
Result cards: AvatarInitials + name + unit·building + balance amount (color coded)
"TAP A RESULT TO OPEN" hint text at bottom
```

Each result card: `backgroundColor: colors.surface`, `borderRadius: 12`, `padding: 16`. Tapping opens `router.push('/(admin)/tenants/[id]')` and closes modal.

Balance display: use `AmountText` variant (`owed` if balance > 0, `zero` if 0, text "Paid" if fully settled).

---

## Screen: Onboarding Wizard

**File:** `app/onboarding.tsx` *(new file — outside `(admin)` group)*  
**Reference:** `dark_17_onboarding.png`

Shown on first launch when no properties exist in DB. On completion → `router.replace('/(admin)')`.

4-step wizard:

**Step 1 — Property** (shown in reference)
- Icon: house in `colors.primary` bg rounded square
- Title: "Set up your first property"
- Subtitle: "Add your building name, address, and number of floors."
- Fields: Property name*, Address, Province, Floors (number), Total units (number)
- CTA: "Continue"
- Caption: "Step 1 of 4"

**Step 2 — Owner profile**
- Fields: Your name*, Phone*
- CTA: "Continue"

**Step 3 — Billing defaults**
- Fields: Billing day (1st/15th/custom), Late fee amount, Grace period (days)
- CTA: "Continue"

**Step 4 — Done**
- Confirmation illustration (simple Ionicons `checkmark-circle` large icon, success color)
- "All set! Let's add your first unit." CTA → `router.replace('/(admin)/properties')`

Structure:
```ts
// ProgressStepIndicator at top (4 steps)
// Step content in the middle
// BottomCTABar with Continue button
```

State: local `useState` for step + form values. On step 4 confirm: bulk-insert property + owner into SQLite, then redirect.

---

## Done Criteria

- [ ] Home: 4 KPICards with colored top borders visible
- [ ] Home: CollectionProgressBar shows in "collection" section
- [ ] Home: Attention rows swipeable with yellow Record Payment action
- [ ] Home: Quick action 4-button row navigates correctly
- [ ] Settings: Profile card at top with initials avatar
- [ ] Settings: Toggles work (notification prefs persisted)
- [ ] Settings: Last backup date color-coded correctly
- [ ] Notifications: FilterChipBar filters list correctly
- [ ] Notifications: "Clear all" marks all read
- [ ] Quick Search: Modal matches dark_04 (no inline Record Payment button; tapping result opens tenant detail)
- [ ] Onboarding: Shown on first launch, 4-step flow, redirects on complete
