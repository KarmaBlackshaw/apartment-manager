# Card Primitive Consolidation — One Card for Everything

## TL;DR

**Atomic-design framing:** `<Card>` is the **atom** — purely a chrome wrapper. It owns: surface color, border radius, padding, press feedback, optional accent border. It does **not** own any layout logic — no leading/title/subtitle/trailing slots. **All content composition lives in the molecules.**

```tsx
// Card atom — chrome only
<Card onPress={...}>{anything}</Card>

// Molecule — owns its own layout
function SettingsCard({ label, value, chevron, onPress }) {
  return (
    <Card onPress={onPress}>
      <View className="flex-row items-center justify-between">
        <AppText>{label}</AppText>
        <View className="flex-row gap-1.5">
          <AppText color="secondary">{value}</AppText>
          {chevron && <Ionicons name="chevron-forward" />}
        </View>
      </View>
    </Card>
  )
}
```

24 card/row components exist today. They all share the same chrome but compose it themselves. After this spec: one ~30 LOC atom + ~16 molecules each owning its own layout. No slot API, no swiss-army-knife atom. Single source of truth for chrome.

**Two API modes on the same component:**
- **Row mode (default):** `<Card leading={…} title="…" subtitle="…" trailing={…} chevron onPress={…} />` — covers ~12 row-pattern components (Settings rows, list rows, document rows, attention rows, etc.).
- **Custom mode:** `<Card>{customContent}</Card>` — covers hero/specialized cards (Balance, Property summary, Unit grid cell, etc.) that keep their internal layout but reuse the chrome.

Result: 24 components collapse to **1 primitive + ~10 thin domain wrappers** (or zero wrappers — most call sites can use `<Card>` directly).

## Agent prompt

```
Implement docs/specs/26_card_primitive_consolidation_spec.md exactly.

Read first:
1. docs/specs/26_card_primitive_consolidation_spec.md (source of truth)
2. CLAUDE.md "Component Map", "Component Extraction" two-uses rule

**Parallelism authorized.** When a step has independent units of work
(per-component migrations, per-screen rebases, batch find-replaces),
dispatch sub-agents (`executor` for medium-complexity, `executor-haiku`
for mechanical) in parallel rather than running Edit calls sequentially.

In this spec specifically:
  - Phase B: each row-pattern component's migration (12 components,
    deletions + call-site replacements) is independent → parallelize.
  - Phase C: each specialized card's chrome rebase (11 components) is
    independent → parallelize.
  - Phase A is sequential (the primitive must exist before phases B/C
    consume it).

Group dependent work into a single sub-agent or run sequentially:
  - Phase A → must finish before B/C start.
  - Within B/C: independent across components/screens, parallel-safe.

Phases:
  Phase A — Build the Card primitive (section 3):
    Replace components/ui/Card.tsx (current 11-line shell) with a
    full primitive supporting both row mode and custom mode.

  Phase B — Migrate row-pattern components (section 4):
    12 components consolidate into call-site `<Card …slots />` usage.
    Delete each replaced file or convert to a thin re-export.
    Files: SettingsCard, ListRow, DocumentRow, AttentionRow, VacantRow,
    MaintenanceRow, NotificationRow, UnitIncomeRow, InfoRow,
    FormToggleRow, ReportCard, TenantCard.

  Phase C — Rebase specialized cards (section 5):
    11 cards keep their domain-specific composition but wrap
    <Card> for shared chrome. Replace inline `bg-surface rounded-xl
    p-4` etc. with the Card wrapper.
    Files: BalanceCard, PropertyCard, PropertySummaryCard,
    PropertyOverviewCard, UnitCard, UnitGridCard, BedSlotCard,
    BillCard, SwipeablePaymentRow, SettlementRow, ReportMenuCard.

After each phase: `npx tsc --noEmit` clean. Smoke-test affected
screens — visuals must be unchanged.

Constraints:
- Do NOT commit.
- No raw hex; NativeWind / colors.* only.
- No <Text> from react-native; use <AppText>.
- No <TouchableOpacity>; use <Pressable> with Reanimated.
- No inline style={{...}} except Reanimated useAnimatedStyle.
- The primitive lives at components/ui/Card.tsx (overwrite the
  existing 11-line shell).

Verify section 8 acceptance (15 items). ~120 min.

After verification passes, mark this spec done:
  git mv docs/specs/26_card_primitive_consolidation_spec.md docs/specs/26_DONE_card_primitive_consolidation_spec.md
```

