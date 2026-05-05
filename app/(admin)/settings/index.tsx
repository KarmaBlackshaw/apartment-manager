import React from 'react'
import { View, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTabBarScrollHandler } from '../../../hooks/useTabBarScrollHandler'
import { AppText } from '../../../components/ui'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

interface SettingRowProps {
  icon: IoniconName
  iconColor?: string
  label: string
  description: string
  onPress: () => void
}

function SettingRow({ icon, iconColor = '#3b82f6', label, description, onPress }: SettingRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      // @ts-ignore
      className="flex-row items-center gap-4 px-4 py-4 bg-elevated border border-[#2a2a2a] rounded-2xl mb-3"
    >
      <View
        // @ts-ignore
        className="w-10 h-10 rounded-xl bg-[#1a1a1a] items-center justify-center"
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <AppText className="font-semibold">{label}</AppText>
        <AppText color="secondary" variant="caption">{description}</AppText>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#555555" />
    </TouchableOpacity>
  )
}

export default function SettingsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const tabBarScroll = useTabBarScrollHandler()

  return (
    <ScrollView
      className="flex-1 bg-app"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 128 }}
      {...tabBarScroll}
    >
      <AppText variant="heading" className="mb-6">Settings</AppText>

      <AppText variant="label" color="secondary" className="mb-3">APP</AppText>
      <SettingRow
        icon="home-outline"
        label="General"
        description="Apartment & owner name"
        onPress={() => router.push('/(admin)/settings/general')}
      />
      <SettingRow
        icon="water-outline"
        label="Rates"
        description="Water, electricity & internet"
        onPress={() => router.push('/(admin)/settings/rates')}
      />
      <SettingRow
        icon="lock-closed-outline"
        label="Security"
        description="PIN & biometrics"
        onPress={() => router.push('/(admin)/settings/security')}
      />

      <AppText variant="label" color="secondary" className="mb-3 mt-2">PROPERTY MANAGEMENT</AppText>
      <SettingRow
        icon="business-outline"
        iconColor="#8b5cf6"
        label="Properties"
        description="View & manage properties"
        onPress={() => router.push('/(admin)/properties')}
      />
      <SettingRow
        icon="grid-outline"
        iconColor="#8b5cf6"
        label="Units"
        description="All units across properties"
        onPress={() => router.push('/(admin)/settings/units')}
      />
    </ScrollView>
  )
}
