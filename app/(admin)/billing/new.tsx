import React, { useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import dayjs from 'dayjs'
import { colors } from '../../../constants/theme'
import {
  ScreenHeader,
  BottomCTABar,
  Button,
  Input,
  DateInput,
  AmountText,
} from '../../../components/ui'
import { useTenant } from '../../../hooks/useTenants'
import { useUnit } from '../../../hooks/useUnits'
import { useBill } from '../../../hooks/useBills'
import { useCreatePayment } from '../../../hooks/usePayments'

export default function RecordPaymentScreen() {
  const router = useRouter()
  const { tenantId = '', billId = '' } = useLocalSearchParams<{ tenantId: string; billId: string }>()

  const { data: tenant } = useTenant(tenantId)
  const { data: unit } = useUnit(tenant?.unit_id ?? '')
  const { data: bill } = useBill(billId)
  const { mutateAsync, isPending } = useCreatePayment()

  const [amountInput, setAmountInput] = useState('')
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [notes, setNotes] = useState('')

  // Balance calculations
  const balanceBefore = bill?.amount ?? 0
  const balanceAfter = balanceBefore - (parseFloat(amountInput) || 0)

  // Covers month — auto-detected from bill period_start, else current month
  const coversMonth = bill?.period_start
    ? dayjs(bill.period_start).format('MMM YYYY')
    : dayjs().format('MMM YYYY')

  function balanceAfterVariant(): 'owed' | 'zero' | 'credit' {
    if (balanceAfter > 0) return 'owed'
    if (balanceAfter === 0) return 'zero'
    return 'credit'
  }

  async function handleSave(withReceipt: boolean) {
    const result = await mutateAsync({
      bill_id: billId || undefined,
      tenant_id: tenantId,
      unit_id: tenant?.unit_id ?? '',
      amount: parseFloat(amountInput) || 0,
      date: selectedDate,
      notes: notes || undefined,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
    })

    if (withReceipt) {
      router.replace(`/(admin)/billing/receipt?paymentId=${result.id}`)
    } else {
      router.back()
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenHeader title="Record Payment" left="back" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 1. Tenant / unit card (read-only) */}
        {(tenant || unit) && (
          <View style={styles.tenantCard}>
            <Text style={styles.tenantName}>{tenant?.full_name ?? '—'}</Text>
            <Text style={styles.tenantUnit}>
              {unit ? `Unit ${unit.unit_number}` : '—'}
            </Text>
          </View>
        )}

        {/* 2. Amount input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Amount received (₱)</Text>
          <Input
            value={amountInput}
            onChangeText={setAmountInput}
            keyboardType="numeric"
            placeholder="0.00"
            autoFocus
            style={styles.amountInput}
          />
        </View>

        {/* 3. Date */}
        <View style={styles.section}>
          <DateInput
            label="Date"
            value={selectedDate}
            onChange={setSelectedDate}
          />
        </View>

        {/* 4. Covers month (read-only) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Covers month — {coversMonth} (auto-detected)
          </Text>
        </View>

        {/* 5. Notes */}
        <View style={styles.section}>
          <Input
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. paid at door"
            multiline
          />
        </View>

        {/* 6. Balance preview */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Balance before</Text>
            <AmountText amount={balanceBefore} variant="owed" size="small" />
          </View>
          <View style={[styles.balanceRow, { marginTop: 12 }]}>
            <Text style={styles.balanceLabel}>Balance after</Text>
            <AmountText amount={balanceAfter} variant={balanceAfterVariant()} size="small" />
          </View>
        </View>
      </ScrollView>

      {/* CTA Bar */}
      <BottomCTABar>
        <Button
          label="Save & Generate Receipt"
          variant="primary"
          onPress={() => handleSave(true)}
          loading={isPending}
        />
        <Pressable
          onPress={() => handleSave(false)}
          style={styles.saveWithoutReceiptBtn}
          disabled={isPending}
        >
          <Text style={styles.saveWithoutReceiptText}>Save without receipt</Text>
        </Pressable>
      </BottomCTABar>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 160,
  },
  tenantCard: {
    backgroundColor: colors.elevated,
    borderRadius: 12,
    margin: 16,
    padding: 14,
  },
  tenantName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  tenantUnit: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  amountInput: {
    fontSize: 28,
  },
  balanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    margin: 16,
    padding: 14,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  saveWithoutReceiptBtn: {
    alignItems: 'center',
    paddingTop: 12,
  },
  saveWithoutReceiptText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
})
