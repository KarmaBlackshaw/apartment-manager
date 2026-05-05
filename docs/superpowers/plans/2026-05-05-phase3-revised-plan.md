# Phase 3 — Navigation, PaymentsOverview, TenantQuickSearch, Home Rewrite

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix navigation to 5 tabs (Home, Properties, Tenants, Payments, Reports), implement global TenantQuickSearchModal accessible from every screen, build PaymentsOverviewScreen with horizontal month scroll + filter tabs + swipe-right quick-pay, rewrite Home screen per spec §7, add Reports stub screen.

**Architecture:** `TenantSearchContext` holds `{ isOpen, open, close }` — rendered at layout level so modal appears over every screen. `fetchPaymentsOverview(year, month)` joins active tenants + bills in-memory. Swipe-right via `react-native-gesture-handler` `Swipeable` (clean, no boilerplate). FloatingTabBar gains 5 tabs + embedded search button. DB schema unchanged (Phase 4).

**Tech Stack:** Expo Router v6, NativeWind v4, TanStack Query v5, Drizzle ORM + expo-sqlite, react-native-reanimated (already installed), react-native-gesture-handler (install in Task 0), jest-expo + @testing-library/react-native

---

### File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Install | `react-native-gesture-handler` | Swipe-right rows (Task 0) |
| Modify | `__mocks__/@expo/vector-icons.js` | Add `__esModule: true` + `default` for subpath default imports |
| Create | `__mocks__/@expo/vector-icons/Ionicons.js` | Direct mock for `import Ionicons from '@expo/vector-icons/Ionicons'` |
| Create | `context/TenantSearchContext.tsx` | `isOpen / open / close` — shared across all screens |
| Create | `lib/api/paymentsOverview.ts` | `fetchPaymentsOverview(year, month)` joining tenants + bills |
| Create | `hooks/usePaymentsOverview.ts` | TanStack Query wrapper |
| Modify | `lib/api/units.ts` | Add `fetchVacantUnits()` for home screen vacant units section |
| Create | `components/admin/TenantQuickSearchModal.tsx` | Full-screen search modal with result cards |
| Create | `app/(admin)/payments/_layout.tsx` | Stack layout (headerShown: false) |
| Create | `app/(admin)/payments/index.tsx` | PaymentsOverviewScreen |
| Create | `app/(admin)/reports/_layout.tsx` | Stack layout (headerShown: false) |
| Create | `app/(admin)/reports/index.tsx` | ReportsMenuScreen (6 stub cards) |
| Modify | `app/(admin)/_layout.tsx` | 5 tabs + TenantSearchProvider + GlobalTenantSearch |
| Modify | `components/admin/FloatingTabBar.tsx` | 5 tab icons + search button in pill |
| Modify | `app/(admin)/index.tsx` | Full rewrite: alert strip, 2×2 KPI, quick actions, attention list, vacant units |
| Create | `__tests__/hooks/usePaymentsOverview.test.ts` | TDD — API logic + hook |
| Create | `__tests__/components/TenantQuickSearchModal.test.tsx` | TDD — modal render + search + navigation |

---

## Task 0: Install react-native-gesture-handler

**Files:** none (package install only)

`react-native-gesture-handler` is the standard Expo swipe/gesture library. It is NOT in
the current `package.json` so must be installed before using `Swipeable`.

- [ ] **Step 1: Install**

```bash
cd /Users/admin/Documents/personal/apartment-manager && npx expo install react-native-gesture-handler
```

Expected: package added to `package.json`, installed in `node_modules`.

- [ ] **Step 2: Verify import resolves**

```bash
node -e "require('./node_modules/react-native-gesture-handler')" && echo "OK"
```

Expected: `OK` (no error).

---

## Task 1: Fix Ionicons Mock for Subpath Default Imports

**Files:**
- Modify: `__mocks__/@expo/vector-icons.js`
- Create: `__mocks__/@expo/vector-icons/Ionicons.js`

The existing mock handles `import { Ionicons } from '@expo/vector-icons'` but NOT
`import Ionicons from '@expo/vector-icons/Ionicons'` (default import of a subpath).
Without the fix, Jest returns the whole `module.exports` object as `Ionicons`,
causing "Element type is invalid" at render time.

- [ ] **Step 1: Update `__mocks__/@expo/vector-icons.js`**

```js
const React = require('react')
const { Text } = require('react-native')
const Icon = ({ name, ...props }) => React.createElement(Text, props, name)

module.exports = { Ionicons: Icon, MaterialIcons: Icon, FontAwesome: Icon, Feather: Icon }
module.exports.default = Icon
module.exports.__esModule = true
```

- [ ] **Step 2: Create `__mocks__/@expo/vector-icons/Ionicons.js`**

```js
const React = require('react')
const { Text } = require('react-native')
const Icon = ({ name, ...props }) => React.createElement(Text, props, name)

module.exports = Icon
module.exports.default = Icon
module.exports.__esModule = true
```

- [ ] **Step 3: Run existing tests to confirm no regressions**

```bash
cd /Users/admin/Documents/personal/apartment-manager && npx jest --passWithNoTests 2>&1 | tail -20
```

Expected: all previously passing tests still pass (no new failures).

---

## Task 2: TenantSearchContext

**Files:**
- Create: `context/TenantSearchContext.tsx`

No test needed — testable implicitly via TenantQuickSearchModal tests.

- [ ] **Step 1: Create `context/TenantSearchContext.tsx`**

```tsx
import React, { createContext, useContext, useState } from 'react'

interface TenantSearchContextType {
  isOpen: boolean
  open: () => void
  close: () => void
}

const TenantSearchContext = createContext<TenantSearchContextType | null>(null)

export function TenantSearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <TenantSearchContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </TenantSearchContext.Provider>
  )
}

export function useTenantSearch(): TenantSearchContextType {
  const ctx = useContext(TenantSearchContext)
  if (!ctx) throw new Error('useTenantSearch must be used within TenantSearchProvider')
  return ctx
}
```

---

## Task 3: fetchPaymentsOverview API + Hook (TDD)

**Files:**
- Create: `__tests__/hooks/usePaymentsOverview.test.ts`
- Create: `lib/api/paymentsOverview.ts`
- Create: `hooks/usePaymentsOverview.ts`

**Design:**
- Fetch all active tenants with unit join
- Fetch all bills with `due_date LIKE '${yyyy}-${mm}-%'`
- For each tenant: find first matching bill → derive `month_status`
- Sort: overdue first, unpaid, no_bill, paid last — then alphabetical within each group

```ts
// lib/api/paymentsOverview.ts — types
export type TenantMonthStatus = 'paid' | 'overdue' | 'unpaid' | 'no_bill'

export interface TenantMonthEntry {
  tenant_id: string
  tenant_full_name: string
  unit_number: string | null
  bill_id: string | null
  bill_amount: number      // 0 when no bill
  bill_status: string | null  // BillStatus | null
  month_status: TenantMonthStatus
}
```

- [ ] **Step 1: Write failing test — `__tests__/hooks/usePaymentsOverview.test.ts`**

```ts
import { fetchPaymentsOverview } from '../../lib/api/paymentsOverview'

// Mock the db module
jest.mock('../../db', () => ({
  db: {
    select: jest.fn(),
  },
}))
jest.mock('../../db/schema', () => ({
  tenants: { id: 'id', status: 'status', unit_id: 'unit_id' },
  units: { id: 'id' },
  bills: { tenant_id: 'tenant_id', due_date: 'due_date', status: 'status' },
}))

describe('fetchPaymentsOverview', () => {
  it('maps paid bill to paid status', async () => {
    const result = await fetchPaymentsOverview(2026, 5)
    expect(Array.isArray(result)).toBe(true)
  })
})
```

Run: `npx jest __tests__/hooks/usePaymentsOverview.test.ts --no-coverage 2>&1 | tail -15`
Expected: FAIL — module not found.

- [ ] **Step 2: Create `lib/api/paymentsOverview.ts`**

