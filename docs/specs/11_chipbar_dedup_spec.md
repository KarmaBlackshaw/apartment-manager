# Chip Primitives Consolidation — `Chip` (static) + `ChipBar` (interactive)

**Trigger:** User identified that `MonthTabSelector` and `FilterChipBar` look the same and should share one component. Clarified the design intent: split by **interaction model**, not by visual variant.
**Audience:** Engineer agent.
**Skills consulted:** `using-superpowers`, `ui-ux-pro-max` (rules §4 `style-match`, `consistency`; CLAUDE.md "Component Extraction" two-uses rule).

---

## 0. TL;DR

Today, three "chip-shaped" components do almost-the-same-thing:

| Today | Role | Verdict |
|---|---|---|
| `StatusChip` | Non-interactive status badge (VACANT, OVERDUE, PAID) | **Rename → `Chip`** |
| `FilterChipBar` | Interactive single-select horizontal pill row (filters) | **Delete; merged into `ChipBar`** |
| `MonthTabSelector` | Interactive single-select horizontal pill row (months) | **Delete; merged into `ChipBar`** |

After this spec, exactly **two** chip primitives exist:

- **`<Chip>`** — static label, semantic color (`success` / `warning` / `danger` / `info` / `neutral` / `advance`), 3 sizes (`xs` / `sm` / `md`). Used for status badges in rows, headers, and cards.
- **`<ChipBar>`** — interactive horizontal scroll of single-select pills, **one canonical visual** (`bg-surface` unselected, `bg-primary` + white text selected). Used for filter rows and month/scope tab strips.

No `variant` prop on `ChipBar` — there's just one visual. The previous "filter vs tab" stylistic difference goes away in favor of consistency.

## Agent prompt

```
Implement docs/specs/11_chipbar_dedup_spec.md exactly. Two phases:

Phase A — Static badge rename (StatusChip → Chip):
  Steps 1-3 from §6. Bulk find-replace across app/ and components/.
  Update ChipVariant type imports.

Phase B — Interactive bar consolidation:
  Steps 4-7 from §6. Create components/ui/ChipBar.tsx, migrate 8
  FilterChipBar callers + 5 MonthTabSelector callers. Note the
  months→options prop rename in §4.2. Delete the two legacy files.

Then steps 8-12: barrel exports, CLAUDE.md "Component Map" update,
grep audit (must be empty):
  grep -rn "StatusChip\|FilterChipBar\|MonthTabSelector" app/ components/

Constraints:
- Do NOT commit.
- No raw hex; NativeWind / colors.* only.
- No <Text> from react-native (primitives may use it — Chip and
  ChipBar internals are primitives).
- No <TouchableOpacity>; use <Pressable> with Reanimated.

Verify §7 acceptance (10 items). Smoke test on iOS + Android per
step 12. ~45 min.

After verification passes, mark this spec done:
  git mv docs/specs/11_chipbar_dedup_spec.md docs/specs/11_chipbar_dedup_spec_DONE.md
```

---

## 1. Why two primitives, not one

| Concern | Static `Chip` | Interactive `ChipBar` |
|---|---|---|
| Tappable? | No | Yes |
| Color | Semantic palette (success/danger/etc.) | Single brand pair (surface ↔ primary) |
| Renders | Singular, inline in rows | Plural, horizontal scroll |
| Animation | None | Reanimated scale on press |
| Haptics | No | Light impact on press |
| Accessibility role | None / decorative | `tab` |
| Sizes | xs/sm/md | One size (32dp) |

Folding both into one component would couple two unrelated APIs and require runtime branching on every prop. KISS says split by behavior; share visuals where they overlap (rounded-full, padding, font weight) by aligning Tailwind classes.

---

## 2. `<Chip>` — static badge (renamed from `StatusChip`)

### 2.1 File

`components/ui/Chip.tsx` — same content as today's `components/ui/StatusChip.tsx`, exported as `Chip` instead of `StatusChip`. Type alias `ChipVariant` stays.

