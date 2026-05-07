import React, { useState } from 'react'
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import dayjs from 'dayjs'
import { BottomCTABar } from '~/components/ui/BottomCTABar'
import { Button } from '~/components/ui/Button'
import { Input } from '~/components/ui/Input'
import { DateInput } from '~/components/ui/DateInput'
import { AmountText } from '~/components/ui/AmountText'
import { ScreenLayout } from '~/layouts/ScreenLayout'
import { useTenant } from '~/hooks/useTenants'
import { useUnit } from '~/hooks/useUnits'
import { useBill } from '~/hooks/useBills'
import { useCreatePayment } from '~/hooks/usePayments'

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
    <ScreenLayout title="Record Payment" backHref="/(admin)/billing">
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >

      <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
        {/* 1. Tenant / unit card (read-only) */}
        {(tenant || unit) && (
          <View className="bg-elevated rounded-md m-4 p-[14px]">
            <Text className="text-text-primary text-base font-semibold">{tenant?.full_name ?? '—'}</Text>
            <Text className="text-text-secondary text-sm mt-1">
              {unit ? `Unit ${unit.unit_number}` : '—'}
            </Text>
          </View>
        )}

        {/* 2. Amount input */}
        <View className="px-4 mb-1">
          <Text className="text-text-secondary text-[13px] mb-2">Amount received (₱)</Text>
          <Input
            value={amountInput}
            onChangeText={setAmountInput}
            keyboardType="numeric"
            placeholder="0.00"
            autoFocus
            style={{ fontSize: 28 }}
          />
        </View>

        {/* 3. Date */}
        <View className="px-4 mb-1">
          <DateInput
            label="Date"
            value={selectedDate}
            onChange={setSelectedDate}
          />
        </View>

        {/* 4. Covers month (read-only) */}
        <View className="px-4 mb-1">
          <Text className="text-text-secondary text-[13px]">
            Covers month — {coversMonth} (auto-detected)
          </Text>
        </View>

        {/* 5. Notes */}
        <View className="px-4 mb-1">
          <Input
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. paid at door"
            multiline
          />
        </View>

        {/* 6. Balance preview */}
        <View className="bg-surface rounded-md m-4 p-[14px]">
          <View className="flex-row items-center justify-between">
            <Text className="text-text-secondary text-sm">Balance before</Text>
            <AmountText amount={balanceBefore} variant="owed" size="small" />
          </View>
          <View className="flex-row items-center justify-between mt-3">
            <Text className="text-text-secondary text-sm">Balance after</Text>
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
          className="items-center pt-3"
          disabled={isPending}
        >
          <Text className="text-text-secondary text-sm">Save without receipt</Text>
        </Pressable>
      </BottomCTABar>
    </KeyboardAvoidingView>
    </ScreenLayout>
  )
}