```ts
import { db } from '../../db'
import { tenants, units, bills } from '../../db/schema'
import { eq, and, like } from 'drizzle-orm'

export type TenantMonthStatus = 'paid' | 'overdue' | 'unpaid' | 'no_bill'

export interface TenantMonthEntry {
  tenant_id: string
  tenant_full_name: string
  unit_number: string | null
  bill_id: string | null
  bill_amount: number
  bill_status: string | null
  month_status: TenantMonthStatus
}

const STATUS_ORDER: Record<TenantMonthStatus, number> = {
  overdue: 0, unpaid: 1, no_bill: 2, paid: 3,
}

export async function fetchPaymentsOverview(year: number, month: number): Promise<TenantMonthEntry[]> {
  const mm = String(month).padStart(2, '0')
  const monthPrefix = `${year}-${mm}-%`

  const activeTenants = await db
    .select({
      id: tenants.id,
      full_name: tenants.full_name,
      unit_id: tenants.unit_id,
      unit_number: units.unit_number,
    })
    .from(tenants)
    .leftJoin(units, eq(tenants.unit_id, units.id))
    .where(eq(tenants.status, 'active'))

  const monthBills = await db
    .select({
      id: bills.id,
      tenant_id: bills.tenant_id,
      amount: bills.amount,
      status: bills.status,
    })
    .from(bills)
    .where(like(bills.due_date, monthPrefix))

  const billByTenant = new Map<string, typeof monthBills[number]>()
  for (const b of monthBills) {
    if (!billByTenant.has(b.tenant_id)) billByTenant.set(b.tenant_id, b)
  }

  const entries: TenantMonthEntry[] = activeTenants.map((t) => {
    const bill = billByTenant.get(t.id) ?? null
    let month_status: TenantMonthStatus = 'no_bill'
    if (bill) {
      if (bill.status === 'paid') month_status = 'paid'
      else if (bill.status === 'overdue') month_status = 'overdue'
      else month_status = 'unpaid'
    }
    return {
      tenant_id: t.id,
      tenant_full_name: t.full_name,
      unit_number: t.unit_number ?? null,
      bill_id: bill?.id ?? null,
      bill_amount: bill?.amount ?? 0,
      bill_status: bill?.status ?? null,
      month_status,
    }
  })

  return entries.sort((a, b) => {
    const od = STATUS_ORDER[a.month_status] - STATUS_ORDER[b.month_status]
    if (od !== 0) return od
    return a.tenant_full_name.localeCompare(b.tenant_full_name)
  })
}
```

- [ ] **Step 3: Replace test with proper unit tests**

Replace `__tests__/hooks/usePaymentsOverview.test.ts` with:

```ts
import { fetchPaymentsOverview, type TenantMonthEntry } from '../../lib/api/paymentsOverview'

// We test fetchPaymentsOverview's pure in-memory logic by mocking the db calls
const mockTenants = [
  { id: 't1', full_name: 'Ana Reyes', unit_id: 'u1', unit_number: '1A' },
  { id: 't2', full_name: 'Ben Cruz', unit_id: 'u2', unit_number: '2B' },
  { id: 't3', full_name: 'Cara Lim', unit_id: null, unit_number: null },
]
const mockBills = [
  { id: 'b1', tenant_id: 't1', amount: 5000, status: 'paid' },
  { id: 'b2', tenant_id: 't2', amount: 4500, status: 'overdue' },
  // t3 has no bill
]

// Mock drizzle db
jest.mock('../../db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn(),
  },
}))
jest.mock('drizzle-orm', () => ({ eq: jest.fn(), like: jest.fn(), and: jest.fn() }))
jest.mock('../../db/schema', () => ({
  tenants: {},
  units: {},
  bills: {},
}))

import { db } from '../../db'

describe('fetchPaymentsOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    let callCount = 0
    ;(db.select as jest.Mock).mockImplementation(() => ({
      from: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockImplementation(() => {
        callCount++
        return callCount === 1 ? Promise.resolve(mockTenants) : Promise.resolve(mockBills)
      }),
    }))
  })

  it('returns one entry per active tenant', async () => {
    const result = await fetchPaymentsOverview(2026, 5)
    expect(result).toHaveLength(3)
  })

  it('maps paid bill → paid status', async () => {
    const result = await fetchPaymentsOverview(2026, 5)
    const ana = result.find((r) => r.tenant_id === 't1')!
    expect(ana.month_status).toBe('paid')
    expect(ana.bill_amount).toBe(5000)
  })

  it('maps overdue bill → overdue status', async () => {
    const result = await fetchPaymentsOverview(2026, 5)
    const ben = result.find((r) => r.tenant_id === 't2')!
    expect(ben.month_status).toBe('overdue')
  })

  it('maps missing bill → no_bill status', async () => {
    const result = await fetchPaymentsOverview(2026, 5)
    const cara = result.find((r) => r.tenant_id === 't3')!
    expect(cara.month_status).toBe('no_bill')
    expect(cara.bill_id).toBeNull()
    expect(cara.bill_amount).toBe(0)
  })

  it('sorts: overdue first, then unpaid, then no_bill, then paid', async () => {
    const result = await fetchPaymentsOverview(2026, 5)
    const statuses = result.map((r) => r.month_status)
    expect(statuses[0]).toBe('overdue')
    expect(statuses[statuses.length - 1]).toBe('paid')
  })
})
```

- [ ] **Step 4: Create `hooks/usePaymentsOverview.ts`**

```ts
import { useQuery } from '@tanstack/react-query'
import { fetchPaymentsOverview } from '../lib/api/paymentsOverview'

export const PAYMENTS_OVERVIEW_KEY = ['paymentsOverview'] as const

export function usePaymentsOverview(year: number, month: number) {
  return useQuery({
    queryKey: [...PAYMENTS_OVERVIEW_KEY, year, month],
    queryFn: () => fetchPaymentsOverview(year, month),
  })
}
```

- [ ] **Step 5: Run tests**

```bash
cd /Users/admin/Documents/personal/apartment-manager && npx jest __tests__/hooks/usePaymentsOverview.test.ts --no-coverage 2>&1 | tail -20
```

Expected: all 5 tests PASS.

---

## Task 4: Add fetchVacantUnits to units API

**Files:**
- Modify: `lib/api/units.ts`

The home screen vacant units section needs all units with status='available' across all properties.

- [ ] **Step 1: Read current `lib/api/units.ts`**

Read the file to understand its structure before editing.

- [ ] **Step 2: Add `fetchVacantUnits` export**

Add after the existing `fetchUnitCounts` function:

```ts
export async function fetchVacantUnits(): Promise<(Unit & { property_name: string })[]> {
  const rows = await db
    .select({
      id: units.id,
      property_id: units.property_id,
      unit_number: units.unit_number,
      floor: units.floor,
      bedrooms: units.bedrooms,
      bathrooms: units.bathrooms,
      monthly_rate: units.monthly_rate,
      daily_rate: units.daily_rate,
      billing_type: units.billing_type,
      status: units.status,
      created_at: units.created_at,
      property_name: properties.name,
    })
    .from(units)
    .innerJoin(properties, eq(units.property_id, properties.id))
    .where(eq(units.status, 'available'))
    .orderBy(units.unit_number)
  return rows as (Unit & { property_name: string })[]
}
```

Also add `properties` to the import from `../../db/schema`:
```ts
import { units, properties } from '../../db/schema'
```

And add `properties` to the drizzle-orm imports if needed.

---

## Task 5: TenantQuickSearchModal (TDD)

**Files:**
- Create: `__tests__/components/TenantQuickSearchModal.test.tsx`
- Create: `components/admin/TenantQuickSearchModal.tsx`

**Design (from MASTER.md §7.8):**
- Full-screen modal, `backgroundColor: 'rgba(0,0,0,0.6)'` scrim
- Input autofocuses on open
- Filters tenants by: full_name, unit_number (case-insensitive)
- Each result card: avatar (initial + color), tenant name, unit, balance (colour-coded), status chip
- "Record Payment" button on cards with pending/overdue status → close modal + navigate to billing/new with tenantId param
- "View" button → close modal + navigate to tenants/[id]
- Empty state text shown only after first keystroke
- Dismiss: tap scrim or close button

