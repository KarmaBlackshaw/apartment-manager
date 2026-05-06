import React from 'react'
import { View, Text, ScrollView, Pressable, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTabBarScrollHandler } from '../../../hooks/useTabBarScrollHandler'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

interface ReportCard {
  title: string
  description: string
  icon: IoniconName
  color: string
}

const REPORTS: ReportCard[] = [
  { title: 'Monthly Income',       description: 'Collections vs expected per month',   icon: 'trending-up-outline',  color: '#22c55e' },
  { title: 'Occupancy Report',     description: 'Occupancy rate over time',             icon: 'home-outline',         color: '#3b82f6' },
  { title: 'Outstanding Balances', description: 'Tenants with unpaid / overdue bills',  icon: 'alert-circle-outline', color: '#ef4444' },
  { title: 'Payment History',      description: 'All payments in a date range',         icon: 'receipt-outline',      color: '#8b5cf6' },
  { title: 'Vacancy Report',       description: 'Vacant units and duration',            icon: 'business-outline',     color: '#f59e0b' },
  { title: 'Tenant Ledger',        description: 'Full ledger for a single tenant',      icon: 'person-outline',       color: '#ec4899' },
]

export default function ReportsMenuScreen() {
  const insets = useSafeAreaInsets()
  const tabBarScroll = useTabBarScrollHandler()

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 128 }}
      {...tabBarScroll}
    >
      <Text className="text-2xl font-extrabold text-text-primary mb-1" style={{ letterSpacing: -0.5 }}>Reports</Text>
      <Text className="text-[13px] text-text-muted mb-6">Coming in Phase 6</Text>

      <View className="gap-3">
        {REPORTS.map((r) => (
          <Pressable
            key={r.title}
            className="bg-surface rounded-md p-4 border border-border"
            onPress={() => Alert.alert('Coming Soon', `${r.title} report will be available in a future update.`)}
          >
            <View
              className="w-[44px] h-[44px] rounded-md items-center justify-center mb-[10px]"
              style={{ backgroundColor: `${r.color}22` }}
            >
              <Ionicons name={r.icon} size={24} color={r.color} />
            </View>
            <Text className="text-[15px] font-semibold text-text-primary mb-1">{r.title}</Text>
            <Text className="text-xs text-text-secondary" style={{ lineHeight: 17 }}>{r.description}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}
