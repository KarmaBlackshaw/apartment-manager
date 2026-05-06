# ApartmentManager — Simplification Plan + AI Spec

## What We're Cutting and Why

The first version must be fast to build and zero-friction for the landlord.
Features that require the landlord to think too hard before they can start = cut.
Everything cut can be added in v2 when users ask for it.

---

## Screens to Remove Entirely

| Screen | Reason |
|---|---|
| Bed Map | Landlord just needs to know who's in what bed and if they paid — a list handles this better than a visual grid |
| Floor View / Floor tabs on Property Detail | Adds navigation depth for no real benefit at this stage |
| Add/Edit Unit — floor, size, unit type, amenities fields | Overcomplicates unit creation — landlord just needs a name and a rent amount |

---

## Fields to Remove Per Screen

### Add / Edit Unit
**Remove:** Floor, Size (sqm), Unit type (studio/1BR/2BR/bedspacer), Amenities picker
**Keep:** Unit name/number, Monthly rent, Billing day, Notes

### Unit Detail
**Remove:** Unit type label (Studio · 22sqm), Amenities chips (Aircon, Private CR, WiFi, Furnished), Floor reference ("Unit 1A — Floor 1")
**Keep:** Unit name, Tenant info, Balance hero, Maintenance issues, Documents

### Property Detail
**Remove:** Floor tab switcher (Floor 1 / Floor 2 / Floor 3), floor-grouped unit grid
**Keep:** Property name, occupancy stats, single flat unit list (all units, no floor grouping)

### Onboarding Wizard
**Remove:** "Number of floors" field
**Keep:** Property name, Address, Province, Total units

### Database Schema
**Remove columns:** `units.floor`, `units.sqm`, `units.type`, `units.amenities`
**Remove table:** `beds` (entire table — bed-level tracking is out of scope for v1)

---

## Navigation Update

**Old:** Home · Tenants · Billing · Reports
**New:** Home · Tenants · Billing · Properties

Reports tab is removed. All report cards are accessible from the Home screen as tappable KPI cards. Each card navigates to its full report screen.

---

## Revised Screen List (29 screens, down from 35)

### System (2)
- App Lock
- Onboarding Wizard (simplified — no floor count)

### Home tab (3)
- Home / Dashboard (KPIs + Quick Actions + Collection Progress + Attention + Vacant + Units grid + Report cards)
- Notifications
- Settings

### Tenants tab (6)
- Tenant List
- Tenant Detail
- Add Tenant (5-step wizard — unchanged)
- Tenant ID Capture
- Tenant Payment History
- Tenant Documents

### Billing tab (6)
- Billing Overview
- Bill Detail
- Record Payment
- Receipt Preview
- Utility Reading
- Bulk Bill Generate
- Payment Detail

### Properties tab (6)
- Property List
- Property Detail (flat unit list — no floor tabs)
- Unit Detail (simplified — no type/size/amenities)
- Add / Edit Unit (simplified — name + rent + billing day + notes only)
- Maintenance Log
- Add Maintenance Issue
- Unit Documents

### Reports (accessed from Home — no tab) (5)
- Monthly Collection
- Outstanding Balances
- Occupancy Report
- Per-Unit Income
- Annual Summary
- Maintenance Cost Report

### Overlays (1)
- Quick Search

**Removed screens (6):** Bed Map, Move-Out Settlement (fold into Tenant Detail as an action), Floor View, Add/Edit Property (fold into Onboarding or Property List FAB)

> Note: Move-Out Settlement is kept as a modal/bottom sheet triggered from Tenant Detail, not a separate screen.

---

## Revised Database Schema