**Balance:** current impl uses `bills` data. For quick search, we show the tenant's latest unpaid bill amount. We query via `fetchLastBillForTenant` — but that's per tenant. For a search modal, we'll show balance from the latest non-paid bill (if any).

Simpler approach: modal searches tenants, shows their most recent bill status. Use `fetchTenants()` for search results, then for each result, show the latest unpaid bill info from existing `useLastBillForTenant` hook — but this would cause N+1 queries.

Better: Pass in all tenants + all bills as props fetched at layout level, or fetch in the modal itself.

Decision: The modal fetches tenants itself (fast, offline SQLite). For balance, show last non-paid bill amount. Use `useTenants({ status: 'active' })` inside the modal and `useBills()` to get balance info. Both are cached by TanStack Query so no extra network calls.

- [ ] **Step 1: Write failing test**

Create `__tests__/components/TenantQuickSearchModal.test.tsx`:

```tsx
import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react-native'
import { TenantQuickSearchModal } from '../../components/admin/TenantQuickSearchModal'

// Mock hooks
jest.mock('../../hooks/useTenants', () => ({
  useTenants: () => ({
    data: [
      {
        id: 't1',
        full_name: 'Ana Reyes',
        email: 'ana@test.com',
        phone: '09171234567',
        billing_type: 'monthly',
        move_in_date: '2026-01-01',
        status: 'active',
        unit_id: 'u1',
        unit: { unit_number: '1A', floor: null, billing_type: 'monthly' },
        due_day: 5,
        include_internet: false,
        water_reading: null,
        electricity_reading: null,
        address: null,
        emergency_contact: null,
        move_out_date: null,
        created_at: '2026-01-01',
      },
      {
        id: 't2',
        full_name: 'Ben Cruz',
        email: 'ben@test.com',
        phone: '09179876543',
        billing_type: 'monthly',
        move_in_date: '2026-01-01',
        status: 'active',
        unit_id: 'u2',
        unit: { unit_number: '2B', floor: null, billing_type: 'monthly' },
        due_day: 10,
        include_internet: false,
        water_reading: null,
        electricity_reading: null,
        address: null,
        emergency_contact: null,
        move_out_date: null,
        created_at: '2026-01-01',
      },
    ],
  }),
}))

jest.mock('../../hooks/useBills', () => ({
  useBills: () => ({
    data: [
      { id: 'b1', tenant_id: 't1', amount: 4500, status: 'overdue', due_date: '2026-05-01', paid_at: null },
    ],
  }),
}))

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}))

describe('TenantQuickSearchModal', () => {
  const onClose = jest.fn()

  it('does not render when visible=false', () => {
    render(<TenantQuickSearchModal visible={false} onClose={onClose} />)
    expect(screen.queryByPlaceholderText('Search tenants...')).toBeNull()
  })

  it('renders search input when visible=true', () => {
    render(<TenantQuickSearchModal visible={true} onClose={onClose} />)
    expect(screen.getByPlaceholderText('Search tenants...')).toBeTruthy()
  })

  it('shows no results text before typing', () => {
    render(<TenantQuickSearchModal visible={true} onClose={onClose} />)
    expect(screen.queryByText('No tenants found')).toBeNull()
    expect(screen.queryByText('Ana Reyes')).toBeNull()
  })

  it('shows matching results after typing', () => {
    render(<TenantQuickSearchModal visible={true} onClose={onClose} />)
    fireEvent.changeText(screen.getByPlaceholderText('Search tenants...'), 'Ana')
    expect(screen.getByText('Ana Reyes')).toBeTruthy()
  })

  it('filters by name case-insensitively', () => {
    render(<TenantQuickSearchModal visible={true} onClose={onClose} />)
    fireEvent.changeText(screen.getByPlaceholderText('Search tenants...'), 'ana')
    expect(screen.getByText('Ana Reyes')).toBeTruthy()
    expect(screen.queryByText('Ben Cruz')).toBeNull()
  })

  it('shows no results text when query matches nothing', () => {
    render(<TenantQuickSearchModal visible={true} onClose={onClose} />)
    fireEvent.changeText(screen.getByPlaceholderText('Search tenants...'), 'zzz')
    expect(screen.getByText('No tenants found')).toBeTruthy()
  })

  it('shows Record Payment button for tenant with overdue bill', () => {
    render(<TenantQuickSearchModal visible={true} onClose={onClose} />)
    fireEvent.changeText(screen.getByPlaceholderText('Search tenants...'), 'Ana')
    expect(screen.getByText('Record Payment')).toBeTruthy()
  })

  it('calls onClose when close button pressed', () => {
    render(<TenantQuickSearchModal visible={true} onClose={onClose} />)
    fireEvent.press(screen.getByAccessibilityLabel('Close search'))
    expect(onClose).toHaveBeenCalled()
  })
})
```

Run: `npx jest __tests__/components/TenantQuickSearchModal.test.tsx --no-coverage 2>&1 | tail -15`
Expected: FAIL — component not found.

- [ ] **Step 2: Create `components/admin/TenantQuickSearchModal.tsx`**

```tsx
import React, { useState, useMemo } from 'react'
import {
  Modal, View, TextInput, ScrollView, Pressable, Text, StyleSheet,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTenants } from '../../hooks/useTenants'
import { useBills } from '../../hooks/useBills'
import type { TenantWithUnit, BillWithTenant } from '../../types'

interface Props {
  visible: boolean
  onClose: () => void
}

const ACCENT_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#ef4444']
function tenantColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % ACCENT_COLORS.length
  return ACCENT_COLORS[h]
}

function formatPHP(amount: number) {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
}

function ResultCard({
  tenant, bill, onRecordPayment, onView,
}: {
  tenant: TenantWithUnit
  bill?: BillWithTenant
  onRecordPayment: () => void
  onView: () => void
}) {
  const initial = tenant.full_name.charAt(0).toUpperCase()
  const color = tenantColor(tenant.full_name)
  const hasBalance = bill && bill.status !== 'paid'
  const balanceColor = hasBalance ? '#ef4444' : '#22c55e'
  const balanceLabel = hasBalance
    ? `${formatPHP(bill.amount)} outstanding`
    : '₱0.00 paid in full'
  const statusColors: Record<string, { bg: string; text: string }> = {
    paid:    { bg: 'rgba(34,197,94,0.15)',   text: '#22c55e' },
    overdue: { bg: 'rgba(239,68,68,0.15)',   text: '#ef4444' },
    pending: { bg: 'rgba(245,158,11,0.15)',  text: '#f59e0b' },
  }
  const chip = bill ? (statusColors[bill.status] ?? statusColors.pending) : null

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={[styles.avatar, { backgroundColor: color }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.tenantName}>{tenant.full_name}</Text>
          <Text style={styles.unitText}>Unit {tenant.unit?.unit_number ?? '?'}</Text>
        </View>
        {chip && (
          <View style={[styles.chip, { backgroundColor: chip.bg }]}>
            <Text style={[styles.chipText, { color: chip.text }]}>
              {bill!.status.toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.balanceText, { color: balanceColor }]}>{balanceLabel}</Text>
      <View style={styles.cardActions}>
        {hasBalance && (
          <Pressable
            onPress={onRecordPayment}
            style={styles.recordBtn}
            accessibilityRole="button"
          >
            <Text style={styles.recordBtnText}>Record Payment</Text>
          </Pressable>
        )}
        <Pressable
          onPress={onView}
          style={styles.viewBtn}
          accessibilityRole="button"
        >
          <Text style={styles.viewBtnText}>View</Text>
        </Pressable>
      </View>
    </View>
  )
}

export function TenantQuickSearchModal({ visible, onClose }: Props) {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { data: tenants } = useTenants({ status: 'active' })
  const { data: bills } = useBills()

  const latestUnpaidBill = useMemo(() => {
    const map = new Map<string, BillWithTenant>()
    if (!bills) return map
    for (const b of bills) {
      if (b.status !== 'paid') {
        const existing = map.get(b.tenant_id)
        if (!existing || b.due_date > existing.due_date) map.set(b.tenant_id, b)
      }
    }
    return map
  }, [bills])

  const results = useMemo(() => {
    if (!query.trim() || !tenants) return []
    const q = query.toLowerCase()
    return tenants.filter(
      (t) =>
        t.full_name.toLowerCase().includes(q) ||
        (t.unit?.unit_number ?? '').toLowerCase().includes(q) ||
        t.phone.includes(q)
    ).slice(0, 5)
  }, [query, tenants])

  if (!visible) return null

  function handleRecordPayment(tenant: TenantWithUnit) {
    onClose()
    setQuery('')
    router.push({ pathname: '/(admin)/billing/new', params: { tenantId: tenant.id } } as any)
  }

  function handleView(tenant: TenantWithUnit) {
    onClose()
    setQuery('')
    router.push(`/(admin)/tenants/${tenant.id}` as any)
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.scrim} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingTop: insets.top + 16 }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search tenants..."
              placeholderTextColor="#555555"
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
            />
            <Pressable
              onPress={() => { onClose(); setQuery('') }}
              style={styles.closeBtn}
              accessibilityLabel="Close search"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={20} color="#f1f1f1" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.results}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {query.trim().length > 0 && results.length === 0 && (
              <Text style={styles.emptyText}>No tenants found</Text>
            )}
            {results.map((t) => (
              <ResultCard
                key={t.id}
                tenant={t}
                bill={latestUnpaidBill.get(t.id)}
                onRecordPayment={() => handleRecordPayment(t)}
                onView={() => handleView(t)}
              />
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-start',
  },
  sheet: {
    backgroundColor: '#0d0d0d',
    paddingHorizontal: 16,
    paddingBottom: 32,
    minHeight: 200,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#171717',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#f1f1f1',
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  results: { flex: 1 },
  emptyText: {
    color: '#555555',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#171717',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cardInfo: { flex: 1 },
  tenantName: { color: '#f1f1f1', fontWeight: '600', fontSize: 15 },
  unitText: { color: '#888888', fontSize: 12, marginTop: 1 },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chipText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  balanceText: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  cardActions: { flexDirection: 'row', gap: 8 },
  recordBtn: {
    flex: 1,
    height: 36,
    borderRadius: 999,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  viewBtn: {
    flex: 1,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBtnText: { color: '#f1f1f1', fontSize: 13, fontWeight: '600' },
})
```

