import React, { useState } from 'react'
import { View, FlatList } from 'react-native'
import { useRouter } from 'expo-router'
import { AppHeader, ScreenView } from '../../../components/ui'
import { PropertySelector } from '../../../components/properties/PropertySelector'
import { ReportMenuCard } from '../../../components/reports/ReportMenuCard'

interface ReportItem {
  label: string
  icon: string
  iconBg: string
  route: string
}

const REPORTS: ReportItem[] = [
  { label: 'Monthly collection', icon: 'briefcase-outline',    iconBg: '#052E16', route: '/(admin)/reports/monthly-collection' },
  { label: 'Outstanding balances', icon: 'alert-circle-outline', iconBg: '#200C0C', route: '/(admin)/reports/outstanding-balances' },
  { label: 'Occupancy rate',      icon: 'home-outline',         iconBg: '#0C1A3D', route: '/(admin)/reports/occupancy' },
  { label: 'Per-unit income',     icon: 'stats-chart-outline',  iconBg: '#1A1040', route: '/(admin)/reports/per-unit-income' },
  { label: 'Annual summary',      icon: 'calendar-outline',     iconBg: '#052E16', route: '/(admin)/reports/annual-summary' },
  { label: 'Maintenance costs',   icon: 'construct-outline',    iconBg: '#2A1A00', route: '/(admin)/reports/maintenance-costs' },
  { label: 'Deposit summary',     icon: 'wallet-outline',       iconBg: '#1E2533', route: '/(admin)/reports/deposit-summary' },
]

export default function ReportsMenuScreen() {
  const router = useRouter()
  const [propertyId, setPropertyId] = useState<string | undefined>()

  return (
    <ScreenView edges={['bottom']}>
      <AppHeader title="Reports" />
      <View className="px-4 py-2 flex-row items-center">
        <PropertySelector selectedId={propertyId} onChange={setPropertyId} />
      </View>
      <FlatList
        data={REPORTS}
        keyExtractor={(item) => item.route}
        numColumns={2}
        contentContainerStyle={{ padding: 16, paddingBottom: 128 }}
        columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
        renderItem={({ item }) => (
          <View className="flex-1">
            <ReportMenuCard
              icon={item.icon}
              iconBg={item.iconBg}
              label={item.label}
              onPress={() =>
                router.push({
                  pathname: item.route as any,
                  params: propertyId ? { propertyId } : {},
                })
              }
            />
          </View>
        )}
      />
    </ScreenView>
  )
}
