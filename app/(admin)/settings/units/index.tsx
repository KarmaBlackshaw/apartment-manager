import React from 'react'
import { View, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTabBarScrollHandler } from '~/hooks/useTabBarScrollHandler'
import { useProperties } from '~/hooks/useProperties'
import { useUnits } from '~/hooks/useUnits'
import { AppText } from '~/components/ui/AppText'
import { LoadingSpinner } from '~/components/ui/LoadingSpinner'
import { UnitCard } from '~/components/properties/UnitCard'
import { ScreenLayout } from '~/layouts/ScreenLayout'
import type { Property } from '~/types'

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

const AddUnitButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} hitSlop={8}>
    <Ionicons name="add" size={26} color="#3b82f6" />
  </TouchableOpacity>
)

export default function AllUnitsScreen() {
  const router = useRouter()
  const tabBarScroll = useTabBarScrollHandler()
  const { data: properties, isLoading } = useProperties()

  if (isLoading) return <LoadingSpinner />

  if (!properties?.length) return (
    <ScreenLayout title="Units" headerRight={<AddUnitButton onPress={() => router.push('/(admin)/settings/units/new')} />} backHref="/(admin)/settings">
      <View className="flex-1 items-center justify-center p-8 bg-app">
        <Ionicons name="business-outline" size={48} color="#555555" />
        <AppText color="muted" className="text-center mt-4">Add a property first before managing units.</AppText>
      </View>
    </ScreenLayout>
  )

  return (
    <ScreenLayout title="Units" headerRight={<AddUnitButton onPress={() => router.push('/(admin)/settings/units/new')} />} backHref="/(admin)/settings">
      <ScrollView className="flex-1 bg-app" contentContainerStyle={{ padding: 16, paddingBottom: 128 }} {...tabBarScroll}>
        {properties.map((p) => (
          <PropertySection key={p.id} property={p} router={router} />
        ))}
      </ScrollView>
    </ScreenLayout>
  )
}
