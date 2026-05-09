import React from 'react'
import { View, FlatList, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useProperty, usePropertyStats } from '~/hooks/useProperties'
import { useUnitsWithStatus } from '~/hooks/useUnits'
import { LoadingSpinner } from '~/components/ui/LoadingSpinner'
import { AppText } from '~/components/ui/AppText'
import { EmptyState } from '~/components/ui/EmptyState'
import { UnitGridCard } from '~/components/properties/UnitGridCard'
import { SectionHeader } from '~/components/ui/SectionHeader'
import { ScreenLayout } from '~/layouts/ScreenLayout'
import { PropertySummaryCard } from '~/components/properties/PropertySummaryCard'
import { colors } from '~/constants/theme'

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
      <AppText className="text-danger text-center mb-4">
        {isError ? `Error: ${String(error)}` : 'Property not found.'}
      </AppText>
      <Pressable onPress={() => router.back()} className="px-3 py-2">
        <AppText className="text-primary">← Go back</AppText>
      </Pressable>
    </View>
  )

  const occupancyPct = stats && stats.totalUnits > 0
    ? Math.round((stats.occupiedUnits / stats.totalUnits) * 100)
    : 0

  const headerRight = (
    <Pressable
      onPress={() => router.push(`/(admin)/properties/${propertyId}/edit` as never)}
      hitSlop={8}
      accessibilityLabel="Edit property"
      className="px-1"
    >
      <Ionicons name="create-outline" size={22} color={colors.textSecondary} />
    </Pressable>
  )

  return (
    <ScreenLayout title={property.name} headerRight={headerRight} backHref="/(admin)/properties">
      <FlatList
        data={units}
        keyExtractor={(u) => u.id}
        numColumns={2}
        contentContainerClassName="px-4 pb-[88px]"
        columnWrapperClassName="gap-2.5"
        ItemSeparatorComponent={() => <View className="h-2.5" />}
        ListHeaderComponent={
          <View className="pt-3">
            <PropertySummaryCard
              occupancyPct={occupancyPct}
              collectedThisMonth={stats?.collectedThisMonth ?? 0}
              expectedMonthlyIncome={stats?.expectedMonthlyIncome ?? 0}
              overdueCount={overdueCount}
              expiringContracts={stats?.expiringContracts ?? 0}
              openIssueCount={stats?.openIssueCount ?? 0}
            />
            <View className="mt-4 mb-2">
              <SectionHeader
                title="All units"
                count={units.length}
                actionLabel="Add unit"
                onViewAll={() => router.push(`/(admin)/properties/${propertyId}/units/new` as never)}
              />
            </View>
          </View>
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
          <EmptyState
            size="md"
            title="No units yet"
            actionLabel="Add Unit"
            onAction={() => router.push(`/(admin)/properties/${propertyId}/units/new` as never)}
          />
        }
      />
    </ScreenLayout>
  )
}
