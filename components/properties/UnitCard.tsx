import React from 'react'
import { Pressable, View } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { Card } from '~/components/ui/Card'
import { AppText } from '~/components/ui/AppText'
import { Badge, unitStatusBadge } from '~/components/ui/Badge'
import type { Unit } from '~/types'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface UnitCardProps {
  unit: Unit
  onPress: () => void
}

export function UnitCard({ unit, onPress }: UnitCardProps) {
  const statusBadge = unitStatusBadge(unit.status)
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
            <AppText variant="subheading">Unit {unit.unit_number}</AppText>
            {unit.monthly_rate != null && (
              <AppText variant="caption" color="secondary" className="mt-1">
                ₱{unit.monthly_rate.toLocaleString('en-PH')} / mo
              </AppText>
            )}
          </View>
          <Badge label={statusBadge.label} variant={statusBadge.variant} />
        </View>
      </Card>
    </AnimatedPressable>
  )
}
