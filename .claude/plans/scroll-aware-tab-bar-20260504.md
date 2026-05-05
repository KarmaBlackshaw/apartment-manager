# Plan: Scroll-aware Tab Bar (hide on scroll-down, show on scroll-up)

## Goal
Hide the custom `FloatingTabBar` when the user scrolls a tab screen downward and reveal it when scrolling upward, so submit buttons (e.g., "Add Tenant") are not obscured. Behavior must apply globally to every screen rendered under `app/(admin)/_layout.tsx`.

## Approach
Option A — Custom `useScrollDirection` hook + Context with `Animated.Value` (built-in RN `Animated` API, zero new deps).

## Steps

### Step 1 [low] — Add `TabBarVisibilityContext`
New file: `/Users/admin/Documents/personal/apartment-manager/context/TabBarVisibilityContext.tsx`
- Exports `TabBarVisibilityProvider` (holds a stable `Animated.Value` initialized to `1` = visible)
- Exports `useTabBarVisibility()` returning `{ visibility: Animated.Value, setVisible(v: boolean): void }`
- `setVisible` calls `Animated.timing(value, { toValue: v ? 1 : 0, duration: 200, useNativeDriver: true }).start()`
- Use `useRef` for `Animated.Value`; memoize context value

Verify: `npx tsc --noEmit`

---

### Step 2 [low] — Wrap admin tab tree with provider
File: `/Users/admin/Documents/personal/apartment-manager/app/(admin)/_layout.tsx`
- Import `TabBarVisibilityProvider`
- Wrap existing `<Tabs … />` in `<TabBarVisibilityProvider>…</TabBarVisibilityProvider>`
- Keep `screenOptions.contentStyle.paddingBottom: 88` unchanged

Verify: `npx tsc --noEmit`

---

### Step 3 [med] — Animate `FloatingTabBar` via `Animated.View`
File: `/Users/admin/Documents/personal/apartment-manager/components/admin/FloatingTabBar.tsx`
- Replace root `<View>` with `<Animated.View>`
- Call `const { visibility } = useTabBarVisibility()`
- `translateY = visibility.interpolate({ inputRange: [0, 1], outputRange: [120, 0] })`
- Apply `transform: [{ translateY }]` and `opacity: visibility` to root view
- Bind `pointerEvents` via `visibility.addListener` (disable when value ≤ 0.05); clean up listener in `useEffect`

Verify: `npx tsc --noEmit`

---

### Step 4 [med] — Add `useTabBarScrollHandler` hook
New file: `/Users/admin/Documents/personal/apartment-manager/hooks/useTabBarScrollHandler.ts`
- Export `useTabBarScrollHandler(threshold = 8)` returning `{ onScroll, scrollEventThrottle: 16 }`
- Track `lastY` in `useRef`; on scroll:
  - `y <= 0` → `setVisible(true)`
  - `y - lastY > threshold` → `setVisible(false)`
  - `lastY - y > threshold` → `setVisible(true)`
- Dedup via direction ref to avoid restarting `Animated.timing` on every frame
- Calls `useTabBarVisibility()` internally
- Use `useFocusEffect` to call `setVisible(true)` on screen focus (so bar never stays hidden between tab switches)

Verify: `npx tsc --noEmit`

---

### Step 5 [low] — Wire into Add Tenant form
File: `/Users/admin/Documents/personal/apartment-manager/app/(admin)/tenants/new.tsx`
- Import and call `useTabBarScrollHandler()`
- Spread onto `<ScrollView>`: `{...tabBarScroll}`
- Change `contentContainerClassName="p-4"` → `"p-4 pb-32"` (ensures button clears bar at rest)

Verify: `npx tsc --noEmit` then manually test — scroll down → bar hides → "Add Tenant" visible; scroll up → bar returns.

---

### Step 6 [low] — Apply handler to all other admin scroll surfaces
Apply `useTabBarScrollHandler` spread + `pb-32` bottom padding to:
- `app/(admin)/index.tsx:104` — ScrollView
- `app/(admin)/settings.tsx:53` — ScrollView (bump `paddingBottom: 16` → `96`)
- `app/(admin)/tenants/index.tsx:49` — FlatList
- `app/(admin)/tenants/[id].tsx:119` — ScrollView
- `app/(admin)/properties/index.tsx:21` — FlatList
- `app/(admin)/properties/new.tsx:32` — ScrollView
- `app/(admin)/properties/[id].tsx:67` — ScrollView
- `app/(admin)/properties/[propertyId]/units/*` — apply to each ScrollView/FlatList found
- `app/(admin)/billing/index.tsx:37` — FlatList
- `app/(admin)/billing/new.tsx:161` — ScrollView
- `app/(admin)/billing/[id].tsx:85` — ScrollView

Verify: `npx tsc --noEmit` then walk each tab — confirm bar hides/shows on every screen.

---

### Step 7 [low] — Final typecheck + lint
```
cd /Users/admin/Documents/personal/apartment-manager && npx tsc --noEmit
```

---

## Risks
- **Animation jank**: `useNativeDriver: true` on `transform`+`opacity` = GPU-driven, fine at `scrollEventThrottle: 16`.
- **pointerEvents race**: `>0.05` deadband disables taps just before fully hidden.
- **FlatList**: `onScroll`/`scrollEventThrottle` accepted natively — no warnings expected.
- **Keyboard + form**: `pb-32` ensures submit button clears bar even with `KeyboardAvoidingView behavior="padding"`.

## Out of scope
- `react-native-reanimated` migration
- Non-admin routes (`lock.tsx`, `setup-pin.tsx`)
- Test files

## Suggestion
Per-screen "spread `onScroll` + bump bottom padding" recurs across ~12 screens. Consider a thin `<TabAwareScrollView>` / `<TabAwareFlatList>` wrapper in `components/ui/` that bakes in the hook + default `pb-32`.
