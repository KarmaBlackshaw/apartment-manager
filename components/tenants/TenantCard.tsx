import React from 'react'
import { Pressable, View } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { Card } from '~/components/ui/Card'
import { AppText } from '~/components/ui/AppText'
import { Badge, billingBadge, tenantStatusBadge } from '~/components/ui/Badge'
import type { TenantWithUnit } from '~/types'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface TenantCardProps {
  tenant: TenantWithUnit
  onPress: () => void
}

export function TenantCard({ tenant, onPress }: TenantCardProps) {
  const billing = billingBadge(tenant.billing_type)
  const status = tenantStatusBadge(tenant.status)
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
            <AppText variant="subheading">{tenant.full_name}</AppText>
            <AppText color="secondary" variant="caption">{tenant.email}</AppText>
          </View>
          <Badge label={status.label} variant={status.variant} />
        </View>
        <View className="flex-row items-center gap-2 mt-2">
          <Badge label={billing.label} variant={billing.variant} />
          {tenant.unit && (
            <AppText variant="caption" color="secondary">Unit {tenant.unit.unit_number}</AppText>
          )}
        </View>
      </Card>
    </AnimatedPressable>
  )
}
