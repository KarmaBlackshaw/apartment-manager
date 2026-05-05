import React, { useState } from 'react'
import { View, FlatList, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useNavigation } from '@react-navigation/native'
import { useLayoutEffect } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTabBarScrollHandler } from '../../../hooks/useTabBarScrollHandler'
import { useTenants } from '../../../hooks/useTenants'
import { TenantCard } from '../../../components/admin/TenantCard'
import { LoadingSpinner, EmptyState, Button, AppText } from '../../../components/ui'

export default function TenantsScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  const tabBarScroll = useTabBarScrollHandler()
  const [showInactive, setShowInactive] = useState(false)
  const { data: tenants, isLoading, isError } = useTenants(showInactive ? undefined : { status: 'active' })

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => router.push('/(admin)/tenants/new')} style={{ marginRight: 8, padding: 4 }}>
          <Ionicons name="add" size={26} color="#3b82f6" />
        </TouchableOpacity>
      ),
    })
  }, [navigation])

  if (isLoading) return <LoadingSpinner />
  if (isError) return (
    <View className="flex-1 items-center justify-center p-8 bg-app">
      <AppText color="danger" className="text-center">Could not load tenants. Please restart the app.</AppText>
    </View>
  )

  return (
    <View className="flex-1 bg-app">
      <View className="flex-row items-center gap-2 px-4 pt-3">
        <Button
          label="Active" size="sm"
          variant={!showInactive ? 'primary' : 'secondary'}
          onPress={() => setShowInactive(false)}
        />
        <Button
          label="All" size="sm"
          variant={showInactive ? 'primary' : 'secondary'}
          onPress={() => setShowInactive(true)}
        />
      </View>

      <FlatList
        data={tenants}
        keyExtractor={(t) => t.id}
        contentContainerClassName="p-4"
        contentContainerStyle={{ paddingBottom: 128 }}
        {...tabBarScroll}
        renderItem={({ item }) => (
          <TenantCard tenant={item} onPress={() => router.push(`/(admin)/tenants/${item.id}` as any)} />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No tenants"
            description="Add your first tenant to get started"
            actionLabel="New tenant"
            onAction={() => router.push('/(admin)/tenants/new')}
          />
        }
      />
    </View>
  )
}
