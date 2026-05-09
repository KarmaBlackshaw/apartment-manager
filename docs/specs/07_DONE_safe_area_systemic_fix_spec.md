# Safe-Area Systemic Fix — Stop the Recurrence

**Trigger:** User reported (again) that Add Property's title overlaps the Android status bar — the same class of bug that has been hit "since ever." Permanent fix required.

**Audience:** Engineer agent.
**Skills consulted:** `using-superpowers`, existing memory `feedback_safe_area_status_bar.md`.

---

## 0. TL;DR

The recurring safe-area bug has **one root cause**: `components/ui/ScreenView.tsx` uses manual `paddingTop: insets.top` from `useSafeAreaInsets()`. Per the project's own memory entry, this is **the documented anti-pattern** — it returns 0 on Android edge-to-edge mode, so content lands under the status bar.

The fix is **one file rewrite** (`ScreenView.tsx`). Every screen using `ScreenView` is patched at the primitive level. No consumer changes needed.

Plus: migrate `properties/new.tsx` (the screen in the screenshot) to `ScreenLayout` for consistency, since it's the only `ScreenView edges={['bottom']}` consumer that doesn't pair with a guaranteed native header.

## Agent prompt

```
Implement docs/specs/07_safe_area_systemic_fix_spec.md exactly.

Root cause: ScreenView used manual paddingTop:insets.top, which
returns 0 on Android edge-to-edge mode.

Read first:
1. docs/specs/07_safe_area_systemic_fix_spec.md (source of truth)
2. docs/specs/04_double_header_audit_and_fix_spec.md (incorporated
   in step 2 of this spec)
3. CLAUDE.md "Safe Area" section (will be replaced)

Execute §5 in order — 9 steps:
  1. Rewrite components/ui/ScreenView.tsx to use <SafeAreaView
     edges={...}> from react-native-safe-area-context. Drop
     useSafeAreaInsets import.
  2. Patch layouts/ScreenLayout.tsx with <Stack.Screen options={{
     headerShown: false }} /> if not already done (spec 04 fix).
  3. Rewrite app/(admin)/properties/new.tsx to wrap in
     <ScreenLayout title="Add Property"
     backHref="/(admin)/properties">. Drop the inline "Property
     Details" subheading.
  4. Edit properties/_layout.tsx — drop headerShown: true from
     the new route.
  5. Replace CLAUDE.md "Safe Area" section with §4.1 content.
  6. Update memory file feedback_safe_area_status_bar.md per §4.2.
  7. Run grep audit per §4.3 — only primitives may call
     useSafeAreaInsets.
  8. `npx tsc --noEmit` clean.
  9. Smoke test on Android (Pixel) + iOS — title below status bar.

Constraints:
- Do NOT commit.
- No raw hex; no <Text> from react-native; use <AppText>.

Verify §6 acceptance (10 items). ~30 min.

After verification passes, mark this spec done:
  git mv docs/specs/07_safe_area_systemic_fix_spec.md docs/specs/07_DONE_safe_area_systemic_fix_spec.md
```

---

## 1. Root cause

```tsx
// components/ui/ScreenView.tsx — CURRENT (broken on Android edge-to-edge)
const insets = useSafeAreaInsets()
return (
  <View
    style={[
      {
        backgroundColor: colors.background,
        paddingTop: edges.includes('top') ? insets.top : undefined,
        paddingBottom: edges.includes('bottom') ? insets.bottom : undefined,
      },
      style,
    ]}
  >
    {children}
  </View>
)
```

This is **the exact pattern** that `feedback_safe_area_status_bar.md` (saved 2025) warned against:

> Never use `paddingTop: insets.top` (from `useSafeAreaInsets()`) to clear the status bar on Android. This returns 0 or an incorrect value in Android edge-to-edge mode, causing content to render behind the status bar.

The fix was applied to `ScreenHeader.tsx` at the time but **`ScreenView.tsx` was missed**. Every consumer of `ScreenView` that lacks a native-header fallback has been silently broken on Android since.

### Why Add Property surfaces it

1. `app/(admin)/properties/new.tsx` wraps in `<ScreenView edges={['bottom']}>` — relies on the native stack header to pad the top.
2. `app/(admin)/properties/_layout.tsx` sets `headerShown: true` + `presentation: 'modal'` for the `new` route.
3. On **Android `presentation: 'modal'`**, the native stack header is unreliable — sometimes hidden, sometimes flat. (iOS modal renders a header; Android does not, by default.)
4. With no native header AND no top safe-area padding from `ScreenView` (manual insets returning 0), the in-body `<AppText variant="subheading">Property Details</AppText>` lands at y=0 — under the status bar.

