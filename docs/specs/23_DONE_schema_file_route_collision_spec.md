# Schema Sibling File ↔ Expo-Router Route Collision

## TL;DR

Runtime error:
> Route "./(admin)/properties/[propertyId]/units/[id]/edit.schema.ts" is missing the required default export.

**Root cause:** expo-router treats every `.ts` / `.tsx` file under `app/` as a route, **except** files (or parent dirs) starting with `_`. The CLAUDE.md "Form schemas live next to the form" rule prescribes `<screen>.schema.ts` as the preferred pattern — that pattern is incompatible with file-based routing because the schema file has no default-exported React component.

**Fix:** prefix every schema sibling file under `app/` with `_`. Specifically rename `edit.schema.ts` → `_edit.schema.ts`, update its single import, and patch the CLAUDE.md rule so this can't recur.

**Scope:** 1 file rename + 1 import path update + 1 CLAUDE.md section rewrite. ~5 minutes.

## Agent prompt

```
Implement docs/specs/23_schema_file_route_collision_spec.md exactly.

Read first:
1. docs/specs/23_schema_file_route_collision_spec.md (source of truth)
2. CLAUDE.md "Conventions" → "Form schemas live next to the form"

Execute §3 in order — 5 steps:
  1. git mv "app/(admin)/properties/[propertyId]/units/[id]/edit.schema.ts" \
            "app/(admin)/properties/[propertyId]/units/[id]/_edit.schema.ts"
  2. In app/(admin)/properties/[propertyId]/units/[id]/edit.tsx:
       change `from './edit.schema'` → `from './_edit.schema'`
     (single import line; no other edits to that file)
  3. Project-wide audit:
       find app/ -name "*.schema.ts" ! -name "_*"
     Each hit (today: only edit.schema.ts; should be empty after step 1):
     rename to add `_` prefix and patch its consumer's import path.
  4. Patch CLAUDE.md "Form schemas live next to the form" subsection
     per §4 of this spec — replace the body block verbatim.
  5. `npx tsc --noEmit` clean. Reload Expo dev server; the
     "missing default export" error must be gone.

Constraints:
- Do NOT commit (no `git commit`).
- Use `git mv` so the rename is tracked in git.
- The fix touches exactly: 1 schema file rename, 1 import path edit
  in edit.tsx, 1 subsection rewrite in CLAUDE.md, 1 spec rename at
  the end. Do NOT refactor anything else.
- Do NOT touch _edit.schema.ts contents — filename change only.

Verify §6 acceptance (5 items). ~5 min.

After verification passes, mark this spec done:
  git mv docs/specs/23_schema_file_route_collision_spec.md docs/specs/23_DONE_schema_file_route_collision_spec.md
```

---

## 1. Why this happens

Expo-router's file-based routing scans `app/**/*.tsx` and `app/**/*.ts`. Every file becomes a route **except**:

- Files whose names start with `_` (e.g. `_layout.tsx`, `_schema.ts`, `_edit.schema.ts`)
- Files inside a directory whose name starts with `_`
- Group directories like `(admin)` — those don't add to the URL but their children are still routes

So `edit.schema.ts` inside the unit-edit directory is interpreted as the route `/(admin)/properties/[propertyId]/units/[id]/edit.schema`. Expo-router then expects a default-exported React component, finds a zod schema, and throws:

> Route "./(admin)/properties/[propertyId]/units/[id]/edit.schema.ts" is missing the required default export.

The CLAUDE.md rule that introduced this pattern (Conventions → Form schemas) listed `<screen>.schema.ts` as the **preferred** path. **That guidance is wrong for any file under `app/`.** The `_schema.ts` alternative in the same rule already works because of its underscore.

## 2. The right pattern (going forward)

| File location | Naming rule |
|---|---|
| Inside `app/` (sibling to a screen file) | `_<screen>.schema.ts` (e.g. `_edit.schema.ts`, `_new.schema.ts`) — **underscore mandatory** |
| Inside `app/<dir>/` (grouped, screens share one schema) | `_schema.ts` (already underscore-prefixed) ✅ |
| Outside `app/` (e.g. `lib/schemas/`) | Any name (no router collision) |

