import React from 'react'
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import dayjs from 'dayjs'
import { colors } from '../../../constants/theme'
import {
  ScreenHeader,
  BottomCTABar,
  Button,
  LoadingSpinner,
  SectionHeader,
  InfoRow,
  StatusChip,
  AvatarInitials,
} from '../../../components/ui'
import type { ChipVariant } from '../../../components/ui'
import { useBill } from '../../../hooks/useBills'
import { useTenant } from '../../../hooks/useTenants'
import { useUnit } from '../../../hooks/useUnits'
import { useSettings } from '../../../hooks/useSettings'
import {
  formatCurrency,
  calcElectricityCharge,
  calcWaterCharge,
} from '../../../lib/billing'

// ---------------------------------------------------------------------------
// Bill status → StatusChip variant
// ---------------------------------------------------------------------------
function billStatusChip(status: string): { variant: ChipVariant; label: string } {
  if (status === 'paid') return { variant: 'success', label: 'PAID' }
  if (status === 'overdue') return { variant: 'danger', label: 'OVERDUE' }
  return { variant: 'warning', label: 'PENDING' }
}

export default function BillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const { data: bill, isLoading, isError } = useBill(id)
  const { data: tenant } = useTenant(bill?.tenant_id ?? '')
  const { data: unit } = useUnit(bill?.unit_id ?? '')
  const { data: settings } = useSettings()

  if (!id) return null

  if (isLoading) {
    return (
      <View style={styles.root}>
        <ScreenHeader title="Bill" left="back" />
        <LoadingSpinner />
      </View>
    )
  }

  if (isError || !bill) {
    return (
      <View style={styles.root}>
        <ScreenHeader title="Bill" left="back" />
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            {isError ? 'Could not load bill.' : 'Bill not found.'}
          </Text>
        </View>
      </View>
    )
  }

  // ---------------------------------------------------------------------------
  // Charge calculations
  // ---------------------------------------------------------------------------
  const elecCharge =
    bill.electricity_previous != null &&
    bill.electricity_current != null &&
    settings
      ? calcElectricityCharge(
          bill.electricity_previous,
          bill.electricity_current,
          settings.electricity_rate,
        )
      : 0

  const waterCharge =
    bill.water_previous != null && bill.water_current != null && settings
      ? calcWaterCharge(
          bill.water_previous,
          bill.water_current,
          settings.water_rate,
        )
      : 0

  const baseRent = bill.amount - elecCharge - waterCharge
  const lateFee =
    bill.status === 'overdue'
      ? parseFloat((bill.amount * 0.05).toFixed(2))
      : 0
  const totalDue = bill.amount + lateFee

  // ---------------------------------------------------------------------------
  // UI helpers
  // ---------------------------------------------------------------------------
  const chip = billStatusChip(bill.status)
  const headerTitle = `${dayjs(bill.period_start).format('MMM YYYY')} Bill`
  const dueDisplay = dayjs(bill.due_date).format('MMM D, YYYY')

  function handleWaiveLateFee() {
    // TODO: implement waive late fee mutation
    Alert.alert('Waive Late Fee', 'Late fee waived (not yet implemented).')
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title={headerTitle} left="back" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 1. Tenant header card */}
        <View style={styles.tenantCard}>
          <AvatarInitials name={tenant?.full_name ?? '?'} size="md" />
          <View style={styles.tenantInfo}>
            <Text style={styles.tenantName}>{tenant?.full_name ?? '—'}</Text>
            <Text style={styles.tenantMeta}>
              {unit ? `Unit ${unit.unit_number}` : '—'} · Due {dueDisplay}
            </Text>
          </View>
          <StatusChip variant={chip.variant} label={chip.label} size="sm" />
        </View>

        {/* 2. Bill breakdown section */}
        <SectionHeader title="Bill breakdown" />
        <View style={styles.sectionCard}>
          <InfoRow
            label="Base rent"
            value={formatCurrency(baseRent)}
            showDivider={
              bill.electricity_previous != null ||
              bill.water_previous != null ||
              bill.status === 'overdue'
            }
          />

          {bill.electricity_previous != null && bill.electricity_current != null && (
            <InfoRow
              label={`Electricity (${bill.electricity_current - bill.electricity_previous} kWh)`}
              value={formatCurrency(elecCharge)}
              valueColor={colors.textPrimary}
              showDivider={bill.water_previous != null || bill.status === 'overdue'}
            />
          )}

          {bill.water_previous != null && bill.water_current != null && (
            <InfoRow
              label={`Water (${bill.water_current - bill.water_previous} cu.m)`}
              value={formatCurrency(waterCharge)}
              valueColor={colors.textPrimary}
              showDivider={bill.status === 'overdue'}
            />
          )}

          {bill.status === 'overdue' && (
            <InfoRow
              label="Late fee"
              value={formatCurrency(lateFee)}
              valueColor={colors.danger}
              showDivider={false}
            />
          )}

          <InfoRow
            label="Total due"
            value={formatCurrency(totalDue)}
            bold
            showDivider={false}
          />
        </View>

        {/* 3. Payment status section */}
        <SectionHeader title="Payment status" />
        <View style={[styles.sectionCard, { marginTop: 0 }]}>
          <InfoRow
            label="Total paid"
            value={bill.status === 'paid' ? formatCurrency(bill.amount) : formatCurrency(0)}
            valueColor={colors.success}
            showDivider
          />
          <InfoRow
            label="Balance due"
            value={bill.status === 'paid' ? formatCurrency(0) : formatCurrency(bill.amount)}
            valueColor={bill.status === 'paid' ? colors.success : colors.danger}
            showDivider={false}
          />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <BottomCTABar>
        <Button
          label="Record Payment"
          variant="primary"
          onPress={() =>
            router.push(
              `/(admin)/billing/new?tenantId=${bill.tenant_id}&billId=${bill.id}`,
            )
          }
        />
        <View style={styles.secondaryRow}>
          <Button
            label="Waive Late Fee"
            variant="secondary"
            className="flex-1"
            onPress={() =>
              Alert.alert(
                'Waive Late Fee',
                'Remove the late fee from this bill?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Waive', onPress: handleWaiveLateFee },
                ],
              )
            }
          />
          <Button
            label="Add Charge"
            variant="secondary"
            className="flex-1"
            onPress={() => Alert.alert('Add Charge', 'Feature coming soon')}
          />
        </View>
      </BottomCTABar>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
    fontSize: 15,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  tenantCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  tenantMeta: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
})
