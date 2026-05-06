# Session 08 — Maintenance Screens

**Prerequisites:** Sessions 01, 02, 03.

**Screens:**
- `app/(admin)/maintenance/index.tsx` — Maintenance Log (new)
- `app/(admin)/maintenance/new.tsx` — Log Issue (new)

---

## Locked Design Decisions

- Follow `references/dark/` images. Dark only. Blue primary `#3B82F6`.
- `colors.*` tokens only. No hardcoded hex. `Pressable` + Reanimated. Ionicons.

---

## Screen: Maintenance Log

**File:** `app/(admin)/maintenance/index.tsx` *(new)*  
**Reference:** `dark_23_maintenance_log.png`

### Navigation entry points
- From Unit Detail → "View all" in Maintenance section (pre-filtered to that unit: `?unitId=[id]`)
- From Home quick actions (future)
- Direct deep link

`ScreenHeader` title "Maintenance". Back button.

### FilterChipBar
Options: All(N) | Open | In Progress | Resolved

Filter maps to `maintenance_issues.status`:
- Open → `REPORTED`
- In Progress → `IN_PROGRESS`
- Resolved → `RESOLVED`

### Issue list
`FlatList` of `MaintenanceRow`. Each row tappable (future: maintenance detail screen — for now just show a toast or no-op). `EmptyState` when list is empty.

Row left-side dot colors:
- REPORTED → `colors.warning` `#F59E0B`
- IN_PROGRESS → `colors.danger` `#EF4444`
- RESOLVED → `colors.success` `#10B981`

StatusChip mapping:
- REPORTED → `StatusChip` variant=neutral, label="REPORTED"
- IN_PROGRESS → `StatusChip` variant=warning, label="IN PROGRESS"
- RESOLVED → `StatusChip` variant=success, label="RESOLVED"

### FAB
`+` button fixed bottom-right → `router.push('/(admin)/maintenance/new')`.

### Data
`useMaintenance({ unitId?, propertyId?, status? })` — filtered issue list.

---

## Screen: Log Issue (Add Maintenance)

**File:** `app/(admin)/maintenance/new.tsx` *(new)*  
**Reference:** `dark_24_add_maintenance.png`

`ScreenHeader` title "Log Issue". Back button.

### Fields (ScrollView, `paddingHorizontal: 16`)

**Unit**
`Select` component — dropdown to pick unit. Pre-filled if `?unitId=` query param present (from Unit Detail or Home quick action). Shows "Unit 1A — Building A" format.

**Category** (single-select chip group)
6 options in wrapping flex row:
```
Plumbing  |  Electrical  |  Structural
Pest      |  Appliance   |  Other
```
Visual: same as `FilterChipBar` chips. Selected = `colors.primary` bg. Unselected = `colors.elevated` bg, `colors.border` border.

**Priority** (single-select chip group)
4 options in a row:
```
Low  |  Medium  |  High  |  Urgent
```
- Low → neutral style (unselected bg)
- Medium → neutral style
- High → `colors.primary` bg when selected
- Urgent → `colors.danger` bg when selected (ALWAYS danger styled, not just on select)

**Description**
Multiline `Input`, placeholder "Describe the issue...", minHeight 100, `textAlignVertical: 'top'`.

**Repair cost (₱)**
`Input` label "Repair cost (₱)" with note below: "Fill in after repair". `keyboardType: 'numeric'`. Optional.

**Photo (optional)**
Tappable zone: `backgroundColor: colors.elevated`, `borderRadius: 10`, `padding: 20`, dashed border, centered camera icon + "Add photo (optional)" label. On tap → image picker.

### BottomCTABar
"Log Issue" — primary pill CTA.

On save: insert into `maintenance_issues` with `status = 'REPORTED'`. → `router.back()`.

### Validation
- Unit required
- Category required
- Priority required
- Description required (min 5 chars)

Show inline error text below field on submit attempt.

---

## DB Schema Reference

```sql
CREATE TABLE maintenance_issues (
  id           TEXT PRIMARY KEY,
  unit_id      TEXT NOT NULL REFERENCES units(id),
  category     TEXT NOT NULL,  -- PLUMBING|ELECTRICAL|STRUCTURAL|PEST|APPLIANCE|OTHER
  priority     TEXT NOT NULL,  -- LOW|MEDIUM|HIGH|URGENT
  description  TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'REPORTED',  -- REPORTED|IN_PROGRESS|RESOLVED
  photo_uri    TEXT,
  repair_cost  REAL,
  charged_to_tenant INTEGER DEFAULT 0,
  reported_at  TEXT NOT NULL,
  resolved_at  TEXT,
  created_at   TEXT NOT NULL
);
```

---

## Done Criteria

- [ ] Maintenance log: FilterChipBar filters by status correctly
- [ ] Maintenance log: FAB navigates to Log Issue
- [ ] Maintenance log: dot color matches status (yellow=reported, red=in-progress, green=resolved)
- [ ] Log issue: category chips single-select, 6 options
- [ ] Log issue: priority chips — Urgent always danger-styled
- [ ] Log issue: form validation blocks save if required fields empty
- [ ] Log issue: inserts record with status=REPORTED, navigates back
- [ ] TypeScript compiles clean
