# Double-Header Audit & Permanent Fix

**Trigger:** User reported "double headers on Add Tenant."
**Audience:** Engineer agent.
**Skills consulted:** `using-superpowers` (rigid-skill discipline applied), `ui-ux-pro-max` (rule §9 `nav-hierarchy`, `navigation-consistency`, `avoid-mixed-patterns`).

---

## 0. TL;DR

`ScreenLayout` renders its **own** in-body header (`<ScreenHeader>` with SafeAreaView + 56pt bar). When a parent stack layout also has `headerShown: true` (or omits `headerShown`, which defaults to `true`), the native stack header renders **above** `ScreenLayout`'s header → two headers stacked.

**Immediate fix:** make `ScreenLayout` self-suppress the native header by emitting `<Stack.Screen options={{ headerShown: false }} />`. One change — all consumers stop double-rendering.

**Prevention:** add a CLAUDE.md rule and a memory entry. Plus a dev-time runtime guard (optional) to scream when the antipattern reappears.

---

## 1. Root cause

```
┌─────────────────────────────────────────────────┐
│ NATIVE STACK HEADER  (from parent _layout)      │ ← header #1
├─────────────────────────────────────────────────┤
│ ScreenLayout                                    │
│  └ ScreenHeader (custom, in body)               │ ← header #2  ← DOUBLE
│  └ children                                     │
└─────────────────────────────────────────────────┘
```

`layouts/ScreenLayout.tsx`:
```tsx
export function ScreenLayout({ title, headerLeft, backHref, headerRight, children }) {
  // … renders <ScreenHeader> in body, with its own SafeAreaView edges={['top']}
  return (
    <ScreenView edges={['bottom']}>
      <ScreenHeader title={title ?? ''} left={headerLeft} right={headerRight} … />
      {children}
    </ScreenView>
  )
}
```

`ScreenHeader` is a **custom** component. It is **not** an `expo-router` Stack header. It does not control `Stack.Screen`'s `headerShown`. So if the route's stack layout has `headerShown: true`, both render.

### Affected routes (audit results)

Confirmed by cross-referencing every `_layout.tsx` against every screen that imports `ScreenLayout`:

| Screen | Parent layout | Layout `headerShown` | Result |
|---|---|---|---|
| `tenants/[id]/index.tsx` | `tenants/[id]/_layout.tsx` | **default `true`** (no override) | 🔴 DOUBLE |
| `tenants/[id]/move-out.tsx` | same | default `true` | 🔴 DOUBLE |
| `tenants/[id]/payment-history.tsx` | same | default `true` | 🔴 DOUBLE |
| `tenants/[id]/documents.tsx` | same | default `true` | 🔴 DOUBLE |
| `settings/units/index.tsx` | `settings/units/_layout.tsx` | **default `true`** + per-screen `title` set | 🔴 DOUBLE |
| `settings/units/new.tsx` | same | default `true` + `presentation: 'modal'` | 🔴 DOUBLE |
| `tenants/new.tsx` | `tenants/_layout.tsx` | per-screen `headerShown: true` | 🟡 native header only — not `ScreenLayout`-driven yet, but **WILL break** when spec `02_add_tenant_wizard_spec.md` migrates this screen to `ScreenLayout` (via `WizardShell`) |
| `properties/new.tsx` | `properties/_layout.tsx` | per-screen `headerShown: true` | 🟡 same risk if migrated |
| All other `ScreenLayout` consumers | parent has `headerShown: false` | n/a | ✅ OK |

**Six confirmed broken screens, two latent.** The user reporting Add Tenant suggests they've already started migrating `new.tsx` toward `ScreenLayout` (or `WizardShell`, which uses `ScreenLayout` internally per spec 01).

### Why this slipped in
The migration commit `a03af4d Migrate billing, properties, home, and related screens from AppHeader/ScreenView pattern to ScreenLayout component …` updated screens but did not audit every parent `_layout.tsx`. The bug surfaced only on routes whose layouts hadn't been updated to `headerShown: false`.

---

## 2. Permanent fix (one-line)

`ScreenLayout` emits `<Stack.Screen options={{ headerShown: false }} />` for the route it renders inside. This is the canonical expo-router pattern for "this screen owns its own header."

```tsx
// layouts/ScreenLayout.tsx
import { Stack, useRouter } from 'expo-router'
import { ScreenHeader } from '~/components/ui/ScreenHeader'
import { ScreenView } from '~/components/ui/ScreenView'

interface ScreenLayoutProps { /* unchanged */ }

export function ScreenLayout({
  title,
  headerLeft = 'back',
  backHref,
  headerRight,
  children,
}: ScreenLayoutProps) {
  const router = useRouter()
  const onLeftPress = backHref ? () => router.navigate(backHref as never) : undefined
  return (
    <ScreenView edges={['bottom']}>
      {/* Self-suppress the native stack header — ScreenHeader below replaces it. */}
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader
        title={title ?? ''}
        left={headerLeft}
        right={headerRight}
        onLeftPress={onLeftPress}
      />
      {children}
    </ScreenView>
  )
}
```

