# `useSafeAreaInsets` Audit (Post Spec 07)

## TL;DR

Spec 07's prevention rule: `useSafeAreaInsets()` is forbidden in screen files. It belongs only in primitives (`ScreenView`, `ScreenHeader`, `BottomCTABar`, `FAB`, `FloatingTabBar`). Everything else wraps in `<ScreenView>` or `<ScreenLayout>`.

Audit: **7 callers**. 4 are legitimate primitives. **3 are screen-level violations** that need migration:

- `app/onboarding.tsx`
- `app/setup-pin.tsx`
- `app/(admin)/settings/index.tsx`
- `app/(admin)/billing/receipt.tsx`
- `components/tenants/TenantQuickSearchModal.tsx` (boundary case — modal-as-component)

This spec migrates each so the rule (per spec 07 section 4.1) is project-wide enforceable by grep.

## Agent prompt

```
Implement docs/specs/21_safe_area_insets_audit_spec.md exactly.

Prerequisite: spec 07 must be applied (ScreenView uses
<SafeAreaView edges={...}>, no useSafeAreaInsets call). Verify
first; if not applied, do that before this spec.

Audit:
  grep -rln "useSafeAreaInsets" app/ components/ layouts/ hooks/

Expected callers AFTER spec 07:
  ✅ components/ui/FAB.tsx                            (primitive — keep)
  ✅ components/navigation/FloatingTabBar.tsx          (primitive — keep)
  🟡 components/tenants/TenantQuickSearchModal.tsx    (boundary — see section 3)
  ❌ app/onboarding.tsx                                → migrate (section 2.1)
  ❌ app/setup-pin.tsx                                 → migrate (section 2.2)
  ❌ app/(admin)/settings/index.tsx                    → migrate (section 2.3)
  ❌ app/(admin)/billing/receipt.tsx                   → migrate (section 2.4)

Migrate each ❌ screen by wrapping in <ScreenView> or <ScreenLayout>;
drop manual paddingTop/paddingBottom: insets.* math.

For TenantQuickSearchModal (section 2.5): keep useSafeAreaInsets but add a
header comment justifying the exception (modal-as-component).

Run `npx tsc --noEmit`. Verify section 5 acceptance. Smoke test on Android
specifically (the platform where manual insets break). ~30 min.
Do NOT commit.

After verification passes, delete this spec:
  rm docs/specs/21_safe_area_insets_audit_spec.md
```

---

## 1. Audit result

```bash
grep -rln "useSafeAreaInsets" app/ components/ layouts/ hooks/
```

Returns 7 files:

| File | Verdict |
|---|---|
| `components/ui/FAB.tsx` | ✅ Primitive — keep |
| `components/navigation/FloatingTabBar.tsx` | ✅ Primitive — keep |
| `components/tenants/TenantQuickSearchModal.tsx` | 🟡 Boundary — modal-as-component; reasonable to keep but verify (see section 3) |
| `app/onboarding.tsx` | ❌ Screen — migrate |
| `app/setup-pin.tsx` | ❌ Screen — migrate |
| `app/(admin)/settings/index.tsx` | ❌ Screen — migrate |
| `app/(admin)/billing/receipt.tsx` | ❌ Screen — migrate |