---

## 1. Audit — current state (24 components)

| Category | Component | Path | LOC | Notes |
|---|---|---|---|---|
| **Generic primitive (replace)** | `Card` | `components/ui/Card.tsx` | 11 | Thin existing shell — overwrite with the new primitive |
| **Generic row primitive (replace)** | `ListRow` | `components/ui/ListRow.tsx` | 99 | The closest thing to a primitive today; folded into the new `<Card>` |
| **Row-pattern (12 — consolidate)** | `SettingsCard` | `components/cards/SettingsCard.tsx` | 93 | Built per spec 22; becomes a thin alias |
| | `DocumentRow` | `components/documents/DocumentRow.tsx` | — | leading icon + title + category + date + chevron |
| | `AttentionRow` | `components/home/AttentionRow.tsx` | — | dashboard attention list |
| | `VacantRow` | `components/home/VacantRow.tsx` | — | dashboard vacant list |
| | `MaintenanceRow` | `components/maintenance/MaintenanceRow.tsx` | — | dot + title + meta + chip |
| | `NotificationRow` | `components/notifications/NotificationRow.tsx` | — | icon + title + subtitle + timestamp |
| | `UnitIncomeRow` | `components/reports/UnitIncomeRow.tsx` | — | per-unit income report row |
| | `InfoRow` | `components/ui/InfoRow.tsx` | — | label + value (settings/info table) |
| | `FormToggleRow` | `components/form/FormToggleRow.tsx` | — | label + Toggle (RHF-bound) |
| | `ReportCard` | `components/home/ReportCard.tsx` | 61 | icon + label + value + sub |
| | `TenantCard` | `components/tenants/TenantCard.tsx` | — | tenant list card |
| **Specialized (11 — keep, rebase chrome)** | `BalanceCard` | `components/billing/BalanceCard.tsx` | — | hero amount + breakdown + CTA |
| | `BillCard` | `components/billing/BillCard.tsx` | — | bill row with breakdown |
| | `SwipeablePaymentRow` | `components/billing/SwipeablePaymentRow.tsx` | — | swipe-action gestures |
| | `SettlementRow` | `components/billing/SettlementRow.tsx` | — | move-out settlement breakdown |
| | `PropertyCard` | `components/properties/PropertyCard.tsx` | — | chips + progress bar + meta |
| | `PropertySummaryCard` | `components/properties/PropertySummaryCard.tsx` | — | multi-section header |
| | `PropertyOverviewCard` | `components/properties/PropertyOverviewCard.tsx` | — | similar |
| | `UnitCard` | `components/properties/UnitCard.tsx` | — | unit list variant |
| | `UnitGridCard` | `components/properties/UnitGridCard.tsx` | — | colored left border + chip |
| | `BedSlotCard` | `components/properties/BedSlotCard.tsx` | — | colored grid cell |
| | `ReportMenuCard` | `components/reports/ReportMenuCard.tsx` | — | reports menu icon tile |

Counts:
- 1 primitive (replace): `Card`
- 1 row primitive (fold): `ListRow`
- 12 row-pattern (consolidate via call-site usage)
- 11 specialized (rebase on `<Card>` chrome)

---

## 2. The argument for one card

Every card on the dashboard, settings, lists, and detail screens shares:

- **Same surface color** (`bg-surface`)
- **Same border radius** (`rounded-xl` = 12dp)
- **Same padding** (`px-4 py-3.5` for rows, `p-4` for content cards — both interchangeable)
- **Same press-on-tap animation** (Reanimated scale 0.97)
- **Same elevation system** (no border, no shadow — surface elevation only)

The "differences" people instinctively reach for new components for:
- Different content layouts (icon + label vs. amount + CTA vs. avatar + name)
- Different content sizes (compact row vs. hero block)
- Different domain-specific elements (chips, progress bars, swipe actions)

**Those are content concerns, not chrome concerns.** A primitive that owns chrome and accepts arbitrary content covers all of them. That's what `<Card>` becomes.

