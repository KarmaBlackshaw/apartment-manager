import React, { useMemo } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import dayjs from 'dayjs'
import { useQuery } from '@tanstack/react-query'
import { useTenant } from '../../../../hooks/useTenants'
import { fetchBills } from '../../../../lib/api/bills'
import {
  ScreenHeader,
  StatusChip,
  AvatarInitials,
  AmountText,
  BalanceCard,
  SectionHeader,
  InfoRow,
  ListRow,
  AppText,
  LoadingSpinner,
} from '../../../../components/ui'
import { Button } from '../../../../components/ui'
import { colors } from '../../../../constants/theme'

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
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScreenHeader title="Tenant" left="back" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <AppText color="danger">Tenant not found.</AppText>
        </View>
      </SafeAreaView>
    )
  }

  const statusVariant = tenant.status === 'active' ? 'success' : 'neutral'
  const statusLabel = tenant.status === 'active' ? 'ACTIVE' : 'INACTIVE'

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScreenHeader
        title={tenant.full_name}
        left="back"
        right={<StatusChip variant={statusVariant} label={statusLabel} />}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <AvatarInitials name={tenant.full_name} size="lg" />
            <View style={{ flex: 1 }}>
              <AppText variant="subheading">{tenant.full_name}</AppText>
              <AppText color="secondary" variant="caption">
                {tenant.unit ? `Unit ${tenant.unit.unit_number}` : 'No unit assigned'}
                {' · '}Move-in {dayjs(tenant.move_in_date).format('MMM D, YYYY')}
              </AppText>
              <View style={{ marginTop: 6 }}>
                <StatusChip
                  variant="info"
                  label={tenant.billing_type === 'monthly' ? 'Month-to-month' : 'Daily'}
                  size="sm"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Balance card */}
        <View style={{ marginTop: 12 }}>
          <BalanceCard
            amount={currentBalance}
            variant={currentBalance > 0 ? 'danger' : currentBalance < 0 ? 'neutral' : 'success'}
            onRecordPayment={() =>
              router.push(`/(admin)/billing/new?tenantId=${id}` as any)
            }
          />
        </View>

        {/* Contract section */}
        <View style={styles.section}>
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
        <View style={{ marginTop: 12 }}>
          <SectionHeader
            title="Payment history"
            onViewAll={() =>
              router.push(`/(admin)/tenants/${id}/payment-history` as any)
            }
          />
          <View style={styles.section}>
            {recentBills.length === 0 ? (
              <AppText color="muted" style={{ padding: 16 }}>
                No payments yet
              </AppText>
            ) : (
              recentBills.map((bill, idx) => (
                <ListRow
                  key={bill.id}
                  title={dayjs(bill.period_start).format('MMM YYYY')}
                  subtitle={`Due ${dayjs(bill.due_date).format('MMM D')} · ${bill.status}`}
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
                  showDivider={idx < recentBills.length - 1}
                />
              ))
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            label="Move Out"
            variant="danger"
            onPress={() => router.push(`/(admin)/tenants/${id}/move-out` as any)}
          />
          <Button
            label="View Documents"
            variant="secondary"
            onPress={() => router.push(`/(admin)/tenants/${id}/documents` as any)}
            className="mt-2"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 48 },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    overflow: 'hidden',
  },
  actions: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 32,
  },
})
