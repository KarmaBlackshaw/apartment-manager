import React, { useState, useMemo } from 'react'
import { View, FlatList, TouchableOpacity, TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTabBarScrollHandler } from '../../../hooks/useTabBarScrollHandler'
import { useProperties } from '../../../hooks/useProperties'
import { useUnitCounts } from '../../../hooks/useUnits'
import { LoadingSpinner, EmptyState, AppText, PropertyCard, AppHeader } from '../../../components/ui'

export default function PropertiesScreen() {
  const router = useRouter()
  const tabBarScroll = useTabBarScrollHandler()
  const { data: properties, isLoading, isError } = useProperties()
  const { data: unitCounts } = useUnitCounts()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!properties) return []
    if (!query.trim()) return properties
    const q = query.toLowerCase()
    return properties.filter(
      (p) => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q),
    )
  }, [properties, query])

  if (isLoading) return <LoadingSpinner />
  if (isError) return (
    <View className="flex-1 items-center justify-center p-8 bg-app">
      <AppText color="danger" className="text-center">Could not load properties. Please restart the app.</AppText>
    </View>
  )

  return (
    <View className="flex-1 bg-app">
      <AppHeader
        title="Properties"
        right={
          <TouchableOpacity
            onPress={() => router.push('/(admin)/properties/new')}
            style={{ marginRight: 8, padding: 4 }}
          >
            <Ionicons name="add" size={26} color="#3b82f6" />
          </TouchableOpacity>
        }
      />
      {/* Search bar */}
      <View className="px-4 pt-3 pb-2">
        {/* @ts-ignore */}
        <View className="flex-row items-center bg-elevated border border-[#2a2a2a] rounded-xl px-4 py-3 gap-3">
          <Ionicons name="search" size={18} color="#555555" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search properties…"
            placeholderTextColor="#555555"
            // @ts-ignore
            className="flex-1 text-base text-[#f1f1f1]"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color="#555555" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerClassName="p-4"
        contentContainerStyle={{ paddingBottom: 128 }}
        {...tabBarScroll}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            unitCount={unitCounts ? (unitCounts[item.id] ?? 0) : undefined}
            onPress={() => router.push(`/(admin)/properties/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          query.trim() ? (
            <AppText color="muted" className="text-center mt-12">No properties match "{query}"</AppText>
          ) : (
            <EmptyState
              title="No properties yet"
              description="Add your first property to get started"
              actionLabel="Add Property"
              onAction={() => router.push('/(admin)/properties/new')}
            />
          )
        }
      />
    </View>
  )
}