- [ ] **Step 3: Run tests**

```bash
cd /Users/admin/Documents/personal/apartment-manager && npx jest __tests__/components/TenantQuickSearchModal.test.tsx --no-coverage 2>&1 | tail -20
```

Expected: all 8 tests PASS.

---

## Task 6: 5-Tab Navigation + FloatingTabBar

**Files:**
- Modify: `app/(admin)/_layout.tsx`
- Modify: `components/admin/FloatingTabBar.tsx`
- Create: `app/(admin)/payments/_layout.tsx`
- Create: `app/(admin)/reports/_layout.tsx`

- [ ] **Step 1: Create `app/(admin)/payments/_layout.tsx`**

```tsx
import { Stack } from 'expo-router'

export default function PaymentsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}
```

- [ ] **Step 2: Create `app/(admin)/reports/_layout.tsx`**

```tsx
import { Stack } from 'expo-router'

export default function ReportsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}
```

- [ ] **Step 3: Update `components/admin/FloatingTabBar.tsx`**

Replace entirely with a version supporting 5 tabs + search button:

```tsx
import React, { useEffect, useState } from 'react'
import { Animated, Pressable, Text, StyleSheet, View } from 'react-native'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTabBarVisibility } from '../../context/TabBarVisibilityContext'
import { useTenantSearch } from '../../context/TenantSearchContext'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const ICONS: Record<string, { on: IoniconName; off: IoniconName }> = {
  index:      { on: 'home',       off: 'home-outline' },
  properties: { on: 'business',   off: 'business-outline' },
  tenants:    { on: 'people',     off: 'people-outline' },
  payments:   { on: 'cash',       off: 'cash-outline' },
  reports:    { on: 'bar-chart',  off: 'bar-chart-outline' },
}

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const { visibility } = useTabBarVisibility()
  const { open: openSearch } = useTenantSearch()
  const [pointerEvents, setPointerEvents] = useState<'auto' | 'none'>('auto')

  const translateY = visibility.interpolate({ inputRange: [0, 1], outputRange: [120, 0] })

  useEffect(() => {
    const id = visibility.addListener(({ value }) => {
      setPointerEvents(value <= 0.05 ? 'none' : 'auto')
    })
    return () => visibility.removeListener(id)
  }, [visibility])

  const visible = state.routes.filter((r) => !descriptors[r.key].options.tabBarButton)
  const activeKey = state.routes[state.index].key

  return (
    <Animated.View
      pointerEvents={pointerEvents}
      style={[styles.wrap, { bottom: insets.bottom + 10, opacity: visibility, transform: [{ translateY }] }]}
    >
      <View style={styles.tabs}>
        {visible.map((route) => {
          const focused = route.key === activeKey
          const icons = ICONS[route.name] ?? { on: 'apps', off: 'apps-outline' }
          const label = descriptors[route.key].options.title ?? route.name

          return (
            <Pressable
              key={route.key}
              style={styles.tab}
              onPress={() => {
                const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
                if (!focused && !e.defaultPrevented) navigation.navigate(route.name)
              }}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
            >
              <Ionicons
                name={focused ? icons.on : icons.off}
                size={20}
                color={focused ? '#3b82f6' : '#4a4a4a'}
              />
              <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
            </Pressable>
          )
        })}
      </View>

      <View style={styles.divider} />

      <Pressable
        style={styles.searchBtn}
        onPress={openSearch}
        accessibilityRole="button"
        accessibilityLabel="Search tenants"
      >
        <Ionicons name="search-outline" size={20} color="#4a4a4a" />
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161616',
    borderRadius: 36,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 14,
  },
  tabs: {
    flex: 1,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 2,
  },
  label: {
    fontSize: 9,
    fontWeight: '600',
    color: '#4a4a4a',
    letterSpacing: 0.3,
  },
  labelActive: {
    color: '#3b82f6',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#2a2a2a',
    marginHorizontal: 4,
  },
  searchBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
```

- [ ] **Step 4: Update `app/(admin)/_layout.tsx`**

```tsx
import { Tabs } from 'expo-router'
import { FloatingTabBar } from '../../components/admin/FloatingTabBar'
import { TabBarVisibilityProvider } from '../../context/TabBarVisibilityContext'
import { TenantSearchProvider, useTenantSearch } from '../../context/TenantSearchContext'
import { TenantQuickSearchModal } from '../../components/admin/TenantQuickSearchModal'

function GlobalTenantSearch() {
  const { isOpen, close } = useTenantSearch()
  return <TenantQuickSearchModal visible={isOpen} onClose={close} />
}

export default function AdminLayout() {
  return (
    <TenantSearchProvider>
      <TabBarVisibilityProvider>
        <Tabs
          tabBar={(props) => <FloatingTabBar {...props} />}
          screenOptions={{
            headerShown: false,
            // @ts-ignore
            contentStyle: { paddingBottom: 88 },
          }}
        >
          <Tabs.Screen name="index"      options={{ title: 'Home' }} />
          <Tabs.Screen name="properties" options={{ title: 'Properties' }} />
          <Tabs.Screen name="tenants"    options={{ title: 'Tenants' }} />
          <Tabs.Screen name="payments"   options={{ title: 'Payments' }} />
          <Tabs.Screen name="reports"    options={{ title: 'Reports' }} />
          <Tabs.Screen name="billing"    options={{ href: null, title: 'Billing' }} />
          <Tabs.Screen name="settings"   options={{ href: null, title: 'Settings' }} />
        </Tabs>
        <GlobalTenantSearch />
      </TabBarVisibilityProvider>
    </TenantSearchProvider>
  )
}
```

