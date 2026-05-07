# Add Tenant Wizard — Implementation Spec

**File:** `app/(admin)/tenants/new.tsx`
**Based on:** `01_form_and_wizard_components_spec.md` (Phase 5)
**Status:** Implemented

---

## Overview

5-step form wizard for onboarding a new tenant. Replaces previous hardcoded form with reusable `WizardShell` + form binder components.

**Screen size:** 260 lines (down from ~400 LOC)
**Field count:** 42 fields across 5 steps
**Form validation:** zod schema with per-step field groups
**API integration:** `useCreateTenant` hook, emergency contact JSON serialization

---

## Step Structure

### Step 1: Personal Info
**Title:** "New Tenant" | **Short Title:** "ID Capture"
**Required fields:** `fullName`, `phone`, `email`
**Optional:** `nickname`, `occupation`, `homeProvince`
**Skippable:** No

### Step 2: ID Capture (Optional)
**Title:** "Capture ID" | **Short Title:** "Emergency Contact"
**Fields:** `idFrontUri`, `idBackUri` (both optional)
**Skippable:** Yes — shows "Skip (not recommended)" link

Displays `InfoNote` banner: "Accepted: UMID · Driver's License · Passport · PhilHealth · Voter's ID"

### Step 3: Emergency Contact
**Title:** "Emergency Contact" | **Short Title:** "Unit Assignment"
**Required fields:** `emergencyName`, `emergencyPhone`
**Optional:** `emergencyRelation`
**Skippable:** No

Data serialized as JSON: `{ name, relation, phone }`

### Step 4: Unit Assignment
**Title:** "Assign Unit" | **Short Title:** "Billing Setup"
**Required fields:** `propertyId`, `unitId`, `moveInDate`, `contractType`
**Conditional:** `contractEndDate` (shown if `contractType === 'fixed'`)
**Skippable:** No

**Behavior:**
- `propertyId` select triggers reset of `unitId` on change
- `unitId` disabled until property selected; options filtered to `status === 'available'`; labels include monthly rate
- `contractEndDate` date input rendered only when contract type is "Fixed term"

### Step 5: Billing Setup
**Title:** "Billing Setup" | **Short Title:** "" (last step)
**Required:** `billingType`
**Skippable:** No

**If `billingType === 'monthly'`:**
- Required: `monthlyRent`, `billingDay` (1–28)
- Optional: `securityDeposit`, `advance`, `includeInternet`, `waterReading`, `electricityReading`
- Internet label: "Include Internet (₱{rate}/mo)" from settings

**If `billingType === 'daily'`:**
- Required: `dailyRate`, `numberOfDays`
- Optional: `securityDeposit`, `advance`

---

## Form State & Validation

**Validation mode:** `onTouched` (errors surface after user leaves field)

**Default values:**
```typescript
{
  moveInDate: dayjs().format('YYYY-MM-DD'),
  billingDay: dayjs().format('D'),
  contractType: 'monthly',
  billingType: 'monthly',
  includeInternet: false,
  // all text fields: '', URIs: null
}
```

**Per-step validation:** `WizardShell` calls `form.trigger(step.fields)` on "Next" press. Blocks advance if validation fails.

---

## Form Submission

**API call:**
```typescript
const tenant = await createTenant({
  unit_id: values.unitId,
  full_name: values.fullName.trim(),
  nickname: values.nickname.trim() || undefined,
  email: values.email.trim(),
  phone: values.phone.trim(),
  occupation: values.occupation.trim() || undefined,
  billing_type: values.billingType as 'monthly' | 'daily',
  move_in_date: values.moveInDate,
  address: values.homeProvince.trim() || undefined,
  emergency_contact: JSON.stringify({
    name: values.emergencyName.trim(),
    relation: values.emergencyRelation.trim() || null,
    phone: values.emergencyPhone.trim(),
  }),
  water_reading: values.waterReading ? parseFloat(values.waterReading) : undefined,
  electricity_reading: values.electricityReading ? parseFloat(values.electricityReading) : undefined,
  due_day: values.billingType === 'monthly' ? parseInt(values.billingDay, 10) : undefined,
  include_internet: values.billingType === 'monthly' && values.includeInternet,
})
```

**Success:** Navigate to `/(admin)/tenants/[id]` detail screen
**Error:** Toast message, form state preserved

---

## Schema Changes

**`db/schema.ts`** — added to tenants table:
```typescript
nickname: text('nickname'),
occupation: text('occupation'),
```

**`types/index.ts`** — added to Tenant interface:
```typescript
nickname?: string | null
occupation?: string | null
```

**`lib/api/tenants.ts`** — extended CreateTenantInput & createTenant():
```typescript
export interface CreateTenantInput {
  nickname?: string
  occupation?: string
}
```

---

## Component Dependencies

**Form binders:** FormField, FormSelect, FormDateInput, FormSegmentedControl, FormToggleRow, FormCameraCapture
**UI primitives:** SectionLabel, InfoNote
**Layout:** WizardShell

**Hooks:** useCreateTenant, useProperties, useUnits, useSettings

---

## Testing Checklist

- [ ] 5 steps render and navigate forward/back
- [ ] Per-step validation blocks "Next" on errors
- [ ] Optional ID step can be skipped
- [ ] Property select populates available units only
- [ ] Changing property resets unit selection
- [ ] Contract end date shows only for fixed-term contracts
- [ ] Billing section adapts to monthly vs daily selection
- [ ] Internet rate updates from settings
- [ ] Form submission serializes emergency contact as JSON
- [ ] Success navigates to tenant detail (not back to form)
- [ ] Dirty form on step 0 + back shows discard confirm
- [ ] Tab bar hidden during form entry