---

## 3. Phase A — `<Card>` primitive

### 3.1 File

`components/ui/Card.tsx` (overwrites the existing 11-line shell). Atom is **chrome-only** — no layout logic, no text rendering, no slots.

```tsx
import React, { type ReactNode } from 'react'
import { View, Pressable } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'

import { cn } from '~/lib/utils'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type CardSize = 'sm' | 'md' | 'lg'

interface CardProps {
  /** Card content. Molecule provides its own layout. */
  children: ReactNode
  /** Padding scale. sm = px-4 py-3 · md = px-4 py-3.5 (default) · lg = p-4 */
  size?: CardSize
  /** Optional colored accent border (UnitGridCard, KPICard patterns). */
  accentBorder?: { side: 'left' | 'top'; color: string; width?: number }
  /** When set, the card is a Pressable with scale-on-press feedback. */
  onPress?: () => void
  /** Optional className override (e.g. for grid-cell `flex-1`). */
  className?: string
  accessibilityLabel?: string
}

const SIZE_CLASSES: Record<CardSize, string> = {
  sm: 'px-4 py-3',
  md: 'px-4 py-3.5',
  lg: 'p-4',
}

export function Card({
  children,
  size = 'md',
  accentBorder,
  onPress,
  className,
  accessibilityLabel,
}: CardProps) {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const accentStyle = accentBorder
    ? accentBorder.side === 'left'
      ? { borderLeftColor: accentBorder.color, borderLeftWidth: accentBorder.width ?? 3 }
      : { borderTopColor: accentBorder.color, borderTopWidth: accentBorder.width ?? 2 }
    : undefined

  const Container = onPress ? AnimatedPressable : View
  const containerProps = onPress
    ? {
        onPress,
        onPressIn: () => { scale.value = withTiming(0.97, { duration: 100 }) },
        onPressOut: () => { scale.value = withTiming(1, { duration: 150 }) },
        style: [animatedStyle, accentStyle],
        accessibilityRole: 'button' as const,
        accessibilityLabel,
      }
    : { style: accentStyle }

  return (
    <Container
      {...containerProps}
      className={cn(
        'bg-surface rounded-xl',
        SIZE_CLASSES[size],
        className,
      )}
    >
      {children}
    </Container>
  )
}
```

**LOC: ~50.** A pure wrapper. No `View flex-row items-center justify-between` baked in — that's the molecule's responsibility (most molecules will use exactly that, but the choice is theirs).

### 3.2 SOLID compliance — why chrome-only

| Principle | How the atom honors it |
|---|---|
| **S — Single Responsibility** | Card owns chrome (bg, radius, padding, press feedback, accent border). It does NOT own layout, text, icons, or any domain knowledge. |
| **O — Open/Closed** | Adding a new card type (e.g. PaymentCard, NotificationCard) needs zero changes to `Card`. The molecule provides its own layout via `children`. |
| **L — Liskov Substitution** | Any UI surface needing the project's card chrome can use `Card` interchangeably. No subtype quirks. |
| **I — Interface Segregation** | 5 props total (`children`, `size`, `accentBorder`, `onPress`, `className`, `accessibilityLabel`). No fat interface with 12 slot props the molecule doesn't need. |
| **D — Dependency Inversion** | Molecules depend on the chrome abstraction (`<Card>`). They don't know how chrome is implemented internally. Swap `Card.tsx` impl (e.g. add gradient, different shadow), and every molecule benefits with no edits. |

**Why no slot props (leading/title/subtitle/trailing/value/chevron):** That would put presentation logic in the atom. A SettingsCard's chevron + value layout is different from a TenantCard's avatar + name + chip layout — making them molecule concerns keeps each molecule explicit and the atom narrow.

### 3.3 API examples — molecules compose chrome

