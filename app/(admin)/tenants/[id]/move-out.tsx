import React, { useMemo, useState } from 'react'
import { View, ScrollView, Alert, StyleSheet, TextInput, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import dayjs from 'dayjs'
import { useTenant, useDeactivateTenant } from '../../../../hooks/useTenants'
import { useBills } from '../../../../hooks/useBills'
import {
  ScreenHeader,
  WarningBanner,
  SettlementRow,
  BottomCTABar,
  Button,
  AppText,
  LoadingSpinner,
} from '../../../../components/ui'
import { colors } from '../../../../constants/theme'

export default function MoveOutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { data: tenant, isLoading } = useTenant(id)
  const { data: allBills = [] } = useBills({ tenant_id: id })
  const { mutateAsync: deactivate, isPending: deactivating } = useDeactivateTenant()

  const openBalance = useMemo(
    () => allBills.filter(b => b.status !== 'paid').reduce((sum, b) => sum + b.amount, 0),
    [allBills],
  )

  // Prorated rent: placeholder — requires unit rate join
  const proratedRent = useMemo(() => {
    if (!tenant?.unit) return 0
    const today = dayjs()
    const lastBill = allBills.find(b => b.status !== 'paid')
    const periodStart = lastBill
      ? dayjs(lastBill.period_start)
      : dayjs(tenant.move_in_date)
    const daysUsed = today.diff(periodStart, 'day')
    if (daysUsed <= 0) return 0
    // Estimate daily rate from monthly_rate (if available)
    // Note: unit monthly_rate not directly available in TenantWithUnit, approximate
    return 0 // placeholder — requires unit rate join
  }, [tenant, allBills])

  const depositHeld = 0 // placeholder until contract table is integrated

  const [damages, setDamages] = useState<Array<{ id: string; label: string; amount: string }>>([])
  const [addingDamage, setAddingDamage] = useState(false)
  const [newDamageLabel, setNewDamageLabel] = useState('')
  const [newDamageAmount, setNewDamageAmount] = useState('')
  const [notes, setNotes] = useState('')

  const totalDamages = damages.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0)
  const refundAmount = depositHeld - openBalance - proratedRent - totalDamages

  async function handleConfirm() {
    if (!tenant) return
    Alert.alert(
      'Confirm Move-Out',
      `This will mark ${tenant.full_name} as moved out and free up their unit. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            try {
              await deactivate({ id, unitId: tenant.unit_id! })
              router.replace('/tenants')
            } catch {
              Alert.alert('Error', 'Could not process move-out. Please try again.')
            }
          },
        },
      ],
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <LoadingSpinner />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title="Move-Out"
        left="back"
        onLeftPress={() => {
          Alert.alert('Discard changes?', 'The move-out will not be processed.', [
            { text: 'Keep editing', style: 'cancel' },
            { text: 'Discard', style: 'destructive', onPress: () => router.back() },
          ])
        }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ marginTop: 12 }}>
          <WarningBanner
            message="Review settlement before confirming. This cannot be undone."
            variant="warning"
          />
        </View>

        {/* Settlement breakdown */}
        <AppText style={styles.sectionLabel}>SETTLEMENT BREAKDOWN</AppText>
        <View style={styles.settlementGroup}>
          <SettlementRow label="Deposit held" amount={depositHeld} variant="credit" />
          <SettlementRow label="Open balance" amount={openBalance} variant="deduction" />
          {proratedRent > 0 && (
            <SettlementRow label="Prorated rent" amount={proratedRent} variant="deduction" />
          )}
          {damages.map(d => (
            <SettlementRow
              key={d.id}
              label={d.label || 'Damage'}
              amount={parseFloat(d.amount) || 0}
              variant="deduction"
            />
          ))}
          <SettlementRow
            label="Refund to tenant"
            amount={Math.max(0, refundAmount)}
            variant="total"
          />
        </View>

        {/* Add damage row */}
        {addingDamage ? (
          <View style={styles.damageInputRow}>
            <TextInput
              style={[styles.damageInput, { flex: 1 }]}
              placeholder="Description"
              placeholderTextColor={colors.textMuted}
              value={newDamageLabel}
              onChangeText={setNewDamageLabel}
            />
            <TextInput
              style={[styles.damageInput, { width: 100 }]}
              placeholder="Amount"
              placeholderTextColor={colors.textMuted}
              value={newDamageAmount}
              onChangeText={setNewDamageAmount}
              keyboardType="decimal-pad"
            />
            <Button
              label="Add"
              size="sm"
              onPress={() => {
                if (newDamageLabel.trim() && parseFloat(newDamageAmount) > 0) {
                  setDamages(prev => [
                    ...prev,
                    {
                      id: Date.now().toString(),
                      label: newDamageLabel.trim(),
                      amount: newDamageAmount,
                    },
                  ])
                  setNewDamageLabel('')
                  setNewDamageAmount('')
                  setAddingDamage(false)
                }
              }}
            />
          </View>
        ) : (
          <Pressable onPress={() => setAddingDamage(true)} style={styles.addDamageRow}>
            <AppText style={{ color: colors.textLink }}>+ Add damage deduction</AppText>
          </Pressable>
        )}

        {/* Notes */}
        <AppText style={styles.sectionLabel}>MOVE-OUT NOTES</AppText>
        <View style={styles.notesContainer}>
          <TextInput
            style={styles.notesInput}
            multiline
            numberOfLines={4}
            placeholder="Any additional notes..."
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
          />
        </View>
      </ScrollView>

      <BottomCTABar>
        <Button label="Confirm Move-Out" onPress={handleConfirm} loading={deactivating} />
        <Pressable onPress={() => router.back()} style={{ alignItems: 'center', marginTop: 12 }}>
          <AppText color="secondary">Cancel</AppText>
        </Pressable>
      </BottomCTABar>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  settlementGroup: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addDamageRow: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  damageInputRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  damageInput: {
    backgroundColor: colors.elevated,
    borderRadius: 8,
    padding: 10,
    color: colors.textPrimary,
    fontSize: 14,
  },
  notesContainer: {
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  notesInput: {
    padding: 16,
    color: colors.textPrimary,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
})
