import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Card, AppText, Badge, billStatusBadge, billingBadge } from '../ui'
import { formatCurrency, formatDateRange } from '../../lib/billing'
import type { BillWithTenant } from '../../types'

interface BillCardProps {
  bill: BillWithTenant
  onPress: () => void
}

export function BillCard({ bill, onPress }: BillCardProps) {
  const statusBadge = billStatusBadge(bill.status)
  const billing = billingBadge(bill.billing_type)

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="mb-3">
      <Card>
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <AppText variant="subheading">{bill.tenant.full_name}</AppText>
            <AppText color="secondary" variant="caption">{formatDateRange(bill.period_start, bill.period_end)}</AppText>
          </View>
          <View className="items-end gap-1">
            <AppText variant="subheading">{formatCurrency(bill.amount)}</AppText>
            <Badge label={statusBadge.label} variant={statusBadge.variant} />
          </View>
        </View>
        <View className="flex-row items-center gap-2 mt-2">
          <Badge label={billing.label} variant={billing.variant} />
          <AppText variant="caption" color="secondary">Due: {bill.due_date}</AppText>
        </View>
      </Card>
    </TouchableOpacity>
  )
}
