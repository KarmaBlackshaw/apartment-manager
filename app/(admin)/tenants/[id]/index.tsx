import React, { useMemo } from 'react'
import { View, ScrollView } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import dayjs from 'dayjs'
import { useQuery } from '@tanstack/react-query'
import { useTenant } from '~/hooks/useTenants'
import { fetchBills } from '~/lib/api/bills'
import { Chip } from '~/components/ui/Chip'
import { AvatarInitials } from '~/components/ui/AvatarInitials'
import { AmountText } from '~/components/ui/AmountText'
import { BalanceCard } from '~/components/billing/BalanceCard'
import { SectionHeader } from '~/components/ui/SectionHeader'
import { InfoRow } from '~/components/ui/InfoRow'
import { ListRow } from '~/components/ui/ListRow'
import { AppText } from '~/components/ui/AppText'
import { LoadingSpinner } from '~/components/ui/LoadingSpinner'
import { Button } from '~/components/ui/Button'
import { EmptyState } from '~/components/ui/EmptyState'
import { ScreenLayout } from '~/layouts/ScreenLayout'

export default function TenantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const { data: tenant, isLoading } = useTenant(id)

  const { data: allBills = [] } = useQuery({
    queryKey: ['bills', { tenant_id: id }],
    queryFn: () => fetchBills({ tenant_id: id }),
    enabled: !!id,
  })

  // Balance = sum of pending + overdue bills
  const currentBalance = useMemo(
    () => allBills.filter((b) => b.status !== 'paid').reduce((sum, b) => sum + b.amount, 0),
    [allBills],
  )

  // Last 2 bills for payment history preview
  const recentBills = useMemo(() => allBills.slice(0, 2), [allBills])

  if (isLoading) return <LoadingSpinner />

  if (!tenant) {
    return (
      <ScreenLayout title="Tenant">
        <View className="flex-1 items-center justify-center">
          <AppText color="danger">Tenant not found.</AppText>
        </View>
      </ScreenLayout>
    )
  }

  const statusVariant = tenant.status === 'active' ? 'success' : 'neutral'
  const statusLabel = tenant.status === 'active' ? 'ACTIVE' : 'INACTIVE'

  return (
    <ScreenLayout title={tenant.full_name} headerRight={<Chip variant={statusVariant} label={statusLabel} />} backHref="/(admin)/tenants">

      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Profile card */}
        <View className="bg-surface rounded-md mx-4 mt-3 p-4">
          <View className="flex-row items-center gap-3">
            <AvatarInitials name={tenant.full_name} size="lg" />
            <View className="flex-1">
              <AppText variant="subheading">{tenant.full_name}</AppText>
              <AppText color="secondary" variant="caption">
                {tenant.unit ? `Unit ${tenant.unit.unit_number}` : 'No unit assigned'}
                {' · '}Move-in {dayjs(tenant.move_in_date).format('MMM D, YYYY')}
              </AppText>
              <View className="mt-[6px]">
                <Chip
                  variant="info"
                  label={tenant.billing_type === 'monthly' ? 'Month-to-month' : 'Daily'}
                  size="sm"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Balance card */}
        <View className="mt-3">
          <BalanceCard
            amount={currentBalance}
            variant={currentBalance > 0 ? 'danger' : currentBalance < 0 ? 'neutral' : 'success'}
            onRecordPayment={() =>
              router.push({ pathname: '/billing/new', params: { tenantId: id } })
            }
          />
        </View>

        {/* Contract section */}
        <View className="bg-surface rounded-md mx-4 mt-3 overflow-hidden">
          <SectionHeader title="Contract" />
          <InfoRow
            label="Rent"
            value={
              tenant.unit != null
                ? `Due on day ${tenant.due_day ?? '—'}`
                : '—'
            }
          />
          <InfoRow label="Deposit" value="See contract" />
          <InfoRow label="Advance" value="1 month" />
          <InfoRow label="Late fee" value="₱200 · 5-day grace" showDivider={false} />
        </View>

        {/* Payment history section */}
        <View className="mt-3">
          <SectionHeader
            title="Payment history"
            onViewAll={() =>
              router.push({ pathname: '/tenants/[id]/payment-history', params: { id } })
            }
          />
          <View className="bg-surface rounded-md mx-4 mt-3 overflow-hidden">
            {recentBills.length === 0 ? (
              <EmptyState size="sm" title="No payments yet" />
            ) : (
              recentBills.map((bill, idx) => (
                <ListRow
                  key={bill.id}
                  title={dayjs(bill.period_start).format('MMM YYYY')}
                  subtitle={`Due ${dayjs(bill.due_date).format('MMM D')} · ${bill.status}`}
                  trailingChip={
                    <Chip
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
                  showDivider={idx < recentBills.length - 1}
                />
              ))
            )}
          </View>
        </View>

        {/* Actions */}
        <View className="mx-4 mt-3 mb-8">
          <Button
            label="Move Out"
            variant="danger"
            onPress={() => router.push({ pathname: '/tenants/[id]/move-out', params: { id } })}
          />
          <Button
            label="View Documents"
            variant="secondary"
            onPress={() => router.push({ pathname: '/tenants/[id]/documents', params: { id } })}
            className="mt-2"
          />
        </View>
      </ScrollView>
    </ScreenLayout>
  )
}
