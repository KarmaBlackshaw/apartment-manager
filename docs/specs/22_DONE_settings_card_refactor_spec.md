# Settings Refactor — Per-Row Cards (`SettingsCard`)

## TL;DR

Settings screen currently groups all rows of a section into one card with internal dividers. The locked design (`docs/screenshots/dark/03_settings.png` + light variant) shows **every row as its own standalone card** with small gaps inside a section, and the section title sits **outside** the card as a label.

Replace `SettingsRow` (97 LOC, divider-style) with **`SettingsCard`** (standalone card per row). Drop all `cardStyle` wrapper blocks in `app/(admin)/settings/index.tsx`. Drop inline-style violations while we're there. Section grouping and order stay the same.

**Component-centric:** the fix lives entirely in `SettingsCard`. Update once, screen reflows automatically.

## Agent prompt

```
Implement docs/specs/22_settings_card_refactor_spec.md exactly.

Read first:
1. docs/specs/22_settings_card_refactor_spec.md (source of truth)
2. docs/screenshots/dark/03_settings.png AND
   docs/screenshots/light/03_settings.png — match these exactly
3. CLAUDE.md "Color tokens", "Tech Stack", "Component Map"

Execute §6 in order — 8 steps:
  1. Create components/cards/SettingsCard.tsx per §3
  2. Update app/(admin)/settings/index.tsx per §4 — drop cardStyle
     blocks, drop SettingsRow imports, drop inline styles, wrap each
     section's rows in <View className="gap-1.5">
  3. Drop redundant inline `style={{ ... }}` and raw hex (`#0d0d0d`)
     surfaced during the migration; replace with NativeWind classes
     and `colors.*` tokens
  4. Replace useSafeAreaInsets call with ScreenView wrapper (per
     spec 21 §2.3) — paddingBottom: insets.bottom + 100 → ScrollView
     contentContainerClassName="pb-[88px]"
  5. Delete components/settings/SettingsRow.tsx (zero remaining
     callers after step 2)
  6. Run grep audits — must return empty:
       grep -rn "SettingsRow" app/ components/
       grep -rn "useSafeAreaInsets" app/(admin)/settings/
       grep -rEn "#[0-9a-fA-F]{6}|rgba\(" app/(admin)/settings/
  7. `npx tsc --noEmit` clean
  8. Smoke test on iOS + Android against both screenshot references

Constraints:
- Do NOT commit.
- No raw hex; NativeWind classes or `colors.*` tokens only.
- No <Text> from react-native in screens; use <AppText>.
- No <TouchableOpacity>; use <Pressable> with Reanimated.
- No inline style={{...}} except Reanimated useAnimatedStyle.
- Do NOT add a card around the profile header at the top.
- Do NOT use uppercase or letter-spacing on section labels.
- Do NOT add borders to cards — surface elevation only.

Verify §7 acceptance (12 items). ~30 min.

After verification passes, mark this spec done:
  git mv docs/specs/22_settings_card_refactor_spec.md docs/specs/22_DONE_settings_card_refactor_spec.md
```

---

## 1. Audit — current state

### 1.1 `components/settings/SettingsRow.tsx` (97 LOC)

Renders a row inside a parent card with `border-b border-border` divider:

```tsx
<View className="flex-row items-center bg-surface px-4 py-4 border-b border-border min-h-[44px]">
  <Text className="flex-1 text-[15px] text-text-primary">{label}</Text>
  ...