---

## Task 7: PaymentsOverviewScreen

**Files:**
- Create: `app/(admin)/payments/index.tsx`

**Design:**
- Header: "Payments" title + settings icon (top right)
- Month selector: horizontal FlatList of month pills, selected = current month, centered on open
- Summary strip: 3 chips (Collected, Pending, Overdue) for selected month
- Filter tabs: All | Unpaid | Partial | Overdue | Paid
- List: TenantMonthEntry rows — each row swipeable right (amber "Record Payment" action)
- Swipe via `Swipeable` from `react-native-gesture-handler` (installed in Task 0)

**Month data:**
- Generate last 6 months + current month + next month (9 total, current at index 6)
- Each month is `{ year: number, month: number, label: string }`

**Filter mapping** (with current schema — no partial support):
- All → all entries
- Unpaid → month_status in ['unpaid', 'no_bill']
- Partial → [] (no partial concept yet — shows 0, reserved for Phase 4)
- Overdue → month_status === 'overdue'
- Paid → month_status === 'paid'

- [ ] **Step 1: Create `app/(admin)/payments/index.tsx`**

```tsx
import React, { useState, useMemo, useCallback } from 'react'
import {
  View, Text, ScrollView, FlatList, Pressable,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { usePaymentsOverview } from '../../../hooks/usePaymentsOverview'
import { useTabBarScrollHandler } from '../../../hooks/useTabBarScrollHandler'
import type { TenantMonthEntry, TenantMonthStatus } from '../../../lib/api/paymentsOverview'

// ─── Month generation ─────────────────────────────────────────────────────────
interface MonthItem { year: number; month: number; label: string; key: string }

function buildMonths(): { months: MonthItem[]; todayIndex: number } {
  const now = new Date()
  const months: MonthItem[] = []
  for (let i = -6; i <= 2; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    months.push({
      year: y,
      month: m,
      label: d.toLocaleString('en-PH', { month: 'short', year: 'numeric' }),
      key: `${y}-${m}`,
    })
  }
  return { months, todayIndex: 6 }
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────
type FilterKey = 'all' | 'unpaid' | 'partial' | 'overdue' | 'paid'
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',     label: 'All' },
  { key: 'unpaid',  label: 'Unpaid' },
  { key: 'partial', label: 'Partial' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'paid',    label: 'Paid' },
]

function applyFilter(entries: TenantMonthEntry[], filter: FilterKey): TenantMonthEntry[] {
  switch (filter) {
    case 'unpaid':  return entries.filter((e) => e.month_status === 'unpaid' || e.month_status === 'no_bill')
    case 'partial': return []  // Phase 4
    case 'overdue': return entries.filter((e) => e.month_status === 'overdue')
    case 'paid':    return entries.filter((e) => e.month_status === 'paid')
    default:        return entries
  }
}

// ─── Status chip colors ───────────────────────────────────────────────────────
const STATUS_CHIP: Record<TenantMonthStatus, { bg: string; color: string; label: string }> = {
  paid:    { bg: 'rgba(34,197,94,0.15)',   color: '#22c55e', label: 'PAID' },
  overdue: { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444', label: 'OVERDUE' },
  unpaid:  { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b', label: 'UNPAID' },
  no_bill: { bg: 'rgba(100,100,100,0.15)', color: '#888888', label: 'NO BILL' },
}

const ACCENT_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#ef4444']
function tenantColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % ACCENT_COLORS.length
  return ACCENT_COLORS[h]
}

function formatPHP(amount: number) {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
}

// ─── Swipeable row ────────────────────────────────────────────────────────────
function renderLeftActions(onRecordPayment: () => void) {
  return (
    <Pressable style={styles.swipeAction} onPress={onRecordPayment}>
      <Ionicons name="cash-outline" size={20} color="#000" />
      <Text style={styles.swipeActionText}>Record{'\n'}Payment</Text>
    </Pressable>
  )
}

function SwipeableRow({
  entry, onRecordPayment, onPress,
}: {
  entry: TenantMonthEntry
  onRecordPayment: () => void
  onPress: () => void
}) {
  const chip = STATUS_CHIP[entry.month_status]
  const initial = entry.tenant_full_name.charAt(0).toUpperCase()
  const color = tenantColor(entry.tenant_full_name)

  return (
    <Swipeable
      renderLeftActions={() => renderLeftActions(onRecordPayment)}
      overshootLeft={false}
    >
      <Pressable onPress={onPress} style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: color }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.rowName}>{entry.tenant_full_name}</Text>
          <Text style={styles.rowUnit}>
            Unit {entry.unit_number ?? '?'}
            {entry.bill_amount > 0 ? ` · ${formatPHP(entry.bill_amount)}` : ''}
          </Text>
        </View>
        <View style={[styles.statusChip, { backgroundColor: chip.bg }]}>
          <Text style={[styles.statusChipText, { color: chip.color }]}>{chip.label}</Text>
        </View>
      </Pressable>
    </Swipeable>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function PaymentsOverviewScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const tabBarScroll = useTabBarScrollHandler()

  const { months, todayIndex } = useMemo(buildMonths, [])
  const [selectedIdx, setSelectedIdx] = useState(todayIndex)
  const selected = months[selectedIdx]

  const [filter, setFilter] = useState<FilterKey>('all')
  const { data: entries, isLoading } = usePaymentsOverview(selected.year, selected.month)

  const filtered = useMemo(
    () => applyFilter(entries ?? [], filter),
    [entries, filter]
  )

  const summary = useMemo(() => {
    const all = entries ?? []
    return {
      collected: all.filter((e) => e.month_status === 'paid').reduce((s, e) => s + e.bill_amount, 0),
      pending:   all.filter((e) => e.month_status === 'unpaid').length,
      overdue:   all.filter((e) => e.month_status === 'overdue').length,
    }
  }, [entries])

  const handleRecordPayment = useCallback((entry: TenantMonthEntry) => {
    router.push({ pathname: '/(admin)/billing/new', params: { tenantId: entry.tenant_id } } as any)
  }, [router])

  const handleRowPress = useCallback((entry: TenantMonthEntry) => {
    if (entry.bill_id) {
      router.push(`/(admin)/billing/${entry.bill_id}` as any)
    } else {
      router.push({ pathname: '/(admin)/billing/new', params: { tenantId: entry.tenant_id } } as any)
    }
  }, [router])

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payments</Text>
        <Pressable
          onPress={() => router.push('/(admin)/settings' as any)}
          style={styles.headerIcon}
          accessibilityLabel="Settings"
        >
          <Ionicons name="settings-outline" size={22} color="#888888" />
        </Pressable>
      </View>

      {/* Month selector */}
      <FlatList
        horizontal
        data={months}
        keyExtractor={(m) => m.key}
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={todayIndex}
        getItemLayout={(_, i) => ({ length: 100, offset: 100 * i, index: i })}
        contentContainerStyle={styles.monthList}
        renderItem={({ item, index }) => {
          const active = index === selectedIdx
          return (
            <Pressable
              onPress={() => setSelectedIdx(index)}
              style={[styles.monthPill, active && styles.monthPillActive]}
            >
              <Text style={[styles.monthLabel, active && styles.monthLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          )
        }}
      />

      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryChip}>
          <Text style={[styles.summaryVal, { color: '#22c55e' }]}>{formatPHP(summary.collected)}</Text>
          <Text style={styles.summaryKey}>Collected</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryChip}>
          <Text style={[styles.summaryVal, { color: '#f59e0b' }]}>{summary.pending}</Text>
          <Text style={styles.summaryKey}>Pending</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryChip}>
          <Text style={[styles.summaryVal, { color: '#ef4444' }]}>{summary.overdue}</Text>
          <Text style={styles.summaryKey}>Overdue</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => setFilter(key)}
            style={[styles.filterTab, filter === key && styles.filterTabActive]}
          >
            <Text style={[styles.filterLabel, filter === key && styles.filterLabelActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* List */}
      {isLoading ? (
        <ActivityIndicator color="#3b82f6" style={{ marginTop: 32 }} />
      ) : filtered.length === 0 ? (
        <Text style={styles.emptyText}>No tenants match this filter</Text>
      ) : (
        <ScrollView {...tabBarScroll} style={styles.list}>
          {filtered.map((entry) => (
            <SwipeableRow
              key={entry.tenant_id}
              entry={entry}
              onRecordPayment={() => handleRecordPayment(entry)}
              onPress={() => handleRowPress(entry)}
            />
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0d0d' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#f1f1f1', letterSpacing: -0.5 },
  headerIcon: { padding: 4 },
  monthList: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  monthPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    minWidth: 96,
    alignItems: 'center',
  },
  monthPillActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  monthLabel: { fontSize: 13, fontWeight: '600', color: '#888888' },
  monthLabelActive: { color: '#fff' },
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: '#171717',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  summaryChip: { flex: 1, alignItems: 'center' },
  summaryVal: { fontSize: 15, fontWeight: '700' },
  summaryKey: { fontSize: 11, color: '#888888', marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: '#2a2a2a', marginHorizontal: 8 },
  filterScroll: { maxHeight: 44 },
  filterContent: { paddingHorizontal: 16, gap: 8, paddingVertical: 4 },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  filterTabActive: { backgroundColor: '#252525', borderColor: '#3b82f6' },
  filterLabel: { fontSize: 13, fontWeight: '500', color: '#888888' },
  filterLabelActive: { color: '#3b82f6' },
  list: { flex: 1, marginTop: 8 },
  emptyText: {
    color: '#555555',
    textAlign: 'center',
    marginTop: 48,
    fontSize: 14,
  },
  // Swipeable row (gesture-handler)
  swipeAction: {
    width: 120,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  swipeActionText: { color: '#000', fontSize: 10, fontWeight: '700', textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#0d0d0d',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: '600', color: '#f1f1f1' },
  rowUnit: { fontSize: 12, color: '#888888', marginTop: 2 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusChipText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
})
```

