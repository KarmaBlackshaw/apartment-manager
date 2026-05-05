import React from 'react'
import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native'
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
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 128 }}
      {...tabBarScroll}
    >
      <Text style={styles.title}>Reports</Text>
      <Text style={styles.subtitle}>Coming in Phase 6</Text>

      <View style={styles.grid}>
        {REPORTS.map((r) => (
          <Pressable
            key={r.title}
            style={styles.card}
            onPress={() => Alert.alert('Coming Soon', `${r.title} report will be available in a future update.`)}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${r.color}22` }]}>
              <Ionicons name={r.icon} size={24} color={r.color} />
            </View>
            <Text style={styles.cardTitle}>{r.title}</Text>
            <Text style={styles.cardDesc}>{r.description}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0d0d' },
  title: { fontSize: 24, fontWeight: '800', color: '#f1f1f1', letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#555555', marginBottom: 24 },
  grid: { gap: 12 },
  card: {
    backgroundColor: '#171717',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#f1f1f1', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#888888', lineHeight: 17 },
})
