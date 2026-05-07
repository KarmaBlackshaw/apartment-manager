import React from 'react'
import { View, Text, ScrollView, FlatList, Pressable, Share } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import dayjs from 'dayjs'
import { ScreenLayout } from '~/layouts/ScreenLayout'
import { SectionHeader } from '~/components/ui/SectionHeader'
import { ListRow } from '~/components/ui/ListRow'
import { AmountText } from '~/components/ui/AmountText'
import { EmptyState } from '~/components/ui/EmptyState'
import { LoadingSpinner } from '~/components/ui/LoadingSpinner'
import { OccupancyBarChart } from '~/components/home/OccupancyBarChart'
import { buildCSV } from '~/lib/csv'
import { useOccupancyReport } from '~/hooks/useReports'

export default function OccupancyScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>()
  const { data, isLoading } = useOccupancyReport(propertyId)
  const activeMonth = dayjs().format('MMM')

  async function handleExport() {
    if (!data) return
    const csv = buildCSV(
      ['Property', 'Total Units', 'Occupied', 'Occupancy %'],
      data.byProperty.map((p) => [p.property_name, p.totalUnits, p.occupiedUnits, p.pct]),
    )
    await Share.share({ message: csv })
  }

  const exportBtn = (
    <Pressable onPress={handleExport} hitSlop={8} disabled={!data}>
      <Text className="text-primary text-sm font-medium pr-3">Export</Text>
    </Pressable>
  )

  const report = data ?? {
    overallPct: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    trend: [],
    byProperty: [],
    vacantList: [],
  }

  return (
    <ScreenLayout title="Occupancy Rate" headerRight={exportBtn} backHref="/(admin)/reports">

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 128 }}>
          <View className="flex-row gap-3 mx-4 mt-3">
            <View className="flex-1 rounded-xl p-4 bg-surface">
              <Text className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                Overall
              </Text>
              <Text className="text-[28px] font-bold mt-1 text-success">
                {report.overallPct}%
              </Text>
              <Text className="text-xs mt-1 text-text-secondary">
                {report.occupiedUnits}/{report.totalUnits} units
              </Text>
            </View>
            <View className="flex-1 rounded-xl p-4 bg-surface">
              <Text className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                Vacant
              </Text>
              <Text className="text-[28px] font-bold mt-1 text-danger">
                {report.vacantUnits}
              </Text>
              <Text className="text-xs mt-1 text-text-secondary">
                units
              </Text>
            </View>
          </View>

          <SectionHeader title="6-Month Trend" />
          <View className="items-center px-4 pb-2">
            {report.trend.length > 0 ? (
              <OccupancyBarChart data={report.trend} activeMonth={activeMonth} />
            ) : (
              <Text className="text-text-muted text-sm py-4">No trend data available</Text>
            )}
          </View>

          {report.byProperty.length > 0 && (
            <>
              <SectionHeader title="By Property" />
              {report.byProperty.map((p) => (
                <View key={p.property_id} className="mx-4 mb-2 flex-row items-center">
                  <Text className="text-sm text-text-primary font-medium w-[120px]" numberOfLines={1}>
                    {p.property_name}
                  </Text>
                  <View className="flex-1 h-[6px] rounded-full mx-3 overflow-hidden bg-border">
                    <View
                      className="h-[6px] rounded-full bg-success"
                      style={{ width: `${p.pct}%` }}
                    />
                  </View>
                  <Text className="text-sm font-semibold w-[40px] text-right text-success">
                    {p.pct}%
                  </Text>
                </View>
              ))}
            </>
          )}

          <SectionHeader title="Vacant Units" count={report.vacantList.length} />
          {report.vacantList.length === 0 ? (
            <EmptyState title="No vacancies" description="All units are currently occupied." />
          ) : (
            <FlatList
              data={report.vacantList}
              keyExtractor={(e) => e.unit_id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <ListRow
                  title={`${item.unit_number} · ${item.property_name}`}
                  subtitle={`Vacant ${item.daysVacant} days`}
                  trailingAmount={
                    <AmountText amount={item.lostRevenue} variant="owed" size="small" />
                  }
                />
              )}
            />
          )}
        </ScrollView>
      )}
    </ScreenLayout>
  )
}
