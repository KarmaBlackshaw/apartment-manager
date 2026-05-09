import React from 'react'
import { View, Text, FlatList, Pressable, Share } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { ScreenLayout } from '~/layouts/ScreenLayout'
import { ListRow } from '~/components/ui/ListRow'
import { AvatarInitials } from '~/components/ui/AvatarInitials'
import { Chip } from '~/components/ui/Chip'
import { AmountText } from '~/components/ui/AmountText'
import { EmptyState } from '~/components/ui/EmptyState'
import { LoadingSpinner } from '~/components/ui/LoadingSpinner'
import { buildCSV } from '~/lib/csv'
import { useDepositSummary } from '~/hooks/useReports'

export default function DepositSummaryScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>()
  const { data, isLoading } = useDepositSummary(propertyId)

  async function handleExport() {
    if (!data) return
    const csv = buildCSV(
      ['Tenant', 'Unit', 'Deposit', 'Status'],
      data.entries.map((e) => [e.tenant_name, e.unit_number ?? '', e.deposit, e.status]),
    )
    await Share.share({ message: csv })
  }

  const exportBtn = (
    <Pressable onPress={handleExport} hitSlop={8} disabled={!data}>
      <Text className="text-primary text-sm font-medium pr-3">Export</Text>
    </Pressable>
  )

  const report = data ?? { entries: [], totalHeld: 0, tenantCount: 0 }

  return (
    <ScreenLayout title="Deposit Summary" headerRight={exportBtn} backHref="/(admin)/reports">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={report.entries}
          keyExtractor={(e) => e.tenant_id}
          ListHeaderComponent={
            <View className="mx-4 mt-2 mb-3 rounded-xl p-4 bg-surface">
              <Text className="text-[11px] font-semibold uppercase tracking-wide mb-1 text-text-muted">
                Total deposits held
              </Text>
              <AmountText amount={report.totalHeld} size="large" />
              <Text className="text-sm mt-1 text-text-secondary">
                {report.tenantCount} tenant{report.tenantCount !== 1 ? 's' : ''}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState size="lg" title="No deposits" description="No deposit records found." />
          }
          renderItem={({ item }) => (
            <ListRow
              leading={<AvatarInitials name={item.tenant_name} />}
              title={item.tenant_name}
              subtitle={`Unit ${item.unit_number ?? '—'} · ₱${item.deposit.toLocaleString('en-PH', { minimumFractionDigits: 0 })} deposit`}
              trailingChip={
                <Chip
                  variant={item.status === 'ACTIVE' ? 'success' : 'neutral'}
                  label={item.status}
                />
              }
              trailingAmount={<AmountText amount={item.deposit} />}
            />
          )}
          contentContainerStyle={{ paddingBottom: 128 }}
        />
      )}
    </ScreenLayout>
  )
}