That's the entire fix. Affects:
- All 6 confirmed broken screens — fixed automatically.
- All currently-correct screens — no behavior change (their layouts already say `headerShown: false`; `<Stack.Screen>` from inside a screen overrides parent options idempotently).
- Future screens — cannot reintroduce the bug, regardless of what their parent layout does.

### Edge cases verified
- **iOS modal presentation** (`presentation: 'modal'`): the modal sheet chrome remains; only the native title bar disappears. `ScreenLayout`'s `ScreenHeader` is the visible title — desired.
- **Hardware back / swipe-back**: unaffected. `Stack.Screen options` only controls header visibility, not navigation.
- **Status bar color**: still controlled by `darkStackOptions.headerStyle` at the layout level. With native header hidden, status bar background falls through to `bg-background` (already the page bg).

---

## 3. Companion cleanup

After the `ScreenLayout` fix is in, do these housekeeping tasks **in the same PR** to reduce future confusion:

### 3.1 Remove redundant `headerShown: true` from layouts that no longer need it

These set `headerShown: true` because the screen depended on the native header. After the fix, the native header is hidden by `ScreenLayout` regardless. Clean up:

| File | Action |
|---|---|
| `tenants/_layout.tsx` | Drop `headerShown: true` from the `new` screen options (still keep `presentation: 'modal'`). |
| `properties/_layout.tsx` | Same — drop `headerShown: true` from `new`. |
| `tenants/[id]/_layout.tsx` | Add `screenOptions={{ ...darkStackOptions, headerShown: false }}` for clarity, even though the fix now handles it. Defense in depth. |
| `settings/_layout.tsx` | Confirm `general`, `rates`, `security` screens still use the **native** header (they don't import `ScreenLayout` per the audit). If they do migrate later, this layout already handles it. |
| `settings/units/_layout.tsx` | Add `headerShown: false` to `screenOptions`. |
| `billing/payments/_layout.tsx` | Add `headerShown: false` to `screenOptions` (currently shows native header on `[id]`). Decide whether `billing/payments/[id].tsx` should use `ScreenLayout` — if yes, hide native header here. |

### 3.2 Delete `components/ui/AppHeader.tsx`

`AppHeader` is the legacy pattern (renders `<Stack.Screen>` inline to drive the native stack header). The new pattern is `ScreenLayout` + `ScreenHeader`. Per the design audit, the codebase has fully migrated. Delete `AppHeader.tsx` and its export to prevent re-introduction.

Verify zero remaining imports first: `grep -rn "AppHeader" app/ components/` — should return only the file itself and any test references.

### 3.3 Remove inline `<Stack.Screen options={{ title: ... }} />` calls from screens

Now that `ScreenLayout` owns the header, screens like `tenants/new.tsx` no longer need the inline `<Stack.Screen options={{ title: STEP_SCREEN_TITLES[step] }} />` to update the native title — the `ScreenHeader` title comes from the `title` prop on `ScreenLayout` (or `WizardShell`).

Affected: `tenants/new.tsx`, `notifications.tsx`, `onboarding.tsx`. Audit and remove.

---

## 4. Prevention — make recurrence impossible

### 4.1 New CLAUDE.md rule

Add to `CLAUDE.md` under "Conventions" or "Engineering Discipline":

> **Header ownership rule.** Each screen has exactly **one** header. Two patterns, never mixed:
>
> - **Pattern A — native stack header.** Parent `_layout.tsx` keeps `headerShown: true` and sets `title`. Screen does NOT use `ScreenLayout`/`ScreenHeader`/`AppHeader`.
> - **Pattern B — `ScreenLayout` (default for this project).** Screen wraps content in `<ScreenLayout title="…">`. The component self-suppresses the native header. Parent layout's `headerShown` value is irrelevant but should be `false` for clarity.
>
> **Forbidden combinations:**
> - `ScreenLayout` + parent `headerShown: true` (without an override) → renders two headers.
> - Inline `<Stack.Screen options={{ title }} />` inside a screen that also uses `ScreenLayout` → duplicates the title source.
> - Mixing `AppHeader` (legacy) and `ScreenLayout` in one tree.

### 4.2 Runtime dev-mode guard (optional)

If we want the issue to scream in dev rather than slip through visually:

```tsx
// layouts/ScreenLayout.tsx
import { useNavigation } from 'expo-router'
import { useEffect } from 'react'

export function ScreenLayout({ … }) {
  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const nav = useNavigation()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const opts = nav.getOptions() as { headerShown?: boolean }
      if (opts.headerShown !== false) {
        console.warn(
          '[ScreenLayout] Parent stack still has headerShown !== false. ' +
          'Native header is suppressed by ScreenLayout, but consider setting ' +
          'headerShown: false in the parent _layout.tsx for clarity.',
        )
      }
    }, [nav])
  }
  // … render
}
```

**Defer this** unless the bug recurs. KISS: the §2 fix is enough. The warning is for cases where a developer wants to know **why** parent options aren't taking effect.

### 4.3 New memory entry

Add to `~/.claude/projects/.../memory/`:

```markdown
---
name: One header per screen
description: ScreenLayout self-suppresses the native header. Never combine with parent headerShown:true or inline Stack.Screen title overrides.
type: feedback
---

Each screen renders exactly one header. Two valid patterns:
- **Native:** parent layout shows native header; screen doesn't use ScreenLayout/AppHeader.
- **Custom:** screen uses ScreenLayout (default in this project). It self-suppresses the native header via `<Stack.Screen options={{ headerShown: false }} />` inside.

**Why:** Bug surfaced 2026-05-08 — Add Tenant rendered two stacked headers. Audit found 6 affected routes from a partial migration to ScreenLayout. Single-line fix to ScreenLayout closed all of them; rule exists to prevent re-introduction.

**How to apply:**
- Never write `<Stack.Screen options={{ title }} />` inside a screen that also wraps in `ScreenLayout` — pass `title` as a prop instead.
- When introducing a new screen group, default the parent `_layout.tsx` to `screenOptions={{ ...darkStackOptions, headerShown: false }}`.
- `AppHeader` (legacy) is deleted — do not reintroduce it.
- If a screen needs both a native back gesture chrome AND a custom header look, use `ScreenLayout` and rely on its `headerLeft="back"` slot.
```

Index entry in `MEMORY.md`:
```
- [One header per screen](feedback_one_header_per_screen.md) — ScreenLayout self-suppresses native header; never mix patterns.
```

### 4.4 Spec lifecycle update

When writing future screen specs (`05_…`, `06_…`), include a one-liner under "Header ownership":

> Header pattern: **B (ScreenLayout)**. Parent layout sets `headerShown: false`. No inline `<Stack.Screen options>` calls.

Eliminates ambiguity at design-time.

---

## 5. Implementation order

| # | Task | Complexity | Files |
|---|---|---|---|
| 1 | Patch `ScreenLayout` to emit `<Stack.Screen options={{ headerShown: false }} />` (§2) | XS | `layouts/ScreenLayout.tsx` |
| 2 | Update parent layouts per §3.1 | S | 6 `_layout.tsx` files |
| 3 | Delete `components/ui/AppHeader.tsx` after verifying zero imports (§3.2) | XS | 1 file |
| 4 | Remove redundant inline `<Stack.Screen options={{ title }} />` from screens (§3.3) | S | `tenants/new.tsx`, `notifications.tsx`, `onboarding.tsx` |
| 5 | Add the "Header ownership rule" to CLAUDE.md (§4.1) | XS | `CLAUDE.md` |
| 6 | Add memory entry (§4.3) | XS | `feedback_one_header_per_screen.md`, `MEMORY.md` |
| 7 | Manual smoke test — open every affected screen on iOS + Android, confirm one header | S | — |
| 8 | Run `npx tsc --noEmit` | XS | — |

Total: ~30 minutes of work for the engineer.

---

## 6. Acceptance criteria

- [ ] All 6 🔴 routes from §1 render exactly one header.
- [ ] `tenants/new.tsx` renders one header on iOS modal AND Android.
- [ ] Adding `<ScreenLayout>` to any future screen does not produce a double header regardless of parent layout config.
- [ ] `AppHeader` no longer exists; no imports reference it.
- [ ] `npx tsc --noEmit` clean.
- [ ] Memory + CLAUDE.md updated.
- [ ] Dev console produces no warnings about header mismatch (if §4.2 is implemented; otherwise N/A).

---

## 7. Why not the alternative fixes?

| Alternative | Rejected because |
|---|---|
| Fix every parent layout to `headerShown: false` | Brittle — relies on every future engineer remembering. The §2 fix removes the dependency entirely. |
| Lint rule | Infra cost. The runtime fix achieves the same result with one line of code. |
| Use the native header everywhere (delete `ScreenLayout`) | Native header doesn't support the design system's status chip on right, custom typography, etc. The design audit already locked in custom headers. |
| Add a prop to `ScreenLayout` like `suppressNativeHeader={true}` | Optional behavior with a default that 99% of consumers want is just bad API design. Default-on is correct. |

---

## 8. UX rationale (per `ui-ux-pro-max` rule §9)

This fix aligns with three explicit rules from the design intelligence guide:

- **`nav-hierarchy`** — primary nav (tabs/bottom bar) vs secondary nav (drawer/settings) must be clearly separated. Two stacked headers blur the hierarchy and confuse the user about what's tappable.
- **`navigation-consistency`** — navigation placement must stay the same across all pages; don't change by page type. A double header on some routes and single on others violates this.
- **`avoid-mixed-patterns`** — don't mix Tab + Sidebar + Bottom Nav at the same hierarchy level. `AppHeader` (native-driven) and `ScreenLayout` (custom-driven) are two header patterns; the codebase has chosen B and should stay there.

The user-perceived issue is not just "two bars at top." It's the implicit doubt every user feels when controls appear redundant: "Which one is the 'real' header? Where do I tap?" The fix restores deterministic spatial expectation.
