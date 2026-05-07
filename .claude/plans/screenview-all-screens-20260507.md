# Plan: Refactor screens to use `ScreenView` wrapper

## Goal
Replace ad-hoc root containers (`View`, `SafeAreaView`, manually-padded `KeyboardAvoidingView`) and manual `useSafeAreaInsets()` calls across all Expo Router screens with the new `ScreenView` component, standardizing safe-area handling.

## Context
- `ScreenView` lives at `components/ui/ScreenView.tsx`. Applies `flex-1 bg-app` and conditionally pads `top`/`bottom` insets via `edges` prop (default `['top','bottom']`).
- Already exported via `components/ui/index.ts`.
- Two distinct treatments:
  - Screens with native stack `AppHeader` → `edges={['bottom']}` (top inset belongs to the header).
  - Screens without `AppHeader` (lock, onboarding, custom) → default `edges` (`['top','bottom']`).

## Steps

### Group A — Plain `<View className="flex-1 bg-...">` root with AppHeader (no insets hook)

### Step 1 [low] — Billing plain-View screens
**Files:**
- `app/(admin)/billing/[id].tsx`
- `app/(admin)/billing/generate.tsx`
- `app/(admin)/billing/index.tsx`
- `app/(admin)/billing/payments/[id].tsx`
- `app/(admin)/billing/utility.tsx`

Replace root `<View className="flex-1 bg-background">…</View>` with `<ScreenView edges={['bottom']}>…</ScreenView>`. Add `ScreenView` to the existing `components/ui` import.

Verify: `npx tsc --noEmit`

---

### Step 2 [low] — Properties plain-View screens
**Files:**
- `app/(admin)/properties/[propertyId]/index.tsx`
- `app/(admin)/properties/[propertyId]/units/[id]/documents.tsx`
- `app/(admin)/properties/[propertyId]/units/[id]/index.tsx`
- `app/(admin)/properties/[propertyId]/units/index.tsx`
- `app/(admin)/properties/index.tsx`

Replace root `<View className="flex-1 bg-app">…</View>` with `<ScreenView edges={['bottom']}>…</ScreenView>`. Add `ScreenView` to existing `components/ui` import.

Verify: `npx tsc --noEmit`

---

### Step 3 [low] — Reports plain-View screens
**Files:**
- `app/(admin)/reports/annual-summary.tsx`
- `app/(admin)/reports/deposit-summary.tsx`
- `app/(admin)/reports/index.tsx`
- `app/(admin)/reports/maintenance-costs.tsx`
- `app/(admin)/reports/monthly-collection.tsx`
- `app/(admin)/reports/occupancy.tsx`
- `app/(admin)/reports/outstanding-balances.tsx`
- `app/(admin)/reports/per-unit-income.tsx`

Replace root `<View className="flex-1 bg-background">…</View>` with `<ScreenView edges={['bottom']}>…</ScreenView>`. Add `ScreenView` to existing `components/ui` import.

Verify: `npx tsc --noEmit`

---

### Step 4 [low] — `tenants/index.tsx` inline-style View root
**File:** `app/(admin)/tenants/index.tsx`

Replace `<View style={{ flex: 1, backgroundColor: colors.background }}>…</View>` with `<ScreenView edges={['bottom']}>…</ScreenView>`. Leave the `colors` import if still used elsewhere in the file.

Verify: `npx tsc --noEmit`

---

### Step 5 [low] — Fragment-rooted admin screens (with AppHeader)
**Files:**
- `app/(admin)/index.tsx`
- `app/(admin)/settings/units/index.tsx`

Wrap the Fragment's children with `<ScreenView edges={['bottom']}>…</ScreenView>` (drop the outer Fragment). Keep `<Stack.Screen …/>` as the first child of ScreenView (safe inside a View in Expo Router).

Verify: `npx tsc --noEmit`

---

### Step 6 [med] — KAV-rooted form screens (with AppHeader)
**Files:**
- `app/(admin)/billing/new.tsx`
- `app/(admin)/properties/[propertyId]/edit.tsx`
- `app/(admin)/properties/[propertyId]/units/new.tsx`
- `app/(admin)/properties/new.tsx`
- `app/(admin)/settings/units/new.tsx`

Wrap the existing `<KeyboardAvoidingView …>` tree in `<ScreenView edges={['bottom']}>…</ScreenView>`. On the KAV, strip `bg-app`/`bg-background` from className (ScreenView provides it); add `className="flex-1"` if not already there. Preserve `behavior` and `keyboardVerticalOffset` props.

Verify: `npx tsc --noEmit`

---

### Step 7 [low] — Tenant detail `SafeAreaView edges={['bottom']}` screens
**Files:**
- `app/(admin)/tenants/[id]/documents.tsx`
- `app/(admin)/tenants/[id]/index.tsx`
- `app/(admin)/tenants/[id]/move-out.tsx`
- `app/(admin)/tenants/[id]/payment-history.tsx`

