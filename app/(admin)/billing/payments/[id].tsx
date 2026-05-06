import React from 'react'
import { View, ScrollView, Text, StyleSheet, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import dayjs from 'dayjs'
import {
  ScreenHeader,
  AmountText,
  SectionHeader,
  InfoRow,
  BottomCTABar,
  Button,
  LoadingSpinner,
} from '../../../../components/ui'
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
      <View style={styles.container}>
        <ScreenHeader title="Payment Detail" left="back" />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Payment not found.</Text>
        </View>
      </View>
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
    <View style={styles.container}>
      <ScreenHeader title="Payment Detail" left="back" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount header card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>AMOUNT PAID</Text>
          <AmountText amount={payment.amount} variant="paid" size="large" />
          <Text style={styles.amountDate}>
            {dayjs(payment.date).format('MMMM D, YYYY')}
          </Text>
        </View>

        {/* Payment info section */}
        <SectionHeader title="Payment Info" />
        <View style={styles.infoCard}>
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
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
    fontSize: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  amountCard: {
    backgroundColor: colors.successBg,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  amountDate: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
})
