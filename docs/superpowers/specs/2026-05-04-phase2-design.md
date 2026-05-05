# Apartment Manager — Phase 2 Design Spec

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan.

**Goal:** Dark theme, admin auth (biometric + PIN), redesigned home screen with upcoming dues, internet billing, settings restructure, daily tenant auto-billing with extend, contract removal, and tenant detail improvements.

**Stack:** Expo SDK 54, Expo Router v6, NativeWind v4, TanStack Query v5, Drizzle ORM + expo-sqlite. Fully offline.

---

## 1. Scope Changes vs Current Codebase

### Remove: Contracts
- Remove `app/(admin)/contracts/` directory (all 4 screens)
- Remove Contracts tab from `app/(admin)/_layout.tsx`
- Remove `lib/api/contracts.ts`, `hooks/useContracts.ts`
- Remove `ContractWithTenant` from `types/index.ts`
- Leave `contracts` DB table in place (SQLite cannot DROP TABLE cleanly); just stop using it

### Remove: Tenant Portal / Access Codes
- No `app/(tenant)/` directory
- No `birthdate`, `access_code`, or `last_name` fields
- App is admin-only

---

## 2. Dark Theme (Global)

Replace the current light-first design system with a permanent dark theme. No toggle.

**Color tokens (applied in NativeWind config and component defaults):**

| Token | Value | Usage |
|---|---|---|
| bg-app | `#0d0d0d` | Screen backgrounds |
| bg-surface | `#171717` | Cards, inputs, modals |
| bg-elevated | `#1f1f1f` | Nested cards, selected states |
| border | `#2a2a2a` | Dividers, input borders |
| text-primary | `#f1f1f1` | Main text |
| text-secondary | `#888888` | Labels, captions |
| text-muted | `#555555` | Placeholders |
| accent-blue | `#3b82f6` | Primary buttons, active tabs, badges |
| accent-red | `#ef4444` | Danger, overdue, delete |
| accent-green | `#22c55e` | Paid status |
| accent-amber | `#f59e0b` | Pending/warning status |

**Component changes:**
- `Card`: `bg-surface` + `border` border, no shadow
- `Button` primary: `bg-accent-blue`
- `Button` danger: `bg-accent-red`
- `Input`: `bg-surface` background, `border` border, `text-primary` text
- `AppText`: `text-primary` default, `text-secondary` for `color="secondary"`
- `Badge`: dark pill variants matching accent colors
- Tab bar: `#111111` background, `#3b82f6` active, `#555` inactive
- Status bar: dark

---

## 3. Admin Authentication

### Flow
1. App cold-starts or returns to foreground (`AppState` → `active`) → `isAuthenticated = false`
2. Root layout renders `<LockScreen />` if `!isAuthenticated`
3. Lock screen: attempts biometric immediately on mount via `expo-local-authentication`
4. Biometric succeeds → `isAuthenticated = true` → admin app renders
5. Biometric unavailable or fails → show inline 6-digit PIN entry + "Use Biometrics" retry button
6. Correct PIN → `isAuthenticated = true`

### First-time setup
- If no PIN in `app_settings` → render `<SetupPinScreen />` instead of lock
- Admin enters PIN (6 digits) + confirms
- Stored as SHA-256 hash in `app_settings` under key `admin_pin_hash`
- Cannot be skipped

### Forgot PIN
- "Forgot PIN" link on lock screen
- Clears `admin_pin_hash` from `app_settings`
- App re-enters setup flow

### New files
- `context/AuthContext.tsx` — `isAuthenticated`, `authenticate()`, `lock()`, `hasPin`, `setPin()`
- `app/lock.tsx` — biometric prompt + PIN fallback + forgot PIN link
- `app/setup-pin.tsx` — 6-digit PIN setup with confirm step
- Modify `app/_layout.tsx` — wrap with `AuthProvider`, subscribe to `AppState`

### Settings > Security
- Toggle: "Allow Biometrics" (stored as `biometrics_enabled` in `app_settings`, default `true`)
- Button: "Change PIN" → navigates to `setup-pin`

---

## 4. Home Screen (Redesigned Dashboard)

Replaces the current stat-card dashboard. Becomes the primary daily workflow screen.

### Layout (ScrollView, dark bg)

**Header row**
- Left: Apartment name (from settings, or "Apartment Manager" fallback) — `text-2xl font-bold text-primary`
- Right: today's date — `text-secondary text-sm`

**Summary strip** — horizontal row of 3 compact stat chips (each: label + bold number)
- Active Tenants
- Expected This Month (sum of all active monthly tenant monthly_rate values)
- Collected This Month (sum of `amount` for bills with `paid_at` in current calendar month)

**Overdue section** — only rendered if overdue bills exist
- Section header: "OVERDUE" in `text-accent-red text-xs uppercase`
- Flat list of overdue bill rows (same row format as upcoming, red left border accent)

**Upcoming Dues section**
- Section header: "UPCOMING" + "within 7 days" subtitle
- Flat list, sorted by due date ascending
- Two row types share the same visual layout:

```
[Icon]  Tenant Name          [amount or —]
        Unit 2A · Due May 9  [badge]
```

Icon: colored square with tenant initial (first letter of full_name, bg derived from name hash → one of 6 accent colors)

Row type A — **has a pending/overdue bill due within 7 days:**
- Amount shown
- Badge: amber "Pending" or red "Overdue"
- Tap → bill detail screen

Row type B — **no bill yet, `due_day` falls within 7 days:**
- Amount shows `—`
- Badge: blue "Create"
- Tap → new bill screen pre-filled with tenant selected

