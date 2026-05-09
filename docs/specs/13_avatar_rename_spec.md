# Avatar Rename — `AvatarInitials` → `Avatar`

## TL;DR

CLAUDE.md "Component Map" lists `Avatar.tsx` as the project's avatar primitive. The actual file is named `AvatarInitials.tsx`. Same component, mismatched name. Rename the file and the export so code matches the documented API. **No new component, no consolidation — just a rename.**

**Audit:** only `AvatarInitials` exists. No second `Avatar.tsx` to merge with. ~10 callers project-wide.

## Agent prompt

```
Implement docs/specs/13_avatar_rename_spec.md exactly. Rename file
components/ui/AvatarInitials.tsx → Avatar.tsx; rename the export;
bulk find-replace `AvatarInitials` → `Avatar` in app/ + components/.
Run `npx tsc --noEmit`. Verify §5 acceptance. ~5 min.
Do NOT commit.

After verification passes, mark this spec done:
  git mv docs/specs/13_avatar_rename_spec.md docs/specs/13_avatar_rename_spec_DONE.md
```

---

## 1. Rename

| Before | After |
|---|---|
| `components/ui/AvatarInitials.tsx` | `components/ui/Avatar.tsx` |
| `export function AvatarInitials(...)` | `export function Avatar(...)` |

Component logic is unchanged. The "initials" suffix is implementation detail (Initials is the rendering strategy); the public API is "an avatar."

## 2. Migration

Bulk find-replace across `app/` and `components/`:
- Import path: `~/components/ui/AvatarInitials` → `~/components/ui/Avatar`
- Symbol: `AvatarInitials` → `Avatar` (imports and JSX)

Use IDE refactor or sed. Verify with `tsc --noEmit`.

## 3. CLAUDE.md

The "Component Map" already reads `Avatar.tsx`. No change needed; renaming the file aligns code with the doc.

## 4. Implementation steps

| # | Task | Complexity |
|---|---|---|
| 1 | Rename file: `git mv components/ui/AvatarInitials.tsx components/ui/Avatar.tsx` | XS |
| 2 | Edit the file: rename the exported function | XS |
| 3 | Find-replace `AvatarInitials` → `Avatar` across `app/` + `components/` | S |
| 4 | `npx tsc --noEmit` clean | XS |
| 5 | Smoke test: any screen with an avatar (Tenant List, Tenant Detail, Settings ProfileCard) | S |

**Estimate:** ~5 minutes.

## 5. Acceptance

- [ ] `components/ui/Avatar.tsx` exists; `AvatarInitials.tsx` does not.
- [ ] `grep -rn "AvatarInitials" app/ components/` returns empty.
- [ ] `tsc --noEmit` clean.
- [ ] Avatars render unchanged across the app.

## 6. Out of scope

- Adding a photo-based avatar variant (current is initials-only) — defer until a use case exists.
- Changing the avatar's visual treatment.
