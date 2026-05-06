import React, { useState, useMemo } from 'react'
import { View, FlatList, Text, TouchableOpacity } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useProperty, usePropertyStats } from '../../../../hooks/useProperties'
import { useUnitsWithStatus } from '../../../../hooks/useUnits'
import {
  AppHeader, LoadingSpinner, FloorTabSelector, UnitGridCard,
} from '../../../../components/ui'
import { colors } from '../../../../constants/theme'

function formatPHP(amount: number) {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export default function PropertyDetailScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>()
  const router = useRouter()
  const { data: property, isLoading } = useProperty(propertyId)
  const { data: stats } = usePropertyStats(propertyId)
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
  const { data: units = [] } = useUnitsWithStatus(propertyId, selectedFloor)
  const { data: allUnits = [] } = useUnitsWithStatus(propertyId)

  const floors = useMemo(() => {
    const floorSet = new Set(allUnits.map((u) => u.floor).filter((f): f is number => f != null))
    return Array.from(floorSet).sort((a, b) => a - b)
  }, [allUnits])

  if (isLoading) return <LoadingSpinner />
  if (!property) return (
    <View className="flex-1 items-center justify-center p-8 bg-app">
      <Text className="text-danger text-center">Property not found.</Text>
    </View>
  )

  const occupancyPct = stats && stats.totalUnits > 0
    ? Math.round((stats.occupiedUnits / stats.totalUnits) * 100)
    : 0

  return (
    <View className="flex-1 bg-app">
      <AppHeader
        title={property.name}
        right={
          <View className="flex-row items-center gap-1">
            <TouchableOpacity
              onPress={() => router.push(`/(admin)/properties/${propertyId}/units/new` as never)}
              style={{ padding: 4 }}
              accessibilityLabel="Add unit"
            >
              <Ionicons name="add" size={26} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/(admin)/properties/${propertyId}/edit` as never)}
              style={{ marginRight: 8, padding: 4 }}
              accessibilityLabel="Edit property"
            >
              <Ionicons name="create-outline" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        }
      />

      <FlatList
        data={units}
        keyExtractor={(u) => u.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        columnWrapperStyle={{ gap: 10 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={
          <>
            {/* Property summary card */}
            <View
              className="rounded-xl p-4 mt-3 mb-4"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-start justify-between">
                <View>
                  <Text
                    className="text-4xl font-bold"
                    style={{ color: colors.success }}
                  >
                    {occupancyPct}%
                  </Text>
                  <Text className="text-xs mt-[2px]" style={{ color: colors.textMuted }}>
                    occupied
                  </Text>
                </View>
                <View className="items-end flex-1 ml-4">
                  {stats && (
                    <Text className="text-sm" style={{ color: colors.textSecondary }}>
                      {formatPHP(stats.collectedThisMonth)} / {formatPHP(stats.expectedMonthlyIncome)} collected
                    </Text>
                  )}
                  <View
                    className="w-full h-[6px] rounded-full mt-2 overflow-hidden"
                    style={{ backgroundColor: colors.elevated }}
                  >
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${occupancyPct}%`,
                        backgroundColor: colors.success,
                      }}
                    />
                  </View>
                  {stats && stats.expiringContracts > 0 && (
                    <View className="flex-row gap-2 mt-2 flex-wrap justify-end">
                      <View
                        className="px-2 py-[3px] rounded-full"
                        style={{ backgroundColor: colors.warningBg }}
                      >
                        <Text className="text-[11px] font-medium" style={{ color: colors.warningText }}>
                          {stats.expiringContracts} expiring
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Floor tabs */}
            {floors.length > 0 && (
              <View className="mb-3 -mx-4">
                <FloorTabSelector
                  floors={floors}
                  selected={selectedFloor ?? floors[0] ?? 1}
                  onChange={(f) => setSelectedFloor(selectedFloor === f ? null : f)}
                />
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <View className="flex-1">
            <UnitGridCard
              unitName={item.unit_number}
              tenantName={item.tenantName}
              status={
                item.paymentStatus === 'vacant' ? 'vacant'
                  : item.paymentStatus === 'overdue' ? 'overdue'
                  : item.paymentStatus === 'partial' ? 'partial'
                  : 'paid'
              }
              onPress={() =>
                router.push(`/(admin)/properties/${propertyId}/units/${item.id}`)
              }
            />
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-sm" style={{ color: colors.textMuted }}>
              No units{selectedFloor != null ? ` on floor ${selectedFloor}` : ''}
            </Text>
            <TouchableOpacity
              onPress={() => router.push(`/(admin)/properties/${propertyId}/units/new`)}
              className="mt-4 px-6 py-3 rounded-full"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white text-sm font-semibold">Add Unit</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  )
}