```sql
-- PROPERTIES
properties (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  address     TEXT,
  province    TEXT,
  created_at  TEXT DEFAULT (datetime('now'))
)

-- UNITS (simplified — no floor, sqm, type, amenities)
units (
  id           TEXT PRIMARY KEY,
  property_id  TEXT NOT NULL REFERENCES properties(id),
  name         TEXT NOT NULL,        -- e.g. "Unit 1A", "Room 3", "Bed Space 2"
  rent_amount  REAL NOT NULL,
  billing_day  INTEGER DEFAULT 1,    -- day of month rent is due
  status       TEXT DEFAULT 'vacant' CHECK(status IN ('occupied','vacant')),
  notes        TEXT,
  created_at   TEXT DEFAULT (datetime('now'))
)

-- TENANTS
tenants (
  id                TEXT PRIMARY KEY,
  unit_id           TEXT NOT NULL REFERENCES units(id),
  first_name        TEXT NOT NULL,
  last_name         TEXT NOT NULL,
  phone             TEXT,
  email             TEXT,
  move_in_date      TEXT NOT NULL,
  lease_type        TEXT DEFAULT 'monthly' CHECK(lease_type IN ('fixed','monthly')),
  lease_end_date    TEXT,
  deposit_amount    REAL DEFAULT 0,
  status            TEXT DEFAULT 'active' CHECK(status IN ('active','moved_out')),
  emergency_contact TEXT,            -- JSON: { name, phone, relationship }
  created_at        TEXT DEFAULT (datetime('now'))
)

-- DOCUMENTS
documents (
  id          TEXT PRIMARY KEY,
  ref_type    TEXT NOT NULL CHECK(ref_type IN ('tenant','unit')),
  ref_id      TEXT NOT NULL,
  type        TEXT NOT NULL CHECK(type IN ('contract','id','photo','permit','other')),
  label       TEXT NOT NULL,
  file_uri    TEXT NOT NULL,
  created_at  TEXT DEFAULT (datetime('now'))
)

-- BILLS
bills (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL REFERENCES tenants(id),
  unit_id         TEXT NOT NULL REFERENCES units(id),
  month           INTEGER NOT NULL,
  year            INTEGER NOT NULL,
  base_rent       REAL NOT NULL,
  electricity     REAL DEFAULT 0,
  water           REAL DEFAULT 0,
  other_charges   TEXT DEFAULT '[]',  -- JSON array: [{ label, amount }]
  late_fee        REAL DEFAULT 0,
  discount        REAL DEFAULT 0,
  total_amount    REAL NOT NULL,
  status          TEXT DEFAULT 'unpaid' CHECK(status IN ('unpaid','partial','paid')),
  generated_at    TEXT DEFAULT (datetime('now')),
  UNIQUE(tenant_id, month, year)      -- one bill per tenant per month
)

-- PAYMENTS
payments (
  id             TEXT PRIMARY KEY,
  bill_id        TEXT NOT NULL REFERENCES bills(id),
  tenant_id      TEXT NOT NULL REFERENCES tenants(id),
  amount         REAL NOT NULL,
  payment_date   TEXT NOT NULL,
  method         TEXT DEFAULT 'cash' CHECK(method IN ('cash','gcash','bank','other')),
  notes          TEXT,
  receipt_number TEXT UNIQUE,
  voided_at      TEXT,
  created_at     TEXT DEFAULT (datetime('now'))
)

-- UTILITY READINGS
utility_readings (
  id               TEXT PRIMARY KEY,
  unit_id          TEXT NOT NULL REFERENCES units(id),
  type             TEXT NOT NULL CHECK(type IN ('electric','water')),
  month            INTEGER NOT NULL,
  year             INTEGER NOT NULL,
  previous_reading REAL NOT NULL,
  current_reading  REAL NOT NULL,
  rate_per_unit    REAL NOT NULL,
  computed_amount  REAL NOT NULL,
  read_at          TEXT DEFAULT (datetime('now')),
  UNIQUE(unit_id, type, month, year)
)

-- MAINTENANCE
maintenance (
  id                 TEXT PRIMARY KEY,
  unit_id            TEXT NOT NULL REFERENCES units(id),
  category           TEXT NOT NULL CHECK(category IN ('plumbing','electrical','structural','pest','appliance','other')),
  priority           TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent')),
  description        TEXT NOT NULL,
  status             TEXT DEFAULT 'reported' CHECK(status IN ('reported','in_progress','resolved')),
  cost               REAL DEFAULT 0,
  charged_to_tenant  INTEGER DEFAULT 0,  -- boolean
  photo_uri          TEXT,
  reported_at        TEXT DEFAULT (datetime('now')),
  resolved_at        TEXT
)
```

