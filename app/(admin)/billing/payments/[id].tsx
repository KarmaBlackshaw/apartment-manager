import React from 'react'
import { View, ScrollView, Text, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import dayjs from 'dayjs'
import {
  AmountText,
  SectionHeader,
  InfoRow,
  BottomCTABar,
  Button,
  LoadingSpinner,
} from '../../../../components/ui'
import { ScreenLayout } from '../../../../layouts/ScreenLayout'
import { colors } from '../../../../constants/theme'
import { formatCurrency } from '../../../../lib/billing'
import { usePayment, useVoidPayment } from '../../../../hooks/usePayments'

export default function PaymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const { data: payment, isLoading } = usePayment(id ?? '')
  const { mutateAsync: voidMutate } = useVoidPayment()

  if (isLoading) return <LoadingSpinner />

  if (!payment) {
    return (
      <ScreenLayout title="Payment Detail" backHref="/(admin)/billing">
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-danger text-center text-base">Payment not found.</Text>
        </View>
      </ScreenLayout>
    )
  }

  const methodDisplay =
    payment.method
      ? payment.method.charAt(0).toUpperCase() + payment.method.slice(1)
      : '—'

  function handleVoid() {
    Alert.alert(
      'Void Payment',
      'This will void the payment. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Void',
          style: 'destructive',
          onPress: async () => {
            try {
              await voidMutate(payment!.id)
              router.back()
            } catch {
              Alert.alert('Error', 'Could not void payment. Please try again.')
            }
          },
        },
      ],
    )
  }

  return (
    <ScreenLayout title="Payment Detail" backHref="/(admin)/billing">

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount header card */}
        <View className="bg-success-bg rounded-md mx-4 mt-4 p-5 items-center">
          <Text
            className="text-text-muted text-xs uppercase mb-1"
            style={{ letterSpacing: 0.5 }}
          >
            AMOUNT PAID
          </Text>
          <AmountText amount={payment.amount} variant="paid" size="large" />
          <Text className="text-text-secondary text-[13px] mt-1">
            {dayjs(payment.date).format('MMMM D, YYYY')}
          </Text>
        </View>

        {/* Payment info section */}
        <SectionHeader title="Payment Info" />
        <View className="bg-surface rounded-md mx-4 overflow-hidden">
          <InfoRow label="Receipt #" value={payment.receipt_no} showDivider={true} />
          <InfoRow label="Tenant" value={payment.tenant.full_name} showDivider={true} />
          <InfoRow label="Unit" value={`Unit ${payment.unit.unit_number}`} showDivider={true} />
          <InfoRow
            label="For month"
            value={dayjs(payment.date).format('MMMM YYYY')}
            showDivider={true}
          />
          <InfoRow label="Method" value={methodDisplay} showDivider={true} />
          <InfoRow
            label="Balance after"
            value={formatCurrency(payment.balance_after)}
            valueColor={payment.balance_after <= 0 ? colors.success : colors.danger}
            showDivider={false}
          />
        </View>
      </ScrollView>

      <BottomCTABar>
        <Button
          label="View Receipt"
          variant="primary"
          onPress={() => router.push(`/(admin)/billing/receipt?paymentId=${payment.id}`)}
        />
        <Button
          label="Void Payment"
          variant="secondary"
          className="mt-2"
          onPress={handleVoid}
        />
      </BottomCTABar>
    </ScreenLayout>
  )
}
