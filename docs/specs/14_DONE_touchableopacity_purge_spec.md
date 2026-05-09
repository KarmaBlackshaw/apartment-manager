# `TouchableOpacity` → `Pressable` Purge

## TL;DR

`TouchableOpacity` is legacy on Expo SDK 54+. The project convention (per spec 03 §2.2 and the engineering rules) is `Pressable` with Reanimated for press feedback. Audit found **~50 occurrences** across 13+ screens.

This spec migrates every `TouchableOpacity` to `<Pressable>` with consistent press behavior (Reanimated scale 0.97 / 100ms in / 150ms out, identical to `Button`, `ChipBar`, `UnitGridCard`, etc.).

**Bulk find-replace + visual verification.** No new components.

## Agent prompt

```
Implement docs/specs/14_touchableopacity_purge_spec.md exactly.

Read first:
1. docs/specs/14_touchableopacity_purge_spec.md (source of truth)
2. CLAUDE.md "Tech Stack" + "Engineering Discipline"

Audit current state:
  grep -rn "TouchableOpacity" app/ components/ layouts/

For each occurrence, classify per §3.3 decision rule:
  - Icon-only header button → <Pressable hitSlop={8}> (no animation)
  - List row → <Pressable> (nav transition is the feedback)
  - Card-style tappable → <AnimatedPressable> with scale-on-press (§3.2)
  - Primary CTA → replace with the existing <Button> component

While editing, also fix:
  - Inline style={{...}} → NativeWind className
  - accessibilityLabel on icon-only Pressables
  - Drop TouchableOpacity from react-native imports

Run `npx tsc --noEmit`. Verify §6 acceptance via audit grep — must
return empty. Smoke test: tap every previously-TO surface; no
missing affordance. ~60 min. Do NOT commit.

After verification passes, mark this spec done:
  git mv docs/specs/14_touchableopacity_purge_spec.md docs/specs/14_DONE_touchableopacity_purge_spec.md
```

---

## 1. Why

| Reason | Detail |
|---|---|
| `Pressable` is the canonical RN API | `TouchableOpacity` predates Pressable; new code on Expo 54+ uses Pressable. |
| Project consistency | All recently-built primitives use `Pressable` + Reanimated. Mixing both styles produces inconsistent press feedback (TO uses default opacity dim; Pressable uses scale animation). |
| Engineering rules | CLAUDE.md "Tech Stack" implies NativeWind + modern primitives. `TouchableOpacity` is the only React Native primitive without native NativeWind support and no Reanimated integration by default. |

## 2. Audit (current state)

```bash
grep -rn "TouchableOpacity" app/ components/ layouts/
```

Approximately **50 hits across 13+ screens**, including:
- `app/lock.tsx`
- `app/setup-pin.tsx`
- `app/(admin)/properties/[propertyId]/index.tsx` — partly addressed by spec 09
- `app/(admin)/properties/[propertyId]/units/[id]/index.tsx` — addressed by spec 03
- `app/(admin)/properties/[propertyId]/units/[id]/documents.tsx`
- `app/(admin)/billing/[id].tsx`
- `app/(admin)/billing/payments/[id].tsx`
- Various `components/` files

Exact list: run the grep above.

## 3. Migration pattern

### 3.1 Static (no press animation needed)

Where `TouchableOpacity` is used as a tappable wrapper without animation:

```tsx
// BEFORE
<TouchableOpacity onPress={...} style={{ padding: 8 }}>
  <Ionicons name="close" />
</TouchableOpacity>

// AFTER
<Pressable onPress={...} className="p-2" hitSlop={8}>
  <Ionicons name="close" />
</Pressable>
```

`Pressable`'s default has no visual feedback — that's fine for headers, list rows, etc. where the navigation transition itself signals the press.

### 3.2 With press animation (cards, primary CTAs)

Where the original used `activeOpacity={0.7}` or similar to dim on press, replace with the project's standard scale-on-press:

```tsx
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { Pressable } from 'react-native'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

function Component(...) {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <AnimatedPressable
      style={animatedStyle}
      onPressIn={() => { scale.value = withTiming(0.97, { duration: 100 }) }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 150 }) }}
      onPress={...}
      className="..."
    >
      ...
    </AnimatedPressable>
  )
}
```

**Use this pattern only on cards / large tap targets** — not on every icon button. Animating every press is noisy.

### 3.3 Decision rule (fast)

| Original element | After migration |
|---|---|
| Icon-only header button (close, back, edit) | `<Pressable hitSlop={8}>` — no animation |
| List row (already nav-pushes) | `<Pressable>` — no animation; nav transition is the feedback |
| Card-style tappable (KPICard after spec 12, UnitGridCard, BillCard) | `<AnimatedPressable>` with scale (§3.2) |
| Primary CTA button | Already covered by `<Button>` component — replace inline `<TouchableOpacity>` "buttons" with the actual `<Button>` component |

## 4. Engineering rules paired with this purge

While editing, also fix:
- **Inline `style={{ ... }}`** → NativeWind `className`. (`style={{ padding: 8 }}` → `className="p-2"`)
- **Raw hex** → `colors.*` (covered by spec 15; if seen during this purge, fix it).
- **`accessibilityLabel`** on icon-only Pressables.

## 5. Implementation steps

| # | Task | Complexity |
|---|---|---|
| 1 | List all `TouchableOpacity` occurrences via grep | XS |
| 2 | For each file, classify per §3.3 (static / animated / replace with `<Button>`) | S |
| 3 | Apply migration; remove `TouchableOpacity` from `react-native` imports | M |
| 4 | Add `accessibilityLabel` to icon-only Pressables | S |
| 5 | `npx tsc --noEmit` clean | XS |
| 6 | Smoke test: tap every previously-TO surface — close buttons, header actions, list rows. Ensure feedback feels right (no missing affordance) | M |

**Estimate:** ~60 minutes (50 occurrences × ~1 min each + smoke test).

## 6. Acceptance

- [ ] `grep -rn "TouchableOpacity" app/ components/ layouts/` returns empty.
- [ ] No regression: every previously-tappable surface still taps.
- [ ] Card-level Pressables have scale-on-press; icon buttons don't (noise reduction).
- [ ] Icon-only Pressables have `accessibilityLabel`.
- [ ] `tsc --noEmit` clean.

## 7. Out of scope

- Replacing legitimate uses of `Touchable*` variants (`TouchableHighlight`, `TouchableWithoutFeedback`) — only `TouchableOpacity` in this spec.
- Refactoring tap behavior (e.g. long-press, drag) — separate concern.
- Adding a `<TapCard>` wrapper component to encapsulate the AnimatedPressable pattern — defer until a 3rd consumer asks; KISS.