</View>
```

Used 11+ times in `app/(admin)/settings/index.tsx`, each section wrapped in a manual `cardStyle` `<View>` block.

### 1.2 `app/(admin)/settings/index.tsx` (190 LOC) — rule violations

- **Inline `style={{...}}`** everywhere — `cardStyle` object, screen title, profile card, every section wrapper.
- **Raw hex** — `'#0d0d0d'` in the outer `<View>` (line 9), `bg-app` literal (deprecated alias).
- **`useSafeAreaInsets()`** call in screen body — forbidden by spec 07 / spec 21.
- **`paddingBottom: insets.bottom + 100`** — should be `pb-[88px]` per CLAUDE.md.
- **`<Text>` from `react-native`** instead of `<AppText>`.

These accumulate violations; the refactor is also a chance to fix them.

### 1.3 Token mapping note

The migration prompt references tokens (`bg-surface-1`, `text-text-1`, `text-text-2`, `text-green`, `text-amber`, `text-red`) that **do not match this project's tailwind config**. Use the project's actual tokens:

| Migration prompt token | Project token |
|---|---|
| `bg-surface-1` | `bg-surface` |
| `text-text-1` | `text-text-primary` |
| `text-text-2` | `text-text-secondary` |
| `text-green` | `text-success` |
| `text-amber` | `text-warning` |
| `text-red` | `text-danger` |

If the project later adds the `-1` / `-2` suffix scheme, this is an automatic find-replace.

---

## 2. New layout structure

```
┌────────────────────────────────────────────┐
│ Settings                                    │   ← screen title
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ [Avatar] Owner Name                     │ │   ← profile header
│ │          0917 555 1234 · Owner          │ │     (kept; no card)
│ └─────────────────────────────────────────┘ │
│                                             │
│ Apartment                                   │   ← section label (lowercase, regular weight)
│ ┌─────────────────────────────────────────┐ │
│ │ Apartment Name           Sunset Apts › │ │   ← per-row card
│ └─────────────────────────────────────────┘ │     gap-1.5 between
│ ┌─────────────────────────────────────────┐ │
│ │ Address                  Not set    ›  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Billing defaults                            │   ← gap-3 between sections
│ ┌─────────────────────────────────────────┐ │
│ │ Billing day              1st of month › │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ Late fee                 ₱200 · 5 days › │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Notifications                               │
│ ┌─────────────────────────────────────────┐ │
│ │ Rent reminders                  [ON ●]  │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ Contract expiry                 [ON ●]  │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ Vacancy alerts                  [● OFF] │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ Quiet hours              10pm–7am   ›   │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Security                                    │
│ ┌─────────────────────────────────────────┐ │
│ │ App lock                 Biometric  ›   │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Data                                        │
│ ┌─────────────────────────────────────────┐ │
│ │ Last backup              Today 8:00am   │ │   ← green text, no chevron
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ Back up now                         ›   │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ Restore from backup                 ›   │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ About                                       │
│ ┌─────────────────────────────────────────┐ │
│ │ Version                 1.0.0 (42)      │ │   ← mono font, no chevron
│ └─────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

---

## 3. `<SettingsCard>` component

### 3.1 File

`components/cards/SettingsCard.tsx` (new). Replaces `components/settings/SettingsRow.tsx`.

```tsx
import React from 'react'
import { View, Pressable, Switch } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { AppText } from '~/components/ui/AppText'
import { colors } from '~/constants/theme'
import { cn } from '~/lib/utils'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type ValueColor = 'primary' | 'success' | 'warning' | 'danger'

interface SettingsCardProps {
  label: string
  /** Right-aligned value text. Ignored when `right` is provided. */
  value?: string
  /** Custom right slot (Toggle, Switch, custom node). Overrides `value`. */
  right?: React.ReactNode
  /** Show › chevron at the end. */
  chevron?: boolean
  /** Optional color for the value text. */
  valueColor?: ValueColor
  /** Use mono font for the value (e.g. version numbers). */
  valueMono?: boolean
  onPress?: () => void
  accessibilityLabel?: string
}

export function SettingsCard({
  label,
  value,
  right,
  chevron = false,
  valueColor,
  valueMono = false,
  onPress,
  accessibilityLabel,
}: SettingsCardProps) {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const valueColorClass =
    valueColor === 'success' ? 'text-success'
    : valueColor === 'warning' ? 'text-warning'
    : valueColor === 'danger'  ? 'text-danger'
    : valueColor === 'primary' ? 'text-primary'
    : 'text-text-secondary'

  const Container = onPress ? AnimatedPressable : View
  const containerProps = onPress
    ? {
        onPress,
        onPressIn: () => { scale.value = withTiming(0.97, { duration: 100 }) },
        onPressOut: () => { scale.value = withTiming(1, { duration: 150 }) },
        style: animatedStyle,
        accessibilityRole: 'button' as const,
        accessibilityLabel: accessibilityLabel ?? label,
      }
    : {}

  return (
    <Container
      {...containerProps}
      className="bg-surface rounded-xl px-4 py-3.5 flex-row items-center justify-between min-h-[44px]"
    >
      <AppText className="text-[13px] font-medium text-text-primary flex-1" numberOfLines={1}>
        {label}
      </AppText>
      <View className="flex-row items-center gap-1.5">
        {right ?? (
          value != null && (
            <AppText
              className={cn(
                'text-[12px] font-normal',
                valueColorClass,
                valueMono && 'font-mono',
              )}
            >
              {value}
            </AppText>
          )
        )}
        {chevron && (
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        )}
      </View>
    </Container>
  )
}
```

