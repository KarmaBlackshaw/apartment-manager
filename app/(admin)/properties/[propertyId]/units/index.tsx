import React from 'react'
import { View, FlatList, TouchableOpacity } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTabBarScrollHandler } from '../../../../../hooks/useTabBarScrollHandler'
import { useUnits } from '../../../../../hooks/useUnits'
import { LoadingSpinner, EmptyState, AppText, UnitCard, AppHeader } from '../../../../../components/ui'

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

  return (
    <View className="flex-1 bg-app">
      <AppHeader
        title="Units"
        right={
          <TouchableOpacity
            onPress={() => router.push(`/(admin)/properties/${propertyId}/units/new`)}
            hitSlop={8}
          >
            <Ionicons name="add" size={26} color="#3b82f6" />
          </TouchableOpacity>
        }
      />
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
    </View>
  )
}
