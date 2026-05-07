import React, { useState, useMemo, useCallback } from 'react'
import {
  View, Text, ScrollView, FlatList, Pressable,
  ActivityIndicator,
} from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { ScreenView } from '../../../components/ui'
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
    case 'partial': return []
    case 'overdue': return entries.filter((e) => e.month_status === 'overdue')
    case 'paid':    return entries.filter((e) => e.month_status === 'paid')
    default:        return entries
  }
}

// ─── Status chip ──────────────────────────────────────────────────────────────
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
function PaymentRow({
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
      renderLeftActions={() => (
        <Pressable
          className="w-[120px] bg-warning justify-center items-center gap-1"
          onPress={onRecordPayment}
        >
          <Ionicons name="cash-outline" size={20} color="#000" />
          <Text className="text-[10px] font-bold text-center text-black">Record{'\n'}Payment</Text>
        </Pressable>
      )}
      overshootLeft={false}
    >
      <Pressable
        onPress={onPress}
        className="flex-row items-center px-4 bg-background gap-3 py-[14px] border-b border-b-[#1a1a1a]"
      >
        <View
          className="w-[40px] h-[40px] rounded-[10px] items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <Text className="text-[15px] font-bold text-white">{initial}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-semibold text-text-primary">{entry.tenant_full_name}</Text>
          <Text className="text-xs text-text-secondary mt-[2px]">
            Unit {entry.unit_number ?? '?'}
            {entry.bill_amount > 0 ? ` · ${formatPHP(entry.bill_amount)}` : ''}
          </Text>
        </View>
        <View className="px-2 py-1 rounded-sm" style={{ backgroundColor: chip.bg }}>
          <Text className="text-[10px] font-bold" style={{ color: chip.color, letterSpacing: 0.5 }}>{chip.label}</Text>
        </View>
      </Pressable>
    </Swipeable>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function PaymentsOverviewScreen() {
  const router = useRouter()
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
    <ScreenView>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-2xl font-extrabold tracking-tight text-text-primary">
          Payments
        </Text>
        <Pressable
          onPress={() => router.push('/(admin)/settings' as any)}
          className="p-1"
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}
        renderItem={({ item, index }) => {
          const active = index === selectedIdx
          return (
            <Pressable
              onPress={() => setSelectedIdx(index)}
              className={`px-4 py-2 rounded-full items-center border min-w-24 ${
                active ? 'bg-primary border-primary' : 'bg-surface border-border'
              }`}
            >
              <Text className={`text-[13px] font-semibold ${active ? 'text-white' : 'text-text-secondary'}`}>
                {item.label}
              </Text>
            </Pressable>
          )
        }}
      />

      {/* Summary strip */}
      <View className="flex-row bg-surface mx-4 rounded-md p-3 mb-2 border border-border">
        <View className="flex-1 items-center">
          <Text className="text-[15px] font-bold text-[#22c55e]">{formatPHP(summary.collected)}</Text>
          <Text className="text-[11px] text-text-secondary mt-[2px]">Collected</Text>
        </View>
        <View className="w-[1px] bg-border mx-2" />
        <View className="flex-1 items-center">
          <Text className="text-[15px] font-bold text-warning">{summary.pending}</Text>
          <Text className="text-[11px] text-text-secondary mt-[2px]">Pending</Text>
        </View>
        <View className="w-[1px] bg-border mx-2" />
        <View className="flex-1 items-center">
          <Text className="text-[15px] font-bold text-danger">{summary.overdue}</Text>
          <Text className="text-[11px] text-text-secondary mt-[2px]">Overdue</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="max-h-11"
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 4 }}
      >
        {FILTERS.map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => setFilter(key)}
            className={`px-4 py-[6px] rounded-full border ${
              filter === key ? 'bg-elevated border-primary' : 'bg-surface border-border'
            }`}
          >
            <Text className={`text-[13px] font-medium ${filter === key ? 'text-primary' : 'text-text-secondary'}`}>
              {label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* List */}
      {isLoading ? (
        <ActivityIndicator color="#3b82f6" className="mt-8" />
      ) : filtered.length === 0 ? (
        <Text className="text-sm text-center mt-12 text-[#555555]">No tenants match this filter</Text>
      ) : (
        <ScrollView {...tabBarScroll} className="flex-1 mt-2">
          {filtered.map((entry) => (
            <PaymentRow
              key={entry.tenant_id}
              entry={entry}
              onRecordPayment={() => handleRecordPayment(entry)}
              onPress={() => handleRowPress(entry)}
            />
          ))}
          <View className="h-[100px]" />
        </ScrollView>
      )}
    </ScreenView>
  )
}
