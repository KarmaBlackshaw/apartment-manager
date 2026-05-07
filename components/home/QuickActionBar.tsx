import React from 'react'
import { View, Pressable, Text } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { useTenantSearch } from '~/context/TenantSearchContext'

export const QuickActionBar: React.FC = () => {
  const router = useRouter()
  const { open } = useTenantSearch()

  return (
    <View className="flex-row gap-2">
      {/* Record Payment Button */}
      <Pressable
        className="flex-1 rounded-[12px] items-center justify-center bg-primary"
        style={{ paddingVertical: 11, paddingHorizontal: 4 }}
        onPress={open}
      >
        <Ionicons name="cash-outline" size={16} color="#fff" />
        <Text style={{ fontSize: 9, fontWeight: '500', color: '#fff', marginTop: 4 }}>
          Record Payment
        </Text>
      </Pressable>

      {/* Add Tenant Button */}
      <Pressable
        className="flex-1 rounded-[12px] items-center justify-center bg-surface"
        style={{ paddingVertical: 11, paddingHorizontal: 4 }}
        onPress={() => router.push('/(admin)/tenants/new' as any)}
      >
        <Ionicons name="person-add-outline" size={16} color="#64748B" />
        <Text style={{ fontSize: 9, fontWeight: '500', color: '#64748B', marginTop: 4 }}>
          Add Tenant
        </Text>
      </Pressable>

      {/* Add Unit Button */}
      <Pressable
        className="flex-1 rounded-[12px] items-center justify-center bg-surface"
        style={{ paddingVertical: 11, paddingHorizontal: 4 }}
        onPress={() => router.push('/(admin)/properties' as any)}
      >
        <Ionicons name="home-outline" size={16} color="#64748B" />
        <Text style={{ fontSize: 9, fontWeight: '500', color: '#64748B', marginTop: 4 }}>
          Add Unit
        </Text>
      </Pressable>

      {/* Log Issue Button */}
      <Pressable
        className="flex-1 rounded-[12px] items-center justify-center bg-surface"
        style={{ paddingVertical: 11, paddingHorizontal: 4 }}
        onPress={() => router.push('/(admin)/reports/maintenance-costs' as any)}
      >
        <Ionicons name="construct-outline" size={16} color="#64748B" />
        <Text style={{ fontSize: 9, fontWeight: '500', color: '#64748B', marginTop: 4 }}>
          Log Issue
        </Text>
      </Pressable>
    </View>
  )
}
