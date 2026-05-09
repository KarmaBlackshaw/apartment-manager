# QuickActionBar — Fix Icon/Label Proportions

## TL;DR

The dashboard's `QuickActionBar` has the icon/label ratio inverted: 16pt icon under 11px text label. The icon should be the dominant visual cue (it's recognized faster than the label), and the label should be small but legible. Per `ui-ux-pro-max` rule §4 `icon-style-consistent` and the general mobile-tile convention, target a 22–24pt icon with 10–11px label.

**One-file change.** Adjust four `Ionicons size` props from `16` → `22`, bump vertical padding for breathing room, slightly increase the icon-to-label gap, leave the label class alone (already `text-[11px] font-medium`).

## Agent prompt

```
Implement docs/specs/27_quick_action_bar_proportions_spec.md exactly.

Read first:
1. docs/specs/27_quick_action_bar_proportions_spec.md (source of truth)
2. components/home/QuickActionBar.tsx (file being edited)

Single-file change — no parallelism applicable.

Execute section 4 in order — 5 steps:
  1. Edit components/home/QuickActionBar.tsx per section 3:
     - Bump 4 Ionicons `size={16}` → `size={22}`
     - Tile vertical padding: `py-[11px]` → `py-3` (12dp, breathing room)
     - Icon-to-label gap: `mt-1` → `mt-1.5` (6dp)
     - Tile min-height: add `min-h-[64px]` (touch-friendly + balanced)
  2. Visual sanity check — tiles look balanced, label still
     readable, no text wrap on a 375pt phone.
  3. `npx tsc --noEmit` clean.
  4. Smoke test on iOS + Android — 4 tiles legible, taps land
     correctly.
  5. Compare against `docs/screenshots/dark/01_home_dashboard.png`
     if available.

Constraints:
- Do NOT commit.
- No raw hex; tokens only (already in compliance — colors.* used).
- Existing engineering rules from CLAUDE.md still apply.

Verify section 5 acceptance (5 items). ~5 min.

After verification passes, mark this spec done:
  git mv docs/specs/27_quick_action_bar_proportions_spec.md docs/specs/27_DONE_quick_action_bar_proportions_spec.md
```

---

## 1. Audit — current state

Current `QuickActionBar.tsx`:

```tsx
<Pressable className="flex-1 rounded-[12px] items-center justify-center bg-primary py-[11px] px-1">
  <Ionicons name="cash-outline" size={16} color={colors.textInverse} />
  <AppText className="text-[11px] font-medium text-white mt-1 text-center">
    Record Payment
  </AppText>
</Pressable>
```

Issues:

| Aspect | Current | Problem |
|---|---|---|
| Icon size | `16` | Tiny relative to label; the icon is the primary recognition cue and should dominate the tile |
| Label size | `text-[11px]` | Adequate alone, but visually dominant because the icon is undersized |
| Vertical padding | `py-[11px]` | Cramped — leaves no room around the icon when it grows |
| Icon-to-label gap | `mt-1` (4px) | Will look squashed once the icon is bigger |
| Horizontal padding | `px-1` (4px) | Acceptable for the current sizes; verify after icon bump |
| Min height | none | Tiles size to content; bigger icon + text combo without floor can look uneven |

---

## 2. UX rationale (per `ui-ux-pro-max`)

| Rule | Application |
|---|---|
| §2 `touch-target-size` | Min 44×44pt. Currently met (tile width is `flex-1` of `screenWidth − padding`, height ~37pt with current padding). After fix, height climbs to ~64pt — comfortably above the floor. |
| §4 `icon-style-consistent` | Tiles in a related row (Record Payment, Add Tenant, Add Unit, Log Issue) must share icon weight + size. They already use the same Ionicons family; size is also already uniform. Just need the absolute size to match the visual weight expected of a primary action tile. |
| §6 `font-scale` / `weight-hierarchy` | Label remains 11px medium. The hierarchy comes from icon dominance, not from oversized text. |
| §6 `whitespace-balance` | Icon-to-label gap and vertical padding must let the two elements breathe. `mt-1.5` + `py-3` does. |
| Mobile tile convention | iOS Springboard-style icon-over-label tiles use roughly **2× icon-to-label height ratio** (e.g. 32pt icon over ~12pt label). Bumping to 22pt icon over 11px label gives a comfortable ~2:1 visual weight. |

---

## 3. The fix

### 3.1 Diff per tile

