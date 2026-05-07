import React from 'react'
import { View, FlatList, Text, TouchableOpacity } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useProperty, usePropertyStats } from '../../../../hooks/useProperties'
import { useUnitsWithStatus } from '../../../../hooks/useUnits'
import {
  AppHeader, LoadingSpinner, UnitGridCard, ScreenView,
} from '../../../../components/ui'
import { colors } from '../../../../constants/theme'

function formatPHP(amount: number) {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export default function PropertyDetailScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>()
  const router = useRouter()
  const { data: property, isLoading, isError, error } = useProperty(propertyId)
  const { data: stats } = usePropertyStats(propertyId)
  const { data: units = [] } = useUnitsWithStatus(propertyId)

  if (isLoading) return <LoadingSpinner />
  if (isError || !property) return (
    <View className="flex-1 items-center justify-center p-8 bg-app">
      <Text className="text-danger text-center mb-4">
        {isError ? `Error: ${String(error)}` : 'Property not found.'}
      </Text>
      <TouchableOpacity onPress={() => router.back()} style={{ padding: 12 }}>
        <Text style={{ color: colors.primary }}>← Go back</Text>
      </TouchableOpacity>
    </View>
  )

  const occupancyPct = stats && stats.totalUnits > 0
    ? Math.round((stats.occupiedUnits / stats.totalUnits) * 100)
    : 0

  return (
    <ScreenView edges={['bottom']}>
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
              No units yet
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
    </ScreenView>
  )
}
