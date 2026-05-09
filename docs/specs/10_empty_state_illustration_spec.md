# Empty-State Illustration & Standardization

**Trigger:** User provided a "magnifying-glass + folder" SVG illustration to use as the canonical empty-state placeholder across all screens. Audit also found ~10 places using inline muted text instead of the existing `<EmptyState>` component — fix while we're here.
**Audience:** Engineer agent.
**Skills consulted:** `using-superpowers`, `ui-ux-pro-max` (rule §8 `empty-states`, §10 `empty-data-state`).

---

## 0. TL;DR

1. Add `<EmptyStateIllustration>` — a react-native-svg component rendering the supplied SVG.
2. Extend `<EmptyState>` to display the illustration above the title, with `size: 'sm' | 'md' | 'lg'` (default `md`).
3. Migrate **10 inline empty messages** scattered across screens/components to use `<EmptyState>`.
4. Add a CLAUDE.md rule banning bare empty-state strings in favor of `<EmptyState>` (with one explicit exception: tiny inline labels in dropdown / search-result panels where a full illustration would be visually disruptive — those use `<EmptyState size="sm">` or stay as a single muted line, engineer's call documented in §4).
5. `react-native-svg` is already installed (15.12.1) — no new dependency.

## Agent prompt

```
Implement docs/specs/10_empty_state_illustration_spec.md exactly.

Read first:
1. docs/specs/10_empty_state_illustration_spec.md (source of truth)
2. CLAUDE.md "Color tokens" section (gets a hex exception per §6)

Execute §7 in order — 11 steps. Highlights:
  1. Create components/illustrations/EmptyStateIllustration.tsx
     with the SVG paths verbatim from §1.1. Hex literals OK in
     this directory.
  2. Refactor components/ui/EmptyState.tsx per §2 — add `size`
     prop, render illustration. Drop-in compatible with all
     existing callers.
  3. Migrate 6 inline empties per §3 (rows 1-6) to <EmptyState>.
  4. Bump 12 full-page list empties to size="lg".
  5. Leave 4 inline-text exceptions alone (§3 rows 7-10).
  6. Update CLAUDE.md per §4 — add "Empty-state rule".
  7. Update CLAUDE.md "Color tokens" per §6 — add illustrations
     hex exception.
  8. Add memory file feedback_empty_states.md per §5.
  9. Run grep audit per step 9.

Constraints:
- Do NOT commit.
- No raw hex anywhere except tailwind.config.js AND
  components/illustrations/**.
- npx tsc --noEmit clean.

Smoke-test step 11 on iOS + Android; confirm illustration crisp
at all 3 sizes.

Verify §8 acceptance (10 items). ~45 min.

After verification passes, mark this spec done:
  git mv docs/specs/10_empty_state_illustration_spec.md docs/specs/10_empty_state_illustration_spec_DONE.md
```

---

## 1. The illustration

### 1.1 New file: `components/illustrations/EmptyStateIllustration.tsx`

Direct one-to-one conversion of the user-supplied SVG to `react-native-svg`. **Hex literals inside this file are acceptable** (illustration assets are exempt from the "no raw hex" rule per §6 below). All values come from the user-supplied SVG verbatim — do not edit.

```tsx
import React from 'react'
import Svg, { Path } from 'react-native-svg'

interface EmptyStateIllustrationProps {
  /** Width in dp. Height is computed from the source aspect ratio (212:186). */
  size?: number
}

export function EmptyStateIllustration({ size = 160 }: EmptyStateIllustrationProps) {
  const height = (size * 186) / 212

  return (
    <Svg width={size} height={height} viewBox="0 0 212 186" fill="none">
      <Path d="M106.008 146.685C106.981 146.685 107.769 145.896 107.769 144.923C107.769 143.95 106.981 143.162 106.008 143.162C105.035 143.162 104.246 143.95 104.246 144.923C104.246 145.896 105.035 146.685 106.008 146.685Z" fill="#CFCFCF" />
      <Path d="M54.8291 14.0566V21.7863" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M50.9463 17.9229H58.694" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M142.822 62.8077C127.776 62.8077 112.46 62.1966 98.1332 58.2059C84.076 54.3051 71.1692 46.7372 59.6645 37.9829C52.1326 32.2845 45.2837 27.7366 35.5048 28.4196C25.9381 28.9373 16.7896 32.5098 9.40362 38.612C-3.03577 49.5055 -1.16627 69.6926 3.81308 83.8217C11.2911 105.159 34.0487 120.025 53.3909 129.643C75.7351 140.806 100.29 147.295 124.899 151.016C146.471 154.306 174.19 156.678 192.885 142.603C210.052 129.643 214.762 100.09 210.555 80.1366C209.535 74.242 206.396 68.9233 201.729 65.1806C189.667 56.3544 171.673 62.2505 158.119 62.5381C153.086 62.646 147.963 62.7718 142.822 62.8077Z" fill="#F2F2F2" />
      <Path d="M118.481 3.5233C119.454 3.5233 120.243 2.73458 120.243 1.76165C120.243 0.788716 119.454 0 118.481 0C117.508 0 116.72 0.788716 116.72 1.76165C116.72 2.73458 117.508 3.5233 118.481 3.5233Z" fill="#CFCFCF" />
      <Path d="M26.9482 140.698V148.428" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M23.084 144.563H30.8137" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M106.725 185.998C143.171 185.998 172.715 184.155 172.715 181.882C172.715 179.608 143.171 177.765 106.725 177.765C70.2801 177.765 40.7354 179.608 40.7354 181.882C40.7354 184.155 70.2801 185.998 106.725 185.998Z" fill="#F2F2F2" />
      <Path d="M159.774 137.787H45.7877C45.0249 137.786 44.2712 137.62 43.579 137.3C42.8867 136.979 42.2723 136.512 41.7783 135.931C41.2842 135.35 40.9223 134.668 40.7176 133.933C40.5129 133.198 40.4703 132.428 40.5926 131.675L55.1712 43.2689C55.3681 42.0385 55.9978 40.9188 56.9469 40.1114C57.896 39.304 59.1022 38.8619 60.3482 38.8648H174.334C175.096 38.8648 175.849 39.0309 176.541 39.3515C177.233 39.6721 177.846 40.1394 178.339 40.7211C178.832 41.3028 179.192 41.9847 179.394 42.7196C179.597 43.4545 179.636 44.2247 179.511 44.9766L165.005 133.383C164.803 134.621 164.164 135.745 163.205 136.553C162.245 137.361 161.028 137.799 159.774 137.787Z" fill="#D2D2D2" />
      <Path d="M161.178 36.5526L93.5184 6.34376C91.524 5.45331 89.1854 6.34821 88.2949 8.34258L66.8512 56.3706C65.9607 58.365 66.8556 60.7036 68.85 61.5941L136.509 91.803C138.504 92.6934 140.842 91.7985 141.733 89.8041L163.177 41.7761C164.067 39.7817 163.172 37.4431 161.178 36.5526Z" fill="white" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M103.436 45.8574C105.216 43.3585 107.807 41.5521 110.767 40.7444C113.727 39.9368 116.876 40.1774 119.679 41.4257C122.483 42.6739 124.768 44.853 126.149 47.5936C127.529 50.3341 127.919 53.4677 127.254 56.4633" stroke="#BABABA" strokeWidth={0.68} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M135.793 43.142C136.816 43.142 137.644 42.3131 137.644 41.2905C137.644 40.2679 136.816 39.439 135.793 39.439C134.77 39.439 133.941 40.2679 133.941 41.2905C133.941 42.3131 134.77 43.142 135.793 43.142Z" fill="#BABABA" />
      <Path d="M108.973 31.1699C109.995 31.1699 110.824 30.3409 110.824 29.3183C110.824 28.2958 109.995 27.4668 108.973 27.4668C107.95 27.4668 107.121 28.2958 107.121 29.3183C107.121 30.3409 107.95 31.1699 108.973 31.1699Z" fill="#BABABA" />
      <Path d="M159.27 137.751H44.7271C43.3333 137.746 41.9982 137.189 41.0144 136.202C40.0305 135.214 39.4781 133.877 39.4781 132.484V51.7175C39.4613 51.0168 39.5846 50.3199 39.8406 49.6674C40.0967 49.015 40.4804 48.4203 40.9692 47.918C41.4581 47.4158 42.0423 47.0161 42.6875 46.7425C43.3328 46.469 44.0262 46.3269 44.7271 46.3247H86.4494C87.4175 46.3283 88.3659 46.5986 89.1905 47.106C90.015 47.6134 90.6837 48.3382 91.1231 49.2009L97.0732 60.8493C97.511 61.7133 98.1794 62.4392 99.0043 62.9468C99.8291 63.4545 100.778 63.724 101.747 63.7255H159.27C160.662 63.7255 161.997 64.2785 162.982 65.2629C163.966 66.2473 164.519 67.5824 164.519 68.9745V132.484C164.519 133.877 163.967 135.214 162.983 136.202C161.999 137.189 160.664 137.746 159.27 137.751Z" fill="white" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M141.635 66.4756C135.018 66.472 128.549 68.431 123.045 72.1048C117.541 75.7785 113.25 81.002 110.716 87.1144C108.181 93.2269 107.516 99.9538 108.805 106.444C110.093 112.935 113.278 118.897 117.956 123.578C122.634 128.258 128.595 131.446 135.084 132.738C141.574 134.03 148.301 133.369 154.415 130.838C160.529 128.306 165.755 124.018 169.432 118.516C173.108 113.015 175.071 106.546 175.071 99.9289C175.071 91.0597 171.549 82.5534 165.279 76.2802C159.009 70.007 150.505 66.4804 141.635 66.4756Z" fill="white" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M165.436 124.196L174.352 133.112" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M173.343 128.78L170.573 131.678C169.331 132.977 169.377 135.036 170.676 136.278L194.715 159.258C196.014 160.5 198.073 160.453 199.315 159.154L202.085 156.257C203.327 154.958 203.28 152.898 201.981 151.657L177.943 128.677C176.644 127.435 174.584 127.481 173.343 128.677Z" fill="#D2D2D2" />
      <Path d="M191.141 1.76172V9.50938" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M187.259 5.64453H195.006" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}
```

**Notes:**
- All `stroke-linecap` / `stroke-linejoin` / `stroke-width` SVG attributes become camelCase (`strokeLinecap`, `strokeLinejoin`, `strokeWidth`) per `react-native-svg` convention.
- Hardcoded greys (`#F2F2F2`, `#D2D2D2`, `#CFCFCF`, `#BABABA`, `white`) are intentional — illustration colors, not UI tokens.
- Aspect ratio (212:186) preserved automatically via the `height` calc.
- File goes in **new directory**: `components/illustrations/`. This separates assets from UI components and makes the hex-literal exception explicit.

### 1.2 Visual fit on dark mode

The illustration uses **light grey + white** strokes. On the project's dark `bg-background` (`#0D0D0D`), it reads as a soft, warm placeholder — the user submitted it knowing the project is dark-mode-only, so no theming toggle is needed in v1.

If a future dark-tinted variant is requested, add it as `<EmptyStateIllustration variant="muted" />` later — KISS, defer until asked.

---

## 2. Refactored `<EmptyState>`

### 2.1 New props

```tsx
interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void

  /**
   * Visual scale.
   * - 'lg' (220dp illustration): full-page list empties (Tenants, Properties, Bills…)
   * - 'md' (160dp illustration, DEFAULT): mid-density section / report empties
   * - 'sm' (96dp illustration): inline card section empties (Documents on Unit Detail)
   * - 'none' (no illustration): tight spaces — search dropdown "no results", etc.
   */
  size?: 'lg' | 'md' | 'sm' | 'none'
}
```

### 2.2 Layout

```tsx
import { View } from 'react-native'
import { AppText } from '~/components/ui/AppText'
import { Button } from '~/components/ui/Button'
import { EmptyStateIllustration } from '~/components/illustrations/EmptyStateIllustration'

const ILLUSTRATION_SIZE: Record<Exclude<EmptyStateProps['size'], 'none'>, number> = {
  lg: 220,
  md: 160,
  sm: 96,
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  size = 'md',
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-10 bg-background">
      {size !== 'none' && (
        <View className="mb-4 opacity-90">
          <EmptyStateIllustration size={ILLUSTRATION_SIZE[size]} />
        </View>
      )}
      <AppText variant="heading" className="text-center mb-2">{title}</AppText>
      {description && (
        <AppText color="secondary" className="text-center mb-6">{description}</AppText>
      )}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} className="self-stretch" />
      )}
    </View>
  )
}
```

**Key changes vs the current 22-LOC version:**
- Adds `<EmptyStateIllustration>` above the title.
- Adds `size` prop with sensible default `md`.
- Drops the `bg-app` class (the design token is `bg-background` per `tailwind.config.js`; current code uses a stale alias).
- Uses `px-8 py-10` to give the illustration breathing room.

The component remains drop-in compatible with all 12 existing callers — they continue to work without changes (default size is `md`, illustration appears automatically).

### 2.3 LOC

~30 lines. Well under the 200-LOC cap.

---

## 3. Audit — inline empty messages to migrate

10 places use bare strings instead of `<EmptyState>`. Replace with `<EmptyState>` (size per the table). Use the matching size; do NOT default everything to `md`.

| # | File | Line | Current | Target |
|---|---|---|---|---|
| 1 | `app/(admin)/payments/index.tsx` | 247 | `<Text className="text-sm text-center mt-12 text-[#555555]">No tenants match this filter</Text>` (raw hex!) | `<EmptyState size="md" title="No matches" description="No tenants match this filter." />` |
| 2 | `app/(admin)/tenants/[id]/index.tsx` | 119 | "No payments yet" inline | `<EmptyState size="sm" title="No payments yet" />` (rendered inside the section card) |
| 3 | `app/(admin)/tenants/[id]/documents.tsx` | 78 | `<AppText color="muted">No documents yet</AppText>` | `<EmptyState size="md" title="No documents yet" description="Tap + to attach a contract or ID." actionLabel="Add document" onAction={openPicker} />` |
| 4 | `app/(admin)/properties/[propertyId]/units/[id]/index.tsx` | 190 | "No documents" inline | `<EmptyState size="sm" title="No documents" />` (inside Documents section card) |
| 5 | `app/(admin)/properties/[propertyId]/units/[id]/documents.tsx` | 102 | "No {filter} documents yet" inline | `<EmptyState size="md" title={...} description="Tap + to attach a document." />` |
| 6 | `app/(admin)/properties/[propertyId]/index.tsx` | 99 | "No units yet" + inline button | `<EmptyState size="md" title="No units yet" actionLabel="Add Unit" onAction={...} />` |
| 7 | `components/ui/Select.tsx` | 133 | `<AppText color="muted" className="text-center py-8">No options found</AppText>` | Stay as muted text (size='none' equivalent — inline single line is correct here per §4 exception) |
| 8 | `components/tenants/TenantQuickSearchModal.tsx` | 161 | "No tenants found" | Stay as muted text — same exception as Select |
| 9 | `components/properties/PropertySelector.tsx` | 128 | `<Text className="text-text-muted text-sm">No properties found</Text>` | Stay as muted text — same exception |
| 10 | `components/billing/CollectionProgressBar.tsx` | 34 | `<Text className="text-xs text-text-muted">No bills this month</Text>` | Stay — this is an inline status sub-label inside a bar, not an empty-state |

**Migrated:** 6 (rows 1–6).
**Stay as inline muted text:** 4 (rows 7–10) — **these are not "empty states," they are inline labels** within compact UI (search panels, dropdowns, progress-bar sub-labels). A 96–220dp illustration would dominate the container. KISS exception per §4.

### 3.1 Existing `<EmptyState>` callers (12) — verify size

These already use the component. Audit each and pass `size` explicitly to match the surrounding layout. All currently get `md` by default, which is correct for full-page list empties. **Do not change** unless visually off:

- `notifications.tsx:220` — full-page list → `lg` (it's the full screen)
- `tenants/index.tsx:147` — full-page list → `lg`
- `properties/index.tsx:61` — full-page list → `lg`
- `billing/index.tsx:174` — full-page list → `lg`
- `reports/outstanding-balances.tsx:62` — full-page → `lg`
- `reports/occupancy.tsx:110` — full-page → `lg`
- `reports/monthly-collection.tsx:98` — full-page → `lg`
- `reports/deposit-summary.tsx:55` — full-page → `lg`
- `reports/maintenance-costs.tsx:134` — full-page → `lg`
- `reports/per-unit-income.tsx:87` — full-page → `lg`
- (any others discovered during the migration)

**Recommendation:** bump every full-page list empty from default `md` to `lg`. The illustration anchors the screen better at full size.

---

## 4. CLAUDE.md rule (new section)

Add to "Conventions" or "Engineering Discipline":

> ### Empty-state rule
>
> Every empty list, empty section, or "nothing to show" state uses `<EmptyState>` from
> `components/ui`. The component renders the standard illustration plus title /
> description / optional action.
>
> **Three sizes:**
> - `lg` (220dp): full-page lists (the screen is otherwise empty).
> - `md` (160dp, default): section-level empties that fill a card.
> - `sm` (96dp): inline section empties when surrounding density is high.
>
> **Exception — `size="none"` or plain muted text** is allowed for tight UI
> surfaces where an illustration would dominate the container:
> - Search modal "no results"
> - Select / picker dropdown "no options"
> - Inline sub-labels under a progress bar / chart
>
> **Forbidden:**
> - Bare `<Text>No items yet</Text>` or `<AppText>No documents</AppText>` as a
>   primary empty state on a screen or full section. Use `<EmptyState>`.
> - Custom hand-rolled empty layouts. Extend `<EmptyState>` if it doesn't fit;
>   don't fork it.
>
> **Illustration source:** `components/illustrations/EmptyStateIllustration.tsx`.
> Hex literals inside `components/illustrations/*` are exempt from the
> "no raw hex" rule — illustrations are assets, not tokens.

---

## 5. Memory entry

`feedback_empty_states.md`:

```markdown
---
name: Empty-state pattern
description: Every empty/no-results state uses <EmptyState> with the standard illustration. Inline muted-text empties forbidden except in tight UI (dropdowns, search panels).
type: feedback
---

Every empty list, empty section, or "nothing to show" state on a screen or section card uses `<EmptyState>` from `components/ui`. It renders the project's standard illustration (`components/illustrations/EmptyStateIllustration.tsx`) above title / description / optional action.

**Why:** Inline muted-text empty states drifted across 10 places — inconsistent typography, copy, and spacing. User supplied a canonical illustration 2026-05-09; spec `10_empty_state_illustration_spec.md` standardized the pattern.

**How to apply:**
- New empty state → reach for `<EmptyState size="lg|md|sm">`. Don't write `<AppText>No X</AppText>` blocks.
- `size="lg"` for full-page list empties; `md` (default) for section cards; `sm` for compact inline section empties.
- `size="none"` (or plain muted text) allowed only for: search modal no-results, Select/picker no-options, sub-labels inside progress bars/charts. Anywhere else, illustration is required.
- Hex literals inside `components/illustrations/*` are acceptable — those are assets, not UI tokens.
```

`MEMORY.md` line:
```
- [Empty-state pattern](feedback_empty_states.md) — Use <EmptyState> with the standard illustration; inline muted-text empties forbidden on screens/sections.
```

---

## 6. Hex-literal exception note

The "no raw hex outside `tailwind.config.js`" rule (CLAUDE.md "Color tokens") gets a small carve-out. Add to that section:

> **Exception:** files under `components/illustrations/**` may use raw hex literals.
> Illustrations are vector assets with their own internal palette (greys, whites,
> brand splashes) that should not pollute the design-token system. Do not extend
> this exception to other directories.

---

## 7. Implementation steps

| # | Task | Complexity | Files |
|---|---|---|---|
| 1 | Create `components/illustrations/EmptyStateIllustration.tsx` per §1.1 | S | 1 (new) |
| 2 | Refactor `components/ui/EmptyState.tsx` per §2 — add `size` prop, render illustration | S | 1 |
| 3 | Migrate 6 inline empty messages per §3 (rows 1–6) to `<EmptyState>` | M | 6 |
| 4 | Bump full-page list `<EmptyState>` callers (12 in §3.1) from default `md` to explicit `size="lg"` | S | 12 |
| 5 | Leave 4 inline labels (§3 rows 7–10) untouched — verify each is a legitimate exception | XS | 0 |
| 6 | Update `CLAUDE.md` per §4 — add "Empty-state rule" section | XS | 1 |
| 7 | Update `CLAUDE.md` "Color tokens" section per §6 — add the illustrations hex exception | XS | 1 |
| 8 | Add memory file `feedback_empty_states.md` per §5; add line to `MEMORY.md` | XS | 2 |
| 9 | Run `grep -rn "No .* yet\|No .* found\|No data\|No items" app/ components/` — every hit must be either inside `<EmptyState>` or one of the 4 documented exceptions | XS | — |
| 10 | `npx tsc --noEmit` clean | XS | — |
| 11 | Smoke test: open every screen with an empty path (no tenants, no properties, etc.) on iOS + Android; confirm illustration renders crisp | M | — |

**Estimate:** ~45 minutes.

---

## 8. Acceptance criteria

- [ ] `components/illustrations/EmptyStateIllustration.tsx` exists, renders the SVG via `react-native-svg`.
- [ ] `<EmptyState>` accepts `size: 'lg' | 'md' | 'sm' | 'none'` and shows the illustration accordingly.
- [ ] All 6 §3 inline messages replaced with `<EmptyState>` calls.
- [ ] 4 documented inline-text exceptions (§3 rows 7–10) remain inline — no over-migration.
- [ ] All full-page `<EmptyState>` callers explicitly pass `size="lg"`.
- [ ] CLAUDE.md "Empty-state rule" section added; "Color tokens" exception added.
- [ ] Memory file created and indexed.
- [ ] No raw hex outside `tailwind.config.js` AND `components/illustrations/**`.
- [ ] `npx tsc --noEmit` clean.
- [ ] Visual check: empty-state illustration renders without clipping at all 3 sizes; not noticeably aliased on Android.

---

## 9. Out of scope

- A second illustration variant (e.g. "all clear / success" celebratory state) — defer until a use case appears.
- Recoloring the illustration for theme variants — defer.
- Animating the illustration on appear — defer (per `motion-meaning` rule, only animate when it conveys meaning).
- Building per-empty-state illustrations (different art for "no tenants" vs "no bills") — KISS; one illustration, varying titles.
- Localizing empty-state copy — single-locale project for now.
- Migrating progress-bar sub-labels (§3 row 10) to anything heavier — those are status text, not empty states.

---

## 10. Open questions

1. **Documents action** — when an empty document section is tappable to add, should `<EmptyState>` show an `actionLabel="Add document"`? The proposed migrations in §3 row 3 and 5 do; row 4 doesn't (because Unit Detail's documents section already has a "View all" link in its header). Engineer's call per screen — if the action is already accessible nearby, omit it from the empty state.
2. **Reports empties** — for "All clear" / "No issues" empties on report screens, the current copy is celebratory ("No vacancies — all units occupied"). The illustration is neutral / search-themed. If a celebratory variant is wanted later, add `<EmptyState variant="positive" />`. For v1, the standard illustration applies to all empties.
3. **Illustration sizing on tablets / landscape** — defer; v1 is phone-first.
