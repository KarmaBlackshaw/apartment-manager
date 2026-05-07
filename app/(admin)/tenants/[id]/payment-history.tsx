import React, { useState, useMemo } from 'react'
import { View, FlatList, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import dayjs from 'dayjs'
import { useTenant } from '../../../../hooks/useTenants'
import { useBills } from '../../../../hooks/useBills'
import {
  AppHeader,
  AvatarInitials,
  AmountText,
  FilterChipBar,
  ListRow,
  StatusChip,
  AppText,
  LoadingSpinner,
  ScreenView,
} from '../../../../components/ui'
import { colors } from '../../../../constants/theme'

export default function PaymentHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { data: tenant } = useTenant(id)
  const { data: allBills = [], isLoading } = useBills({ tenant_id: id })
  const [chipFilter, setChipFilter] = useState('all')

  const currentBalance = useMemo(
    () => allBills.filter(b => b.status !== 'paid').reduce((sum, b) => sum + b.amount, 0),
    [allBills],
  )

  const filteredBills = useMemo(() => {
    if (chipFilter === 'all') return allBills
    if (chipFilter === 'paid') return allBills.filter(b => b.status === 'paid')
    if (chipFilter === 'overdue') return allBills.filter(b => b.status === 'overdue')
    // 'partial' — no partial status yet, return empty
    return []
  }, [allBills, chipFilter])

  if (isLoading) {
    return (
      <ScreenView>
        <LoadingSpinner />
      </ScreenView>
    )
  }

  return (
    <ScreenView edges={['bottom']}>
      <AppHeader
        title="Payment History"
        right={
          <Pressable hitSlop={8} onPress={() => { /* export placeholder */ }}>
            <AppText style={{ fontSize: 14, color: colors.textLink }}>Export</AppText>
          </Pressable>
        }
      />

      {/* Tenant header card */}
      <View className="bg-surface rounded-md mx-4 my-3 p-4">
        <View className="flex-row items-center gap-3">
          <AvatarInitials name={tenant?.full_name ?? ''} size="md" />
          <View className="flex-1">
            <AppText variant="subheading">{tenant?.full_name}</AppText>
            <AppText color="secondary" variant="caption">
              {tenant?.unit ? `Unit ${tenant.unit.unit_number}` : 'No unit'}
              {tenant?.due_day ? ` · Due ${tenant.due_day}th` : ''}
            </AppText>
          </View>
          <AmountText amount={currentBalance} variant={currentBalance > 0 ? 'owed' : 'zero'} />
        </View>
      </View>

      {/* Filter chips */}
      <FilterChipBar
        options={[
          { label: 'All', value: 'all' },
          { label: 'Paid', value: 'paid' },
          { label: 'Partial', value: 'partial' },
          { label: 'Overdue', value: 'overdue' },
        ]}
        selected={chipFilter}
        onChange={setChipFilter}
      />

      {/* Bills list */}
      <FlatList
        data={filteredBills}
        keyExtractor={b => b.id}
        contentContainerStyle={{ paddingBottom: 48 }}
        renderItem={({ item: bill, index }) => (
          <ListRow
            title={dayjs(bill.period_start).format('MMM YYYY')}
            subtitle={
              bill.status === 'paid'
                ? `Paid ${bill.paid_at ? dayjs(bill.paid_at).format('MMM D') : '—'}`
                : `Due ${dayjs(bill.due_date).format('MMM D')} · ${bill.status}`
            }
            trailingChip={
              <StatusChip
                variant={
                  bill.status === 'paid'
                    ? 'success'
                    : bill.status === 'overdue'
                      ? 'danger'
                      : 'warning'
                }
                label={bill.status.toUpperCase()}
              />
            }
            trailingAmount={
              <AmountText
                amount={bill.amount}
                variant={bill.status === 'paid' ? 'paid' : 'owed'}
              />
            }
            onPress={() => router.push({ pathname: '/billing/[id]', params: { id: bill.id } })}
            showDivider={index < filteredBills.length - 1}
          />
        )}
        ListEmptyComponent={
          <View className="p-8 items-center">
            <AppText color="muted">No payment records</AppText>
          </View>
        }
      />
    </ScreenView>
  )
}
