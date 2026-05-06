# Session 02 — P0 Shared Components

**Prerequisites:** Session 01 (tokens in `tailwind.config.js` + `constants/theme.ts` must exist).

**Output:** 11 components in `components/ui/`. All exported from `components/ui/index.ts`.

---

## Locked Design Decisions

- Dark mode only. Use token names from `tailwind.config.js` / `constants/theme.ts`.
- Never hardcode hex values in component files — use token constants.
- Use `Pressable` + Reanimated scale(0.97) for all interactive elements. Never `TouchableOpacity`.
- `fontVariant: ['tabular-nums']` on all amount/number text.
- Touch targets ≥ 44×44dp.
- Icons: Ionicons only. No emoji.
- Reference images are in `references/dark/` — check them when unsure about visual detail.

---

## Component 2.1 — `StatusChip`

**File:** `components/ui/StatusChip.tsx`  
**Replaces:** existing `Badge` component (keep Badge exports working via re-export if needed)

```ts
type ChipVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'advance'

interface StatusChipProps {
  variant: ChipVariant
  label: string
  size?: 'sm' | 'md'  // default 'sm'
}
```

Visual spec (from MASTER.md §7.1 + dark token values):
```
paddingHorizontal: 8
paddingVertical: 4
borderRadius: 6  (radius.sm)
fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase'
```

| Variant | bg | text |
|---------|----|------|
| success | `colors.successBg` `#052E16` | `colors.successText` `#6EE7B7` |
| warning | `colors.warningBg` `#1C1005` | `colors.warningText` `#FCD34D` |
| danger  | `colors.dangerBg` `#200C0C`  | `colors.dangerText` `#FCA5A5` |
| info    | `colors.infoBg` `#0C1A3D`    | `colors.infoText` `#93C5FD`   |
| neutral | `colors.neutralBg` `#1E2533` | `colors.neutralText` `#94A3B8`|
| advance | `colors.infoBg` `#0C1A3D`    | `colors.infoText` `#93C5FD`   |

Status mappings for reference (use in consuming screens, not in the component itself):
- PAID → success · PARTIAL → warning · UNPAID → neutral · OVERDUE → danger
- CREDIT → info · ADVANCE → advance · OCCUPIED → success · VACANT → neutral
- NOTICE → warning · EXPIRING → warning · IN PROGRESS → warning · RESOLVED → success
- REPORTED → neutral · BLACKLISTED → danger

Reference: dark_05 (tenant list chips), dark_09 (billing chips), dark_23 (maintenance chips).

---

## Component 2.2 — `AvatarInitials`

**File:** `components/ui/AvatarInitials.tsx`

```ts
interface AvatarInitialsProps {
  name: string       // derives 1–2 initials (first + last name initial)
  size?: 'sm' | 'md' | 'lg'  // sm=32, md=40, lg=48
}
```

Visual spec:
- Circle shape (borderRadius: pill)
- bg color: deterministic from name — hash name string → pick from a fixed palette of 8 muted dark colors (e.g. `#1E3A5F`, `#1A3A2A`, `#3A1A1A`, `#2A1A3A`, `#1A2A3A`, `#3A2A1A`, `#1A3A3A`, `#2D2D1A`)
- text: `#F1F5F9`, weight semibold

Reference: dark_05, dark_06, dark_15, dark_27 — all show initials avatars.

---

## Component 2.3 — `AmountText`

**File:** `components/ui/AmountText.tsx`

```ts
type AmountVariant = 'owed' | 'credit' | 'paid' | 'zero' | 'muted' | 'default'
type AmountSize = 'large' | 'medium' | 'small'

interface AmountTextProps {
  amount: number
  variant?: AmountVariant   // default 'default'
  size?: AmountSize         // default 'small'
  showSign?: boolean        // prepend ₱ (default true)
}
```

Color mapping:
- `owed` → `colors.balanceOwed` `#EF4444`
- `credit` → `colors.balanceCredit` `#3B82F6`
- `paid` / `zero` → `colors.balanceZero` `#10B981`
- `muted` → `colors.textMuted` `#64748B`
- `default` → `colors.textPrimary` `#F1F5F9`

Font sizes: large=28/700, medium=20/600, small=15/600 (from MASTER.md §3).