**Notes:**
- `<AppText>` everywhere (no raw `<Text>`).
- `<Pressable>` via Reanimated when `onPress` is set; plain `<View>` otherwise (no animation noise on info rows).
- Token mapping per §1.3.
- 16px chevron stroke matches the design audit's small-chevron pattern; if the design references show a thinner stroke, swap to a custom 10×10 SVG with `stroke-width 2.5` per the migration prompt's note.
- `min-h-[44px]` ensures the row meets the 44pt touch-target rule even at the smallest content.
- `accessibilityLabel` defaults to the row label.

### 3.2 Component path

Per CLAUDE.md "Component Map", cards live in `components/cards/`. New file goes there. The legacy `components/settings/SettingsRow.tsx` is deleted in step 5.

---

## 4. Screen rewrite (`app/(admin)/settings/index.tsx`)

### 4.1 Top-level structure

```tsx
import React from 'react'
import { View, ScrollView, Switch } from 'react-native'

import { ScreenView } from '~/components/ui/ScreenView'
import { AppText } from '~/components/ui/AppText'
import { Avatar } from '~/components/ui/Avatar'                 // post spec 13 rename
import { SettingsCard } from '~/components/cards/SettingsCard'
import { colors } from '~/constants/theme'
import { useSettings, useUpdateSetting } from '~/hooks/useSettings'

export default function SettingsScreen() {
  const { data: settings } = useSettings()
  const { mutate: updateSetting } = useUpdateSetting()

  const ownerName     = settings?.owner_name      ?? ''
  const ownerPhone    = settings?.owner_phone     ?? ''
  const apartmentName = settings?.apartment_name  ?? ''

  const rentReminders  = (settings?.notif_rent_reminders  ?? '1') === '1'
  const contractExpiry = (settings?.notif_contract_expiry ?? '1') === '1'
  const vacancyAlerts  = (settings?.notif_vacancy_alerts  ?? '1') === '1'

  return (
    <ScreenView>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="px-4 pt-5 pb-[88px] gap-3"
        showsVerticalScrollIndicator={false}
      >
        {/* Screen title */}
        <AppText variant="heading">Settings</AppText>

        {/* Profile header — NOT in a card per design */}
        <View className="flex-row items-center gap-4 py-2">
          <Avatar name={ownerName || 'Owner'} size="lg" />
          <View className="flex-1">
            <AppText className="text-[14px] font-bold text-text-primary" numberOfLines={1}>
              {ownerName || 'Set owner name'}
            </AppText>
            <AppText className="text-[11px] text-text-secondary mt-[2px]">
              {ownerPhone ? `${ownerPhone} · Owner` : 'Owner'}
            </AppText>
          </View>
        </View>

        {/* Apartment */}
        <SettingsSectionLabel>Apartment</SettingsSectionLabel>
        <View className="gap-1.5">
          <SettingsCard label="Apartment Name" value={apartmentName || 'Not set'} chevron onPress={() => {}} />
          <SettingsCard label="Address"        value="Not set" chevron onPress={() => {}} />
        </View>

        {/* Billing defaults */}
        <SettingsSectionLabel>Billing defaults</SettingsSectionLabel>
        <View className="gap-1.5">
          <SettingsCard label="Billing day" value="1st of month" chevron onPress={() => {}} />
          <SettingsCard label="Late fee"    value="₱200 · 5 days" chevron onPress={() => {}} />
        </View>

        {/* Notifications */}
        <SettingsSectionLabel>Notifications</SettingsSectionLabel>
        <View className="gap-1.5">
          <SettingsCard
            label="Rent reminders"
            right={
              <Switch
                value={rentReminders}
                onValueChange={(v) => updateSetting({ key: 'notif_rent_reminders', value: v ? '1' : '0' })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={colors.border}
              />
            }
          />
          <SettingsCard
            label="Contract expiry"
            right={
              <Switch
                value={contractExpiry}
                onValueChange={(v) => updateSetting({ key: 'notif_contract_expiry', value: v ? '1' : '0' })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={colors.border}
              />
            }
          />
          <SettingsCard
            label="Vacancy alerts"
            right={
              <Switch
                value={vacancyAlerts}
                onValueChange={(v) => updateSetting({ key: 'notif_vacancy_alerts', value: v ? '1' : '0' })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={colors.border}
              />
            }
          />
          <SettingsCard label="Quiet hours" value="10pm–7am" chevron onPress={() => {}} />
        </View>

        {/* Security */}
        <SettingsSectionLabel>Security</SettingsSectionLabel>
        <View className="gap-1.5">
          <SettingsCard label="App lock" value="Biometric" chevron onPress={() => {}} />
        </View>

        {/* Data */}
        <SettingsSectionLabel>Data</SettingsSectionLabel>
        <View className="gap-1.5">
          <SettingsCard label="Last backup"        value="Today 8:00am" valueColor="success" />
          <SettingsCard label="Back up now"        chevron onPress={() => {}} />
          <SettingsCard label="Restore from backup" chevron onPress={() => {}} />
        </View>

        {/* About */}
        <SettingsSectionLabel>About</SettingsSectionLabel>
        <View className="gap-1.5">
          <SettingsCard label="Version" value="1.0.0 (42)" valueMono />
        </View>
      </ScrollView>
    </ScreenView>
  )
}

function SettingsSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <AppText className="text-[11px] font-semibold text-text-secondary px-1 pt-2 pb-0">
      {children}
    </AppText>
  )
}
```

