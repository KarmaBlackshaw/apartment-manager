# `<Text>` from `react-native` → `<AppText>` Purge

## TL;DR

`<AppText>` is the project's typography primitive (variant + color tokens). `<Text>` from `react-native` bypasses it, producing inconsistent typography (font weight, color, line-height) and frequently pairs with raw hex literals. Audit found **20 files** importing `Text` from `react-native`.

This spec migrates every `<Text>` in screens to `<AppText>`. Primitives (the `ui/` directory and Reanimated wrappers) keep raw `<Text>` — they are the layer where typography is *defined*, not consumed.

## Agent prompt

```
Implement docs/specs/16_text_to_apptext_purge_spec.md exactly.

Scope: 20 screen files (section 2). Primitives in components/ui/* keep <Text>
— they're the typography source. Do NOT touch them.

For each screen file:
  1. Drop `import { Text }` from 'react-native' (keep View, etc.)
  2. Add `import { AppText } from '~/components/ui/AppText'`
  3. Replace each <Text style={{...}}>...</Text> with <AppText
     variant="..." color="...">...</AppText> per section 3.2 / section 3.3 mapping
  4. Drop inline style={{ fontSize, color, fontWeight }}; let
     variant/color do the work
  5. Any raw hex that surfaces → fix it inline (pairs with spec 15)

If a needed AppText variant doesn't exist, add it to AppText before
migrating screens — don't fork the typography system.

Run `npx tsc --noEmit`. Verify section 5 acceptance:
  grep -rln "import.*\bText\b.*from 'react-native'" app/
  → must return empty.

Smoke test: typography unchanged across migrated screens. ~90 min.
Do NOT commit.

After verification passes, delete this spec:
  rm docs/specs/16_text_to_apptext_purge_spec.md
```

---

## 1. Why

| Reason | Detail |
|---|---|
| Inconsistent typography | Raw `<Text>` accepts ad-hoc `style={{ fontSize: 13, color: '#888' }}` — bypasses the type scale. |
| Pairs with raw hex | Per spec 15, raw hex still leaks into the codebase via `<Text style={{ color: '#... '}}>`. Migrating Text simultaneously fixes those. |
| Project rule | CLAUDE.md "Tech Stack" + "Component Map" implies `<AppText>` is canonical. Engineers reach for `<Text>` out of habit; the rule is enforced by migration. |

## 2. Audit (current state)

```bash
grep -rln "import.*\\bText\\b.*from 'react-native'" app/ components/
```

20 files, mostly screens. List from latest grep:

- `app/lock.tsx`, `app/setup-pin.tsx`
- `app/(admin)/settings/index.tsx`
- `app/(admin)/tenants/index.tsx`
- `app/(admin)/properties/index.tsx`
- `app/(admin)/properties/[propertyId]/units/[id]/documents.tsx`
- `app/(admin)/billing/index.tsx`, `billing/utility.tsx`, `billing/generate.tsx`, `billing/receipt.tsx`, `billing/new.tsx`, `billing/[id].tsx`, `billing/payments/[id].tsx`
- `app/(admin)/reports/*` (7 report screens)

Plus a few `components/` files (legitimate primitives — keep `<Text>`):
- `components/ui/AppText.tsx` ← the source
- `components/ui/Chip.tsx`, `ChipBar.tsx`, `WarningBanner.tsx`, `ListRow.tsx`, `ScreenHeader.tsx`, `InfoRow.tsx`, `CameraCapture.tsx`, `SectionHeader.tsx`, `AvatarInitials.tsx`

## 3. Migration

### 3.1 In screens — replace `<Text>` with `<AppText>`

```tsx
// BEFORE
import { Text } from 'react-native'
<Text style={{ fontSize: 14, color: '#94A3B8' }}>
  May 2026
</Text>

// AFTER
import { AppText } from '~/components/ui/AppText'
<AppText variant="caption" color="secondary">
  May 2026
</AppText>
```

### 3.2 Variant mapping (rule of thumb)

| Existing inline style | AppText variant |
|---|---|
| `fontSize: 22+, fontWeight: '700'` | `heading` |
| `fontSize: 18, fontWeight: '600/700'` | `subheading` (or `title`) |
| `fontSize: 16, fontWeight: '500/600'` | `body` (default) |
| `fontSize: 14` | `body` |
| `fontSize: 12-13` | `caption` |
| `fontSize: 11` | `label` |
| `fontFamily: 'JetBrainsMono*'` | `mono` |

Verify against `components/ui/AppText.tsx`'s actual exported variants. If a needed variant doesn't exist, add it before migrating.

### 3.3 Color mapping

| Inline color | `<AppText color>` |
|---|---|
| Primary text (white-ish) | (default — omit `color`) |
| Secondary text | `color="secondary"` |
| Muted / disabled | `color="muted"` |
| Danger / error | `color="danger"` |
| Primary brand link | `color="primary"` (or className `text-primary`) |

### 3.4 Keep `<Text>` in primitives

Do NOT migrate `<Text>` inside `components/ui/AppText.tsx` (it's the source) or any other primitive that's defining typography. Those files use `<Text>` deliberately. Spec scope is **screen files (`app/**`) and screen-specific composite components**.

## 4. Implementation steps

| # | Task | Complexity |
|---|---|---|
| 1 | Audit each of the 20 files; classify `<Text>` usages by variant/color (section 3.2, section 3.3) | M |
| 2 | Replace `<Text>` → `<AppText>`; remove `import { Text }` from `react-native` line | M |
| 3 | Drop `style={{ fontSize, color, fontWeight }}` props in favor of `variant` / `color` | M |
| 4 | Pair with spec 15 — any raw hex that surfaces during migration goes to tokens | S |
| 5 | `npx tsc --noEmit` clean | XS |
| 6 | Smoke test: visuals unchanged across migrated screens | M |

**Estimate:** ~90 minutes.

## 5. Acceptance

- [ ] `grep -rln "import.*\\bText\\b.*from 'react-native'" app/` returns empty.
- [ ] `grep -rln "import.*\\bText\\b.*from 'react-native'" components/` returns only the legitimate primitives listed in section 2.
- [ ] No `<Text>` JSX in screen files (manual verification or a stricter grep).
- [ ] Typography visually consistent across migrated screens.
- [ ] `tsc --noEmit` clean.

## 6. Out of scope

- Changing the `<AppText>` component itself.
- Adding new variants — only add if the migration uncovers a missing one.
- Migrating primitives' internal `<Text>` usages.