**Upcoming logic (computed in component, no new API):**
- For each active tenant with `due_day` set:
  - Compute `nextDueDate`: if `today.day <= due_day`, it's `YYYY-MM-{due_day}` this month, else next month
  - `daysUntil = nextDueDate - today`
  - If `daysUntil <= 7`: check if a bill exists with `due_date = nextDueDate` for that tenant
  - If bill exists and status !== `paid` → Type A row
  - If no bill → Type B row
- Also include any currently overdue bills in the Overdue section (separate from upcoming)

---

## 5. Settings — Restructured

Single settings screen `app/(admin)/settings.tsx`, rendered as labeled section cards.

### General
- Apartment Name (text input) — stored as `apartment_name` in `app_settings`
- Owner Name (text input) — stored as `owner_name` in `app_settings`
- Both appear in PDF receipt header

### Rates
- Water Rate (PHP / cu.m) — `water_rate`
- Electricity Rate (PHP / kWh) — `electricity_rate`
- Internet Rate (PHP / mo, flat) — `internet_rate`

### Security
- "Allow Biometrics" toggle — `biometrics_enabled`
- "Change PIN" button → `router.push('/setup-pin')`

---

## 6. Internet Billing

### Schema
- Add `include_internet INTEGER NOT NULL DEFAULT 0` to `tenants` table via `ALTER TABLE ADD COLUMN IF NOT EXISTS` (SQLite requires try/catch pattern — catch "duplicate column" silently)
- Add `internet_rate` key to `app_settings`

### Tenant creation
- Monthly tenants: checkbox "Include Internet" (default unchecked)
- Stored as `include_internet: boolean` on the tenant record

### Bill calculation (monthly)
```
total = monthly_rate + water_charge + electricity_charge + (include_internet ? internet_rate : 0)
```

### Receipt
- Internet line always shown in breakdown:
  - If `include_internet`: `PHP {rate}`
  - If not: `Free`

---

## 7. Daily Tenant Billing

### Auto-generate on create
- Tenant creation form for daily tenants includes: **Number of Days** (integer input, min 1)
- On submit: tenant is created AND a bill is immediately generated:
  - `period_start` = `move_in_date`
  - `period_end` = `move_in_date + (days - 1)`
  - `due_date` = `period_end`
  - `amount` = `daily_rate × days`
- Admin is navigated back after both operations complete

### Extend Stay
- On the **tenant detail screen** for daily tenants: "Extend Stay" button
- Shows a modal/inline input: "Additional days" (integer input)
- On confirm: creates a new bill:
  - `period_start` = last bill's `period_end + 1 day`
  - `period_end` = new start + (additional_days - 1)
  - `due_date` = new `period_end`
  - `amount` = `daily_rate × additional_days`
- Extends are cumulative — multiple extensions allowed

---

## 8. Tenant Detail Screen Improvements

Show all stored fields:

**Info card:**
- Full name, email, phone
- Address (if set)
- Emergency contact (if set)
- Billing type badge

**Billing card:**
- Unit number
- Move-in date
- Due day (monthly only): "Every {due_day} of the month"
- Include internet: yes/no (monthly only)
- Initial water reading / electricity reading (monthly only)

**Actions:**
- Monthly: "Create Bill" button → new bill screen pre-filled
- Daily: "Extend Stay" button → additional days input
- "Deactivate Tenant" (danger)

---

## 9. Due Day Defaults

When admin fills in the move-in date on the tenant creation form:
- `due_day` field auto-updates to the day-of-month from `move_in_date`
- Admin can override manually
- Applies to monthly tenants only; daily tenants have no `due_day`

---

## 10. Updated Types

```typescript
// AppSettings — add new keys
interface AppSettings {
  water_rate: number
  electricity_rate: number
  internet_rate: number
  apartment_name: string
  owner_name: string
  admin_pin_hash: string
  biometrics_enabled: boolean
}

// Tenant — add internet field
interface Tenant {
  // ... existing fields ...
  include_internet: boolean  // new
}
```

---

## 11. Receipt Updates

`lib/receipt.ts` — update `generateReceiptHTML`:
- Header: apartment name + owner name from settings
- Internet line in breakdown (always shown, Free or PHP amount)
- Adjust rent calculation: `rent = amount - water_charge - electricity_charge - internet_charge`

---

## File Changes Summary

| Action | Path |
|--------|------|
| Delete | `app/(admin)/contracts/` (entire directory) |
| Delete | `lib/api/contracts.ts` |
| Delete | `hooks/useContracts.ts` |
| Create | `context/AuthContext.tsx` |
| Create | `app/lock.tsx` |
| Create | `app/setup-pin.tsx` |
| Modify | `app/_layout.tsx` |
| Modify | `app/(admin)/_layout.tsx` (remove Contracts tab) |
| Modify | `app/(admin)/index.tsx` (new home screen) |
| Modify | `app/(admin)/settings.tsx` (restructured) |
| Modify | `app/(admin)/tenants/new.tsx` (due day default, internet checkbox, daily days input) |
| Modify | `app/(admin)/tenants/[id].tsx` (new detail fields + extend stay) |
| Modify | `app/(admin)/billing/new.tsx` (internet in total) |
| Modify | `db/schema.ts` (include_internet on tenants) |
| Modify | `db/index.ts` (ALTER TABLE migration) |
| Modify | `types/index.ts` |
| Modify | `lib/api/tenants.ts` |
| Modify | `lib/api/settings.ts` (new keys) |
| Modify | `lib/receipt.ts` (apartment name, owner, internet) |
| Modify | All UI components (dark theme) |
| Install | `expo-local-authentication` |