```tsx
// Molecule — settings row pattern (lives in components/cards/SettingsCard.tsx)
function SettingsCard({ label, value, chevron, onPress }) {
  return (
    <Card onPress={onPress} accessibilityLabel={label}>
      <View className="flex-row items-center justify-between">
        <AppText className="text-[13px] font-medium text-text-primary flex-1" numberOfLines={1}>
          {label}
        </AppText>
        <View className="flex-row items-center gap-1.5">
          {value && <AppText className="text-[12px] text-text-secondary">{value}</AppText>}
          {chevron && <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />}
        </View>
      </View>
    </Card>
  )
}

// Molecule — tenant list row
function TenantCard({ tenant, balance, onPress }) {
  return (
    <Card onPress={onPress} accessibilityLabel={tenant.full_name}>
      <View className="flex-row items-center gap-3">
        <Avatar name={tenant.full_name} />
        <View className="flex-1">
          <AppText className="text-[14px] font-semibold">{tenant.full_name}</AppText>
          <AppText variant="caption" color="muted">Unit {tenant.unit_number}</AppText>
        </View>
        <Chip variant={balance > 0 ? 'danger' : 'success'} label={balance > 0 ? 'OVERDUE' : 'PAID'} />
      </View>
    </Card>
  )
}

// Molecule — hero balance card
function BalanceCard({ amount, variant, onRecordPayment }) {
  return (
    <Card size="lg">
      <AppText variant="caption" color="muted">CURRENT BALANCE</AppText>
      <AmountText amount={amount} variant={variant} size="large" />
      <Button label="Record Payment" onPress={onRecordPayment} className="mt-3" />
    </Card>
  )
}

// Molecule — colored grid cell
function UnitGridCard({ unit, onPress }) {
  return (
    <Card
      onPress={onPress}
      size="md"
      accentBorder={{ side: 'left', color: borderColorMap[unit.status], width: 3 }}
      className="flex-1"
    >
      <AppText className="text-sm font-semibold">{unit.unit_number}</AppText>
      <AppText variant="caption" color="muted">{unit.tenantName ?? 'Vacant'}</AppText>
      <Chip variant={chipVariantMap[unit.status]} label={chipLabelMap[unit.status]} size="xs" />
    </Card>
  )
}
```

Every molecule is explicit about its layout. The atom's contract is narrow.

### 3.4 Press behavior — when to make a card tappable

The `onPress` prop's presence determines whether the card becomes a `Pressable` with scale-on-press feedback. There is **no** separate `pressable` boolean — KISS.

```tsx
const Container = onPress ? AnimatedPressable : View
```

Three card patterns the engineer (or molecule author) should recognize:

| Pattern | When | Code shape |
|---|---|---|
| **Navigates on tap** | Card routes to a sub-screen (settings rows, list items, document rows) | Molecule passes `onPress` to `Card`; molecule renders a chevron in its trailing position so the affordance is visible |
| **Has internal CTA** | Card has its own button / toggle / swipe action; chrome is NOT the tap target | Molecule omits `onPress` on `Card`; the inner Button/Switch handles the tap |
| **Read-only info** | Static information; user can't interact | Molecule omits `onPress`; no chevron, no inner CTA |

**Rules of thumb (apply at the molecule layer):**
- If `onPress` is set → always render an affordance (chevron, custom trailing icon, etc.) so the user knows it's interactive. Never make a card silently tappable with no visual cue.
- If the card has an internal CTA (button, toggle), do NOT also pass `onPress` to `Card`. Two tap targets in one row create ambiguity.
- Static info cards (Last backup, Version) deliberately omit `onPress`. The lack of affordance signals "read-only."

### 3.5 Engineering rule compliance