```diff
 <Pressable
-  className="flex-1 rounded-[12px] items-center justify-center bg-primary py-[11px] px-1"
+  className="flex-1 rounded-[12px] items-center justify-center bg-primary py-3 px-1 min-h-[64px]"
   onPress={open}
 >
-  <Ionicons name="cash-outline" size={16} color={colors.textInverse} />
+  <Ionicons name="cash-outline" size={22} color={colors.textInverse} />
-  <AppText className="text-[11px] font-medium text-white mt-1 text-center">
+  <AppText className="text-[11px] font-medium text-white mt-1.5 text-center">
     Record Payment
   </AppText>
 </Pressable>
```

Apply the same three edits to all 4 tiles:
1. `py-[11px]` → `py-3 min-h-[64px]`
2. `size={16}` → `size={22}`
3. `mt-1` → `mt-1.5`

### 3.2 Why these specific values

- **Icon `22`**: lands between Ionicons' "filled" sweet spot (20–24). At 22 it's prominent but not chunky on a tile that's ~80pt wide on a 375pt phone with 4 tiles + gaps.
- **`py-3` (12dp)**: replaces `py-[11px]` (the magic number disappears). Standard 4dp grid value.
- **`min-h-[64px]`**: floor for the tile so 4 tiles look uniform regardless of content. ~22pt icon + ~12pt gap + ~14pt label + 12pt × 2 padding = ~72pt actual; the floor keeps short labels (e.g. "Add Unit") on the same height as longer ones.
- **`mt-1.5` (6dp)**: gap between icon and label. `mt-1` (4dp) would look cramped at the new icon size.
- **Label class unchanged**: `text-[11px] font-medium` — already correct.
- **Horizontal padding `px-1` unchanged**: tight but acceptable. If a label wraps awkwardly on small phones (verify in smoke test), bump to `px-2` (8dp).

### 3.3 Single iteration

The fix is one file (`components/home/QuickActionBar.tsx`). All 4 tiles are visually identical except for icon name and active state — apply the same diff to each.

---

## 4. Implementation steps

| # | Task | Complexity |
|---|---|---|
| 1 | Edit `components/home/QuickActionBar.tsx` per section 3 | XS |
| 2 | Visual sanity — tiles balanced, no text wrap on 375pt | XS |
| 3 | `npx tsc --noEmit` clean | XS |
| 4 | Smoke test on iOS + Android — taps still route correctly to Record Payment / Add Tenant / Add Unit / Log Issue | XS |
| 5 | Compare against `docs/screenshots/dark/01_home_dashboard.png` if available | XS |

**Estimate:** ~5 minutes.

---

## 5. Acceptance criteria

- [ ] All 4 tiles: `size={22}` on the Ionicons (was 16).
- [ ] All 4 tiles: `py-3 min-h-[64px]` (was `py-[11px]`).
- [ ] All 4 tiles: `mt-1.5` icon-to-label gap (was `mt-1`).
- [ ] Label class unchanged (`text-[11px] font-medium`).
- [ ] No raw hex introduced (already in compliance).
- [ ] `npx tsc --noEmit` clean.
- [ ] Visual: icon dominates the tile; label is supporting text; no text wrap on a 375pt phone.

---

## 6. Out of scope

- Changing the 4 tiles' destinations (Record Payment, Add Tenant, Add Unit, Log Issue) — keep the routes as they are.
- Animating the tile press — `Pressable` default is fine for compact tiles like these (no need for the project's standard scale-on-press; the tile is small enough that scale would feel jittery).
- Reordering the tiles or changing the active state semantics (currently the first tile uses `bg-primary`; the rest use `bg-surface`).
- Replacing Ionicons with a custom set — out of scope.
- Migrating QuickActionBar onto the spec 26 `<Card>` atom — defer until spec 26 lands. The chrome here (rounded-[12px], bg-primary/bg-surface) is similar but the tile is square-ish, which is a different visual ratio than the standard card. Re-evaluate after spec 26.

---

## 7. Open questions

1. **`px-1` horizontal padding** — keep at 4dp or bump to `px-2` (8dp)? Spec says keep; if smoke test shows label wrapping awkwardly on a 375pt phone, bump.
2. **Active state choice** — currently the "Record Payment" tile uses `bg-primary`. The other three use `bg-surface text-text-muted`. If the design intent is "all tiles look equal until pressed," remove the per-tile `bg-primary` and keep all 4 on `bg-surface`. Engineer should verify against `dark/01_home_dashboard.png`.
3. **Icon weight** — `Ionicons` default is `outline`. If the design references show filled icons in the QuickActionBar, switch the names from `cash-outline` → `cash`, etc. Verify visually.