### Why this keeps recurring

| Reason | Why |
|---|---|
| The known rule was only applied to `ScreenHeader` | `ScreenView`, the wrapper used by **every** screen, was never fixed. |
| `useSafeAreaInsets` is still imported in screen files | Memory rule wasn't enforced beyond the one fix. Manual `insets.top` keeps appearing. |
| Two header patterns coexist | Native stack header vs. custom in-body header. When the wrong combination is used, the bug surfaces. |
| No automated check | Grep would catch `useSafeAreaInsets` calls outside primitives in seconds. Never run. |
| The rule lives in a memory file | Easy to miss when implementing a new screen. Belongs in `CLAUDE.md`. |

---

## 2. The fix

### 2.1 Rewrite `components/ui/ScreenView.tsx`

```tsx
import React from 'react'
import { ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '~/constants/theme'

type Edge = 'top' | 'bottom'

interface ScreenViewProps {
  children: React.ReactNode
  /**
   * Which edges to apply safe-area inset.
   * - With `ScreenLayout`: `['bottom']` (top is owned by `ScreenHeader`).
   * - Standalone (lock, onboarding, modals without `ScreenLayout`): default `['top', 'bottom']`.
   */
  edges?: Edge[]
  className?: string
  style?: ViewStyle
}

export function ScreenView({
  children,
  edges = ['top', 'bottom'],
  className,
  style,
}: ScreenViewProps) {
  return (
    <SafeAreaView
      edges={edges}
      className={`flex-1${className ? ` ${className}` : ''}`}
      style={[{ backgroundColor: colors.background }, style]}
    >
      {children}
    </SafeAreaView>
  )
}
```

**Diff in essence:**
- Replace `<View>` + manual `paddingTop`/`paddingBottom` with `<SafeAreaView edges={...}>` from `react-native-safe-area-context`.
- Remove `useSafeAreaInsets()` import — no longer needed.
- Behavior identical on iOS; **fixes Android edge-to-edge**.

### 2.2 Migrate `properties/new.tsx` to `ScreenLayout`

Per the screenshot, the screen also has redundant chrome — the in-body "Property Details" subheading + the native stack header title both want to label the screen. Consolidate via `ScreenLayout`:

```tsx
import { ScreenLayout } from '~/layouts/ScreenLayout'

return (
  <ScreenLayout title="Add Property" backHref="/(admin)/properties">
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <ScrollView contentContainerClassName="px-4 pt-3 pb-[88px]" {...tabBarScroll}>
        {/* Drop the redundant "Property Details" subheading — the header IS the title */}
        <Input label="Property Name" value={name} … />
        <Input label="Address" value={address} … />
        <Input label="Description (optional)" … />
        <Button label="Create Property" onPress={handleSubmit} loading={isPending} className="mt-4" />
      </ScrollView>
    </KeyboardAvoidingView>
  </ScreenLayout>
)
```

