import React from 'react'
import { View, ScrollView, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { useTabBarScrollHandler } from '../../../hooks/useTabBarScrollHandler'
import { useBill, useMarkBillPaid, useDeleteBill } from '../../../hooks/useBills'
import { Button, AppText, LoadingSpinner, Card, Badge, billStatusBadge, billingBadge } from '../../../components/ui'
import { formatCurrency, formatDateRange } from '../../../lib/billing'
import { useSettings } from '../../../hooks/useSettings'
import { useTenant } from '../../../hooks/useTenants'
import { useUnit } from '../../../hooks/useUnits'
import { generateReceiptHTML } from '../../../lib/receipt'

export default function BillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const tabBarScroll = useTabBarScrollHandler()
  const { data: bill, isLoading, isError } = useBill(id)
  const { mutateAsync: markPaid, isPending: paying } = useMarkBillPaid()
  const { mutateAsync: remove, isPending: deleting } = useDeleteBill()
  const { data: settings } = useSettings()
  const { data: tenant } = useTenant(bill?.tenant_id ?? '')
  const { data: unit } = useUnit(bill?.unit_id ?? '')

  if (!id) return null
  if (isLoading) return <LoadingSpinner />
  if (isError) return (
    <View className="flex-1 items-center justify-center p-8 bg-app">
      <AppText color="danger" className="text-center">Could not load bill. Please restart the app.</AppText>
    </View>
  )
  if (!bill) return (
    <View className="flex-1 items-center justify-center p-8 bg-app">
      <AppText color="danger" className="text-center">Bill not found.</AppText>
    </View>
  )

  const statusBadge = billStatusBadge(bill.status)
  const billing = billingBadge(bill.billing_type)

  async function handleMarkPaid() {
    try {
      await markPaid(id)
    } catch {
      Alert.alert('Error', 'Could not mark bill as paid. Please try again.')
    }
  }

  function handleDelete() {
    Alert.alert('Delete Bill', 'Delete this bill permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await remove(id)
            router.back()
          } catch {
            Alert.alert('Error', 'Could not delete bill. Please try again.')
          }
        }
      },
    ])
  }

  async function handleGenerateReceipt() {
    if (!bill || !settings || !unit) {
      Alert.alert('Error', 'Still loading data. Please try again.')
      return
    }
    try {
      const html = generateReceiptHTML({
        bill,
        unitNumber: unit.unit_number,
        settings,
        includeInternet: tenant?.include_internet ?? false,
      })
      const { uri } = await Print.printToFileAsync({ html })
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' })
    } catch {
      Alert.alert('Error', 'Could not generate receipt. Please try again.')
    }
  }

  return (
    <ScrollView className="flex-1 bg-app" contentContainerClassName="p-4 pb-32" {...tabBarScroll}>
      <Card className="mb-4">
        <AppText variant="heading" className="mb-1">{formatCurrency(bill.amount)}</AppText>
        <AppText variant="subheading" color="secondary">{bill.tenant.full_name}</AppText>
        <View className="flex-row gap-2 mt-2">
          <Badge label={statusBadge.label} variant={statusBadge.variant} />
          <Badge label={billing.label} variant={billing.variant} />
        </View>
      </Card>

      <Card>
        <View className="gap-2">
          <View className="flex-row justify-between">
            <AppText color="secondary">Period</AppText>
            <AppText>{formatDateRange(bill.period_start, bill.period_end)}</AppText>
          </View>
          <View className="flex-row justify-between">
            <AppText color="secondary">Due Date</AppText>
            <AppText>{bill.due_date}</AppText>
          </View>
          {bill.paid_at && (
            <View className="flex-row justify-between">
              <AppText color="secondary">Paid On</AppText>
              <AppText>{bill.paid_at.split('T')[0]}</AppText>
            </View>
          )}
          {bill.notes && (
            <View>
              <AppText color="secondary">Notes</AppText>
              <AppText>{bill.notes}</AppText>
            </View>
          )}
          {bill.billing_type === 'monthly' && bill.water_previous != null && bill.water_current != null && (
            <>
              <View className="flex-row justify-between">
                <AppText color="secondary">Water Reading</AppText>
                <AppText>{bill.water_previous} → {bill.water_current} cu.m</AppText>
              </View>
              <View className="flex-row justify-between">
                <AppText color="secondary">Water Charge</AppText>
                <AppText>{settings ? formatCurrency((bill.water_current - bill.water_previous) * settings.water_rate) : '—'}</AppText>
              </View>
            </>
          )}
          {bill.billing_type === 'monthly' && bill.electricity_previous != null && bill.electricity_current != null && (
            <>
              <View className="flex-row justify-between">
                <AppText color="secondary">Electricity Reading</AppText>
                <AppText>{bill.electricity_previous} → {bill.electricity_current} kWh</AppText>
              </View>
              <View className="flex-row justify-between">
                <AppText color="secondary">Electricity Charge</AppText>
                <AppText>{settings ? formatCurrency((bill.electricity_current - bill.electricity_previous) * settings.electricity_rate) : '—'}</AppText>
              </View>
            </>
          )}
          {bill.billing_type === 'monthly' && (
            <View className="flex-row justify-between">
              <AppText color="secondary">Internet</AppText>
              <AppText>{settings && tenant?.include_internet
                ? formatCurrency(settings.internet_rate)
                : 'Free'
              }</AppText>
            </View>
          )}
        </View>
      </Card>

      {bill.status !== 'paid' && (
        <Button label="Mark as Paid" onPress={handleMarkPaid} loading={paying} className="mt-4" />
      )}
      <Button label="Delete Bill" variant="danger" onPress={handleDelete} loading={deleting} className="mt-3" />
      <Button label="Generate Receipt (PDF)" variant="secondary" onPress={handleGenerateReceipt} className="mt-3" />
    </ScrollView>
  )
}
