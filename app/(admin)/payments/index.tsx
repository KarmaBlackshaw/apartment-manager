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
        <Pressable style={styles.swipeAction} onPress={onRecordPayment}>
          <Ionicons name="cash-outline" size={20} color="#000" />
          <Text style={styles.swipeActionText}>Record{'\n'}Payment</Text>
        </Pressable>
      )}
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
            <PaymentRow
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