(Spec 07 also patches `ScreenView` to use `<SafeAreaView edges={...}>` — that fix's `useSafeAreaInsets` import is **removed**, so it doesn't appear in the audit anymore. If it does, spec 07 isn't fully applied.)

## 2. Migration pattern

For each screen file: replace manual inset math with `<ScreenView>` or `<ScreenLayout>`.

### 2.1 `app/onboarding.tsx`

```tsx
// BEFORE — manual inset
const insets = useSafeAreaInsets()
return (
  <View style={{ paddingTop: insets.top }}>...</View>
)

// AFTER
return (
  <ScreenView>     {/* default edges=['top','bottom'] */}
    ...
  </ScreenView>
)
```

### 2.2 `app/setup-pin.tsx`
Same pattern. The PIN keypad screen is full-bleed; wrap in `<ScreenView>` (no `ScreenLayout`).

### 2.3 `app/(admin)/settings/index.tsx`
Currently:
```tsx
contentContainerStyle={{
  paddingTop: spacing[5],
  paddingHorizontal: spacing[4],
  paddingBottom: insets.bottom + 100,
}}
```

`paddingBottom: insets.bottom + 100` is the floating-pill clearance hack. Replace with the canonical `pb-[88px]` class on `contentContainerClassName`. Already inside a `<ScreenView>` — `insets` import becomes unused.

### 2.4 `app/(admin)/billing/receipt.tsx`
Open the file, identify why `useSafeAreaInsets` is used. Likely a custom action bar at bottom (Share/Print/Done). Wrap content in `<ScreenLayout title="Receipt">`; the action row sits inside the body, not a sticky footer (per spec 06 inline-CTA pattern).

### 2.5 `components/tenants/TenantQuickSearchModal.tsx`
Modal-as-component. Two paths:
- **Keep `useSafeAreaInsets`** if the modal renders its own top/bottom padding manually (e.g. needs to clear keyboard + safe area together).
- **Or** wrap in `<ScreenView edges={['top']}>` if the modal's chrome is screen-like.

Engineer's call. If kept, document in the file with a comment why this is an exception.

## 3. Boundary case — modal-as-component

`TenantQuickSearchModal` is a modal rendered from anywhere in the admin app, with its own visual chrome. Per spec 07, primitives (which is what a modal scrim is) are allowed to use `useSafeAreaInsets`. Add a header comment if kept:

```tsx
// useSafeAreaInsets allowed here — TenantQuickSearchModal is a screen-like primitive
// (renders top to bottom edge with custom chrome, not wrapped in ScreenView).
```

## 4. Implementation steps

| # | Task | Complexity |
|---|---|---|
| 1 | Verify spec 07 is applied (`ScreenView` does NOT call `useSafeAreaInsets`) | XS |
| 2 | Migrate `app/onboarding.tsx` per section 2.1 | S |
| 3 | Migrate `app/setup-pin.tsx` per section 2.2 | S |
| 4 | Migrate `app/(admin)/settings/index.tsx` per section 2.3 | S |
| 5 | Migrate `app/(admin)/billing/receipt.tsx` per section 2.4 | S |
| 6 | Decide on `TenantQuickSearchModal` per section 2.5; add justifying comment if kept | XS |
| 7 | Run final audit grep — only primitives remain | XS |
| 8 | `tsc --noEmit` clean | XS |
| 9 | Smoke test: every migrated screen on Android (the platform where manual insets break) — top + bottom areas render correctly | M |

**Estimate:** ~30 minutes.

## 5. Acceptance

- [ ] `useSafeAreaInsets` callers limited to: `components/ui/FAB.tsx`, `components/navigation/FloatingTabBar.tsx`, optionally `components/tenants/TenantQuickSearchModal.tsx` (with justifying comment).
- [ ] No `useSafeAreaInsets` in any `app/**/*.tsx` file.
- [ ] No `paddingTop: insets.top` / `paddingBottom: insets.bottom` in screen files.
- [ ] Android edge-to-edge: every screen renders content below the status bar (no overlap).
- [ ] iOS: no regressions.

## 6. Out of scope

- Changing `<ScreenView>` itself — spec 07 owns that.
- Adding inset support to `<ScreenLayout>` for unusual layouts — current API is sufficient.
- Building a `<Modal>` primitive — defer until a 2nd modal-as-component appears.

## 7. Prevention

The audit grep is the ongoing check. Add to PR checklist:

> `grep -rln "useSafeAreaInsets" app/ components/ layouts/` — only `FAB`, `FloatingTabBar`, and `TenantQuickSearchModal` allowed.
