import React, { useMemo, useState } from 'react'
import { ScrollView, View, TouchableOpacity, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTabBarScrollHandler } from '../../hooks/useTabBarScrollHandler'
import { useTenants } from '../../hooks/useTenants'
import { useBills } from '../../hooks/useBills'
import { useSettings } from '../../hooks/useSettings'
import { isOverdue, formatCurrency } from '../../lib/billing'
import { AppText, Card, Badge, billStatusBadge } from '../../components/ui'
import type { TenantWithUnit, BillWithTenant } from '../../types'

const ACCENT_COLORS = ['#3b82f6','#8b5cf6','#ec4899','#f59e0b','#22c55e','#ef4444']
function tenantColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % ACCENT_COLORS.length
  return ACCENT_COLORS[h]
}

function TenantRow({
  tenant, bill, dueDate, onPress,
}: {
  tenant: TenantWithUnit
  bill?: BillWithTenant
  dueDate: string
  onPress: () => void
}) {
  const initial = tenant.full_name.charAt(0).toUpperCase()
  const color = tenantColor(tenant.full_name)
  const hasBill = !!bill
  const statusBadge = hasBill ? billStatusBadge(bill!.status) : null

  return (
    <TouchableOpacity onPress={onPress} className="flex-row items-center gap-3 py-3 border-b border-[#2a2a2a]">
      <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: color }}>
        <Text className="text-white font-bold text-base">{initial}</Text>
      </View>
      <View className="flex-1">
        <AppText className="font-semibold">{tenant.full_name}</AppText>
        <AppText color="secondary" variant="caption">
          Unit {tenant.unit?.unit_number ?? '?'} · Due {dueDate}
        </AppText>
      </View>
      <View className="items-end gap-1">
        {hasBill
          ? <AppText className="font-semibold">{formatCurrency(bill!.amount)}</AppText>
          : <AppText color="muted">—</AppText>
        }
        {statusBadge
          ? <Badge label={statusBadge.label} variant={statusBadge.variant} />
          : <Badge label="Create" variant="info" />
        }
      </View>
    </TouchableOpacity>
  )
}

type IncomePeriod = 'day' | 'week' | 'month'
const INCOME_PERIODS: { key: IncomePeriod; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
]

function ExpectedIncomeCard({ bills, yyyy, mm, todayStr }: {
  bills: BillWithTenant[] | undefined
  yyyy: string
  mm: string
  todayStr: string
}) {
  const [period, setPeriod] = useState<IncomePeriod>('month')

  const amounts = useMemo((): Record<IncomePeriod, number> => {
    if (!bills) return { day: 0, week: 0, month: 0 }
    const d = new Date(todayStr)
    const weekStart = new Date(todayStr)
    weekStart.setDate(d.getDate() - d.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    const ws = weekStart.toISOString().split('T')[0]
    const we = weekEnd.toISOString().split('T')[0]
    return {
      day: bills.filter(b => b.due_date === todayStr).reduce((s, b) => s + b.amount, 0),
      week: bills.filter(b => b.due_date >= ws && b.due_date <= we).reduce((s, b) => s + b.amount, 0),
      month: bills.filter(b => b.due_date.startsWith(`${yyyy}-${mm}`)).reduce((s, b) => s + b.amount, 0),
    }
  }, [bills, todayStr, yyyy, mm])

  return (
    <Card className="mb-3">
      <View className="flex-row items-center gap-3 mb-3">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}
        >
          <Ionicons name="trending-up-outline" size={20} color="#22c55e" />
        </View>
        <View className="flex-1">
          <AppText className="font-semibold">Expected Income</AppText>
          <AppText color="secondary" variant="caption">from billed amounts</AppText>
        </View>
      </View>
      <AppText variant="display" className="mb-3">{formatCurrency(amounts[period])}</AppText>
      <View className="flex-row gap-2">
        {INCOME_PERIODS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => setPeriod(key)}
            style={{ backgroundColor: key === period ? '#22c55e' : '#252525' }}
            className="flex-1 py-2 rounded-xl items-center"
          >
            <AppText
              variant="caption"
              className={key === period ? 'text-black font-semibold' : ''}
              color={key === period ? undefined : 'secondary'}
            >
              {label}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  )
}

function UnbilledTenantsCard({ count, onPress }: { count: number; onPress: () => void }) {
  if (count === 0) return null
  return (
    <Card className="mb-6">
      <View className="flex-row items-center gap-3 mb-3">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: 'rgba(245,158,11,0.15)' }}
        >
          <Ionicons name="receipt-outline" size={20} color="#f59e0b" />
        </View>
        <View className="flex-1">
          <AppText className="font-semibold">Unbilled Tenants</AppText>
          <AppText color="secondary" variant="caption">no bill this month</AppText>
        </View>
        <View
          className="rounded-full px-2.5 py-1"
          style={{ backgroundColor: 'rgba(245,158,11,0.2)' }}
        >
          <AppText className="font-bold" style={{ color: '#f59e0b' }}>{count}</AppText>
        </View>
      </View>
      <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center justify-center gap-2 py-3 rounded-xl"
        style={{ backgroundColor: '#252525' }}
      >
        <Ionicons name="add-circle-outline" size={18} color="#f1f1f1" />
        <AppText className="font-semibold">Create Bill</AppText>
      </TouchableOpacity>
    </Card>
  )
}

