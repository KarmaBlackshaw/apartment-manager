# Session 07 — Property & Unit Screens

**Prerequisites:** Sessions 01, 02, 03.

**Screens:**
- `app/(admin)/properties/index.tsx` — Property List (partial fix)
- `app/(admin)/properties/[id].tsx` — Property Detail (partial fix)
- `app/(admin)/properties/[propertyId]/units/[id].tsx` — Unit Detail (partial fix)
- `app/(admin)/properties/[propertyId]/units/new.tsx` — Add/Edit Unit (partial fix)
- `app/(admin)/properties/[propertyId]/units/[id]/bed-map.tsx` — Bed Map (new)
- `app/(admin)/properties/[propertyId]/units/[id]/documents.tsx` — Unit Documents (new)

**Note on navigation:** Per Session 01, Properties is accessed from the Tenants tab stack — not a top-level tab. All these screens live under `app/(admin)/properties/` but are pushed from the Tenants tab. The Tenants tab bar item stays active when viewing these screens.

---

## Locked Design Decisions

- Follow `references/dark/` images. Dark only. Blue primary `#3B82F6`.
- `colors.*` tokens only. No hardcoded hex.

---

## Screen: Property List

**File:** `app/(admin)/properties/index.tsx`  
**Reference:** `dark_18_property_list.png`

`ScreenHeader` title "Properties". Bell icon right.

**List of `PropertyCard`** (full-width, `marginHorizontal: 16`). Each card:
- Building name bold
- Address `colors.textSecondary`
- Chips row: total units (neutral), occupied count (success), vacant count (danger if >0)
- Occupancy progress bar (success color fill)
- "₱42,000 / mo expected" `colors.textSecondary` caption

Below cards: dashed "Add property" card — `borderWidth: 1`, `borderStyle: 'dashed'`, `borderColor: colors.border`, `borderRadius: 12`, centered "+ Add property" text, `colors.textMuted`.

**FAB:** `+` button fixed bottom-right, 56×56, `backgroundColor: colors.primary`, `borderRadius: pill`, `elevation: 6`. → same action as dashed card → add property flow.

Tapping a `PropertyCard` → `router.push('/(admin)/properties/[id]')`.

### Data
`useProperties()` — list with occupancy stats.

---

## Screen: Property Detail

**File:** `app/(admin)/properties/[id].tsx`  
**Reference:** `dark_19_property_detail.png`

`ScreenHeader` title = property name (e.g. "Building A"). Right: edit icon (`create-outline`).

**Property summary card:**
`backgroundColor: colors.surface`, `borderRadius: 12`, `marginHorizontal: 16`, `padding: 16`.
- Occupancy %: large number (`colors.success`), "occupied" label
- Collected/total revenue: small text
- Progress bar (success fill)
- Alert chips row: e.g. "3 issues" (`danger`), "1 expiring" (`warning`) — only shown if count > 0

**Floor tabs:** `FloorTabSelector` — renders floor buttons for each floor in the property.

**Unit grid:** 2-column `FlatList` of `UnitGridCard`. Each card shows unit name, tenant name (or blank if vacant), `StatusChip`. Left border colored by status.

Tapping a unit card → `router.push('/(admin)/properties/[propertyId]/units/[id]')`.

### Data
`useProperty(id)` — property + stats. `useUnits(propertyId, floor)` — units for selected floor.

---

## Screen: Unit Detail

**File:** `app/(admin)/properties/[propertyId]/units/[id].tsx`  
**Reference:** `dark_20_unit_detail.png`

`ScreenHeader` title = unit name (e.g. "Unit 1A"). Right: `StatusChip` (OVERDUE/PAID/VACANT etc).

**Unit info card:**
`backgroundColor: colors.surface`, `borderRadius: 12`, `marginHorizontal: 16`, `padding: 16`.
- Unit name bold + floor label: "Unit 1A — Floor 1"
- Unit type badge: "Studio", "Furnished" chips
- Amenity chips row: `AmenityChipSelector` in display-only mode (non-interactive, just shows selected amenities as chips). Aircon, Private CR, WiFi etc.

**Current tenant row** (if occupied):
`AvatarInitials`, tenant name, "Move-in [date] · MTM", balance `AmountText` (owed variant), `colors.textSecondary`.
Tapping → `router.push('/(admin)/tenants/[tenantId]')`.

**Balance card** (if occupied):
`BalanceCard` — variant based on balance. `onRecordPayment` → billing/new.

**Maintenance section:**
`SectionHeader` "Maintenance (N open)" + "View all" → `router.push('/(admin)/maintenance?unitId=[id]')`.
Show first 2 `MaintenanceRow` items.