### 4.2 What changes vs current `index.tsx`

| Old | New |
|---|---|
| `<View style={{ flex: 1, backgroundColor: '#0d0d0d' }}>` outer wrapper | `<ScreenView>` (handles bg + safe area) |
| `useSafeAreaInsets()` + manual padding math | `pb-[88px]` on ScrollView |
| `cardStyle` object reused 6× per section | Per-row `<SettingsCard>` inside `<View className="gap-1.5">` |
| `<SettingsRow>` (97 LOC, divider-style) | `<SettingsCard>` (per §3) |
| `<Text style={{ fontSize, fontWeight, color }}>` for screen title | `<AppText variant="heading">` |
| Inline section header `<SectionHeader>` | Inline `<SettingsSectionLabel>` (lowercase, regular case, no uppercase) |
| Profile card with `cardStyle` background | Profile header without a card (per design) |

The local `SettingsSectionLabel` helper stays inside the file — it's a 4-line component used only here.

---

## 5. Token + style audit while editing

Already-violated tokens to fix (paired with §15 raw-hex purge intent):

```bash
grep -En "#[0-9a-fA-F]{6}|rgba\(" app/\(admin\)/settings/index.tsx
```

Replace each with the `colors.*` or NativeWind token. After this spec, the file should pass:

```bash
grep -En "style={{|#[0-9a-fA-F]{6}|useSafeAreaInsets|TouchableOpacity|<Text " app/\(admin\)/settings/index.tsx
```

Expected: zero hits (the only allowed `style` usage is Reanimated's `useAnimatedStyle` which doesn't appear in this file).

---

## 6. Implementation steps

