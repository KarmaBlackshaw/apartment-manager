# Raw Hex / RGBA Purge

## TL;DR

Audit found **177 raw hex / rgba literals** in `app/` + `components/` + `layouts/`. CLAUDE.md "Color tokens" rule explicitly forbids them outside `tailwind.config.js` and `components/illustrations/`. This spec is a project-wide migration to NativeWind classes or `colors.*` tokens.

**Largest cleanup in this batch.** Tedious but mechanical. ~177 hits to triage.

## Agent prompt

```
Implement docs/specs/15_raw_hex_purge_spec.md exactly.

Read first:
1. docs/specs/15_raw_hex_purge_spec.md (source of truth)
2. CLAUDE.md "Color tokens — no raw hex outside tailwind.config.js"

Run in 3 phases per section 4:

Phase A — Token-mapped replacements (section 4.1):
  Add subtle/tint tokens to constants/theme.ts first (section 3:
  successSubtle, dangerSubtle, warningSubtle, infoSubtle,
  accentSubtle, tealSubtle). Then run the regex mapping table
  (section 4.1) project-wide.

Phase B — NativeWind arbitrary values (section 4.2):
  Replace `text-[#xxx]` and `bg-[#xxx]` with named classes;
  extend tailwind.config.js if needed.

Phase C — Triage leftovers (section 4.3):
  Anything not mapping cleanly: add to tailwind.config.js or
  one-off.

EXEMPT directories (raw hex allowed):
  - tailwind.config.js (it IS the tokens)
  - components/illustrations/** (per spec 10 section 6)

Run audit between phases:
  grep -rEn "#[0-9a-fA-F]{6}|rgba\(" app/ components/ layouts/ \
    | grep -v "tailwind.config\|illustrations"

Final result must be 0 hits. Run `npx tsc --noEmit` clean. Verify
section 6 acceptance. Smoke test every screen — visuals identical. ~90-120
min. Do NOT commit.

After verification passes, mark this spec done:
  git mv docs/specs/15_raw_hex_purge_spec.md docs/specs/15_DONE_raw_hex_purge_spec.md
```

---

## 1. Audit command

```bash
grep -rEn "#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}\\b|rgba\\(" \
  app/ components/ layouts/ \
  | grep -v "tailwind.config\|node_modules\|.expo\|components/illustrations"
```

177 hits today.

## 2. Classification

Each hit falls into one of these buckets:

| Bucket | Action | Examples |
|---|---|---|
| **Brand color literals** (e.g. `#3B82F6`, `#22C98A`) | Replace with `colors.primary`, `colors.success` etc. | `Ionicons color="#3b82f6"` → `Ionicons color={colors.primary}` |
| **Semantic background tints** (e.g. `'rgba(34,201,138,0.12)'`) | Add `colors.successSubtle` etc. tokens to `constants/theme.ts`; replace literals | `iconBg: 'rgba(34,201,138,0.12)'` → `iconBg: colors.successSubtle` |
| **Status bar / system colors** (`#0d0d0d`, `#171717`) | Replace with `colors.background`, `colors.surface` | `style={{ backgroundColor: '#0d0d0d' }}` → `className="bg-background"` |
| **Text color hex** (`#94A3B8`, `#555555`, `#f1f1f1`) | Replace with `colors.textPrimary`, `colors.textSecondary`, `colors.textMuted` | `color="#94A3B8"` → `color={colors.textSecondary}` |
| **One-off illustration / asset colors** | Move the file to `components/illustrations/` if applicable; otherwise add a token | — |
| **NativeWind arbitrary values** (`text-[#555555]`) | Replace with class (`text-text-muted`) or extend `tailwind.config.js` | `<Text className="text-[#555555]">` → `<Text className="text-text-muted">` |

## 3. Add subtle/tint tokens to `constants/theme.ts`

Several reportCard + KPICard usages need 12% alpha versions of brand colors. Add named tokens:

```ts
// constants/theme.ts (additions)
export const colors = {
  // ...existing
  successSubtle: 'rgba(34,201,138,0.12)',
  dangerSubtle:  'rgba(255,92,106,0.12)',
  warningSubtle: 'rgba(255,176,32,0.12)',
  infoSubtle:    'rgba(75,123,255,0.12)',
  accentSubtle:  'rgba(155,111,255,0.12)',
  tealSubtle:    'rgba(24,201,201,0.12)',
}
```

Mirror in `tailwind.config.js` if any consumer needs the NativeWind class (e.g. `bg-success-subtle`).

## 4. Migration approach

### 4.1 Phase A — token-mapped replacements

Most hits are direct token mappings. Build a regex replacement table:

| Hex | Token |
|---|---|
| `#3B82F6` / `#3b82f6` | `colors.primary` |
| `#22C98A` | `colors.success` |
| `#FF5C6A` | `colors.danger` |
| `#FFB020` | `colors.warning` |
| `#0D0D0D` / `#0d0d0d` | `colors.background` |
| `#171717` | `colors.surface` |
| `#1F1F1F` / `#1f1f1f` | `colors.elevated` |
| `#2A2A2A` / `#2a2a2a` | `colors.border` |
| `#F1F5F9` / `#f1f1f1` | `colors.textPrimary` |
| `#94A3B8` | `colors.textSecondary` |
| `#64748B` / `#555555` | `colors.textMuted` |
| `#9B6FFF` | `colors.purple` (verify in tailwind.config) |
| `#18C9C9` | `colors.teal` |

Run each replacement project-wide. Verify each pass with `tsc --noEmit`.

### 4.2 Phase B — NativeWind arbitrary values

```bash
grep -rEn '\\[#[0-9a-fA-F]{3,6}\\]' app/ components/
```

Replace `text-[#555555]`, `bg-[#171717]`, etc. with the named class.

### 4.3 Phase C — leftovers

Anything not mapping cleanly: triage one-by-one. If a hex doesn't match an existing token, it's a candidate to add to `tailwind.config.js`.

## 5. Implementation steps

| # | Task | Complexity |
|---|---|---|
| 1 | Add subtle/tint tokens to `constants/theme.ts` (section 3) | S |
| 2 | Build the regex mapping table (section 4.1) and run replacements | M |
| 3 | Replace NativeWind arbitrary values (section 4.2) | M |
| 4 | Triage leftovers; add tokens or fix one-off (section 4.3) | M |
| 5 | Run audit grep — must return only `tailwind.config.js` and `components/illustrations/` hits | XS |
| 6 | `npx tsc --noEmit` clean | XS |
| 7 | Smoke test: every screen — visuals identical, no missing colors | M |

**Estimate:** ~90–120 minutes (177 hits, mostly mechanical).

## 6. Acceptance

- [ ] Audit grep (section 1) returns zero hits in `app/`, `components/` (except `illustrations/`), `layouts/`.
- [ ] `constants/theme.ts` has the new subtle tokens.
- [ ] No visual regressions — colors preserved.
- [ ] `tsc --noEmit` clean.

## 7. Out of scope

- Adding a fully alpha-aware design token system — current hardcoded 12% is sufficient.
- Migrating Tailwind config color names — keep current `bg-primary` etc. naming.
- Touching `components/illustrations/**` — exempt per spec 10 section 6.
- Reviewing `tailwind.config.js`'s own hex values — those ARE the tokens.

## 8. Prevention

CLAUDE.md "Color tokens" rule already forbids raw hex outside `tailwind.config.js`. After this migration, add the audit grep to a project README or `.github/PULL_REQUEST_TEMPLATE.md` as a manual reviewer check.

ESLint rule (defer): pattern-match for `#[0-9a-fA-F]{3,6}` literals in `.tsx` files — flag as warning. Not built in this spec; defer until rule recurs.