Always: `fontVariant: ['tabular-nums']`. Always format as `₱X,XXX.XX` using `toLocaleString('en-PH', { minimumFractionDigits: 2 })`.

Reference: dark_06, dark_09, dark_15, dark_27.

---

## Component 2.4 — `ScreenHeader`

**File:** `components/ui/ScreenHeader.tsx`

```ts
interface ScreenHeaderProps {
  title: string
  left?: 'back' | 'close' | ReactNode   // 'back' = arrow-back icon, 'close' = close icon
  right?: ReactNode
  onLeftPress?: () => void   // defaults to router.back()
}
```

Visual spec:
```
height: 56 (+ safeAreaTop applied via useSafeAreaInsets)
backgroundColor: colors.surface  (#171717)
borderBottomWidth: 1, borderBottomColor: colors.border (#2A2A2A)
title: fontSize 18, fontWeight '700', color colors.textPrimary, centered
left/right icon: 24×24, color colors.textSecondary (#94A3B8), tap target 44×44
```

Reference: every push screen (dark_06, dark_07, dark_08, dark_10, etc.).

---

## Component 2.5 — `BottomCTABar`

**File:** `components/ui/BottomCTABar.tsx`

```ts
interface BottomCTABarProps {
  children: ReactNode
}
```

Wraps `children` above the safe area bottom inset. Adds `paddingHorizontal: 16`, `paddingTop: 12`, `paddingBottom: insets.bottom + 12`. Background `colors.surface`. Border top 1dp `colors.border`.

Used on every screen with a primary CTA button.

Reference: dark_07, dark_10, dark_12, dark_17, dark_21, dark_24.

---

## Component 2.6 — `FilterChipBar`

**File:** `components/ui/FilterChipBar.tsx`

```ts
interface FilterOption {
  label: string   // e.g. "All (22)" or "Active"
  value: string
}

interface FilterChipBarProps {
  options: FilterOption[]
  selected: string
  onChange: (value: string) => void
}
```

Visual spec:
- Horizontal `ScrollView` (horizontal, no scrollbar)
- `paddingHorizontal: 16`, `gap: 8`
- Selected chip: `backgroundColor: colors.primary` `#3B82F6`, text `#FFFFFF`
- Unselected chip: `backgroundColor: colors.surface` `#171717`, text `colors.textSecondary`, border `colors.border`
- Chip: `paddingHorizontal: 14`, `paddingVertical: 8`, `borderRadius: pill`

Reference: dark_05, dark_09, dark_23, dark_27.

---

## Component 2.7 — `SectionHeader`

**File:** `components/ui/SectionHeader.tsx`

```ts
interface SectionHeaderProps {
  title: string
  count?: number          // shown in parentheses: "Attention (4)"
  onViewAll?: () => void  // shows "View all" teal link on right
}
```

Visual spec:
- `paddingHorizontal: 16`, `paddingVertical: 12`
- title: fontSize 13, fontWeight '600', color `colors.textSecondary`, `textTransform: 'uppercase'`  (matches reference label style)
- "View all": fontSize 13, color `colors.textLink` `#3B82F6`

Reference: dark_01 (Attention section, Vacant section).

---

## Component 2.8 — `ListRow`

**File:** `components/ui/ListRow.tsx`

```ts
interface ListRowProps {
  leading?: ReactNode          // AvatarInitials, icon, etc.
  title: string
  subtitle?: string
  trailingChip?: ReactNode     // StatusChip
  trailingAmount?: ReactNode   // AmountText
  trailingText?: string        // plain trailing text
  onPress?: () => void
  showDivider?: boolean        // default true
}
```

Visual spec:
```
minHeight: 72
paddingHorizontal: 16, paddingVertical: 12
backgroundColor: colors.surface (#171717)
borderBottomWidth: 1, borderBottomColor: colors.muted (#242424)
```

- title: fontSize 15, fontWeight '600', color `colors.textPrimary`
- subtitle: fontSize 13, color `colors.textSecondary`
- trailing: right-aligned column (chip on top, amount below)

Reanimated press: scale(0.98), 150ms.

Reference: dark_05, dark_09, dark_14, dark_15, dark_27.

---

## Component 2.9 — `BalanceCard`

**File:** `components/ui/BalanceCard.tsx`

