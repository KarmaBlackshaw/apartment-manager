# Units Pages Deduplication — Implementation Plan
**Spec:** `docs/specs/08_units_pages_dedup_spec.md`
**Date:** 2026-05-09

---

## Steps

| # | Task | Complexity | File(s) |
|---|---|---|---|
| 1 | Delete `app/(admin)/properties/[propertyId]/units/index.tsx` | low | 1 deleted |
| 2 | Edit `app/(admin)/properties/[propertyId]/units/_layout.tsx` — remove `<Stack.Screen name="index" />` | low | 1 patched |
| 3 | Delete `app/(admin)/settings/units/_layout.tsx` | low | 1 deleted |
| 4 | Delete `app/(admin)/settings/units/index.tsx` | low | 1 deleted |
| 5 | Delete `app/(admin)/settings/units/new.tsx` | low | 1 deleted |
| 6 | Edit `app/(admin)/settings/_layout.tsx` — remove `<Stack.Screen name="units" />` | low | 1 patched |
| 7 | Verify `app/(admin)/settings/index.tsx` has no `/settings/units` link | low | read-only |
| 8 | Run grep audits (§4 of spec) — both must be empty | low | — |
| 9 | `npx tsc --noEmit` must be clean | low | — |

## Acceptance criteria (from spec §7)

- [ ] `properties/[propertyId]/units/index.tsx` deleted
- [ ] `settings/units/` directory and all 3 files deleted
- [ ] `properties/[propertyId]/units/_layout.tsx` does not register `index`
- [ ] `settings/_layout.tsx` does not reference `units`
- [ ] `grep -rn "settings/units" app/ components/ hooks/ lib/` → empty
- [ ] `grep -rn "/units['\"]|/units$" app/ components/` → empty
- [ ] `npx tsc --noEmit` clean
