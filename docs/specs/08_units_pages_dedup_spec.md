# Units Pages Deduplication

**Trigger:** User reported a duplicate Units page. Investigation found **two** dead/duplicate listings, both pointing at the same data the Property Detail screen already renders inline.
**Audience:** Engineer agent.
**Skills consulted:** `using-superpowers` (skill discipline applied).

---

## 0. TL;DR

Three views currently exist for "units." Only one is canonical:

| Route | What it shows | Reachable from UI? | Decision |
|---|---|---|---|
| `app/(admin)/properties/[propertyId]/index.tsx` | Property Detail — header card + **2-col `<UnitGridCard>` grid** of the property's units inline | ✅ via Property List → property tap | ✅ **Keep — canonical** |
| `app/(admin)/properties/[propertyId]/units/index.tsx` | Standalone "Units" list — same units, single-column `<UnitCard>` rows | ❌ no UI link (`grep` returns empty) | ❌ **Delete** |
| `app/(admin)/settings/units/index.tsx` | Cross-property "Units" list — `<PropertySection>` per property, each with `<UnitCard>` rows | ❌ Settings index has no link to it; deletable | ❌ **Delete** |

Property Detail's embedded grid is the only place users need to browse units. Add Unit and Unit Detail (the destinations users actually need) live at `/(admin)/properties/[propertyId]/units/new` and `/(admin)/properties/[propertyId]/units/[id]` respectively — those stay.

## Agent prompt

```
Implement docs/specs/08_units_pages_dedup_spec.md exactly.

Delete 4 files (§2): the standalone properties/[propertyId]/units/
index.tsx + the entire settings/units/ directory (3 files).

Patch 2 _layout.tsx files (§3): drop the index entry from
properties/[propertyId]/units/_layout.tsx; drop the units entry
from settings/_layout.tsx.

Run §4 grep checks — both must return empty:
  grep -rn "settings/units" app/ components/ hooks/ lib/
  grep -rn "/units['\"]\|/units$" app/ components/

Constraints:
- Do NOT commit.
- npx tsc --noEmit clean.

Verify §7 acceptance (8 items). Smoke test §5: Property Detail
intact, Add Unit works, Unit Detail works, Settings tab loads.
~10 min.

After verification passes, mark this spec done:
  git mv docs/specs/08_units_pages_dedup_spec.md docs/specs/08_units_pages_dedup_spec_DONE.md
```

---

## 1. Why both lists are dead weight

### 1.1 `properties/[propertyId]/units/index.tsx`
- 56 LOC. Renders a flat list of `<UnitCard>`.
- `grep -rn "/units['\"]\|/units$" app/ components/` returns **0 hits** — no UI element navigates to the bare `/units` path.
- Reachable only via deep link.
- Property Detail already shows this data in a more informative grid (status-coded left border, chip).

### 1.2 `settings/units/index.tsx`
- 75 LOC. Renders a `<PropertySection>` per property; each section calls `useUnits(property.id)` separately → **N+1 query firing** as the list grows.
- Settings index (`app/(admin)/settings/index.tsx`) has no link to it (verified with `grep`).
- Functional duplication; tapping a row routes to the same `/properties/{id}/units/{id}` Unit Detail destination.

### 1.3 Why this happened
Earlier sessions built the standalone listings as scaffolds before Property Detail's inline grid was implemented. The grid replaced them functionally but the old screens were never removed. Classic dead-code accumulation.

---

## 2. Files to delete

```
app/(admin)/properties/[propertyId]/units/index.tsx        ← property-scoped standalone list

app/(admin)/settings/units/_layout.tsx                     ← entire settings/units stack
app/(admin)/settings/units/index.tsx
app/(admin)/settings/units/new.tsx
```

Total: **4 files deleted**, plus the empty `app/(admin)/settings/units/` directory removed.

### What stays
- `app/(admin)/properties/[propertyId]/units/new.tsx` — Add Unit form. Reachable via Property Detail's "Add unit" section-header link and (per spec 09) the empty-state Add Unit button.
- `app/(admin)/properties/[propertyId]/units/[id]/index.tsx` — Unit Detail. Reachable via tapping a `<UnitGridCard>`.
- `app/(admin)/properties/[propertyId]/units/[id]/documents.tsx` — Unit Documents.
- `app/(admin)/properties/[propertyId]/units/_layout.tsx` — Stack wrapper for the surviving routes.
- `app/(admin)/properties/[propertyId]/units/[id]/_layout.tsx` — same.

---

## 3. Files to patch

### 3.1 `app/(admin)/properties/[propertyId]/units/_layout.tsx`

Remove the `<Stack.Screen name="index" />` registration if present:

```tsx
// BEFORE
<Stack screenOptions={{ ...darkStackOptions, headerShown: false }}>
  <Stack.Screen name="index" options={{ headerShown: false }} />
  <Stack.Screen name="new" options={{ headerShown: false }} />
  <Stack.Screen name="[id]" options={{ headerShown: false }} />
</Stack>

// AFTER (drop the `index` line — file no longer exists)
<Stack screenOptions={{ ...darkStackOptions, headerShown: false }}>
  <Stack.Screen name="new" options={{ headerShown: false }} />
  <Stack.Screen name="[id]" options={{ headerShown: false }} />
</Stack>
```

expo-router does not throw when an `index.tsx` is missing under a stack — the route just no longer matches. `new` and `[id]` keep working.

### 3.2 `app/(admin)/settings/_layout.tsx`

Remove the `<Stack.Screen name="units" />` registration:

```tsx
// BEFORE
<Stack.Screen name="units" options={{ headerShown: false }} />

// AFTER (drop the line; the units directory is gone)
```

### 3.3 `app/(admin)/settings/index.tsx`

**Verify** there is no SettingsRow or other link pointing to `/(admin)/settings/units`. Per current grep, none exists. If something has been added since, remove it.

---

## 4. Verification — must be empty after deletion

```bash
# No reference to either deleted listing
grep -rn "settings/units" app/ components/ hooks/ lib/

# No reference to bare /units path (only /units/new and /units/[id] should remain)
grep -rn "/units['\"]\|/units$" app/ components/
```

Expected: both empty.

```bash
# Sanity check — ensure Property Detail still references unit detail and add forms
grep -n "/units/new\|/units/" app/\(admin\)/properties/\[propertyId\]/index.tsx
```

Expected: at least 2 hits (Add unit + tap unit card → detail).

---

## 5. Knock-on effects to verify

| Concern | Expected behavior |
|---|---|
| Property Detail unaffected | Embedded unit grid still renders; tap routes to Unit Detail; "Add unit" routes to form |
| Settings tab loads cleanly | No runtime warning about missing `units` route |
| Unit Detail still reachable | Tap a `<UnitGridCard>` from Property Detail → `/units/[id]` |
| Add Unit still reachable | "Add unit" link from Property Detail → `/units/new` |
| `tsc --noEmit` clean | No dangling imports referencing the deleted files |
| No broken deep links | If any external link or notification handler points to `/settings/units` or bare `/units`, it now no-ops. `grep` shows zero such references in code |

---

## 6. Implementation steps

| # | Task | Complexity | Files |
|---|---|---|---|
| 1 | Delete `app/(admin)/properties/[propertyId]/units/index.tsx` | XS | 1 |
| 2 | Edit `app/(admin)/properties/[propertyId]/units/_layout.tsx` — drop `<Stack.Screen name="index" />` | XS | 1 |
| 3 | Delete `app/(admin)/settings/units/_layout.tsx` | XS | 1 |
| 4 | Delete `app/(admin)/settings/units/index.tsx` | XS | 1 |
| 5 | Delete `app/(admin)/settings/units/new.tsx` | XS | 1 |
| 6 | Edit `app/(admin)/settings/_layout.tsx` — drop `<Stack.Screen name="units" />` | XS | 1 |
| 7 | Verify Settings index has no `/settings/units` link (per §3.3) | XS | 0 (read only) |
| 8 | Run grep audits per §4 — both must be empty | XS | — |
| 9 | `npx tsc --noEmit` clean | XS | — |
| 10 | Smoke test §5: Property Detail intact, Add Unit works, Unit Detail works, Settings tab loads | S | — |

**Estimate:** ~10 minutes.

---

## 7. Acceptance criteria

- [ ] `app/(admin)/properties/[propertyId]/units/index.tsx` deleted.
- [ ] `app/(admin)/settings/units/` directory and all 3 files deleted.
- [ ] `properties/[propertyId]/units/_layout.tsx` does not register `index`.
- [ ] `settings/_layout.tsx` does not reference `units`.
- [ ] `grep -rn "settings/units" app/ components/ hooks/ lib/` returns empty.
- [ ] `grep -rn "/units['\"]\|/units$" app/ components/` returns empty (only `/units/new` and `/units/[id]` references remain).
- [ ] Property Detail unchanged: unit grid renders, "Add unit" routes correctly, unit cards route correctly.
- [ ] Settings tab loads without runtime errors.
- [ ] `npx tsc --noEmit` clean.

---

## 8. Out of scope

- **Property Detail redesign** — covered by `09_property_detail_redesign_spec.md`. Apply that spec separately.
- **Unit Detail rebuild** — covered by `03_unit_detail_spec.md`.
- **Add Unit form changes** — separate spec if needed.
- **Adding a "Units across all properties" view** — if that becomes useful later, build it as a Reports screen, not a navigation duplicate. Out of scope here.
- **Touching the Property-scoped `units/_layout.tsx` beyond removing the `index` registration** — the layout still wraps `new` and `[id]`; leave its other config alone.