The leading `_` is expo-router's canonical "this file is not a route" signal. Use it consistently for every schema sibling that lives under `app/`.

## 3. Implementation steps

| # | Task | Complexity | Files |
|---|---|---|---|
| 1 | `git mv "app/(admin)/properties/[propertyId]/units/[id]/edit.schema.ts" "..._edit.schema.ts"` | XS | 1 |
| 2 | Update single import line in `edit.tsx` from `'./edit.schema'` → `'./_edit.schema'` | XS | 1 |
| 3 | Run `find app/ -name "*.schema.ts" ! -name "_*"` — must return empty after step 1. If anything else is found, rename + patch consumer | XS | 0–N |
| 4 | Patch CLAUDE.md "Form schemas live next to the form" subsection per §4 (verbatim replacement) | XS | 1 (`CLAUDE.md`) |
| 5 | `npx tsc --noEmit` clean, then reload Expo dev server | XS | — |

**Estimate:** ~5 minutes.

## 4. CLAUDE.md rule replacement

In `CLAUDE.md`, find the existing "Form schemas live next to the form" subsection under "Conventions". The current body reads:

```
Every multi-field form has a sibling schema file — either `<screen>.schema.ts` (preferred) or `_schema.ts` for screens grouped under a directory. Keeps screens scannable, makes schemas reusable for create/edit variants, and isolates zod imports from JSX-heavy files.
```

Replace the **body** of that subsection (keeping the `### Form schemas live next to the form` heading) with:

```
Every multi-field form has a sibling schema file. **The filename MUST start with an underscore (`_`) when the file lives inside `app/`** — expo-router treats every non-underscored `.ts`/`.tsx` file as a route and throws when the file does not export a default React component.

Canonical patterns:
- Sibling-style: `_<screen>.schema.ts` next to `<screen>.tsx` (e.g. `_edit.schema.ts` next to `edit.tsx`)
- Grouped-style: `_schema.ts` for screens grouped under a directory
- Outside `app/`: `lib/schemas/<name>.schema.ts` — no underscore needed

**Forbidden:** `<screen>.schema.ts` directly under `app/` (no underscore). This pattern collides with file-based routing — see `docs/specs/23_DONE_schema_file_route_collision_spec.md`.
```

## 5. Audit (run before assuming step 3 is empty)

```bash
find /Users/admin/Documents/personal/apartment-manager/app \
  -name "*.schema.ts" ! -name "_*" 2>/dev/null
```

Expected today (pre-fix): one hit
- `app/(admin)/properties/[propertyId]/units/[id]/edit.schema.ts`

Expected after step 1: empty.

If the audit returns anything else (e.g. another screen has been built with a no-prefix schema since this spec was written), apply steps 1+2 to each.

## 6. Acceptance

- [ ] `find app/ -name "*.schema.ts" ! -name "_*"` returns empty.
- [ ] `app/(admin)/properties/[propertyId]/units/[id]/_edit.schema.ts` exists.
- [ ] `edit.tsx` imports from `'./_edit.schema'` (verify with `grep "from './_edit.schema'" app/(admin)/properties/[propertyId]/units/[id]/edit.tsx`).
- [ ] CLAUDE.md "Form schemas" rule body matches §4 verbatim (mentions underscore mandate + forbidden no-prefix pattern + reference to spec 23).
- [ ] Expo dev server starts without the "missing default export" route error; `npx tsc --noEmit` clean.

## 7. Out of scope

- Moving schemas out of `app/` to a top-level `schemas/` or `lib/schemas/` — defer; sibling-with-underscore is fine.
- Refactoring how schemas are imported (barrel files, etc.) — defer.
- Changing the CLAUDE.md "schema lives next to form" intent — only the filename rule changes.
- Touching `_edit.schema.ts` contents — filename change only.

## 8. Why this couldn't be a runtime fix

Could expo-router's behavior be patched in `app.json` or `expo-router` config to ignore `*.schema.ts`? Yes, in theory, via `unstable_settings` or a custom `routes` filter. **Rejected** because:
- It's a hidden, undocumented dependency on a library internal.
- Future expo-router updates may change the API.
- The underscore convention is stable, documented, and zero-config.

Stick with the underscore prefix. KISS.
