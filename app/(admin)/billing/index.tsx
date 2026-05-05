import React, { useState } from 'react'
import { View, FlatList } from 'react-native'
import { useRouter } from 'expo-router'
import { useTabBarScrollHandler } from '../../../hooks/useTabBarScrollHandler'
import { useBills } from '../../../hooks/useBills'
import { BillCard } from '../../../components/admin/BillCard'
import { LoadingSpinner, EmptyState, Button, AppText } from '../../../components/ui'
import type { BillStatus } from '../../../types'

const FILTERS: { label: string; value: BillStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Paid', value: 'paid' },
]

export default function BillingScreen() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<BillStatus | undefined>(undefined)
  const { data: bills, isLoading, isError } = useBills(statusFilter ? { status: statusFilter } : undefined)

  if (isLoading) return <LoadingSpinner />
  if (isError) return (
    <View className="flex-1 items-center justify-center p-8 bg-app">
      <AppText color="danger" className="text-center">Could not load bills. Please restart the app.</AppText>
    </View>
  )

  return (
    <View className="flex-1 bg-app">
      <View className="flex-row gap-2 px-4 pt-3 flex-wrap">
        {FILTERS.map((f) => (
          <Button key={f.label} label={f.label} size="sm"
            variant={statusFilter === f.value ? 'primary' : 'secondary'}
            onPress={() => setStatusFilter(f.value)} />
        ))}
      </View>
      <FlatList
        data={bills}
        keyExtractor={(b) => b.id}
        contentContainerClassName="p-4"
        renderItem={({ item }) => (
          <BillCard bill={item} onPress={() => router.push(`/(admin)/billing/${item.id}`)} />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No bills"
            description="Create a bill for a tenant"
            actionLabel="New Bill"
            onAction={() => router.push('/(admin)/billing/new')}
          />
        }
        ListFooterComponent={
          bills && bills.length > 0
            ? <Button label="New Bill" variant="secondary" onPress={() => router.push('/(admin)/billing/new')} className="mt-2" />
            : null
        }
      />
    </View>
  )
}
