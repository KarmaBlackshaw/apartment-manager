import React from 'react'
import { Pressable, View } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { Card } from '~/components/ui/Card'
import { AppText } from '~/components/ui/AppText'
import { Badge, billStatusBadge, billingBadge } from '~/components/ui/Badge'
import { formatCurrency, formatDateRange } from '~/lib/billing'
import type { BillWithTenant } from '~/types'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface BillCardProps {
  bill: BillWithTenant
  onPress: () => void
}

export function BillCard({ bill, onPress }: BillCardProps) {
  const statusBadge = billStatusBadge(bill.status)
  const billing = billingBadge(bill.billing_type)
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <AnimatedPressable
      style={animatedStyle}
      onPressIn={() => { scale.value = withTiming(0.97, { duration: 100 }) }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 150 }) }}
      onPress={onPress}
      className="mb-3"
    >
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
    </AnimatedPressable>
  )
}