Plus update `properties/_layout.tsx`: drop `headerShown: true` from the `new` route (the migration to `ScreenLayout` makes it irrelevant; combined with spec 04's fix to `ScreenLayout`, the native header is suppressed automatically).

### 2.3 Apply spec 04's `ScreenLayout` self-suppression

If spec 04 (`04_double_header_audit_and_fix_spec.md`) hasn't been implemented yet, apply its §2 fix in the same PR:

```tsx
// layouts/ScreenLayout.tsx
import { Stack } from 'expo-router'

return (
  <ScreenView edges={['bottom']}>
    <Stack.Screen options={{ headerShown: false }} />     {/* ← add this */}
    <ScreenHeader title={title ?? ''} … />
    {children}
  </ScreenView>
)
```

Without this, migrating `properties/new.tsx` to `ScreenLayout` will produce two headers (the spec 04 bug). The two fixes ship together.

---

## 3. Audit — what else is at risk

```
ScreenView consumers (10 screens):
  app/onboarding.tsx                       edges={'top','bottom'} default       ✅ fixed by §2.1
  app/lock.tsx                              edges={'top','bottom'} default       ✅ fixed by §2.1
  app/(admin)/settings/index.tsx            edges={'top','bottom'} default       ✅ fixed by §2.1
  app/(admin)/notifications.tsx             edges={'top','bottom'} default       ✅ fixed by §2.1
  app/(admin)/settings/general.tsx          edges={'top','bottom'} default       ✅ fixed by §2.1
  app/(admin)/settings/security.tsx         edges={'top','bottom'} default       ✅ fixed by §2.1
  app/(admin)/settings/rates.tsx            edges={'top','bottom'} default       ✅ fixed by §2.1
  app/(admin)/payments/index.tsx            edges={'top','bottom'} default       ✅ fixed by §2.1
  app/(admin)/properties/new.tsx            edges={'bottom'} only                ⚠️ migrate to ScreenLayout (§2.2)
  layouts/ScreenLayout.tsx                  edges={'bottom'} only — by design   ✅ fixed by §2.1 + spec 04
```

**Conclusion:** every `ScreenView` consumer benefits from §2.1 automatically. Only `properties/new.tsx` needs a code change beyond the primitive rewrite, because it uses `edges={['bottom']}` without the matching `ScreenLayout` (`ScreenHeader` provides the top inset). The rest already let `ScreenView` handle both edges.

---

## 4. Prevention — make recurrence impossible

### 4.1 New CLAUDE.md rule (replace existing "Safe Area" section)

Find the existing "Safe Area" section in CLAUDE.md and **replace** with:

> ### Safe area
>
> Always wrap screen content in `<ScreenView>` from `components/ui`. It uses
> `<SafeAreaView edges={...}>` from `react-native-safe-area-context` internally —
> no manual inset math required.
>
> ```tsx
> // Screen with ScreenLayout (default — header owns top inset):
> <ScreenLayout title="…">
>   {/* content */}
> </ScreenLayout>
>
> // Standalone (lock, onboarding, modals with no ScreenLayout):
> <ScreenView>          {/* edges defaults to ['top','bottom'] */}
>   {/* content */}
> </ScreenView>
> ```
>
> **Forbidden:**
> - `useSafeAreaInsets()` in screen files. The hook is only acceptable inside
>   primitives (`ScreenView`, `ScreenHeader`, `BottomCTABar`). If you find
>   yourself reaching for it in `app/**/*.tsx`, you are doing it wrong — wrap in
>   `ScreenView` or `ScreenLayout` instead.
> - `paddingTop: insets.top` / `paddingBottom: insets.bottom` anywhere. Manual
>   inset math is unreliable on Android edge-to-edge (returns 0). Use
>   `<SafeAreaView edges={...}>` always.
> - `<SafeAreaView>` from `react-native` (the deprecated one). Always import from
>   `react-native-safe-area-context`.
>
> **Rule of thumb:** if a screen does not use `ScreenLayout`, it must wrap in
> `<ScreenView>` (default `edges`). Both edges are handled.

### 4.2 Update memory entry

Replace `feedback_safe_area_status_bar.md` content:

```markdown
---
name: Safe area — use ScreenView/ScreenLayout, never manual insets
description: ScreenView wraps SafeAreaView from rnsac. Never useSafeAreaInsets() in screens. Bug recurred 2026-05-08 because ScreenView used manual paddingTop until then.
type: feedback
---

`<ScreenView>` (in `components/ui`) handles top + bottom safe-area via `<SafeAreaView edges={...}>` from `react-native-safe-area-context`. Every screen wraps in `ScreenView` (or `ScreenLayout`, which wraps `ScreenView`).

**Why:** Manual `paddingTop: insets.top` from `useSafeAreaInsets()` returns 0 on Android edge-to-edge mode, causing content to render under the status bar. This bug has recurred multiple times because `ScreenView` itself originally used manual insets — fixed 2026-05-08 in spec `07_safe_area_systemic_fix_spec.md`.

**How to apply:**
- New screen: wrap in `<ScreenLayout>` (preferred) or `<ScreenView>` (standalone).
- Never call `useSafeAreaInsets()` outside the primitives `ScreenView` / `ScreenHeader` / `BottomCTABar`. If a screen file imports it, that's a bug.
- Never write `paddingTop: insets.top` or `paddingBottom: insets.bottom` anywhere.
- Always import `SafeAreaView` from `react-native-safe-area-context`, never from `react-native`.
- The full rule lives in CLAUDE.md "Safe area" section.
```

Update `MEMORY.md` line:
```
- [Safe area — use ScreenView/ScreenLayout, never manual insets](feedback_safe_area_status_bar.md) — ScreenView wraps SafeAreaView; useSafeAreaInsets in screens is forbidden.
```

### 4.3 Audit grep (run as part of step 5)

After the migration, run:

```bash
grep -rn "useSafeAreaInsets\|paddingTop:\s*insets\.top\|paddingBottom:\s*insets\.bottom" app/ components/ layouts/ 2>/dev/null
```

Expected results: **only** primitives (`ScreenView`, `ScreenHeader`, `BottomCTABar` if it survives spec 06). Any hit in `app/**` is a bug to fix.

If the grep returns clean today, lock it in: future PRs that introduce a new `useSafeAreaInsets` import to a screen file should be rejected by reviewer (or, eventually, by a custom ESLint rule).

### 4.4 Lint rule (optional, defer)

If the bug recurs again, add a custom ESLint rule banning `useSafeAreaInsets` imports outside `components/ui/Screen*` and `components/ui/BottomCTABar`. Until then, manual review + the CLAUDE.md rule is enough. **Do not build the lint rule preemptively** — KISS.

---

## 5. Implementation steps (one PR)

| # | Task | Complexity | Files |
|---|---|---|---|
| 1 | Rewrite `ScreenView` per §2.1 — switch to `<SafeAreaView edges={...}>` | XS | `components/ui/ScreenView.tsx` |
| 2 | Apply spec 04's `<Stack.Screen options={{ headerShown: false }}>` fix to `ScreenLayout` (if not already done) | XS | `layouts/ScreenLayout.tsx` |
| 3 | Migrate `properties/new.tsx` to `ScreenLayout` per §2.2 — drop the inline "Property Details" heading | S | `app/(admin)/properties/new.tsx` |
| 4 | Drop `headerShown: true` from `properties/_layout.tsx` `new` route | XS | `app/(admin)/properties/_layout.tsx` |
| 5 | Replace CLAUDE.md "Safe Area" section per §4.1 | XS | `CLAUDE.md` |
| 6 | Update memory file `feedback_safe_area_status_bar.md` per §4.2; update `MEMORY.md` index line | XS | memory + index |
| 7 | Run audit grep per §4.3; fix any unexpected hits | S | various if found |
| 8 | `npx tsc --noEmit` clean | XS | — |
| 9 | Smoke test on Android (Pixel emulator) — open Add Property; confirm title is below status bar, not under it. Repeat on iOS to confirm no regression | M | — |

**Estimate:** ~30 minutes.

---

## 6. Acceptance criteria

- [ ] `components/ui/ScreenView.tsx` uses `<SafeAreaView edges={...}>` from `react-native-safe-area-context`. No `useSafeAreaInsets()` import.
- [ ] `layouts/ScreenLayout.tsx` emits `<Stack.Screen options={{ headerShown: false }} />`.
- [ ] `app/(admin)/properties/new.tsx` uses `<ScreenLayout title="Add Property">`. No in-body "Property Details" heading.
- [ ] `app/(admin)/properties/_layout.tsx` does not set `headerShown: true` on `new`.
- [ ] CLAUDE.md "Safe area" section matches §4.1 verbatim. The forbidden list explicitly bans `useSafeAreaInsets` in screen files.
- [ ] Memory file updated; `MEMORY.md` index line refreshed.
- [ ] Grep returns no `useSafeAreaInsets` / `paddingTop: insets.top` / `paddingBottom: insets.bottom` outside `components/ui/Screen*` or `BottomCTABar`.
- [ ] Add Property on Android emulator: title is below the status bar, not overlapping.
- [ ] Add Property on iOS simulator: visually unchanged from before (no regression).
- [ ] `npx tsc --noEmit` clean.

---

## 7. Why this is the last time we hit this

Three layers of prevention:

1. **Code-level fix** — `ScreenView` is now correct at the primitive. Every consumer benefits without changing.
2. **Banned anti-pattern** — `useSafeAreaInsets` in screens is forbidden in CLAUDE.md. Any future regression is a reviewer-catchable PR comment, not a silent ship.
3. **Audit grep** — one shell command verifies the rule. Run it any time the question comes up.

If this still recurs, the root cause is no longer technical — it's process. At that point, build the ESLint rule (§4.4). Until then, the §2.1 rewrite + the CLAUDE.md ban is enough.
