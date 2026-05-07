import React from 'react'
import { View, FlatList, Text, TouchableOpacity } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useProperty, usePropertyStats } from '../../../../hooks/useProperties'
import { useUnitsWithStatus } from '../../../../hooks/useUnits'
import { LoadingSpinner, UnitGridCard, FAB, SectionHeader } from '../../../../components/ui'
import { ScreenLayout } from '../../../../layouts/ScreenLayout'
import { colors } from '../../../../constants/theme'
import { PropertySummaryCard } from '../../../../components/properties/PropertySummaryCard'

export default function PropertyDetailScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>()
  const router = useRouter()
  const { data: property, isLoading, isError, error } = useProperty(propertyId)
  const { data: stats } = usePropertyStats(propertyId)
  const { data: units = [] } = useUnitsWithStatus(propertyId)
  const overdueCount = units.filter(u => u.paymentStatus === 'overdue' || u.paymentStatus === 'partial').length

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

  const headerRight = (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/properties/${propertyId}/edit` as never)}
      style={{ marginRight: 8, padding: 4 }}
      accessibilityLabel="Edit property"
    >
      <Ionicons name="create-outline" size={22} color={colors.textSecondary} />
    </TouchableOpacity>
  )

  return (
    <ScreenLayout title={property.name} headerRight={headerRight} backHref="/(admin)/properties">
      <FlatList
        data={units}
        keyExtractor={(u) => u.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        columnWrapperStyle={{ gap: 10 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={
          <>
            <View className="pt-3 pb-0">
              <PropertySummaryCard
                occupancyPct={occupancyPct}
                collectedThisMonth={stats?.collectedThisMonth ?? 0}
                expectedMonthlyIncome={stats?.expectedMonthlyIncome ?? 0}
                overdueCount={overdueCount}
                expiringContracts={stats?.expiringContracts ?? 0}
              />
            </View>
            <SectionHeader
              title="All units"
              count={units.length}
              actionLabel="Add unit"
              onViewAll={() => router.push(`/(admin)/properties/${propertyId}/units/new` as never)}
            />
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
      <FAB onPress={() => router.push(`/(admin)/properties/${propertyId}/units/new` as never)} />
    </ScreenLayout>
  )
}
