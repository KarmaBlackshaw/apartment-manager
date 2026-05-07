import React from 'react'
import { View, FlatList, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { useTabBarScrollHandler } from '~/hooks/useTabBarScrollHandler'
import { usePropertiesWithStats } from '~/hooks/useProperties'
import { LoadingSpinner } from '~/components/ui/LoadingSpinner'
import { EmptyState } from '~/components/ui/EmptyState'
import { FAB } from '~/components/ui/FAB'
import { ScreenLayout } from '~/layouts/ScreenLayout'
import { PropertyOverviewCard } from '~/components/properties/PropertyOverviewCard'

export default function PropertiesScreen() {
  const router = useRouter()
  const tabBarScroll = useTabBarScrollHandler()
  const { data: properties, isLoading, isError } = usePropertiesWithStats()

  if (isLoading) return <LoadingSpinner />
  if (isError) return (
    <View className="flex-1 items-center justify-center p-8 bg-app">
      <Text className="text-danger text-center">Could not load properties. Please restart the app.</Text>
    </View>
  )

  const handleAdd = () => router.push('/(admin)/properties/new')

  return (
    <ScreenLayout
      title="Properties"
      headerLeft={null}
    >
      <FlatList
        data={properties ?? []}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 140 }}
        {...tabBarScroll}
        renderItem={({ item }) => {
          const occupancyPct = item.totalUnits > 0
            ? Math.round((item.occupiedUnits / item.totalUnits) * 100)
            : 0
          const chips = [
            { label: `${item.totalUnits} unit${item.totalUnits !== 1 ? 's' : ''}`, variant: 'neutral' as const },
            ...(item.occupiedUnits > 0
              ? [{ label: `${item.occupiedUnits} occupied`, variant: 'success' as const }]
              : []),
            ...(item.vacantUnits > 0
              ? [{ label: `${item.vacantUnits} vacant`, variant: 'danger' as const }]
              : []),
          ]
          return (
            <PropertyOverviewCard
              name={item.name}
              address={item.address}
              chips={chips}
              monthlyIncome={item.expectedMonthlyIncome}
              occupancyPct={occupancyPct}
              onPress={() => router.push(`/(admin)/properties/${item.id}`)}
            />
          )
        }}
        ListEmptyComponent={
          <EmptyState
            title="No properties yet"
            description="Add your first property to get started"
            actionLabel="Add Property"
            onAction={handleAdd}
          />
        }
      />

      <FAB onPress={handleAdd} bottomOffset={100} />
    </ScreenLayout>
  )
}
