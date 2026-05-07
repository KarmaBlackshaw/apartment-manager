import React from 'react'
import { View, Text, FlatList, Pressable, Share } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ScreenLayout } from '~/layouts/ScreenLayout'
import { ListRow } from '~/components/ui/ListRow'
import { AvatarInitials } from '~/components/ui/AvatarInitials'
import { AmountText } from '~/components/ui/AmountText'
import { EmptyState } from '~/components/ui/EmptyState'
import { LoadingSpinner } from '~/components/ui/LoadingSpinner'
import { buildCSV } from '~/lib/csv'
import { useOutstandingBalances } from '~/hooks/useReports'

export default function OutstandingBalancesScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>()
  const router = useRouter()
  const { data, isLoading } = useOutstandingBalances(propertyId)

  async function handleExport() {
    if (!data) return
    const csv = buildCSV(
      ['Tenant', 'Unit', 'Months Overdue', 'Balance'],
      data.entries.map((e) => [e.tenant_full_name, e.unit_number ?? '', e.overdueMonthCount, e.balance]),
    )
    await Share.share({ message: csv })
  }

  const exportBtn = (
    <Pressable onPress={handleExport} hitSlop={8} disabled={!data}>
      <Text className="text-primary text-sm font-medium pr-3">Export</Text>
    </Pressable>
  )

  const report = data ?? { entries: [], totalOutstanding: 0, tenantCount: 0 }

  return (
    <ScreenLayout title="Outstanding" headerRight={exportBtn} backHref="/(admin)/reports">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={report.entries}
          keyExtractor={(e) => e.tenant_id}
          ListHeaderComponent={
            <View className="mx-4 mt-2 mb-3 rounded-xl p-4 flex-row bg-danger-bg">
              <View className="flex-1 mr-4">
                <Text className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                  TOTAL OUTSTANDING
                </Text>
                <AmountText amount={report.totalOutstanding} variant="owed" size="large" />
              </View>
              <View className="items-start">
                <Text className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                  TENANTS
                </Text>
                <Text className="text-[28px] font-bold text-danger">
                  {report.tenantCount}
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <EmptyState title="All clear" description="No tenants with outstanding balances." />
          }
          renderItem={({ item }) => (
            <ListRow
              leading={<AvatarInitials name={item.tenant_full_name} />}
              title={item.tenant_full_name}
              subtitle={`Unit ${item.unit_number ?? '—'} · ${item.overdueMonthCount >= 2 ? `${item.overdueMonthCount}+ months` : '1 month'} overdue`}
              trailingAmount={<AmountText amount={item.balance} variant="owed" size="small" />}
              onPress={() =>
                router.push({ pathname: '/(admin)/tenants/[id]' as any, params: { id: item.tenant_id } })
              }
            />
          )}
          contentContainerStyle={{ paddingBottom: 128 }}
        />
      )}
    </ScreenLayout>
  )
}
