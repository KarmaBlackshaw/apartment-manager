import React from 'react'
import { View, Pressable } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { useTenantSearch } from '~/context/TenantSearchContext'
import { AppText } from '~/components/ui/AppText'
import { colors } from '~/constants/theme'

export const QuickActionBar: React.FC = () => {
  const router = useRouter()
  const { open } = useTenantSearch()

  return (
    <View className="flex-row gap-2">
      <Pressable
        className="flex-1 rounded-md items-center justify-center bg-primary py-3 px-1 min-h-[64px]"
        onPress={open}
      >
        <Ionicons name="cash-outline" size={22} color={colors.textPrimary} />
        <AppText className="text-[11px] font-medium text-text-primary mt-1.5 text-center">
          Record Payment
        </AppText>
      </Pressable>

      <Pressable
        className="flex-1 rounded-md items-center justify-center bg-surface py-3 px-1 min-h-[64px]"
        onPress={() => router.push('/(admin)/tenants/new' as any)}
      >
        <Ionicons name="person-add-outline" size={22} color={colors.textMuted} />
        <AppText className="text-[11px] font-medium text-text-muted mt-1.5 text-center">
          Add Tenant
        </AppText>
      </Pressable>

      <Pressable
        className="flex-1 rounded-md items-center justify-center bg-surface py-3 px-1 min-h-[64px]"
        onPress={() => router.push('/(admin)/properties' as any)}
      >
        <Ionicons name="home-outline" size={22} color={colors.textMuted} />
        <AppText className="text-[11px] font-medium text-text-muted mt-1.5 text-center">
          Add Unit
        </AppText>
      </Pressable>

      <Pressable
        className="flex-1 rounded-md items-center justify-center bg-surface py-3 px-1 min-h-[64px]"
        onPress={() => router.push('/(admin)/reports/maintenance-costs' as any)}
      >
        <Ionicons name="construct-outline" size={22} color={colors.textMuted} />
        <AppText className="text-[11px] font-medium text-text-muted mt-1.5 text-center">
          Log Issue
        </AppText>
      </Pressable>
    </View>
  )
}