```tsx
import React from 'react'
import { Text, View } from 'react-native'
import { colors } from '~/constants/theme'

export type ChipVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'advance'

interface ChipProps {
  variant: ChipVariant
  label: string
  size?: 'xs' | 'sm' | 'md'
}

const bgColor: Record<ChipVariant, string> = {
  success: colors.successBg,
  warning: colors.warningBg,
  danger:  colors.dangerBg,
  info:    colors.infoBg,
  neutral: colors.neutralBg,
  advance: colors.infoBg,
}

const textColor: Record<ChipVariant, string> = {
  success: colors.successText,
  warning: colors.warningText,
  danger:  colors.dangerText,
  info:    colors.infoText,
  neutral: colors.neutralText,
  advance: colors.infoText,
}

const SIZE_CLASSES: Record<NonNullable<ChipProps['size']>, { container: string; text: string }> = {
  xs: { container: 'px-[6px] py-[2px]', text: 'text-[8px]'  },
  sm: { container: 'px-2 py-1',         text: 'text-[11px]' },
  md: { container: 'px-3 py-[6px]',     text: 'text-xs'     },
}

export function Chip({ variant, label, size = 'sm' }: ChipProps) {
  const { container, text } = SIZE_CLASSES[size]
  return (
    <View className={`rounded-sm self-start ${container}`} style={{ backgroundColor: bgColor[variant] }}>
      <Text className={`font-semibold uppercase tracking-wide ${text}`} style={{ color: textColor[variant] }}>
        {label}
      </Text>
    </View>
  )
}
```

**LOC: ~50.** Net change vs today's `StatusChip`: zero — only rename.

### 2.2 Migration — every `StatusChip` import becomes `Chip`

```bash
# Find all StatusChip usages
grep -rn "StatusChip\|ChipVariant" app/ components/
```

Per audit: ~25 import lines + ~30 JSX usages across `app/(admin)/**` and `components/**`. Each becomes:

```tsx
// BEFORE
import { StatusChip } from '~/components/ui/StatusChip'
import type { ChipVariant } from '~/components/ui/StatusChip'
<StatusChip variant="success" label="PAID" />

// AFTER
import { Chip } from '~/components/ui/Chip'
import type { ChipVariant } from '~/components/ui/Chip'
<Chip variant="success" label="PAID" />
```