---

## Task 8: Reports Screen Stub

**Files:**
- Create: `app/(admin)/reports/index.tsx`

6 report cards, each tapping shows "Coming soon" alert. This is a Phase 6 placeholder.

- [ ] **Step 1: Create `app/(admin)/reports/index.tsx`**

```tsx
import React from 'react'
import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTabBarScrollHandler } from '../../../hooks/useTabBarScrollHandler'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

interface ReportCard {
  title: string
  description: string
  icon: IoniconName
  color: string
}

const REPORTS: ReportCard[] = [
  { title: 'Monthly Income',      description: 'Collections vs expected per month',  icon: 'trending-up-outline',    color: '#22c55e' },
  { title: 'Occupancy Report',    description: 'Occupancy rate over time',             icon: 'home-outline',           color: '#3b82f6' },
  { title: 'Outstanding Balances',description: 'Tenants with unpaid / overdue bills',  icon: 'alert-circle-outline',   color: '#ef4444' },
  { title: 'Payment History',     description: 'All payments in a date range',         icon: 'receipt-outline',        color: '#8b5cf6' },
  { title: 'Vacancy Report',      description: 'Vacant units and duration',            icon: 'business-outline',       color: '#f59e0b' },
  { title: 'Tenant Ledger',       description: 'Full ledger for a single tenant',      icon: 'person-outline',         color: '#ec4899' },
]

export default function ReportsMenuScreen() {
  const insets = useSafeAreaInsets()
  const tabBarScroll = useTabBarScrollHandler()

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 128 }}
      {...tabBarScroll}
    >
      <Text style={styles.title}>Reports</Text>
      <Text style={styles.subtitle}>Coming in Phase 6</Text>

      <View style={styles.grid}>
        {REPORTS.map((r) => (
          <Pressable
            key={r.title}
            style={styles.card}
            onPress={() => Alert.alert('Coming Soon', `${r.title} report will be available in a future update.`)}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${r.color}22` }]}>
              <Ionicons name={r.icon} size={24} color={r.color} />
            </View>
            <Text style={styles.cardTitle}>{r.title}</Text>
            <Text style={styles.cardDesc}>{r.description}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0d0d' },
  title: { fontSize: 24, fontWeight: '800', color: '#f1f1f1', letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#555555', marginBottom: 24 },
  grid: { gap: 12 },
  card: {
    backgroundColor: '#171717',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#f1f1f1', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#888888', lineHeight: 17 },
})
```

---

## Task 9: Home Screen Full Rewrite

**Files:**
- Modify: `app/(admin)/index.tsx`

**Data sources:**
- `useTenants({ status: 'active' })` — active tenant count, attention list, billing logic
- `useBills()` — all bills for KPIs, attention list, recent activity
- `useUnitCounts()` — unit counts by status (occupancy, vacancies)
- `useSettings()` — apartment_name
- `useProperties()` — property list (for count display)

**KPI 2×2 grid:**
| Card | Value | Accent |
|------|-------|--------|
| Monthly Income | sum of bills paid this month | `#22c55e` |
| Occupancy | `(occupied / total_units * 100).toFixed(0)%` | `#3b82f6` |
| Outstanding | sum of pending+overdue bills | `#ef4444` |
| Vacancies | available unit count | `#f59e0b` |

**Alert strip chips** (horizontal scroll, only render when count > 0):
- Overdue bills → red chip `alert-circle` icon
- Vacancies → amber chip `home-outline` icon

**Quick action bar (4 buttons):**
1. Record Payment → `openSearch()` from `useTenantSearch()`
2. Add Tenant → `router.push('/(admin)/tenants/new')`
3. Add Unit → `router.push('/(admin)/properties')` (user selects property first)
4. Log Issue → `Alert.alert('Coming Soon', ...)`

**Collection progress card:**
- Total billed this month = sum of bills with due_date in current month
- Total collected = sum paid at in current month
- Progress bar: `collected / total_billed * 100`

**Tenants requiring attention:**
- Bills with status 'overdue' or 'pending', ordered by due_date asc
- Max 5 rows, "See all" → router.push('/(admin)/payments')
- Swipe-right (same SwipeableRow as PaymentsOverviewScreen — extract to shared component)

**Vacant units:**
- Use `useVacantUnits` hook wrapping new `fetchVacantUnits()`
- Max 3, "See all" → router.push('/(admin)/properties')

**Recent activity:**
- Last 5 bills by created_at desc
- Rows: tenant name, bill type, amount, date

- [ ] **Step 1: Add `useVacantUnits` to `hooks/useUnits.ts`**

After the existing exports in `hooks/useUnits.ts`, add:

```ts
import { fetchVacantUnits } from '../lib/api/units'

export function useVacantUnits() {
  return useQuery({
    queryKey: ['vacant-units'],
    queryFn: fetchVacantUnits,
  })
}
```

- [ ] **Step 2: Create shared component `components/admin/SwipeablePaymentRow.tsx`**

Shared by both PaymentsOverviewScreen and HomeScreen. Uses `Swipeable` from `react-native-gesture-handler`.