| # | Task | Complexity | Files |
|---|---|---|---|
| 1 | Create `components/cards/SettingsCard.tsx` per §3 | S | 1 (new) |
| 2 | Rewrite `app/(admin)/settings/index.tsx` per §4 — drop cardStyle, use SettingsCard, add SettingsSectionLabel helper | M | 1 |
| 3 | Replace inline `style={{ ... }}` and raw hex with NativeWind / `colors.*` | XS | 1 (same file) |
| 4 | Replace `useSafeAreaInsets` + manual padding with `<ScreenView>` + `pb-[88px]` | XS | 1 (same file) |
| 5 | Delete `components/settings/SettingsRow.tsx` (zero remaining callers project-wide) | XS | 1 |
| 6 | Run grep audits per agent prompt — must all return empty | XS | — |
| 7 | `npx tsc --noEmit` clean | XS | — |
| 8 | Smoke test on iOS + Android against `docs/screenshots/dark/03_settings.png` and `light/03_settings.png` | M | — |

**Estimate:** ~30 minutes.

---

## 7. Acceptance criteria

- [ ] `components/cards/SettingsCard.tsx` exists with `SettingsCardProps` matching §3.1.
- [ ] `components/settings/SettingsRow.tsx` deleted; `grep -rn "SettingsRow" app/ components/` returns empty.
- [ ] Settings screen: every row is its own `bg-surface rounded-xl` card.
- [ ] Rows in the same section are wrapped in `<View className="gap-1.5">`.
- [ ] Sections separated by `gap-3` via the ScrollView's `contentContainerClassName`.
- [ ] Section labels are lowercase regular-case (e.g. "Billing defaults"), 11px semibold, `text-text-secondary`. **No uppercase, no letter-spacing.**
- [ ] Profile header is NOT in a card.
- [ ] Toggles use the `right` slot of `SettingsCard`.
- [ ] "Last backup" value renders in success green; "Version" renders in mono font.
- [ ] No inline `style={{...}}` in `app/(admin)/settings/index.tsx`.
- [ ] No raw hex / rgba in `app/(admin)/settings/index.tsx`.
- [ ] No `useSafeAreaInsets` call in the screen file.
- [ ] No `<Text>` from `react-native` in the screen file.
- [ ] `npx tsc --noEmit` clean.
- [ ] Visual: screen matches `docs/screenshots/dark/03_settings.png` and `light/03_settings.png`.

---

## 8. Out of scope

- Wiring `onPress` handlers for not-yet-built screens (Apartment Name, Address, Billing day, Late fee, Quiet hours, App lock, Backup screens) — keep `onPress={() => {}}` placeholders. Engineer notes the TODO with `// FIXME(v2): route to <screen>` per CLAUDE.md "no bare TODOs".
- Building the underlying screens those rows route to — separate specs.
- Building a custom Toggle to replace RN `Switch` — defer until a 2nd consumer needs it (KISS).
- Adding a `chevron` SVG primitive — `Ionicons` is fine.
- Changing the section grouping or order — keep the 6 sections (Apartment, Billing defaults, Notifications, Security, Data, About) exactly as listed.
- Migrating the `SectionHeader` helper component — `SettingsSectionLabel` is a local one-off; not promoted to `components/ui/`.
- Renaming `Avatar` if spec 13 hasn't shipped — use the symbol available; rename later.

---

## 9. Open questions / verification

1. **Chevron stroke weight.** Migration prompt says `10×10 stroke-width 2.5`; spec uses Ionicons `chevron-forward` 16px which is the existing project convention. Compare to reference screenshot during smoke test — if the chevron looks heavier than reference, swap to a custom SVG.
2. **Section label color.** Spec uses `text-text-secondary`. If the reference shows it darker (closer to muted), swap to `text-text-muted`.
3. **Switch styling.** Native RN `Switch` looks slightly different per platform. If the reference shows a custom toggle (rounder thumb, different track), engineer should build a `Toggle` primitive — but defer until reference confirms divergence.
4. **Profile header tap behavior.** Spec leaves it non-tappable. If the design intends it to navigate to "Edit Profile", add `onPress` to the View wrapper (turn into Pressable).