Use a **single batch find-and-replace** (the engineer's tool of choice — sed, IDE refactor, etc.) to flip the imports and JSX usages in one pass. Then delete `StatusChip.tsx`.

---

## 3. `<ChipBar>` — interactive single-select scroll

### 3.1 File

`components/ui/ChipBar.tsx` (new). One visual, one accessibility role, one size.

```tsx
import React from 'react'
import { ScrollView, Text, Pressable } from 'react-native'
import * as Haptics from 'expo-haptics'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'

export interface ChipOption {
  value: string
  label: string
}

interface ChipBarProps {
  /** Accepts `{value, label}[]` (preferred) or `string[]` (value === label). */
  options: ChipOption[] | string[]
  selected: string
  onChange: (value: string) => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

function toOptions(input: ChipOption[] | string[]): ChipOption[] {
  return input.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
}

interface ChipProps {
  option: ChipOption
  isSelected: boolean
  onPress: (value: string) => void
}

function Chip({ option, isSelected, onPress }: ChipProps) {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <AnimatedPressable
      style={animatedStyle}
      className={`px-4 h-[32px] rounded-full justify-center items-center ${
        isSelected ? 'bg-primary' : 'bg-surface'
      }`}
      onPressIn={() => { scale.value = withTiming(0.97, { duration: 100 }) }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 150 }) }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress(option.value)
      }}
      accessibilityRole="tab"
      accessibilityState={{ selected: isSelected }}
    >
      <Text
        className={`text-[12px] font-medium ${
          isSelected ? 'text-white' : 'text-text-secondary'
        }`}
      >
        {option.label}
      </Text>
    </AnimatedPressable>
  )
}

export function ChipBar({ options, selected, onChange }: ChipBarProps) {
  const opts = toOptions(options)
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="flex-row items-center gap-2 px-4 py-1.5"
      className="grow-0 shrink-0"
    >
      {opts.map((opt) => (
        <Chip
          key={opt.value}
          option={opt}
          isSelected={opt.value === selected}
          onPress={onChange}
        />
      ))}
    </ScrollView>
  )
}
```

**LOC: ~75.** Replaces `FilterChipBar` (94) + `MonthTabSelector` (86) = **180 LOC removed, 75 added → net −105 LOC**.

### 3.2 The canonical visual (single style)

Picked from the union of `FilterChipBar` + `MonthTabSelector`:

| Aspect | Value | Rationale |
|---|---|---|
| Pill shape | `rounded-full` | Both use it |
| Height | `h-[32px]` | Splits the 30/32 difference; matches `ui-ux-pro-max` rule §2 `touch-target-size` (with `gap-2` between, total touch area ≥ 44 with hitSlop fallback if needed) |
| Padding | `px-4` | Both use it |
| Unselected bg | `bg-surface` | Stronger affordance than transparent — users can tell what's tappable. The MonthTabSelector's transparent bg made unselected chips feel like text labels. |
| Selected bg | `bg-primary` | Both use it |
| Selected text | `text-white font-medium` | High contrast on blue; consistent weight |
| Unselected text | `text-text-secondary font-medium` | Same weight as selected for layout stability (no font-weight reflow on selection change) |
| Text size | `text-[12px]` | Splits the 11/13 difference. Reads cleanly at both filter density (4–5 chips) and month strip density (12 months). |
| Gap between chips | `gap-2` (8dp) | Comfortable separation; matches `FilterChipBar` |
| Horizontal padding (scroll container) | `px-4` | Matches both |
| Vertical padding (scroll container) | `py-1.5` | 6dp top/bottom — leaves room around the 32dp pill |

This is the only visual. There is no `variant` prop. If a future need arises (e.g. an outlined chip), add it as an explicit prop **only when a 2nd consumer needs it**.

### 3.3 Accessibility role

Always `tab`. The `button` role on `FilterChipBar` was inconsistent with `MonthTabSelector` and not particularly meaningful (they are tabs that filter; "tab" reads correctly to VoiceOver in either case).

---

## 4. Migration

### 4.1 `<FilterChipBar>` → `<ChipBar>` (8 callers)

| File | Line | Change |
|---|---|---|
| `app/(admin)/notifications.tsx` | 200 | rename component |
| `app/(admin)/tenants/index.tsx` | 102 | rename |
| `app/(admin)/tenants/[id]/payment-history.tsx` | 66 | rename |
| `app/(admin)/tenants/[id]/documents.tsx` | 45 | rename |
| `app/(admin)/properties/[propertyId]/units/[id]/documents.tsx` | 82 | rename |
| `app/(admin)/billing/utility.tsx` | 91 | rename |
| `app/(admin)/billing/index.tsx` | 138 | rename |
| `app/(admin)/reports/annual-summary.tsx` | 71 | rename |

Each line:
```tsx
// BEFORE
<FilterChipBar options={...} selected={...} onChange={...} />
// AFTER
<ChipBar options={...} selected={...} onChange={...} />
```

Plus update the import.

### 4.2 `<MonthTabSelector>` → `<ChipBar>` (5 callers)

| File | Line | Change |
|---|---|---|
| `app/(admin)/billing/generate.tsx` | 62 | rename + rename `months={...}` to `options={...}` |
| `app/(admin)/billing/index.tsx` | 87 | same |
| `app/(admin)/reports/monthly-collection.tsx` | 62 | same |
| `app/(admin)/reports/per-unit-income.tsx` | 52 | same |
| `app/(admin)/reports/maintenance-costs.tsx` | 88 | same |

Each line:
```tsx
// BEFORE
<MonthTabSelector months={['Jan', 'Feb', ...]} selected={...} onChange={...} />
// AFTER
<ChipBar options={['Jan', 'Feb', ...]} selected={...} onChange={...} />
```

`ChipBar` accepts `string[]` directly via `toOptions` coercion — no need to map to `{value, label}`.

### 4.3 `<StatusChip>` → `<Chip>` (~30 JSX usages, ~25 imports)

Bulk find-and-replace per §2.2. Two passes:

1. Imports:
   ```bash
   # Across app/ and components/:
   #   from '~/components/ui/StatusChip' → from '~/components/ui/Chip'
   #   import { StatusChip } → import { Chip }
   #   import type { ChipVariant } from '~/components/ui/StatusChip' → from '~/components/ui/Chip'
   ```
2. JSX:
   ```bash
   # Across app/ and components/:
   #   <StatusChip → <Chip
   #   </StatusChip> → </Chip>
   ```

Use the IDE refactor tool if available; otherwise sed. Verify with `tsc --noEmit`.

### 4.4 Files to delete

```
components/ui/FilterChipBar.tsx       ← delete after §4.1 done
components/ui/MonthTabSelector.tsx    ← delete after §4.2 done
components/ui/StatusChip.tsx          ← delete after §4.3 done
```

### 4.5 Barrel exports

```bash
grep -rn "FilterChipBar\|MonthTabSelector\|StatusChip" components/ui/index.ts 2>/dev/null
```

If a barrel exists, replace those exports with `Chip` and `ChipBar`. (The project may not have a barrel — skip if grep is empty.)

---

## 5. CLAUDE.md update

Replace the chip-related lines in the "Component Map":

```
ui/
  ...
  Chip.tsx              Static badge — variant: success|warning|danger|info|neutral|advance, size: xs|sm|md. Use for status labels, counts, etc. Non-interactive.
  ChipBar.tsx           Interactive horizontal scroll of single-select pills. Use for filter rows and month/scope tab strips. Single visual (bg-surface ↔ bg-primary).
  ...
```

Append a one-liner under "Component Extraction":

> **Chip pattern:** static labels use `<Chip>`; interactive selectable pill rows use `<ChipBar>`. There is no third chip primitive. New "chip-like" needs MUST extend one of these two — do not create a sibling component. (Consolidation lives in spec 11.)

---

## 6. Implementation steps

| # | Task | Complexity | Files |
|---|---|---|---|
| 1 | Create `components/ui/Chip.tsx` per §2.1 (copy of StatusChip with renamed exports) | XS | 1 (new) |
| 2 | Find-replace `StatusChip` → `Chip` across `app/` and `components/` (imports + JSX). Update `ChipVariant` import paths too. | S | ~25 files |
| 3 | Delete `components/ui/StatusChip.tsx` | XS | 1 |
| 4 | Create `components/ui/ChipBar.tsx` per §3.1 | S | 1 (new) |
| 5 | Migrate 8 `<FilterChipBar>` callers per §4.1 | S | 8 |
| 6 | Migrate 5 `<MonthTabSelector>` callers per §4.2 (rename `months` → `options`) | S | 5 |
| 7 | Delete `components/ui/FilterChipBar.tsx` and `components/ui/MonthTabSelector.tsx` | XS | 2 |
| 8 | Update `components/ui/index.ts` barrel if present | XS | 0–1 |
| 9 | Update CLAUDE.md "Component Map" per §5 | XS | 1 |
| 10 | Run `grep -rn "StatusChip\|FilterChipBar\|MonthTabSelector" app/ components/` — must return empty | XS | — |
| 11 | `npx tsc --noEmit` clean | XS | — |
| 12 | Smoke test on iOS + Android: every screen with a chip filter row, every screen with a month strip, every row with a status badge. Confirm visuals are coherent and selection works | M | — |

**Estimate:** ~45 minutes (mostly the find-replace + smoke test).

---

## 7. Acceptance criteria

- [ ] `components/ui/Chip.tsx` exists and exports `Chip` + `ChipVariant`.
- [ ] `components/ui/ChipBar.tsx` exists and exports `ChipBar` + `ChipOption`.
- [ ] `components/ui/StatusChip.tsx`, `FilterChipBar.tsx`, `MonthTabSelector.tsx` all deleted.
- [ ] `grep -rn "StatusChip\|FilterChipBar\|MonthTabSelector" app/ components/` returns empty (or only doc/spec references).
- [ ] All filter/month chip rows look identical to each other after migration. (Slight perceived shift from the old MonthTabSelector's transparent-unselected style is expected and intentional.)
- [ ] All status badges render unchanged.
- [ ] `npx tsc --noEmit` clean.
- [ ] No raw hex; no `<TouchableOpacity>`; no inline `style={{...}}` outside Reanimated `useAnimatedStyle`.
- [ ] CLAUDE.md "Component Map" reflects the two new primitives.

---

## 8. Visual change notice

`<MonthTabSelector>`'s old style had **transparent backgrounds** for unselected chips, so unselected months looked like flat text labels. After this spec, unselected chips show `bg-surface` like every other ChipBar — the unselected month chips now look like buttons.

This is **intentional** — it's the canonical visual the user agreed on ("they look the same"). If the user reviews and prefers the old transparent look for month strips specifically, the `variant` system from the rejected first draft can be reintroduced. Until then, keep one visual.

---

## 9. Out of scope

- Multi-select chip bar — single-select only for v1; add a `multiSelect` prop later if needed.
- Count badges (`All (12)`) — already encoded in label strings; no structural prop needed.
- Outline / ghost chip variant — not present today, defer.
- Animating the selected state's bg color via Reanimated — Tailwind class swap is fine; the scale animation already provides press feedback.
- Touching `SegmentedControl` (boxed control with internal track) — different UI pattern, separate component, separate concern.
- Touching the `Chip` size variants — keep `xs|sm|md` as today; sufficient.
- Localizing chip labels — single-locale project for now.

---

## 10. Open question

**Visual confirmation:** the canonical look in §3.2 picks `bg-surface` for unselected. The MonthTabSelector strips currently use `bg-transparent`. After the migration, those strips will look slightly more "buttony." If the user reviews and wants transparent-unselected back for month strips only:

- Add `variant?: 'solid' | 'ghost'` (default `solid`) to `<ChipBar>`.
- 5 month-strip callers pass `variant="ghost"`.
- Cost: ~10 LOC added back.

This is the only place where two visuals might be justified. Defer until the user reviews the migrated screens.
