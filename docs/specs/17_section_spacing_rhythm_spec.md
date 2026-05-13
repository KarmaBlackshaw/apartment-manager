# Section Spacing Rhythm

## TL;DR

Screens mix `mt-2`, `mt-3`, `mt-4`, `mt-5` between sections inconsistently. Pick **`mt-3` (12dp)** as the canonical inter-section gap and migrate. Card-internal spacing (between rows inside a card) keeps `mt-2` (8dp).

**Lowest priority of the cleanup batch — visually small wins.** Do this last, or pair with screen rebuilds.

## Agent prompt

```
Implement docs/specs/17_section_spacing_rhythm_spec.md exactly.

Pick mt-3 (12dp) as inter-section gap; mt-2 (8dp) within cards.
When 3+ siblings share a gap, use parent <View className="gap-3">
instead of repeated mt-3 children.

Audit:
  grep -rEn 'className="[^"]*mt-[2-9]' app/ components/

Migration order (top-priority screens first):
  1. Home (app/(admin)/index.tsx)
  2. Tenant Detail (app/(admin)/tenants/[id]/index.tsx)
  3. Property Detail
  4. Unit Detail
  5. Bill Detail
  6. All others (Settings sub-screens, Reports)

Forbidden: mt-5 / mt-6 / mt-7 (off the 4/8 dp grid).
Allowed exceptions: mt-4 / mt-8 for deliberate heavier breaks
(e.g. Danger zone separators).

Run `npx tsc --noEmit`. Verify section 5 acceptance. Smoke test — visuals
tighter and more consistent. ~60 min. Do NOT commit.

After verification passes, delete this spec:
  rm docs/specs/17_section_spacing_rhythm_spec.md
```

---

## 1. The rhythm rule

Per CLAUDE.md "Design System" — `12px gap between sections`, 4/8 dp grid.

Canonical scale:

| Distance | Class | Use |
|---|---|---|
| 4dp | `mt-1` | Inline labels, tight elements |
| 8dp | `mt-2` | Within-card between rows |
| 12dp | `mt-3` | **Inter-section gap (default)** |
| 16dp | `mt-4` | Heavier section break (use sparingly) |
| 32dp | `mt-8` | "Danger zone" separators (Delete buttons, etc.) |

Don't use `mt-5` / `mt-6` / `mt-7` — they fall off the 4/8 dp grid.

## 2. Audit

Manual review of each screen's scroll content. Look for `mt-2`, `mt-4`, `mt-5` between top-level sections (between BalanceCard and Tenant Info, between Maintenance and Documents, etc.).

Spec 03 (Unit Detail) section 2 already established this for one screen. Apply project-wide.

```bash
grep -rEn "className=\"[^\"]*mt-[2-9]" app/ components/
```

## 3. Migration

### 3.1 Inter-section gap → `mt-3`

```tsx
// BEFORE — mixed
<View className="mt-4">{/* Section A */}</View>
<View className="mt-2">{/* Section B */}</View>

// AFTER — one rhythm
<View className="mt-3">{/* Section A */}</View>
<View className="mt-3">{/* Section B */}</View>
```

### 3.2 Within-card row gap → `mt-2`

```tsx
<View className="bg-surface rounded-xl p-4">
  <AppText variant="title">Card title</AppText>
  <AppText className="mt-2" variant="caption" color="muted">Subtitle</AppText>
  <View className="mt-2">{/* row */}</View>
</View>
```

### 3.3 Use `gap-3` on parent `<View>` instead of repeated `mt-3`

When 3+ siblings share the same gap, use the parent's `gap` class:

```tsx
// BEFORE
<View>
  <Section1 className="mt-3" />
  <Section2 className="mt-3" />
  <Section3 className="mt-3" />
</View>

// AFTER
<View className="gap-3">
  <Section1 />
  <Section2 />
  <Section3 />
</View>
```

Cleaner, harder to drift.

## 4. Implementation steps

| # | Task | Complexity |
|---|---|---|
| 1 | Run audit grep | XS |
| 2 | Per screen, pick the rhythm: inter-section `mt-3` (or `gap-3`), within-card `mt-2` | M |
| 3 | Migrate top-priority screens first (Home, Tenant Detail, Property Detail, Unit Detail, Bill Detail) | M |
| 4 | Lower-priority screens (Settings sub-screens, Reports) | M |
| 5 | `tsc --noEmit` clean | XS |
| 6 | Smoke test — visuals tighter and more consistent | M |

**Estimate:** ~60 minutes (subjective work, screen-by-screen judgment).

## 5. Acceptance

- [ ] No `mt-5`, `mt-6`, `mt-7` in screen files (off-grid values).
- [ ] Inter-section gaps use `mt-3` or `gap-3` consistently.
- [ ] Within-card row gaps use `mt-2` consistently.
- [ ] Visual consistency across the dashboard, tenant detail, property detail, unit detail, bill detail.

## 6. Out of scope

- Changing existing card padding (`p-4`) — that's separate.
- `pb-[88px]` floating-tab clearance — fixed value, not part of rhythm.
- `mt-4` / `mt-8` for **deliberate** heavier breaks (Danger zone separators) — keep when intentional.

## 7. Prevention

Add to CLAUDE.md "Design System" if not already explicit:

> Inter-section gap: `mt-3` (12dp) or `gap-3` on parent `<View>`. Within-card rows: `mt-2`. Avoid `mt-5/6/7` — off-grid.