```tsx
// components/admin/SwipeablePaymentRow.tsx
import React from 'react'
import { Pressable, Text, View, StyleSheet } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import Ionicons from '@expo/vector-icons/Ionicons'

const ACCENT_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#ef4444']
function tenantColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % ACCENT_COLORS.length
  return ACCENT_COLORS[h]
}

export interface SwipeablePaymentRowProps {
  tenantName: string
  unitNumber: string | null
  amount: number
  statusLabel: string
  statusColor: string
  statusBg: string
  onRecordPayment: () => void
  onPress: () => void
}

function LeftAction({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.swipeAction} onPress={onPress}>
      <Ionicons name="cash-outline" size={20} color="#000" />
      <Text style={styles.swipeActionText}>Record{'\n'}Payment</Text>
    </Pressable>
  )
}

export function SwipeablePaymentRow({
  tenantName, unitNumber, amount, statusLabel, statusColor, statusBg,
  onRecordPayment, onPress,
}: SwipeablePaymentRowProps) {
  const initial = tenantName.charAt(0).toUpperCase()
  const color = tenantColor(tenantName)

  return (
    <Swipeable
      renderLeftActions={() => <LeftAction onPress={onRecordPayment} />}
      overshootLeft={false}
    >
      <Pressable onPress={onPress} style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: color }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.rowName}>{tenantName}</Text>
          <Text style={styles.rowUnit}>Unit {unitNumber ?? '?'}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.amount}>₱{amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
          <View style={[styles.chip, { backgroundColor: statusBg }]}>
            <Text style={[styles.chipText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
      </Pressable>
    </Swipeable>
  )
}

const styles = StyleSheet.create({
  swipeAction: {
    width: 120,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  swipeActionText: { color: '#000', fontSize: 10, fontWeight: '700', textAlign: 'center' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#171717',
    borderBottomWidth: 1, borderBottomColor: '#2a2a2a', gap: 12,
  },
  avatar: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: '600', color: '#f1f1f1' },
  rowUnit: { fontSize: 12, color: '#888888', marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: 14, fontWeight: '600', color: '#f1f1f1' },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  chipText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
})
```

Update `payments/index.tsx` to import `SwipeablePaymentRow` from the shared component and remove the inline `SwipeableRow` + `renderLeftActions`.

- [ ] **Step 3: Write new `app/(admin)/index.tsx`**

