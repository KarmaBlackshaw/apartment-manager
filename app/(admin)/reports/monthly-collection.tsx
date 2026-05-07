import React, { useState } from 'react'
import { View, Text, FlatList, Pressable, Share } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import dayjs from 'dayjs'
import { ScreenLayout } from '../../../layouts/ScreenLayout'
import { MonthTabSelector } from '../../../components/ui/MonthTabSelector'
import { CollectionProgressBar } from '../../../components/billing/CollectionProgressBar'
import { ListRow } from '../../../components/ui/ListRow'
import { StatusChip } from '../../../components/ui/StatusChip'
import { AmountText } from '../../../components/ui/AmountText'
import { EmptyState } from '../../../components/ui/EmptyState'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { buildCSV } from '../../../lib/csv'
import { useMonthlyCollection } from '../../../hooks/useReports'
import type { MonthlyCollectionEntry } from '../../../types'

const MONTHS = Array.from({ length: 6 }, (_, i) =>
  dayjs().subtract(5 - i, 'month').format('YYYY-MM'),
)

function getMonthLabel(m: string) {
  return dayjs(`${m}-01`).format('MMM YYYY')
}

function statusVariant(s: MonthlyCollectionEntry['month_status']) {
  switch (s) {
    case 'paid':    return 'success' as const
    case 'overdue': return 'danger'  as const
    case 'unpaid':  return 'warning' as const
    default:        return 'neutral' as const
  }
}

export default function MonthlyCollectionScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>()
  const [month, setMonth] = useState(MONTHS[MONTHS.length - 1])
  const { data, isLoading } = useMonthlyCollection(month, propertyId)

  const title = dayjs(`${month}-01`).format('MMMM YYYY')

  async function handleExport() {
    if (!data) return
    const csv = buildCSV(
      ['Tenant', 'Unit', 'Amount', 'Status'],
      data.entries.map((e) => [e.tenant_full_name, e.unit_number ?? '', e.bill_amount, e.month_status]),
    )
    await Share.share({ message: csv })
  }

  const exportBtn = (
    <Pressable onPress={handleExport} hitSlop={8} disabled={!data}>
      <Text className="text-primary text-sm font-medium pr-3">Export</Text>
    </Pressable>
  )

  const stats = data?.stats ?? { totalCollected: 0, totalBilled: 0, paidCount: 0, partialCount: 0, unpaidCount: 0 }
  const entries = data?.entries ?? []
  const pct = stats.totalBilled > 0 ? Math.round((stats.totalCollected / stats.totalBilled) * 100) : 0

  return (
    <ScreenLayout title={title} headerRight={exportBtn}>
      <MonthTabSelector
        months={MONTHS.map(getMonthLabel)}
        selected={getMonthLabel(month)}
        onChange={(label) => {
          const found = MONTHS.find((m) => getMonthLabel(m) === label)
          if (found) setMonth(found)
        }}
      />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(e) => e.tenant_id}
          ListHeaderComponent={
            <View className="mx-4 mt-2 mb-3 rounded-xl p-4 bg-surface">
              <Text className="text-xs text-text-muted uppercase tracking-wide mb-1">Total collected</Text>
              <AmountText amount={stats.totalCollected} variant="paid" size="large" />
              <Text className="text-sm text-text-secondary mt-1">
                of{' '}
                <Text className="font-semibold text-text-primary">
                  ₱{stats.totalBilled.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>{' '}
                <Text className="text-success">({pct}%)</Text>
              </Text>
              <View className="mt-3">
                <CollectionProgressBar
                  paid={stats.paidCount}
                  partial={0}
                  unpaid={stats.unpaidCount}
                  total={stats.paidCount + stats.unpaidCount}
                />
              </View>
            </View>
          }
          ListEmptyComponent={
            <EmptyState title="No data" description="No billing data for this month." />
          }
          renderItem={({ item }) => (
            <ListRow
              title={item.tenant_full_name}
              subtitle={`Unit ${item.unit_number ?? '—'} · ₱${(item.monthly_rate).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/mo`}
              trailingChip={
                <StatusChip variant={statusVariant(item.month_status)} label={item.month_status.replace('_', ' ').toUpperCase()} />
              }
              trailingAmount={
                <AmountText
                  amount={item.bill_amount}
                  variant={item.month_status === 'paid' ? 'paid' : 'owed'}
                  size="small"
                />
              }
            />
          )}
          contentContainerStyle={{ paddingBottom: 128 }}
        />
      )}
    </ScreenLayout>
  )
}
