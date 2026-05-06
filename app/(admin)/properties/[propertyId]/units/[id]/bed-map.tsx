import React from 'react'
import { View, FlatList, Text } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useBedMap } from '../../../../../../hooks/useBeds'
import { useUnit } from '../../../../../../hooks/useUnits'
import { AppHeader, LoadingSpinner, SectionHeader, InfoRow } from '../../../../../../components/ui'
import { BedSlotCard } from '../../../../../../components/properties/BedSlotCard'
import { colors } from '../../../../../../constants/theme'

export default function BedMapScreen() {
  const { propertyId, id } = useLocalSearchParams<{ propertyId: string; id: string }>()
  const { data: unit } = useUnit(id)
  const { data: beds = [], isLoading } = useBedMap(id)

  const occupiedCount = beds.filter((b) => b.status !== 'vacant').length
  const vacantCount = beds.filter((b) => b.status === 'vacant').length
  const totalDailyRate = beds.reduce((sum, b) => sum + b.daily_rate, 0)
  const monthlyTotal = totalDailyRate * 30

  const revenueLostBeds = beds.filter((b) => b.status === 'vacant' && b.vacated_at)
  const totalRevenueLost = revenueLostBeds.reduce((sum, b) => {
    const days = b.vacated_at
      ? Math.max(0, Math.floor((Date.now() - new Date(b.vacated_at).getTime()) / (1000 * 60 * 60 * 24)))
      : 0
    return sum + b.daily_rate * days
  }, 0)

  const firstVacantBed = revenueLostBeds[0]

  const title = unit ? `${unit.unit_number} — Beds` : 'Bed Map'

  if (isLoading) return <LoadingSpinner />

  return (
    <View className="flex-1 bg-app">
      <AppHeader title={title} />

      <FlatList
        data={beds}
        keyExtractor={(b) => b.id}
        numColumns={3}
        contentContainerStyle={{ paddingBottom: 80 }}
        columnWrapperStyle={{ gap: 8, paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListHeaderComponent={
          <>
            {/* Summary row */}
            <View
              className="mx-4 mt-4 mb-4 rounded-[10px] px-4 py-3 flex-row items-center gap-3"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-[13px] font-medium" style={{ color: colors.textSecondary }}>
                {unit?.unit_number ?? 'Room'}
              </Text>
              {occupiedCount > 0 && (
                <View
                  className="px-2 py-[3px] rounded-full"
                  style={{ backgroundColor: colors.successBg }}
                >
                  <Text className="text-[11px] font-medium" style={{ color: colors.successText }}>
                    {occupiedCount} occupied
                  </Text>
                </View>
              )}
              {vacantCount > 0 && (
                <View
                  className="px-2 py-[3px] rounded-full"
                  style={{ backgroundColor: colors.neutralBg }}
                >
                  <Text className="text-[11px] font-medium" style={{ color: colors.neutralText }}>
                    {vacantCount} vacant
                  </Text>
                </View>
              )}
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View className="flex-1">
            <BedSlotCard
              bedLabel={item.label}
              tenantName={item.tenantLastName ?? undefined}
              status={item.status}
            />
          </View>
        )}
        ListFooterComponent={
          <>
            {/* Legend */}
            <View className="flex-row gap-4 px-4 mt-4 mb-2">
              {[
                { color: colors.success, label: 'Paid' },
                { color: colors.danger, label: 'Overdue' },
                { color: colors.neutral, label: 'Vacant' },
              ].map(({ color, label }) => (
                <View key={label} className="flex-row items-center gap-1">
                  <View
                    className="w-[8px] h-[8px] rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <Text className="text-[12px]" style={{ color: colors.textMuted }}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Bed income section */}
            <SectionHeader title="Bed income" />
            <View
              className="mx-4 rounded-xl overflow-hidden"
              style={{ backgroundColor: colors.surface }}
            >
              <InfoRow
                label="Monthly total"
                value={`₱${monthlyTotal.toLocaleString('en-PH')}`}
                valueColor={colors.success}
                showDivider={totalRevenueLost > 0}
              />
              {totalRevenueLost > 0 && firstVacantBed && (
                <InfoRow
                  label={`Revenue lost · ${firstVacantBed.label} vacant`}
                  value={`₱${totalRevenueLost.toLocaleString('en-PH')}`}
                  valueColor={colors.danger}
                  showDivider={false}
                />
              )}
            </View>

            {beds.length === 0 && (
              <View className="items-center py-12 px-4">
                <Text className="text-sm text-center" style={{ color: colors.textMuted }}>
                  No beds configured for this unit yet.
                </Text>
              </View>
            )}
          </>
        }
      />
    </View>
  )
}
