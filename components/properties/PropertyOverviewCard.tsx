import React from 'react'
import { View, Text, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'

interface PropertyChip {
  label: string
  variant?: 'neutral' | 'success' | 'danger'
}

interface PropertyOverviewCardProps {
  name: string
  address: string
  chips: PropertyChip[]
  monthlyIncome: number
  occupancyPct: number
  onPress: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const chipBgClass: Record<'neutral' | 'success' | 'danger', string> = {
  neutral: 'bg-elevated',
  success: 'bg-success-bg',
  danger:  'bg-danger-bg',
}

const chipTextClass: Record<'neutral' | 'success' | 'danger', string> = {
  neutral: 'text-text-secondary',
  success: 'text-success-text',
  danger:  'text-danger-text',
}

function PropertyChipBadge({ label, variant = 'neutral' }: PropertyChip) {
  return (
    <View className={`px-2 py-[3px] rounded-full ${chipBgClass[variant]}`}>
      <Text className={`text-[11px] font-medium ${chipTextClass[variant]}`}>{label}</Text>
    </View>
  )
}

export function PropertyOverviewCard({
  name,
  address,
  chips,
  monthlyIncome,
  occupancyPct,
  onPress,
}: PropertyOverviewCardProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const clampedPct = Math.min(100, Math.max(0, occupancyPct))

  return (
    <AnimatedPressable
      style={animatedStyle}
      className="bg-surface rounded-md p-4 mb-3"
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 100 })
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 150 })
      }}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text className="text-base font-bold text-text-primary">{name}</Text>
      <Text className="text-[13px] text-text-secondary mt-[2px]">{address}</Text>

      <View className="flex-row gap-[6px] mt-2 flex-wrap">
        {chips.map((chip, index) => (
          <PropertyChipBadge key={index} label={chip.label} variant={chip.variant} />
        ))}
      </View>

      <View className="mt-3 w-full h-1 rounded-full bg-elevated overflow-hidden">
        <View
          className="h-1 rounded-full bg-success"
          style={{ width: `${clampedPct}%` }}
        />
      </View>

      <View className="mt-2 flex-row justify-between">
        <Text className="text-xs text-text-muted">Monthly income</Text>
        <Text className="text-xs text-text-secondary" style={{ fontVariant: ['tabular-nums'] }}>
          {`₱${monthlyIncome.toLocaleString('en-PH')}`}
        </Text>
      </View>
    </AnimatedPressable>
  )
}