```ts
type BalanceVariant = 'danger' | 'success' | 'neutral'

interface BalanceCardProps {
  amount: number
  variant: BalanceVariant
  breakdown?: string      // e.g. "₱3,500 rent + ₱200 late fee + ₱1,100 prev"
  onRecordPayment?: () => void   // shows blue button inside card when provided
  label?: string          // "CURRENT BALANCE" (default)
}
```

Visual spec:
- `borderRadius: 12`, `padding: 16`, `marginHorizontal: 16`
- danger variant bg: `colors.dangerBg` `#200C0C`, border `1dp colors.danger` `#EF4444`
- success variant bg: `colors.successBg` `#052E16`, border `1dp colors.success` `#10B981`
- neutral variant bg: `colors.elevated` `#1F1F1F`, border `1dp colors.border`
- label: fontSize 11, fontWeight '600', letterSpacing 0.5, uppercase, `colors.textMuted`
- amount: fontSize 28, fontWeight '700', color matches variant (danger→`#EF4444`, success→`#10B981`, neutral→`#F1F5F9`)
- breakdown: fontSize 13, `colors.textMuted`, below amount
- Record Payment button: full-width, `backgroundColor: colors.primary`, borderRadius pill, height 44, inside card

Reference: dark_06, dark_20, dark_30 (payment header uses success variant).

---

## Component 2.10 — `KPICard`

**File:** `components/ui/KPICard.tsx`

```ts
interface KPICardProps {
  label: string         // "Monthly income"
  value: string         // "₱18,500"
  subtitle?: string     // "of ₱24,000 – 77%" or "22 / 25 units"
  accentColor: string   // top border color
  accentBg?: string     // subtle bg tint (optional)
}
```

Visual spec:
- `backgroundColor: colors.surface` `#171717`
- `borderRadius: 12`, `padding: 16`
- **Top border strip:** `borderTopWidth: 3`, `borderTopColor: accentColor`
- label: fontSize 12, color `colors.textSecondary`
- value: fontSize 20, fontWeight '700', color `colors.textPrimary`
- subtitle: fontSize 12, color `colors.textMuted`

Reference: dark_01 — 4 cards in 2×2 grid. Colors extracted:
- Monthly income: top border `#10B981` (success)
- Occupancy: top border `#3B82F6` (info/primary)
- Outstanding: top border `#EF4444` (danger)
- Vacancies: top border `#F59E0B` (warning)

---

## Component 2.11 — `CollectionProgressBar`

**File:** `components/ui/CollectionProgressBar.tsx`

```ts
interface CollectionProgressBarProps {
  paid: number
  partial: number
  unpaid: number
  total: number
  showCounts?: boolean   // default true — shows "Paid: 14  Partial: 3  Unpaid: 5"
}
```

Visual spec:
- Full-width segmented bar, height 6, borderRadius pill
- Segments: paid=`#10B981`, partial=`#F59E0B`, unpaid=`#EF4444` (proportional widths)
- Counts row below: dot + label for each, dot color matches segment color
- Count text: fontSize 12, `colors.textSecondary`

Reference: dark_01 ("May 2026 collection" section), dark_14 (monthly collection report summary card).

---

## Export All

Add all new components to `components/ui/index.ts`:

```ts
export { StatusChip } from './StatusChip'
export type { ChipVariant } from './StatusChip'
export { AvatarInitials } from './AvatarInitials'
export { AmountText } from './AmountText'
export { ScreenHeader } from './ScreenHeader'
export { BottomCTABar } from './BottomCTABar'
export { FilterChipBar } from './FilterChipBar'
export { SectionHeader } from './SectionHeader'
export { ListRow } from './ListRow'
export { BalanceCard } from './BalanceCard'
export { KPICard } from './KPICard'
export { CollectionProgressBar } from './CollectionProgressBar'
// keep existing exports below
```

---

## Done Criteria

- [ ] All 11 components exist in `components/ui/`
- [ ] All exported from `components/ui/index.ts`
- [ ] No hardcoded hex values — all use `colors.*` from `constants/theme.ts`
- [ ] `StatusChip` renders all 6 variants with correct dark bg/text colors
- [ ] `BalanceCard` danger variant matches dark_06 reference (very dark red bg, red border, red amount)
- [ ] `KPICard` shows colored top border
- [ ] `CollectionProgressBar` segments proportional to paid/partial/unpaid
- [ ] TypeScript compiles clean
