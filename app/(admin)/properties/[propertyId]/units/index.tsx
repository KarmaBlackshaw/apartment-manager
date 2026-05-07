import React from 'react'
import { View, FlatList, TouchableOpacity } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTabBarScrollHandler } from '~/hooks/useTabBarScrollHandler'
import { useUnits } from '~/hooks/useUnits'
import { LoadingSpinner } from '~/components/ui/LoadingSpinner'
import { EmptyState } from '~/components/ui/EmptyState'
import { AppText } from '~/components/ui/AppText'
import { UnitCard } from '~/components/properties/UnitCard'
import { ScreenLayout } from '~/layouts/ScreenLayout'

export default function UnitsScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>()
  const router = useRouter()
  const tabBarScroll = useTabBarScrollHandler()
  const { data: units, isLoading, isError } = useUnits(propertyId)

  if (isLoading) return <LoadingSpinner />
  if (isError) return (
    <View className="flex-1 items-center justify-center p-8 bg-app">
      <AppText color="danger" className="text-center">Could not load units. Please restart the app.</AppText>
    </View>
  )

  const addButton = (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/properties/${propertyId}/units/new`)}
      hitSlop={8}
    >
      <Ionicons name="add" size={26} color="#3b82f6" />
    </TouchableOpacity>
  )

  return (
    <ScreenLayout title="Units" headerRight={addButton} backHref={`/(admin)/properties/${propertyId}`}>
      <FlatList
        data={units}
        keyExtractor={(u) => u.id}
        contentContainerClassName="p-4 pb-32"
        {...tabBarScroll}
        renderItem={({ item }) => (
          <UnitCard unit={item} onPress={() => router.push(`/(admin)/properties/${propertyId}/units/${item.id}`)} />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No units yet"
            description="Add units to this property"
            actionLabel="Add Unit"
            onAction={() => router.push(`/(admin)/properties/${propertyId}/units/new`)}
          />
        }
      />
    </ScreenLayout>
  )
}