---

## Revised Component List

Same layer structure, but with these removed or simplified:

**Removed components:**
- `BedCell` — bed map is cut
- `IDCaptureFrame` — simplify to just a camera button in Add Tenant, not a dedicated component

**Simplified components:**

### `UnitCell` (simplified)
```tsx
// No type, no size, no amenities
<UnitCell
  name="Unit 1A"
  tenant="Santos, Jose"   // or null if vacant
  status="overdue"        // paid | overdue | vacant
  onPress={...}
/>
```

### `AddUnitForm` (simplified)
```tsx
// 4 fields only
- Unit name / number   (text input, required)
- Monthly rent ₱       (numeric input, required)
- Billing day          (picker: 1st–31st, default 1st)
- Notes                (text area, optional)
```

### `PropertyDetail` (simplified)
```tsx
// No floor tabs — just a flat list of all units
<PropertyDetail>
  <SummaryStrip />         // occupancy % + collection progress
  <UnitList />             // flat FlashList of UnitCell
  <FAB />                  // add unit
</PropertyDetail>
```

---

## AI Spec — Feed This to Claude Code

```
SIMPLIFICATION CHANGES — apply these before building any unit or property screen:

1. REMOVE from units table: floor, sqm, type (studio/1BR/2BR/bedspacer), amenities
   KEEP: id, property_id, name, rent_amount, billing_day, status, notes, created_at

2. REMOVE from Add/Edit Unit screen: Floor field, Size (sqm) field, Unit type picker,
   Amenities tag picker
   KEEP: Unit name/number (required), Monthly rent in ₱ (required),
   Billing day picker (default 1st), Notes (optional text area)

3. REMOVE from Unit Detail screen: unit type label, sqm label, amenities chip row,
   floor reference in the unit name
   Unit name displays as-is (e.g. "Unit 1A" not "Unit 1A — Floor 1 · Studio · 22sqm")

4. REMOVE from Property Detail screen: floor tab switcher (Floor 1 / Floor 2 / Floor 3)
   REPLACE WITH: single flat FlashList of all units for this property, no grouping

5. REMOVE from Onboarding Wizard: "Number of floors" field
   KEEP in onboarding: Property name, Address, Province, Total units

6. REMOVE entirely: Bed Map screen (BedMapScreen) — do not build it
   REMOVE entirely: beds table from schema — do not create it

7. REMOVE entirely: separate Move-Out screen
   REPLACE WITH: "Move Out" button inside Tenant Detail that opens a confirmation
   bottom sheet asking for move-out date and deposit deduction amount

8. Navigation tabs: Home · Tenants · Billing · Properties
   Reports tab does NOT exist — reports are accessed by tapping KPI cards on Home

9. Report cards on Home screen are tappable — each navigates to its report screen:
   - Monthly Collection card → reports/monthly-collection
   - Occupancy card → reports/occupancy
   - Outstanding card → reports/outstanding-balances
   - Maintenance card → reports/maintenance-costs
   - Per-Unit Income card → reports/per-unit-income
   - Annual Summary card → reports/annual-summary

10. UnitCell component props: name, tenant (string | null), status ('paid'|'overdue'|'vacant')
    No type, no size, no amenities, no floor

11. Total screens to build: 29 (not 35)
    Removed: Bed Map, Floor View, standalone Move-Out screen, Add/Edit Property
    (property creation happens in Onboarding + a simple form from Property List FAB)
```

---

## What This Unlocks for v2

When users are comfortable and start asking:
- Bed/bedspacer tracking → add `beds` table + Bed Map screen
- Unit categorization → add `type` + `amenities` columns to units
- Floor plans → add `floor` column + floor tab view on Property Detail
- Move-out workflow → promote bottom sheet to full screen with full settlement flow
- Reports tab → promote from Home cards to dedicated tab when report usage is high

None of these require architectural changes. They're additive — the schema and navigation are designed to accept them cleanly.