Replace `<SafeAreaView edges={['bottom']} className="flex-1 bg-background">…</SafeAreaView>` with `<ScreenView edges={['bottom']}>…</ScreenView>`. Remove `SafeAreaView` from the `react-native-safe-area-context` import (delete import line if it becomes empty). Add `ScreenView` to existing `components/ui` import.

Verify: `npx tsc --noEmit`

---

### Step 8 [med] — `tenants/new.tsx` (KAV wrapping SafeAreaView)
**File:** `app/(admin)/tenants/new.tsx`

Wrap with `<ScreenView edges={['bottom']}>` outside the existing KAV. Remove the inner `<SafeAreaView edges={['top']}>…</SafeAreaView>` (AppHeader provides top inset; ScreenView provides bottom). Strip `SafeAreaView` from the safe-area-context import. Keep KAV with `className="flex-1"`, drop `bg-*`.

Verify: `npx tsc --noEmit`

---

### Step 9 [med] — `billing/receipt.tsx` (has `useSafeAreaInsets`)
**File:** `app/(admin)/billing/receipt.tsx`

Replace root `<View className="flex-1 bg-background">…</View>` with `<ScreenView edges={['bottom']}>…</ScreenView>`. Audit every `insets.` reference: if only used for root top/bottom padding, remove the hook call and its import. If `insets.bottom` still feeds a sticky element inside content, keep the hook but remove the redundant root-level padding.

Verify: `npx tsc --noEmit`

---

### Group H — Screens WITHOUT AppHeader (default edges)

### Step 10 [low] — `notifications.tsx` Fragment root (no AppHeader)
**File:** `app/(admin)/notifications.tsx`

Wrap the Fragment's children with `<ScreenView>…</ScreenView>` (default `edges=['top','bottom']`). Keep `<Stack.Screen …/>` as first child of ScreenView.

Verify: `npx tsc --noEmit`

---

### Step 11 [med] — `payments/index.tsx` (manual `paddingTop: insets.top`)
**File:** `app/(admin)/payments/index.tsx`

Replace `<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>…</View>` with `<ScreenView>…</ScreenView>` (default edges). Remove `useSafeAreaInsets` hook call and import if no longer used.

Verify: `npx tsc --noEmit`

---

### Step 12 [med] — Settings KAV screens (no AppHeader)
**Files:**
- `app/(admin)/settings/general.tsx`
- `app/(admin)/settings/rates.tsx`

Wrap `<KeyboardAvoidingView …>` in `<ScreenView>…</ScreenView>`. On the KAV, drop `flex: 1, backgroundColor: '#0d0d0d'` from inline style; add `className="flex-1"`. Preserve `behavior`.

Verify: `npx tsc --noEmit`

---

### Step 13 [med] — `settings/security.tsx` (ScrollView root, no AppHeader)
**File:** `app/(admin)/settings/security.tsx`

Wrap root `<ScrollView style={{ flex: 1, backgroundColor: '#0d0d0d' }}>` in `<ScreenView>…</ScreenView>`. Drop `flex: 1, backgroundColor` from ScrollView style; add `className="flex-1"` if not present.

Verify: `npx tsc --noEmit`

---

### Step 14 [high] — `settings/index.tsx` (ScrollView with inset arithmetic)
**File:** `app/(admin)/settings/index.tsx`

Wrap the root `<ScrollView>` in `<ScreenView>…</ScreenView>`. In ScrollView's `contentContainerStyle`, change `paddingTop: insets.top + spacing[5]` → `paddingTop: spacing[5]` (ScreenView now handles the top inset). Remove `useSafeAreaInsets` call and import if no remaining consumers.

Verify: `npx tsc --noEmit`

---

### Step 15 [med] — `app/lock.tsx` (manual top+bottom insets)
**File:** `app/lock.tsx`

Replace `<View className="flex-1 bg-app" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>…</View>` with `<ScreenView>…</ScreenView>`. Remove `useSafeAreaInsets` call and import if unused.

Verify: `npx tsc --noEmit`

---

### Step 16 [med] — `app/onboarding.tsx` (KAV root, no AppHeader)
**File:** `app/onboarding.tsx`

Wrap `<KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }}>` in `<ScreenView>…</ScreenView>`. Drop `flex: 1, backgroundColor` from KAV style; add `className="flex-1"`. Preserve `behavior` and any offset.

Verify: `npx tsc --noEmit`

---

### Step 17 [low] — Final typecheck
Run `npx tsc --noEmit` across the full repo and resolve any stragglers.

Verify: `npx tsc --noEmit`

## Risks
- **Stack.Screen in View**: placing `<Stack.Screen>` inside a View is supported in Expo Router (render-time options registrar). No visual diff.
- **Removing `useSafeAreaInsets` prematurely**: before removing, check for ANY `insets.` reference in the file (a sticky CTA/FAB may still need it).
- **KAV + bottom inset**: ScreenView adds `paddingBottom: insets.bottom`; KAV avoidance baseline shifts slightly. Smoke-test form screens on device after step 6 if issues arise.
- **`tenants/new.tsx` SafeAreaView top**: safe to remove because AppHeader is confirmed present.

## Out of scope
- `_layout.tsx` files
- Test files
- Child components, AppHeader, theme config
