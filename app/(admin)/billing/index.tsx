import React, { useState } from 'react'
import { View, Text, FlatList } from 'react-native'
import { useRouter } from 'expo-router'
import dayjs from 'dayjs'
import { ChipBar } from '~/components/ui/ChipBar'
import { ListRow } from '~/components/ui/ListRow'
import { Chip } from '~/components/ui/Chip'
import { AmountText } from '~/components/ui/AmountText'
import { LoadingSpinner } from '~/components/ui/LoadingSpinner'
import { EmptyState } from '~/components/ui/EmptyState'
import { FAB } from '~/components/ui/FAB'
import { PropertySelector } from '~/components/properties/PropertySelector'
import { ScreenLayout } from '~/layouts/ScreenLayout'
import type { ChipVariant } from '~/components/ui/Chip'
import { useBillingOverview } from '~/hooks/useBillingOverview'
import type { BillingOverviewEntry } from '~/types'

// 8 months: 6 past + current + 1 future. Short label for tabs, full value for API.
const monthEntries = Array.from({ length: 8 }, (_, i) => {
  const d = dayjs().subtract(6, 'month').add(i, 'month')
  return { label: d.format('MMM'), value: d.format('YYYY-MM') }
})

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Partial', value: 'partial' },
  { label: 'Paid', value: 'paid' },
]

function monthStatusToChip(s: string): { variant: ChipVariant; label: string } {
  if (s === 'paid') return { variant: 'success', label: 'PAID' }
  if (s === 'overdue') return { variant: 'danger', label: 'OVERDUE' }
  if (s === 'unpaid') return { variant: 'warning', label: 'UNPAID' }
  return { variant: 'neutral', label: 'NO BILL' }
}

function fmtAmount(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export default function BillingScreen() {
  const router = useRouter()

  const [selectedLabel, setSelectedLabel] = useState(dayjs().format('MMM'))
  const selectedMonth =
    monthEntries.find((m) => m.label === selectedLabel)?.value ?? dayjs().format('YYYY-MM')

  const [filterValue, setFilterValue] = useState('all')
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>(undefined)

  const { data, isLoading } = useBillingOverview(selectedMonth, selectedPropertyId)

  const entries: BillingOverviewEntry[] = data?.entries ?? []
  const stats = data?.stats ?? { collected: 0, billed: 0, rate: 0, overdueCount: 0 }

  const filteredEntries =
    filterValue === 'all'
      ? entries
      : entries.filter((e) => e.month_status === filterValue)

  return (
    <ScreenLayout
      title="Billing"
      headerLeft={null}
    >

      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => `${item.tenant_id}-${item.unit_id ?? 'none'}`}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={
          <>
            {/* Property selector + month label */}
            <View className="flex-row items-center justify-between px-4 pt-[10px] pb-1">
              <PropertySelector
                selectedId={selectedPropertyId}
                onChange={setSelectedPropertyId}
              />
              <Text className="text-[13px] text-text-secondary font-medium">
                {dayjs(selectedMonth).format('MMM YYYY')}
              </Text>
            </View>

            {/* Month tabs — compact */}
            <ChipBar
              options={monthEntries.map((m) => m.label)}
              selected={selectedLabel}
              onChange={setSelectedLabel}
            />

            {/* KPI 2×2 */}
            <View className="px-4 pt-3 pb-1 gap-[10px]">
              <View className="flex-row gap-[10px]">
                <View className="flex-1 bg-surface rounded-md p-[14px]">
                  <Text className="text-xs text-text-secondary mb-[6px]">Collected</Text>
                  <Text
                    className="text-[22px] font-bold text-text-primary"
                    style={{ fontVariant: ['tabular-nums'] }}
                  >
                    {fmtAmount(stats.collected)}
                  </Text>
                </View>
                <View className="flex-1 bg-surface rounded-md p-[14px]">
                  <Text className="text-xs text-text-secondary mb-[6px]">Billed</Text>
                  <Text
                    className="text-[22px] font-bold text-text-primary"
                    style={{ fontVariant: ['tabular-nums'] }}
                  >
                    {fmtAmount(stats.billed)}
                  </Text>
                </View>
              </View>
              <View className="flex-row gap-[10px]">
                <View className="flex-1 bg-surface rounded-md p-[14px]">
                  <Text className="text-xs text-text-secondary mb-[6px]">Rate</Text>
                  <Text
                    className="text-[22px] font-bold text-success"
                    style={{ fontVariant: ['tabular-nums'] }}
                  >
                    {stats.rate}%
                  </Text>
                </View>
                <View className="flex-1 bg-surface rounded-md p-[14px]">
                  <Text className="text-xs text-text-secondary mb-[6px]">Overdue</Text>
                  <Text
                    className="text-[22px] font-bold text-danger"
                    style={{ fontVariant: ['tabular-nums'] }}
                  >
                    {stats.overdueCount}
                  </Text>
                </View>
              </View>
            </View>

            {/* Filter chips */}
            <ChipBar
              options={FILTER_OPTIONS}
              selected={filterValue}
              onChange={setFilterValue}
            />

            {isLoading && <LoadingSpinner />}
          </>
        }
        renderItem={({ item, index }: { item: BillingOverviewEntry; index: number }) => {
          const chip = monthStatusToChip(item.month_status)
          const isPaid = item.month_status === 'paid'
          const amountVariant: 'paid' | 'owed' = isPaid ? 'paid' : 'owed'
          const displayAmount = isPaid ? item.bill_amount : 0

          return (
            <ListRow
              title={item.tenant_full_name}
              subtitle={`Unit ${item.unit_number ?? '—'} · ₱${item.monthly_rate.toLocaleString()}/mo`}
              trailingChip={<Chip variant={chip.variant} label={chip.label} size="sm" />}
              trailingAmount={
                item.bill_id ? (
                  <AmountText amount={displayAmount} variant={amountVariant} size="small" />
                ) : undefined
              }
              onPress={
                item.bill_id
                  ? () => router.push(`/(admin)/billing/${item.bill_id}`)
                  : undefined
              }
              showDivider={index < filteredEntries.length - 1}
            />
          )
        }}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              size="lg"
              title="No entries"
              description="No billing records for this month"
            />
          ) : null
        }
      />

      <FAB onPress={() => router.push('/(admin)/billing/generate')} icon="add" bottomOffset={100} />
    </ScreenLayout>
  )
}
