# Plan: Migrate ScreenHeader and useLayoutEffect screens to AppHeader

## Goal
Replace custom `ScreenHeader` (12 screens) and `useLayoutEffect`+`navigation.setOptions` pattern (4 screens) with declarative `AppHeader` component using `darkStackOptions`.

## Phase 1 — Parent layout updates (run first)

1. [low] Update `app/(admin)/billing/_layout.tsx` — remove `headerShown: false` from all Stack.Screen entries, keep `presentation: 'modal'` on `new`, keep `payments` with `headerShown: false` (nested stack)
2. [low] Update `app/(admin)/tenants/[id]/_layout.tsx` — replace custom `darkHeader` local object with `import { darkStackOptions }` from constants, remove `headerShown: false`

## Phase 2 — ScreenHeader screens

3. [low] `billing/index.tsx` — swap `<ScreenHeader title="Billing" right={...}>` → `<AppHeader title="Billing" right={...} />`
4. [med] `billing/[id].tsx` — swap all 3 render-branch ScreenHeader usages → `<AppHeader title={...} />`; drop `left="back"` (native handles it)
5. [low] `billing/generate.tsx` — swap `<ScreenHeader title="Generate Bills" left="back" />` → `<AppHeader title="Generate Bills" />`
6. [low] `billing/new.tsx` — swap `<ScreenHeader title="Record Payment" left="back" />` → `<AppHeader title="Record Payment" />`
7. [med] `billing/receipt.tsx` — swap both branches; preserve `right={<Pressable>Done</Pressable>}` via AppHeader right prop
8. [low] `billing/utility.tsx` — swap `<ScreenHeader title="Utility Reading" left="back" />` → `<AppHeader title="Utility Reading" />`
9. [med] `billing/payments/[id].tsx` — swap both render-branch usages → `<AppHeader title="Payment Detail" />`
10. [med] `tenants/[id]/index.tsx` — swap both branches; preserve `right={<StatusChip>}`; convert full-edges SafeAreaView in error branch to View
11. [med] `tenants/[id]/documents.tsx` — swap with dynamic title
12. [high] `tenants/[id]/move-out.tsx` — swap with custom `left` Pressable that triggers discard-confirm Alert before router.back()
13. [med] `tenants/[id]/payment-history.tsx` — swap; preserve `right={Export button}`

## Phase 3 — useLayoutEffect screens

14. [med] `properties/index.tsx` — remove useLayoutEffect+useNavigation; add `<AppHeader title="Properties" right={add button} />`
15. [med] `properties/[propertyId]/units/index.tsx` — same pattern; add button pushes to units/new
16. [med] `settings/units/index.tsx` — same pattern; wrap branches in fragment with AppHeader
17. [med] `tenants/index.tsx` — same pattern; right = notifications bell

## Phase 4 — Verification

18. [low] Grep confirm 0 `ScreenHeader` usages in app/
19. [low] Grep confirm 0 `navigation.setOptions` / `useLayoutEffect` usages in app/; run tsc --noEmit