export default function HomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const tabBarScroll = useTabBarScrollHandler()
  const { data: tenants } = useTenants({ status: 'active' })
  const { data: bills } = useBills()
  const { data: settings } = useSettings()

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const todayDay = today.getDate()
  const yyyy = String(today.getFullYear())
  const mm = String(today.getMonth() + 1).padStart(2, '0')

  function nextDueDate(dueDay: number): string {
    const pad = String(dueDay).padStart(2, '0')
    if (todayDay <= dueDay) return `${yyyy}-${mm}-${pad}`
    const next = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    const ny = next.getFullYear()
    const nm = String(next.getMonth() + 1).padStart(2, '0')
    return `${ny}-${nm}-${pad}`
  }

  const overdueBills = useMemo(() =>
    bills?.filter((b) => isOverdue(b.due_date, b.status)) ?? [], [bills])

  const upcomingRows = useMemo(() => {
    if (!tenants || !bills) return []
    const result: { tenant: TenantWithUnit; bill?: BillWithTenant; dueDate: string }[] = []
    for (const t of tenants) {
      if (!t.due_day) continue
      const dd = nextDueDate(t.due_day)
      const daysUntil = Math.round((new Date(dd).getTime() - today.getTime()) / 86400000)
      if (daysUntil < 0 || daysUntil > 7) continue
      const bill = bills.find((b) => b.tenant_id === t.id && b.due_date === dd && b.status !== 'paid')
      result.push({ tenant: t, bill, dueDate: dd })
    }
    return result.sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  }, [tenants, bills, todayStr])

  const unbilledCount = useMemo(() => {
    if (!tenants || !bills) return 0
    return tenants.filter(t =>
      !bills.some(b => b.tenant_id === t.id && b.due_date.startsWith(`${yyyy}-${mm}`))
    ).length
  }, [tenants, bills, yyyy, mm])

  const activeTenants = tenants?.length ?? 0
  const collectedThisMonth = bills?.filter((b) => b.paid_at?.startsWith(`${yyyy}-${mm}`))
    .reduce((s, b) => s + b.amount, 0) ?? 0

  const aptName = settings?.apartment_name ?? 'Apartment Manager'

  return (
    <ScrollView
      className="flex-1 bg-app"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 128 }}
      {...tabBarScroll}
    >
      <View className="flex-row justify-between items-center mb-6">
        <AppText variant="heading">{aptName}</AppText>
        <TouchableOpacity onPress={() => router.push('/(admin)/settings')} style={{ padding: 4 }}>
          <Ionicons name="settings-outline" size={22} color="#888888" />
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-3 mb-4">
        {[
          { label: 'Tenants',   value: String(activeTenants) },
          { label: 'Collected', value: formatCurrency(collectedThisMonth) },
        ].map((s) => (
          <Card key={s.label} className="flex-1">
            <AppText variant="display" className="text-xl">{s.value}</AppText>
            <AppText color="secondary" variant="caption">{s.label}</AppText>
          </Card>
        ))}
      </View>

      <ExpectedIncomeCard bills={bills} yyyy={yyyy} mm={mm} todayStr={todayStr} />

      <UnbilledTenantsCard
        count={unbilledCount}
        onPress={() => router.push('/(admin)/billing/new')}
      />

      {overdueBills.length > 0 && (
        <View className="mb-6">
          <AppText variant="label" color="danger" className="mb-2">OVERDUE</AppText>
          <Card>
            {overdueBills.map((b) => {
              const t = tenants?.find((t) => t.id === b.tenant_id)
              if (!t) return null
              return (
                <TenantRow key={b.id} tenant={t} bill={b} dueDate={b.due_date}
                  onPress={() => router.push(`/(admin)/billing/${b.id}` as any)} />
              )
            })}
          </Card>
        </View>
      )}

      <Card>
        <View className="flex-row items-center gap-3 mb-4">
          <View
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: 'rgba(59,130,246,0.15)' }}
          >
            <Ionicons name="calendar-outline" size={20} color="#3b82f6" />
          </View>
          <View className="flex-1">
            <AppText className="font-semibold">Upcoming Dues</AppText>
            <AppText color="secondary" variant="caption">within 7 days</AppText>
          </View>
        </View>
        {upcomingRows.length === 0
          ? <AppText color="muted" className="text-center py-4">No upcoming dues</AppText>
          : upcomingRows.map(({ tenant, bill, dueDate }) => (
              <TenantRow key={tenant.id} tenant={tenant} bill={bill} dueDate={dueDate}
                onPress={() => bill
                  ? router.push(`/(admin)/billing/${bill.id}` as any)
                  : router.push({ pathname: '/(admin)/billing/new', params: { tenantId: tenant.id } })
                }
              />
            ))
        }
      </Card>
    </ScrollView>
  )
}
