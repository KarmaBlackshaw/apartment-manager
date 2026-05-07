import React, { useState } from 'react'
import { View, Text, FlatList, Pressable, Share } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import dayjs from 'dayjs'
import { AppHeader, ScreenView } from '../../../components/ui'
import { MonthTabSelector } from '../../../components/ui/MonthTabSelector'
import { EmptyState } from '../../../components/ui/EmptyState'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { UnitIncomeRow } from '../../../components/reports/UnitIncomeRow'
import { colors } from '../../../constants/theme'
import { buildCSV } from '../../../lib/csv'
import { usePerUnitIncome } from '../../../hooks/useReports'

const MONTHS = Array.from({ length: 6 }, (_, i) =>
  dayjs().subtract(5 - i, 'month').format('YYYY-MM'),
)

function getMonthLabel(m: string) {
  return dayjs(`${m}-01`).format('MMM YYYY')
}

export default function PerUnitIncomeScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>()
  const [month, setMonth] = useState(MONTHS[MONTHS.length - 1])
  const { data, isLoading } = usePerUnitIncome(month, propertyId)

  async function handleExport() {
    if (!data) return
    const csv = buildCSV(
      ['Unit', 'Tenant', 'Status', 'Collected', 'Expected', '%'],
      data.entries.map((e) => [
        e.unit_label,
        e.tenant_name ?? 'Vacant',
        e.status,
        e.collected,
        e.expected,
        e.pct,
      ]),
    )
    await Share.share({ message: csv })
  }

  const exportBtn = (
    <Pressable onPress={handleExport} hitSlop={8} disabled={!data}>
      <Text className="text-primary text-sm font-medium pr-3">Export</Text>
    </Pressable>
  )

  const report = data ?? { entries: [], totalCollected: 0, bestUnitLabel: null }

  return (
    <ScreenView edges={['bottom']}>
      <AppHeader title="Per-Unit Income" right={exportBtn} />
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
          data={report.entries}
          keyExtractor={(e) => e.unit_id}
          ListHeaderComponent={
            <View className="flex-row gap-3 mx-4 mt-3 mb-3">
              <View className="flex-1 rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
                <Text className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: colors.textMuted }}>
                  Total collected
                </Text>
                <Text className="text-[22px] font-bold mt-1" style={{ color: colors.success }}>
                  ₱{report.totalCollected.toLocaleString('en-PH', { minimumFractionDigits: 0 })}
                </Text>
              </View>
              <View className="flex-1 rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
                <Text className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: colors.textMuted }}>
                  Best unit
                </Text>
                <Text className="text-[22px] font-bold mt-1" style={{ color: colors.primary }}>
                  {report.bestUnitLabel ?? '—'}
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <EmptyState title="No units" description="No units found for this period." />
          }
          renderItem={({ item }) => <UnitIncomeRow entry={item} />}
          contentContainerStyle={{ paddingBottom: 128 }}
        />
      )}
    </ScreenView>
  )
}
