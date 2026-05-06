import React from 'react'
import { View, ScrollView, Text, StyleSheet, Pressable, Alert, Share } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import dayjs from 'dayjs'
import { ScreenHeader, ReceiptDocument, LoadingSpinner } from '../../../components/ui'
import { colors } from '../../../constants/theme'
import { useSettings } from '../../../hooks/useSettings'
import { usePayment } from '../../../hooks/usePayments'

export default function ReceiptScreen() {
  const { paymentId } = useLocalSearchParams<{ paymentId: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { data: payment, isLoading: paymentLoading } = usePayment(paymentId ?? '')
  const { data: settings, isLoading: settingsLoading } = useSettings()

  if (paymentLoading || settingsLoading) return <LoadingSpinner />

  if (!payment) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Receipt" left="back" />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Payment not found.</Text>
        </View>
      </View>
    )
  }

  async function handleShare() {
    try {
      await Share.share({
        message: `Receipt #${payment!.receipt_no}\nTenant: ${payment!.tenant.full_name}\nAmount: ₱${payment!.amount}\nDate: ${payment!.date}`,
      })
    } catch {
      // user cancelled or share failed silently
    }
  }

  function handlePrint() {
    Alert.alert('Print', 'Print feature coming soon')
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Receipt"
        left="back"
        right={
          <Pressable onPress={router.back} hitSlop={8}>
            <Text style={styles.doneLink}>Done</Text>
          </Pressable>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ReceiptDocument
          buildingName={settings?.apartment_name ?? 'Apartment'}
          address={settings?.owner_phone ?? ''}
          receiptNo={payment.receipt_no}
          tenantName={payment.tenant.full_name}
          unitName={`Unit ${payment.unit.unit_number}`}
          date={dayjs(payment.date).format('MMM D, YYYY')}
          forPeriod={dayjs(payment.date).format('MMMM YYYY')}
          amountPaid={payment.amount}
          balanceAfter={payment.balance_after}
          receivedBy={settings?.owner_name ?? 'Admin'}
        />
      </ScrollView>

      {/* Action row */}
      <View
        style={[
          styles.actionRow,
          { paddingBottom: insets.bottom + 12 },
        ]}
      >
        <Pressable
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={handleShare}
        >
          <Text style={styles.actionButtonPrimaryText}>Share</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={handlePrint}
        >
          <Text style={styles.actionButtonSecondaryText}>Print</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={router.back}
        >
          <Text style={styles.actionButtonSecondaryText}>Done</Text>
        </Pressable>
      </View>
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
  doneLink: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  actionRow: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
  },
  actionButtonPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  actionButtonSecondary: {
    backgroundColor: colors.elevated,
  },
  actionButtonSecondaryText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
})
