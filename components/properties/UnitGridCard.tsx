import React from 'react'
import { View, Text, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { colors } from '../../constants/theme'
import { StatusChip } from '../ui/StatusChip'
import type { ChipVariant } from '../ui/StatusChip'

export type UnitStatus = 'paid' | 'overdue' | 'vacant' | 'partial'

interface UnitGridCardProps {
  unitName: string
  tenantName?: string
  status: UnitStatus
  onPress: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const borderColorMap: Record<UnitStatus, string> = {
  paid:    colors.success,
  overdue: colors.danger,
  partial: colors.warning,
  vacant:  colors.textMuted,
}

const chipVariantMap: Record<UnitStatus, ChipVariant> = {
  paid:    'success',
  overdue: 'danger',
  partial: 'warning',
  vacant:  'neutral',
}

const chipLabelMap: Record<UnitStatus, string> = {
  paid:    'PAID',
  overdue: 'OVERDUE',
  partial: 'PARTIAL',
  vacant:  'VACANT',
}

export function UnitGridCard({ unitName, tenantName, status, onPress }: UnitGridCardProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <AnimatedPressable
      style={[
        animatedStyle,
        { borderLeftColor: borderColorMap[status], borderLeftWidth: 3 },
      ]}
      className="bg-surface rounded-[10px] p-3"
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 100 })
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 150 })
      }}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text className="text-sm font-semibold text-text-primary">{unitName}</Text>
      <Text className="text-xs text-text-secondary mt-[2px]">
        {tenantName ?? 'Vacant'}
      </Text>
      <View className="mt-[6px]">
        <StatusChip variant={chipVariantMap[status]} label={chipLabelMap[status]} size="sm" />
      </View>
    </AnimatedPressable>
  )
}
