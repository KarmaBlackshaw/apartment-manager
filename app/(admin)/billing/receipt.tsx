import React from 'react'
import { View, ScrollView, Text, Pressable, Alert, Share } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import dayjs from 'dayjs'
import { ReceiptDocument } from '~/components/billing/ReceiptDocument'
import { LoadingSpinner } from '~/components/ui/LoadingSpinner'
import { ScreenLayout } from '~/layouts/ScreenLayout'
import { useSettings } from '~/hooks/useSettings'
import { usePayment } from '~/hooks/usePayments'

export default function ReceiptScreen() {
  const { paymentId } = useLocalSearchParams<{ paymentId: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { data: payment, isLoading: paymentLoading } = usePayment(paymentId ?? '')
  const { data: settings, isLoading: settingsLoading } = useSettings()

  if (paymentLoading || settingsLoading) return <LoadingSpinner />

  if (!payment) {
    return (
      <ScreenLayout title="Receipt">
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-danger text-center text-base">Payment not found.</Text>
        </View>
      </ScreenLayout>
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
    <ScreenLayout
      title="Receipt"
      backHref="/(admin)/billing"
      headerRight={
        <Pressable onPress={router.back} hitSlop={8}>
          <Text className="text-primary text-base font-medium">Done</Text>
        </Pressable>
      }
    >

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
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
        className="bg-surface border-t border-border flex-row gap-3 px-4 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Pressable
          className="flex-1 py-[14px] rounded-md items-center justify-center bg-primary"
          onPress={handleShare}
        >
          <Text className="text-white font-semibold text-[15px]">Share</Text>
        </Pressable>
        <Pressable
          className="flex-1 py-[14px] rounded-md items-center justify-center bg-elevated"
          onPress={handlePrint}
        >
          <Text className="text-text-primary font-semibold text-[15px]">Print</Text>
        </Pressable>
        <Pressable
          className="flex-1 py-[14px] rounded-md items-center justify-center bg-elevated"
          onPress={router.back}
        >
          <Text className="text-text-primary font-semibold text-[15px]">Done</Text>
        </Pressable>
      </View>
    </ScreenLayout>
  )
}