```tsx
import React, { useMemo } from 'react'
import { ScrollView, View, Text, Pressable, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTabBarScrollHandler } from '../../hooks/useTabBarScrollHandler'
import { useTenants } from '../../hooks/useTenants'
import { useBills } from '../../hooks/useBills'
import { useUnitCounts, useVacantUnits } from '../../hooks/useUnits'
import { useSettings } from '../../hooks/useSettings'
import { useTenantSearch } from '../../context/TenantSearchContext'
import { SwipeablePaymentRow } from '../../components/admin/SwipeablePaymentRow'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

function formatPHP(n: number) {
  return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, accent, icon }: {
  label: string; value: string; accent: string; icon: IoniconName
}) {
  return (
    <View style={[styles.kpiCard, { flex: 1 }]}>
      <View style={[styles.kpiIcon, { backgroundColor: `${accent}22` }]}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  )
}

// ─── Quick action button ──────────────────────────────────────────────────────
function QuickAction({ label, icon, color, onPress }: {
  label: string; icon: IoniconName; color: string; onPress: () => void
}) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      )}
    </View>
  )
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const tabBarScroll = useTabBarScrollHandler()
  const { open: openSearch } = useTenantSearch()

  const { data: tenants } = useTenants({ status: 'active' })
  const { data: bills } = useBills()
  const { data: unitCounts } = useUnitCounts()
  const { data: vacantUnits } = useVacantUnits()
  const { data: settings } = useSettings()

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const yyyy = String(today.getFullYear())
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const monthPrefix = `${yyyy}-${mm}`

  const aptName = settings?.apartment_name ?? 'Apartment Manager'

  // ─── KPI calculations
  const kpis = useMemo(() => {
    const occupied = unitCounts?.occupied ?? 0
    const available = unitCounts?.available ?? 0
    const maintenance = unitCounts?.maintenance ?? 0
    const totalUnits = occupied + available + maintenance

    const collectedThisMonth = bills
      ?.filter((b) => b.paid_at?.startsWith(monthPrefix))
      .reduce((s, b) => s + b.amount, 0) ?? 0

    const outstanding = bills
      ?.filter((b) => b.status === 'pending' || b.status === 'overdue')
      .reduce((s, b) => s + b.amount, 0) ?? 0

    const occupancyPct = totalUnits > 0 ? Math.round((occupied / totalUnits) * 100) : 0

    return {
      income: collectedThisMonth,
      occupancy: `${occupancyPct}%`,
      outstanding,
      vacancies: available,
    }
  }, [bills, unitCounts, monthPrefix])

  // ─── Alert strip data
  const overdueBills = useMemo(
    () => bills?.filter((b) => b.status === 'overdue') ?? [],
    [bills]
  )

  // ─── Collection progress
  const progress = useMemo(() => {
    const monthBills = bills?.filter((b) => b.due_date.startsWith(monthPrefix)) ?? []
    const total = monthBills.reduce((s, b) => s + b.amount, 0)
    const collected = monthBills.filter((b) => b.status === 'paid').reduce((s, b) => s + b.amount, 0)
    return { total, collected, pct: total > 0 ? (collected / total) * 100 : 0 }
  }, [bills, monthPrefix])

  // ─── Attention list (overdue + pending, sorted by due_date)
  const attentionList = useMemo(() => {
    if (!bills) return []
    return bills
      .filter((b) => b.status === 'overdue' || b.status === 'pending')
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
      .slice(0, 5)
  }, [bills])

  const billStatusStyle = (s: string) => {
    if (s === 'overdue') return { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444', label: 'OVERDUE' }
    return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'PENDING' }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 128 }}
      {...tabBarScroll}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{aptName}</Text>
        <View style={styles.headerIcons}>
          <Pressable style={styles.headerIcon} accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={22} color="#888888" />
          </Pressable>
          <Pressable
            style={styles.headerIcon}
            onPress={() => router.push('/(admin)/settings' as any)}
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={22} color="#888888" />
          </Pressable>
        </View>
      </View>

      {/* Alert strip */}
      {(overdueBills.length > 0 || (kpis.vacancies ?? 0) > 0) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.alertScroll}
          contentContainerStyle={styles.alertContent}
        >
          {overdueBills.length > 0 && (
            <Pressable
              style={[styles.alertChip, { backgroundColor: 'rgba(239,68,68,0.15)' }]}
              onPress={() => router.push('/(admin)/payments' as any)}
            >
              <Ionicons name="alert-circle" size={14} color="#ef4444" />
              <Text style={[styles.alertText, { color: '#ef4444' }]}>
                {overdueBills.length} overdue
              </Text>
            </Pressable>
          )}
          {kpis.vacancies > 0 && (
            <Pressable
              style={[styles.alertChip, { backgroundColor: 'rgba(245,158,11,0.15)' }]}
              onPress={() => router.push('/(admin)/properties' as any)}
            >
              <Ionicons name="home-outline" size={14} color="#f59e0b" />
              <Text style={[styles.alertText, { color: '#f59e0b' }]}>
                {kpis.vacancies} vacant
              </Text>
            </Pressable>
          )}
        </ScrollView>
      )}

      {/* KPI 2×2 grid */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiRow}>
          <KPICard label="Monthly Income"  value={formatPHP(kpis.income)}     accent="#22c55e" icon="trending-up-outline" />
          <View style={{ width: 12 }} />
          <KPICard label="Occupancy"       value={kpis.occupancy}              accent="#3b82f6" icon="home-outline" />
        </View>
        <View style={[styles.kpiRow, { marginTop: 12 }]}>
          <KPICard label="Outstanding"     value={formatPHP(kpis.outstanding)} accent="#ef4444" icon="alert-circle-outline" />
          <View style={{ width: 12 }} />
          <KPICard label="Vacancies"       value={String(kpis.vacancies)}      accent="#f59e0b" icon="business-outline" />
        </View>
      </View>

      {/* Quick actions */}
      <View style={styles.quickActions}>
        <QuickAction label="Record Payment" icon="cash-outline"       color="#22c55e" onPress={openSearch} />
        <QuickAction label="Add Tenant"     icon="person-add-outline" color="#3b82f6" onPress={() => router.push('/(admin)/tenants/new' as any)} />
        <QuickAction label="Add Unit"       icon="home-outline"       color="#8b5cf6" onPress={() => router.push('/(admin)/properties' as any)} />
        <QuickAction label="Log Issue"      icon="construct-outline"  color="#f59e0b" onPress={() => Alert.alert('Coming Soon', 'Maintenance logging is coming in a future update.')} />
      </View>

      {/* Collection progress */}
      <View style={styles.section}>
        <SectionHeader title="Collection Progress" />
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              {formatPHP(progress.collected)} of {formatPHP(progress.total)}
            </Text>
            <Text style={[styles.progressPct, { color: progress.pct >= 80 ? '#22c55e' : '#f59e0b' }]}>
              {progress.pct.toFixed(0)}%
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(progress.pct, 100)}%` as any,
                  backgroundColor: progress.pct >= 80 ? '#22c55e' : '#f59e0b',
                },
              ]}
            />
          </View>
          <Text style={styles.progressSub}>
            {bills?.filter((b) => b.due_date.startsWith(monthPrefix) && b.status === 'paid').length ?? 0} of{' '}
            {bills?.filter((b) => b.due_date.startsWith(monthPrefix)).length ?? 0} bills paid this month
          </Text>
        </View>
      </View>

      {/* Tenants requiring attention */}
      {attentionList.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Requires Attention"
            onSeeAll={() => router.push('/(admin)/payments' as any)}
          />
          <View style={styles.card}>
            {attentionList.map((b) => {
              const st = billStatusStyle(b.status)
              return (
                <SwipeablePaymentRow
                  key={b.id}
                  tenantName={b.tenant.full_name}
                  unitNumber={null}
                  amount={b.amount}
                  statusLabel={st.label}
                  statusColor={st.color}
                  statusBg={st.bg}
                  onRecordPayment={() =>
                    router.push({ pathname: '/(admin)/billing/new', params: { tenantId: b.tenant_id } } as any)
                  }
                  onPress={() => router.push(`/(admin)/billing/${b.id}` as any)}
                />
              )
            })}
          </View>
        </View>
      )}

      {/* Vacant units */}
      {(vacantUnits?.length ?? 0) > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Vacant Units"
            onSeeAll={() => router.push('/(admin)/properties' as any)}
          />
          <View style={styles.card}>
            {(vacantUnits ?? []).slice(0, 3).map((u) => (
              <View key={u.id} style={styles.vacantRow}>
                <View style={styles.vacantIcon}>
                  <Ionicons name="home-outline" size={16} color="#f59e0b" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vacantUnit}>Unit {u.unit_number}</Text>
                  <Text style={styles.vacantProp}>{(u as any).property_name}</Text>
                </View>
                <View style={styles.vacantChip}>
                  <Text style={styles.vacantChipText}>VACANT</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recent activity */}
      {(bills?.length ?? 0) > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Recent Activity" />
          <View style={styles.card}>
            {(bills ?? [])
              .slice()
              .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
              .slice(0, 5)
              .map((b) => (
                <Pressable
                  key={b.id}
                  style={styles.activityRow}
                  onPress={() => router.push(`/(admin)/billing/${b.id}` as any)}
                >
                  <View style={styles.activityDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityName}>{b.tenant.full_name}</Text>
                    <Text style={styles.activityMeta}>
                      {b.billing_type} · {formatPHP(b.amount)}
                    </Text>
                  </View>
                  <Text style={styles.activityDate}>
                    {b.due_date}
                  </Text>
                </Pressable>
              ))}
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0d0d' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, marginBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#f1f1f1', letterSpacing: -0.5 },
  headerIcons: { flexDirection: 'row', gap: 4 },
  headerIcon: { padding: 6 },
  alertScroll: { maxHeight: 44 },
  alertContent: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  alertChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  alertText: { fontSize: 12, fontWeight: '600' },
  kpiGrid: { paddingHorizontal: 16, marginTop: 8 },
  kpiRow: { flexDirection: 'row' },
  kpiCard: {
    backgroundColor: '#171717', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  kpiIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  kpiValue: { fontSize: 20, fontWeight: '700', color: '#f1f1f1', letterSpacing: -0.3 },
  kpiLabel: { fontSize: 11, color: '#888888', marginTop: 2 },
  quickActions: {
    flexDirection: 'row', paddingHorizontal: 16, marginTop: 16,
    justifyContent: 'space-between',
  },
  quickAction: { flex: 1, alignItems: 'center', gap: 6 },
  quickActionIcon: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  quickActionLabel: { fontSize: 10, fontWeight: '600', color: '#888888', textAlign: 'center' },
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#888888', letterSpacing: 0.5 },
  seeAll: { fontSize: 12, color: '#3b82f6', fontWeight: '600' },
  card: {
    backgroundColor: '#171717', borderRadius: 12,
    borderWidth: 1, borderColor: '#2a2a2a', overflow: 'hidden',
  },
  progressCard: {
    backgroundColor: '#171717', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontSize: 14, fontWeight: '600', color: '#f1f1f1' },
  progressPct: { fontSize: 16, fontWeight: '800' },
  progressBarBg: { height: 8, backgroundColor: '#2a2a2a', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: 8, borderRadius: 4 },
  progressSub: { fontSize: 11, color: '#888888', marginTop: 8 },
  vacantRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#2a2a2a',
  },
  vacantIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: 'rgba(245,158,11,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  vacantUnit: { fontSize: 14, fontWeight: '600', color: '#f1f1f1' },
  vacantProp: { fontSize: 11, color: '#888888', marginTop: 1 },
  vacantChip: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    backgroundColor: 'rgba(100,100,100,0.15)',
  },
  vacantChipText: { fontSize: 10, fontWeight: '700', color: '#888888', letterSpacing: 0.5 },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#2a2a2a',
  },
  activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6' },
  activityName: { fontSize: 13, fontWeight: '600', color: '#f1f1f1' },
  activityMeta: { fontSize: 11, color: '#888888', marginTop: 1 },
  activityDate: { fontSize: 11, color: '#555555' },
})
```

---

## Task 10: Run Full Test Suite

- [ ] **Step 1: Run all tests**

```bash
cd /Users/admin/Documents/personal/apartment-manager && npx jest --passWithNoTests 2>&1 | tail -30
```

Expected: all previously passing tests still pass + new tests for `usePaymentsOverview` (5) and `TenantQuickSearchModal` (8) pass.

- [ ] **Step 2: Fix any regressions**

If any tests fail due to changed imports (e.g. `useVacantUnits` added to `useUnits.ts`), verify the existing `useUnits` tests still pass by re-reading those tests and confirming no breaking changes were made.

---

## Self-Review Checklist

| Spec Requirement | Covered |
|---|---|
| 5 tabs: Home, Properties, Tenants, Payments, Reports | Task 6 |
| Billing + Settings hidden from tab bar (still accessible as stack screens) | Task 6 |
| Global search icon on every screen via FloatingTabBar | Task 6 |
| TenantQuickSearchModal: autofocus, search, Record Payment, View | Task 5 |
| PaymentsOverviewScreen: horizontal month selector | Task 7 |
| PaymentsOverviewScreen: filter tabs All/Unpaid/Partial/Overdue/Paid | Task 7 |
| PaymentsOverviewScreen: swipe-right Record Payment | Task 7 |
| PaymentsOverviewScreen: summary strip (collected, pending, overdue) | Task 7 |
| Home: header with apt name + bell + gear | Task 9 |
| Home: alert strip (overdue chip, vacancy chip) | Task 9 |
| Home: 2×2 KPI grid (income, occupancy, outstanding, vacancies) | Task 9 |
| Home: quick action bar (4 buttons) | Task 9 |
| Home: collection progress card | Task 9 |
| Home: tenants requiring attention (swipe-right rows) | Task 9 |
| Home: vacant units section | Task 9 |
| Home: recent activity feed | Task 9 |
| Reports stub (6 cards, Coming Soon) | Task 8 |
| TDD for fetchPaymentsOverview | Task 3 |
| TDD for TenantQuickSearchModal | Task 5 |
| Ionicons mock fix (no "Element type is invalid") | Task 1 |
