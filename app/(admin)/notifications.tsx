import React, { useState, useMemo } from 'react'
import { ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { eq, and, lt, lte } from 'drizzle-orm'

import { db } from '~/db'
import { bills, tenants, contracts, units } from '~/db/schema'
import { FilterChipBar } from '~/components/ui/FilterChipBar'
import { NotificationRow } from '~/components/notifications/NotificationRow'
import { EmptyState } from '~/components/ui/EmptyState'
import { ScreenView } from '~/components/ui/ScreenView'
// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NotifType = 'overdue' | 'expiring' | 'vacant'

interface Notification {
  id: string
  type: NotifType
  title: string
  subtitle: string
  timestamp: string
  /** navigation target payload */
  tenantId?: string
}

// ---------------------------------------------------------------------------
// Filter chip config
// ---------------------------------------------------------------------------

const FILTER_OPTIONS = [
  { label: 'All',      value: 'All' },
  { label: 'Unpaid',   value: 'Unpaid' },
  { label: 'Expiring', value: 'Expiring' },
  { label: 'Vacancy',  value: 'Vacancy' },
]

// ---------------------------------------------------------------------------
// Helper – format date string (YYYY-MM-DD) → short display
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ---------------------------------------------------------------------------
// Data query – derive notifications from existing tables
// ---------------------------------------------------------------------------

async function fetchNotifications(): Promise<Notification[]> {
  const today = new Date().toISOString().split('T')[0]
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const notifications: Notification[] = []

  // 1. Overdue bills (due_date < today AND status != 'paid')
  const overdueBills = await db
    .select({
      id: bills.id,
      amount: bills.amount,
      due_date: bills.due_date,
      tenant_id: bills.tenant_id,
      tenant_name: tenants.full_name,
    })
    .from(bills)
    .innerJoin(tenants, eq(bills.tenant_id, tenants.id))
    .where(and(lt(bills.due_date, today), eq(bills.status, 'overdue')))

  for (const b of overdueBills) {
    notifications.push({
      id: `overdue-${b.id}`,
      type: 'overdue',
      title: b.tenant_name,
      subtitle: `${formatCurrency(b.amount)} overdue`,
      timestamp: formatDate(b.due_date),
      tenantId: b.tenant_id,
    })
  }

  // Also catch pending bills whose due_date has passed
  const pendingOverdue = await db
    .select({
      id: bills.id,
      amount: bills.amount,
      due_date: bills.due_date,
      tenant_id: bills.tenant_id,
      tenant_name: tenants.full_name,
    })
    .from(bills)
    .innerJoin(tenants, eq(bills.tenant_id, tenants.id))
    .where(and(lt(bills.due_date, today), eq(bills.status, 'pending')))

  for (const b of pendingOverdue) {
    notifications.push({
      id: `overdue-pending-${b.id}`,
      type: 'overdue',
      title: b.tenant_name,
      subtitle: `${formatCurrency(b.amount)} overdue`,
      timestamp: formatDate(b.due_date),
      tenantId: b.tenant_id,
    })
  }

  // 2. Expiring contracts (end_date within next 30 days, status = 'active')
  const expiringContracts = await db
    .select({
      id: contracts.id,
      end_date: contracts.end_date,
      tenant_id: contracts.tenant_id,
      unit_id: contracts.unit_id,
      tenant_name: tenants.full_name,
    })
    .from(contracts)
    .innerJoin(tenants, eq(contracts.tenant_id, tenants.id))
    .where(
      and(
        eq(contracts.status, 'active'),
        lte(contracts.end_date, in30Days),
      ),
    )

  for (const c of expiringContracts) {
    notifications.push({
      id: `expiring-${c.id}`,
      type: 'expiring',
      title: c.tenant_name,
      subtitle: `Lease expires ${formatDate(c.end_date)}`,
      timestamp: formatDate(c.end_date),
      tenantId: c.tenant_id,
    })
  }

  // 3. Vacant units (status = 'available')
  const vacantUnits = await db
    .select({
      id: units.id,
      unit_number: units.unit_number,
    })
    .from(units)
    .where(eq(units.status, 'available'))

  for (const u of vacantUnits) {
    notifications.push({
      id: `vacant-${u.id}`,
      type: 'vacant',
      title: `Unit ${u.unit_number}`,
      subtitle: 'Unit is vacant',
      timestamp: formatDate(today),
    })
  }

  return notifications
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function NotificationsScreen() {
  const router = useRouter()
  const [selected, setSelected] = useState('All')

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  })

  const filtered = useMemo(() => {
    if (selected === 'All') return notifications
    if (selected === 'Unpaid') return notifications.filter((n) => n.type === 'overdue')
    if (selected === 'Expiring') return notifications.filter((n) => n.type === 'expiring')
    if (selected === 'Vacancy') return notifications.filter((n) => n.type === 'vacant')
    return notifications
  }, [notifications, selected])

  function handlePress(n: Notification) {
    if (n.type === 'overdue' && n.tenantId) {
      router.push(`/(admin)/tenants/${n.tenantId}` as any)
    } else if (n.type === 'expiring' && n.tenantId) {
      router.push(`/(admin)/tenants/${n.tenantId}` as any)
    } else if (n.type === 'vacant') {
      router.push('/(admin)/properties' as any)
    }
  }

  return (
    <ScreenView>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-background"
      >
        <View className="pt-3 pb-4">
          <FilterChipBar
            options={FILTER_OPTIONS}
            selected={selected}
            onChange={setSelected}
          />
        </View>

        {filtered.map((n) => (
          <NotificationRow
            key={n.id}
            type={n.type}
            title={n.title}
            subtitle={n.subtitle}
            timestamp={n.timestamp}
            onPress={() => handlePress(n)}
          />
        ))}

        {filtered.length === 0 && (
          <View className="mt-10">
            <EmptyState
              size="lg"
              title="No notifications"
              description={
                selected === 'All'
                  ? 'Everything looks good here.'
                  : `No ${selected.toLowerCase()} notifications.`
              }
            />
          </View>
        )}
      </ScrollView>
    </ScreenView>
  )
}