- ✅ NativeWind classes only — no inline `style={{}}` outside Reanimated `useAnimatedStyle` and the optional `accentBorder` (color comes from a token; the only inline style is for the dynamic border value which can't go through a class).
- ✅ `<AppText>` for all text.
- ✅ `<Pressable>` via Reanimated for press feedback.
- ✅ `accessibilityLabel` defaults to `title`.
- ✅ Single source of truth for chrome.

---

## 4. Phase B — migrate row-pattern components

Every row-pattern component becomes a **molecule** that wraps `<Card>` for chrome and provides its own internal layout (typically `<View className="flex-row items-center justify-between">` with the molecule's specific content). No leading/title/subtitle/trailing props on the atom — molecules render their own JSX.

### 4.1 Migration shape

For each component, the migration is the same:

1. Open the component file.
2. Replace the inline chrome (`bg-surface rounded-xl p-X`, custom Pressable + Reanimated, etc.) with `<Card onPress={...} size="...">`.
3. Move all layout JSX inside `Card`'s children.
4. Drop the duplicate animation / Pressable / chrome boilerplate (~30–60 LOC saved per file).
5. Verify call sites are unchanged — molecule's external API stays the same.

**Example: `DocumentRow` before → after**

```tsx
// BEFORE — duplicate chrome
export function DocumentRow({ title, category, date, onPress }) {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withTiming(0.97, { duration: 100 }) }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 150 }) }}
      style={animatedStyle}
      className="bg-surface rounded-xl px-4 py-3.5 flex-row items-center justify-between"
    >
      <View className="flex-row items-center gap-3">
        <Ionicons name={categoryIcon[category]} size={20} color={colors.textSecondary} />
        <View>
          <AppText className="text-[13px] font-medium">{title}</AppText>
          <AppText variant="caption" color="muted">{category} · {formatDate(date)}</AppText>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
    </AnimatedPressable>
  )
}

// AFTER — molecule wraps Card atom
export function DocumentRow({ title, category, date, onPress }) {
  return (
    <Card onPress={onPress} accessibilityLabel={title}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          <Ionicons name={categoryIcon[category]} size={20} color={colors.textSecondary} />
          <View className="flex-1">
            <AppText className="text-[13px] font-medium">{title}</AppText>
            <AppText variant="caption" color="muted">{category} · {formatDate(date)}</AppText>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </View>
    </Card>
  )
}
```

The molecule shrinks from ~60 LOC (with duplicated chrome + animation) to ~20 LOC (layout only). The atom owns chrome.

### 4.2 Per-component migration table

Every row-pattern component **stays as a molecule** (own file, own internal layout). They all rebase onto `<Card>`. None get inlined into call sites — the molecule layer is where domain composition lives, per SOLID.

| Component | Path | Action |
|---|---|---|
| `Card` (current shell) | `components/ui/Card.tsx` | Replace with the new atom (section 3.1) |
| `ListRow` | `components/ui/ListRow.tsx` | Rebase on `Card` (becomes a generic 2-slot molecule for list rows) |
| `SettingsCard` | `components/cards/SettingsCard.tsx` | Rebase on `Card` |
| `DocumentRow` | `components/documents/DocumentRow.tsx` | Rebase on `Card` |
| `AttentionRow` | `components/home/AttentionRow.tsx` | Rebase on `Card` |
| `VacantRow` | `components/home/VacantRow.tsx` | Rebase on `Card` |
| `MaintenanceRow` | `components/maintenance/MaintenanceRow.tsx` | Rebase on `Card` |
| `NotificationRow` | `components/notifications/NotificationRow.tsx` | Rebase on `Card` |
| `UnitIncomeRow` | `components/reports/UnitIncomeRow.tsx` | Rebase on `Card` |
| `InfoRow` | `components/ui/InfoRow.tsx` | Rebase on `Card` |
| `FormToggleRow` | `components/form/FormToggleRow.tsx` | Rebase on `Card` |
| `ReportCard` | `components/home/ReportCard.tsx` | Rebase on `Card` |
| `TenantCard` | `components/tenants/TenantCard.tsx` | Rebase on `Card` |

**No deletions in phase B.** Every existing molecule keeps its file (its domain semantics are clearer that way) — the migration only swaps the inline chrome for a `<Card>` wrapper.

The reason for keeping all molecules: SOLID's Single Responsibility says the atom does chrome and only chrome; the molecules express domain meaning ("this is a tenant row," "this is a document row"). Inlining a molecule into a call site loses the domain name. With ~12 molecules each ~20 LOC, the surface stays small and explicit.

---

## 5. Phase C — rebase specialized molecules on `<Card>` chrome

Specialized cards (BalanceCard, PropertyCard, etc.) follow the same molecule-wraps-atom pattern as Phase B. They differ only in that their internal layout is richer (multi-section, hero amount, progress bars, chip rows). Same migration shape.

### 5.1 Pattern

```tsx
// BEFORE — BalanceCard with own chrome
export function BalanceCard({ amount, variant, onRecordPayment }) {
  return (
    <View className="bg-surface rounded-xl p-4">
      <AppText variant="caption" color="muted">CURRENT BALANCE</AppText>
      <AmountText amount={amount} variant={variant} size="large" />
      <Button label="Record Payment" onPress={onRecordPayment} className="mt-3" />
    </View>
  )
}

// AFTER — BalanceCard composes Card atom
export function BalanceCard({ amount, variant, onRecordPayment }) {
  return (
    <Card size="lg">
      <AppText variant="caption" color="muted">CURRENT BALANCE</AppText>
      <AmountText amount={amount} variant={variant} size="large" />
      <Button label="Record Payment" onPress={onRecordPayment} className="mt-3" />
    </Card>
  )
}
```

Chrome (bg, radius, padding, accent border, press feedback) is shared. Internal layout stays domain-specific.

### 5.2 Per-component rebase

| Component | Internal layout | Card props passed |
|---|---|---|
| `BalanceCard` | Hero amount + breakdown + Record Payment CTA | `size="lg"`, `onPress={onRecordPayment}` (or omit if CTA is inside) |
| `PropertyCard` | Header + chip row + progress bar | `size="lg"`, `onPress` |
| `PropertySummaryCard` | Multi-section (occupancy + collected + chips) | `size="lg"` |
| `PropertyOverviewCard` | Similar to above | `size="lg"` |
| `UnitCard` | Compact row variant | `size="md"`, `onPress` |
| `UnitGridCard` | Colored left border + name + tenant + chip | `size="md"`, `accentBorder={{ side: 'left', color: ..., width: 3 }}` |
| `BedSlotCard` | Colored grid cell | `accentBorder` (same pattern) |
| `BillCard` | Bill row with breakdown lines | `size="lg"`, `onPress` |
| `SwipeablePaymentRow` | Wrapped in `Swipeable` from gesture-handler | `size="md"` inside the swipeable; the swipe layer is outside Card |
| `SettlementRow` | Move-out breakdown row | `size="md"` |
| `ReportMenuCard` | Icon tile in 2-col grid | `size="lg"`, custom layout via `children` |

Each rebase deletes the inline `bg-surface rounded-xl p-X` from the component and wraps in `<Card>`. Internal text/layout untouched.

---

## 6. Engineering-rule pickup along the way

While doing the migration, fix these incidentally:

- **Raw hex** (`colors.success`, `#3b82f6`, etc.) — replace with `colors.*` tokens.
- **`<Text>` from react-native** — replace with `<AppText>`.
- **`<TouchableOpacity>`** — replace with `<Pressable>` (if any remain after spec 14).
- **Inline `style={{}}`** — replace with NativeWind className unless dynamic value (accentBorder, animated).

These are the standard set per CLAUDE.md "Color tokens" / "Tech Stack". Do them during the migration; don't blow scope on non-card files.

---

## 7. Implementation steps

Phase A is sequential (atom blocks B/C). Phases B and C are **parallelizable** — each molecule's rebase is independent.

| # | Phase | Task | Complexity | Files | Parallel? |
|---|---|---|---|---|---|
| 1 | A | Overwrite `components/ui/Card.tsx` with the chrome-only atom (section 3.1) | M | 1 | seq |
| 2 | A | Sanity check: `npx tsc --noEmit` clean (no consumers yet, but the atom must compile) | XS | — | seq |
| 3 | B | Rebase 12 row-pattern molecules onto `Card` per section 4 — drop inline chrome, keep file + external API + internal layout. **Dispatch one sub-agent per molecule (12 in parallel)** | M | 12 | parallel |
| 4 | C | Rebase 11 specialized molecules onto `Card` per section 5 — same pattern, hero/multi-section internals untouched. **Dispatch one sub-agent per molecule (11 in parallel)** | M | 11 | parallel |
| 5 | All | `npx tsc --noEmit` clean | XS | — | seq |
| 6 | All | Smoke test every screen — visuals identical to before, presses still work, animation still feels right | M | — | seq |
| 7 | All | Update CLAUDE.md "Component Map" to reflect the atom + molecule split | XS | `CLAUDE.md` | seq |

**Estimate:** ~60 minutes with parallelism (atom build + ~5 min for the 23 molecule rebases in parallel + smoke test). ~120 min if serialized.

---

## 8. Acceptance criteria

- [ ] `components/ui/Card.tsx` is the chrome-only atom per section 3.1 (~50 LOC; props: `children`, `size`, `accentBorder`, `onPress`, `className`, `accessibilityLabel`). **No leading/title/subtitle/trailing/value/chevron props on the atom.**
- [ ] All 12 row-pattern molecules (`ListRow`, `SettingsCard`, `DocumentRow`, `AttentionRow`, `VacantRow`, `MaintenanceRow`, `NotificationRow`, `UnitIncomeRow`, `InfoRow`, `FormToggleRow`, `ReportCard`, `TenantCard`) wrap `<Card>` for chrome and own their internal layout via `children`.
- [ ] All 11 specialized molecules (`BalanceCard`, `PropertyCard`, `PropertySummaryCard`, `PropertyOverviewCard`, `UnitCard`, `UnitGridCard`, `BedSlotCard`, `BillCard`, `SwipeablePaymentRow`, `SettlementRow`, `ReportMenuCard`) wrap `<Card>` for chrome and own their internal layout via `children`.
- [ ] **No `bg-surface rounded-xl` chrome literals** anywhere outside `Card.tsx` — `grep -rn "bg-surface\s\+rounded-xl" components/ app/` returns only `Card.tsx`.
- [ ] **No duplicate `Pressable + Reanimated scale` blocks** in any molecule — `grep -rn "withTiming(0.97" components/` returns only `Card.tsx` (or zero if Card uses an external helper).
- [ ] All molecules with press behavior pass `accessibilityLabel` to `Card`.
- [ ] `npx tsc --noEmit` clean.
- [ ] Visual diff vs pre-migration: imperceptible across all screens. Press animation, chevron behavior, color tokens, padding all preserved.
- [ ] CLAUDE.md "Component Map" updated: `Card` listed as the atom; molecules listed by domain.
- [ ] No raw hex / `<Text>` from react-native / `<TouchableOpacity>` introduced anywhere.
- [ ] `<Card size="lg">` used for hero molecules; `size="md"` (default) for rows; `size="sm"` for compact rows.
- [ ] All molecule files retain their original external API — call sites do not change.

---

## 9. Out of scope

- **Forcing every specialized card to use slot mode (row mode).** Some (BalanceCard, PropertySummaryCard) genuinely need custom internal layout. `children` mode is the right escape hatch — don't try to flatten them into slots.
- **Building a `<CardGroup>` wrapper** to handle inter-card gaps. The current `<View className="gap-1.5">` pattern works fine; abstracting it is premature.
- **Adding a `variant` prop** for color-themed cards (e.g. `variant="danger"` auto-coloring the card red). Stays domain logic; `accentBorder` covers the audit's actual usage. KISS.
- **Animating the card on appear** (slide-in, fade-in). Defer until a specific screen calls for it.
- **Migrating swipe gestures** (`SwipeablePaymentRow`). The swipe layer wraps `Card`; don't try to fold gesture handling into the primitive.
- **Touching the underlying tokens** (`bg-surface`, `rounded-xl`). Those are project-wide design tokens; this spec uses them, doesn't change them.
- **Renaming files.** Keep current paths; only delete or rebase contents.

---

## 10. Open questions

1. **Default size — `md` or `lg`?** Spec defaults to `md` (the row pattern is most common). Hero usages (Balance, Property summary) explicitly pass `size="lg"`. Confirm.
2. **Press animation on every Card with `onPress`?** Spec says yes. If some molecules (e.g. swipeable rows where the swipe gesture handles feedback) need to suppress the scale, expose a `disablePressAnimation` prop. Defer unless a real consumer needs it.
3. **`InfoRow` chrome question.** Today's `InfoRow` is a flusher key/value row often rendered inside a parent card (a card-of-cards anti-pattern). If `InfoRow` is meant to be chrome-less (just text rows that sit inside another `Card`), it does NOT use `<Card>` — it stays as a plain layout helper. Engineer should verify against the current visual; if InfoRow has its own chrome today, rebase it; if it's chrome-less, leave the chrome out.
4. **Molecule file colocation** — current paths put cards under `components/cards/`, `components/billing/`, `components/properties/`, etc. Spec preserves this domain-grouped structure. If the user prefers all card molecules under `components/cards/`, that's a separate refactor.
