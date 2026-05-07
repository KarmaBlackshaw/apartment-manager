import React, { useMemo, useState } from 'react'
import { View, ScrollView, Alert, TextInput, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import dayjs from 'dayjs'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTenant, useDeactivateTenant } from '../../../../hooks/useTenants'
import { useBills } from '../../../../hooks/useBills'
import {
  WarningBanner,
  SettlementRow,
  BottomCTABar,
  Button,
  AppText,
  LoadingSpinner,
} from '../../../../components/ui'
import { ScreenLayout } from '../../../../layouts/ScreenLayout'
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

  const proratedRent = useMemo(() => {
    if (!tenant?.unit) return 0
    const today = dayjs()
    const lastBill = allBills.find(b => b.status !== 'paid')
    const periodStart = lastBill
      ? dayjs(lastBill.period_start)
      : dayjs(tenant.move_in_date)
    const daysUsed = today.diff(periodStart, 'day')
    if (daysUsed <= 0) return 0
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

  const backButton = (
    <Pressable
      onPress={() => {
        Alert.alert('Discard changes?', 'The move-out will not be processed.', [
          { text: 'Keep editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ])
      }}
      hitSlop={8}
    >
      <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
    </Pressable>
  )

  if (isLoading) {
    return (
      <ScreenLayout title="Move-Out">
        <LoadingSpinner />
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout title="Move-Out" headerLeft={backButton}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="mt-3">
          <WarningBanner
            message="Review settlement before confirming. This cannot be undone."
            variant="warning"
          />
        </View>

        <AppText
          className="text-[11px] font-semibold text-text-muted mx-4 mt-5 mb-2"
          style={{ letterSpacing: 0.5, textTransform: 'uppercase' }}
        >
          SETTLEMENT BREAKDOWN
        </AppText>
        <View className="bg-surface mx-4 rounded-md overflow-hidden">
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

        {addingDamage ? (
          <View className="flex-row gap-2 px-4 py-3 items-center">
            <TextInput
              className="flex-1 bg-elevated rounded-lg p-[10px] text-text-primary text-sm"
              placeholder="Description"
              placeholderTextColor={colors.textMuted}
              value={newDamageLabel}
              onChangeText={setNewDamageLabel}
            />
            <TextInput
              className="bg-elevated rounded-lg p-[10px] text-text-primary text-sm w-[100px]"
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
          <Pressable onPress={() => setAddingDamage(true)} className="px-4 py-4">
            <AppText style={{ color: colors.textLink }}>+ Add damage deduction</AppText>
          </Pressable>
        )}

        <AppText
          className="text-[11px] font-semibold text-text-muted mx-4 mt-5 mb-2"
          style={{ letterSpacing: 0.5, textTransform: 'uppercase' }}
        >
          MOVE-OUT NOTES
        </AppText>
        <View className="mx-4 bg-surface rounded-md">
          <TextInput
            className="p-4 text-text-primary text-sm"
            style={{ minHeight: 100, textAlignVertical: 'top' }}
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
        <Pressable onPress={() => router.back()} className="items-center mt-3">
          <AppText color="secondary">Cancel</AppText>
        </Pressable>
      </BottomCTABar>
    </ScreenLayout>
  )
}
