import React, { useLayoutEffect } from 'react'
import { View, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useNavigation } from '@react-navigation/native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTabBarScrollHandler } from '../../../../hooks/useTabBarScrollHandler'
import { useProperties } from '../../../../hooks/useProperties'
import { useUnits } from '../../../../hooks/useUnits'
import { UnitCard } from '../../../../components/admin/UnitCard'
import { AppText, LoadingSpinner } from '../../../../components/ui'
import type { Property } from '../../../../types'

function PropertySection({ property, router }: { property: Property; router: ReturnType<typeof useRouter> }) {
  const { data: units, isLoading } = useUnits(property.id)

  if (isLoading) return (
    <View className="mb-6">
      <AppText variant="label" color="secondary" className="mb-3">{property.name.toUpperCase()}</AppText>
      <AppText color="muted" variant="caption" className="text-center py-2">Loading…</AppText>
    </View>
  )

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <AppText variant="label" color="secondary">{property.name.toUpperCase()}</AppText>
        <AppText color="muted" variant="caption">{units?.length ?? 0} unit{units?.length !== 1 ? 's' : ''}</AppText>
      </View>
      {units?.length === 0
        ? <AppText color="muted" className="text-center py-2">No units yet</AppText>
        : units?.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              onPress={() => router.push(`/(admin)/properties/${property.id}/units/${unit.id}` as any)}
            />
          ))
      }
    </View>
  )
}

export default function AllUnitsScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  const tabBarScroll = useTabBarScrollHandler()
  const { data: properties, isLoading } = useProperties()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => router.push('/(admin)/settings/units/new')}
          style={{ marginRight: 8, padding: 4 }}
        >
          <Ionicons name="add" size={26} color="#3b82f6" />
        </TouchableOpacity>
      ),
    })
  }, [navigation])

  if (isLoading) return <LoadingSpinner />

  if (!properties?.length) return (
    <View className="flex-1 items-center justify-center p-8 bg-app">
      <Ionicons name="business-outline" size={48} color="#555555" />
      <AppText color="muted" className="text-center mt-4">Add a property first before managing units.</AppText>
    </View>
  )

  return (
    <ScrollView className="flex-1 bg-app" contentContainerStyle={{ padding: 16, paddingBottom: 128 }} {...tabBarScroll}>
      {properties.map((p) => (
        <PropertySection key={p.id} property={p} router={router} />
      ))}
    </ScrollView>
  )
}
