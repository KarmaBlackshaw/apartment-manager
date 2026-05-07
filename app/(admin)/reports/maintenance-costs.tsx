import React, { useState } from 'react'
import { View, Text, FlatList, Pressable, Share } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import dayjs from 'dayjs'
import { ScreenLayout } from '~/layouts/ScreenLayout'
import { MonthTabSelector } from '~/components/ui/MonthTabSelector'
import { SectionHeader } from '~/components/ui/SectionHeader'
import { InfoRow } from '~/components/ui/InfoRow'
import { EmptyState } from '~/components/ui/EmptyState'
import { LoadingSpinner } from '~/components/ui/LoadingSpinner'
import { colors } from '~/constants/theme'
import { buildCSV } from '~/lib/csv'
import { useMaintenanceCosts } from '~/hooks/useReports'
import type { MaintenanceCostByUnit } from '~/types'

const MONTHS = Array.from({ length: 6 }, (_, i) =>
  dayjs().subtract(5 - i, 'month').format('YYYY-MM'),
)

function getMonthLabel(m: string) {
  return dayjs(`${m}-01`).format('MMM YYYY')
}

function formatPHP(n: number) {
  return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function UnitCostRow({ item }: { item: MaintenanceCostByUnit }) {
  return (
    <View className="px-4 py-3 border-b border-muted flex-row items-center bg-surface">
      <View className="flex-1 mr-3">
        <Text className="text-[15px] font-semibold text-text-primary" numberOfLines={1}>
          {item.unit_label}
        </Text>
        <Text className="text-[13px] text-text-secondary mt-[2px]" numberOfLines={1}>
          {item.categories} · {item.count} issue{item.count !== 1 ? 's' : ''}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-[15px] font-semibold text-warning">
          {formatPHP(item.cost)}
        </Text>
        {item.fromTenant != null ? (
          <Text className="text-xs mt-[2px] text-success">
            {formatPHP(item.fromTenant)} from tenant
          </Text>
        ) : (
          <Text className="text-xs mt-[2px] text-text-muted">
            pending
          </Text>
        )}
      </View>
    </View>
  )
}

export default function MaintenanceCostsScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>()
  const [month, setMonth] = useState(MONTHS[MONTHS.length - 1])
  const { data, isLoading } = useMaintenanceCosts(month, propertyId)

  async function handleExport() {
    if (!data) return
    const csv = buildCSV(
      ['Unit', 'Categories', 'Count', 'Cost', 'From Tenant'],
      data.byUnit.map((u) => [u.unit_label, u.categories, u.count, u.cost, u.fromTenant ?? 0]),
    )
    await Share.share({ message: csv })
  }

  const exportBtn = (
    <Pressable onPress={handleExport} hitSlop={8} disabled={!data}>
      <Text className="text-primary text-sm font-medium pr-3">Export</Text>
    </Pressable>
  )

  const report = data ?? {
    thisMonthCost: 0,
    ytdCost: 0,
    openCount: 0,
    resolvedCount: 0,
    chargedToTenantCount: 0,
    byUnit: [],
  }

  return (
    <ScreenLayout title="Maintenance Costs" headerRight={exportBtn} backHref="/(admin)/reports">
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
          data={report.byUnit}
          keyExtractor={(u) => u.unit_id}
          ListHeaderComponent={
            <View>
              <View className="flex-row gap-3 mx-4 mt-3 mb-1">
                <View className="flex-1 rounded-xl p-4 bg-surface">
                  <Text className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                    This month
                  </Text>
                  <Text className="text-[22px] font-bold mt-1 text-warning">
                    {formatPHP(report.thisMonthCost)}
                  </Text>
                </View>
                <View className="flex-1 rounded-xl p-4 bg-surface">
                  <Text className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                    YTD total
                  </Text>
                  <Text className="text-[22px] font-bold mt-1 text-neutral">
                    {formatPHP(report.ytdCost)}
                  </Text>
                </View>
              </View>

              <SectionHeader title="Issues This Month" />
              <View className="mx-4 rounded-xl overflow-hidden bg-surface">
                <InfoRow label="Open"              value={String(report.openCount)}              valueColor={colors.danger}  />
                <InfoRow label="Resolved"          value={String(report.resolvedCount)}          valueColor={colors.success} />
                <InfoRow label="Charged to tenant" value={String(report.chargedToTenantCount)}   valueColor={colors.neutral} showDivider={false} />
              </View>

              <SectionHeader title="Cost by Unit" count={report.byUnit.length} />
            </View>
          }
          ListEmptyComponent={
            <EmptyState title="No issues" description="No maintenance issues recorded this month." />
          }
          renderItem={({ item }) => <UnitCostRow item={item} />}
          contentContainerStyle={{ paddingBottom: 128 }}
        />
      )}
    </ScreenLayout>
  )
}
