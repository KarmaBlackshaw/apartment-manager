import React, { useState } from 'react'
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import dayjs from 'dayjs'
import { colors, radius, spacing } from '../../../constants/theme'
import {
  ScreenHeader,
  MonthTabSelector,
  FilterChipBar,
  ListRow,
  StatusChip,
  AmountText,
  LoadingSpinner,
  EmptyState,
  FAB,
} from '../../../components/ui'
import type { ChipVariant } from '../../../components/ui'
import { useBillingOverview } from '../../../hooks/useBillingOverview'
import type { BillingOverviewEntry } from '../../../types'

// 8 months: 6 past + current + 1 future. Short label for tabs, full value for API.
const monthEntries = Array.from({ length: 8 }, (_, i) => {
  const d = dayjs().subtract(6, 'month').add(i, 'month')
  return { label: d.format('MMM'), value: d.format('YYYY-MM') }
})

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Partial', value: 'partial' },
  { label: 'Paid', value: 'paid' },
]

function monthStatusToChip(s: string): { variant: ChipVariant; label: string } {
  if (s === 'paid') return { variant: 'success', label: 'PAID' }
  if (s === 'overdue') return { variant: 'danger', label: 'OVERDUE' }
  if (s === 'unpaid') return { variant: 'warning', label: 'UNPAID' }
  return { variant: 'neutral', label: 'NO BILL' }
}

function fmtAmount(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export default function BillingScreen() {
  const router = useRouter()

  const [selectedLabel, setSelectedLabel] = useState(dayjs().format('MMM'))
  const selectedMonth =
    monthEntries.find((m) => m.label === selectedLabel)?.value ?? dayjs().format('YYYY-MM')

  const [filterValue, setFilterValue] = useState('all')

  const { data, isLoading } = useBillingOverview(selectedMonth)

  const entries: BillingOverviewEntry[] = data?.entries ?? []
  const stats = data?.stats ?? { collected: 0, billed: 0, rate: 0, overdueCount: 0 }

  const filteredEntries =
    filterValue === 'all'
      ? entries
      : entries.filter((e) => e.month_status === filterValue)

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Billing"
        right={
          <Pressable
            onPress={() => router.push('/(admin)/notifications')}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
          </Pressable>
        }
      />

      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => `${item.tenant_id}-${item.unit_id ?? 'none'}`}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Property selector + month label */}
            <View style={styles.propRow}>
              <Pressable style={styles.propPill} hitSlop={4} accessibilityRole="button">
                <Ionicons name="business-outline" size={12} color={colors.textSecondary} />
                <Text style={styles.propText}>All properties</Text>
                <Ionicons name="chevron-down" size={12} color={colors.textSecondary} />
              </Pressable>
              <Text style={styles.monthLabel}>
                {dayjs(selectedMonth).format('MMM YYYY')}
              </Text>
            </View>

            {/* Month tabs — compact */}
            <MonthTabSelector
              months={monthEntries.map((m) => m.label)}
              selected={selectedLabel}
              onChange={setSelectedLabel}
            />

            {/* KPI 2×2 */}
            <View style={styles.kpiGrid}>
              <View style={styles.kpiRow}>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiLabel}>Collected</Text>
                  <Text style={styles.kpiValue}>{fmtAmount(stats.collected)}</Text>
                </View>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiLabel}>Billed</Text>
                  <Text style={styles.kpiValue}>{fmtAmount(stats.billed)}</Text>
                </View>
              </View>
              <View style={styles.kpiRow}>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiLabel}>Rate</Text>
                  <Text style={[styles.kpiValue, { color: colors.success }]}>
                    {stats.rate}%
                  </Text>
                </View>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiLabel}>Overdue</Text>
                  <Text style={[styles.kpiValue, { color: colors.danger }]}>
                    {stats.overdueCount}
                  </Text>
                </View>
              </View>
            </View>

            {/* Filter chips */}
            <FilterChipBar
              options={FILTER_OPTIONS}
              selected={filterValue}
              onChange={setFilterValue}
            />

            {isLoading && <LoadingSpinner />}
          </>
        }
        renderItem={({ item, index }: { item: BillingOverviewEntry; index: number }) => {
          const chip = monthStatusToChip(item.month_status)
          const isPaid = item.month_status === 'paid'
          const amountVariant: 'paid' | 'owed' = isPaid ? 'paid' : 'owed'
          const displayAmount = isPaid ? item.bill_amount : 0

          return (
            <ListRow
              title={item.tenant_full_name}
              subtitle={`Unit ${item.unit_number ?? '—'} · ₱${item.monthly_rate.toLocaleString()}/mo`}
              trailingChip={<StatusChip variant={chip.variant} label={chip.label} size="sm" />}
              trailingAmount={
                item.bill_id ? (
                  <AmountText amount={displayAmount} variant={amountVariant} size="small" />
                ) : undefined
              }
              onPress={
                item.bill_id
                  ? () => router.push(`/(admin)/billing/${item.bill_id}`)
                  : undefined
              }
              showDivider={index < filteredEntries.length - 1}
            />
          )
        }}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title="No entries"
              description="No billing records for this month"
            />
          ) : null
        }
      />

      <FAB onPress={() => router.push('/(admin)/billing/generate')} icon="add" bottomOffset={100} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: 120,
  },
  // Property selector row
  propRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingTop: 10,
    paddingBottom: 4,
  },
  propPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.elevated,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  propText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  monthLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  // KPI grid
  kpiGrid: {
    paddingHorizontal: spacing[4],
    paddingTop: 12,
    paddingBottom: 4,
    gap: 10,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
  },
  kpiLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
})