**Documents section:**
`SectionHeader` "Documents" + "View all" → `router.push('/(admin)/properties/[propertyId]/units/[id]/documents')`.
Show document type chips as tappable pills: "Contract", "ID Front", "Unit Photo" etc.

**If unit type is Bedspacer:**
Show "View Bed Map" row → `router.push('/(admin)/properties/[propertyId]/units/[id]/bed-map')`.

### Data
`useUnit(id)` — unit record, current tenant, balance, open maintenance count, document summary.

---

## Screen: Add / Edit Unit

**File:** `app/(admin)/properties/[propertyId]/units/new.tsx`  
**Reference:** `dark_21_add_edit_unit.png`

`ScreenHeader` title "Add Unit" or "Edit Unit". Back button.

**Fields (ScrollView):**
1. Unit number / name: `Input`, e.g. "Unit 1A"
2. Floor: `Input`, `keyboardType: 'numeric'`
3. Size (sqm): `Input`, optional, `keyboardType: 'numeric'`
4. Unit type: `SegmentedControl` — Studio | 1BR | 2BR | Bedspacer
5. Monthly rent (₱): `Input`, `keyboardType: 'numeric'`
6. Billing day: `Input` or `Select`, default "1st of month"
7. Amenities: `AmenityChipSelector` — Aircon, WiFi, Private CR, Furnished, Parking, Water included

**BottomCTABar:** "Save Unit" — primary pill CTA.

On save: insert/update unit record → `router.back()`.

If editing existing unit: pre-fill all fields from unit record.

---

## Screen: Bed Map

**File:** `app/(admin)/properties/[propertyId]/units/[id]/bed-map.tsx` *(new)*  
**Reference:** `dark_22_bed_map.png`

`ScreenHeader` title = "Room B1 — Beds" (room name + "Beds"). Back button.

**Room summary row:**
Inline chips: "5 occupied" (`success`), "1 vacant" (`neutral`). `backgroundColor: colors.surface`, `padding: 12`, `borderRadius: 10`.

**Bed grid:**
`FlatList numColumns={3}` of `BedSlotCard`. Each card: bed label (A1, A2...), tenant last name or "Vacant", status-colored bg.

**Legend row:**
3 dots with labels: Paid (`colors.success`), Overdue (`colors.danger`), Vacant (`colors.neutral`).

**Bed income section:**
`SectionHeader` "Bed income". Two `InfoRow` items:
- Monthly total: `AmountText` success (e.g. "₱10,000")
- Revenue lost: `AmountText` danger (e.g. "₱480 — Bed B2 · vacant 12 days")

Tapping a `BedSlotCard` (if occupied) → `router.push('/(admin)/tenants/[tenantId]')`.

### Data
`useBedMap(unitId)` — beds with occupancy + payment status. Revenue lost = daily_rate × days_vacant per bed.

---

## Screen: Unit Documents

**File:** `app/(admin)/properties/[propertyId]/units/[id]/documents.tsx` *(new)*  
**Reference:** `dark_25_unit_documents.png`

`ScreenHeader` title = "Unit 1A — Docs". Back button.

**FilterChipBar:** All(N) | Contract | Photos | Permits

**FlatList of `DocumentRow`** items.

**Dashed add row:** Below list — tappable dashed row "+ Add document or photo". Tap → image picker (library or camera).

### Document categories for this screen:
- contract (lease contract)
- photo (move-in condition photos, unit photos)
- permit (building permit, fire certificate)

### Data
`useUnitDocuments(unitId)` — reads `documents` table where `ref_type = 'UNIT'` and `ref_id = unitId`.
`useAddDocument(refType, refId)` — insert after picking image.

---

## Done Criteria

- [ ] Property list: `PropertyCard` shows chips + progress bar, FAB and dashed card both visible
- [ ] Property detail: Floor tabs filter unit grid, `UnitGridCard` has colored left border
- [ ] Property detail: alert chips (issues/expiring) show conditionally
- [ ] Unit detail: Amenity chips visible in info card (display-only)
- [ ] Unit detail: BalanceCard present, variant matches tenant status
- [ ] Unit detail: Maintenance section shows open-issue count
- [ ] Unit detail: "View Bed Map" row shown only for Bedspacer type
- [ ] Add unit: SegmentedControl for type, AmenityChipSelector works
- [ ] Bed map: 3-column grid of BedSlotCard, colored by status
- [ ] Unit documents: DocumentRow with correct icons per category
- [ ] TypeScript compiles clean
