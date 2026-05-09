import React from 'react'
import { Text, View, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { colors } from '~/constants/theme'
import { Chip, ChipVariant } from '~/components/ui/Chip'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type MaintenanceStatus = 'reported' | 'in-progress' | 'resolved'

interface MaintenanceRowProps {
  title: string
  category: string
  date: string
  status: MaintenanceStatus
  cost?: number
  onPress?: () => void
}

const STATUS_DOT_COLOR: Record<MaintenanceStatus, string> = {
  reported:      colors.warning,
  'in-progress': colors.danger,
  resolved:      colors.success,
}

const STATUS_CHIP_VARIANT: Record<MaintenanceStatus, ChipVariant> = {
  reported:      'neutral',
  'in-progress': 'warning',
  resolved:      'success',
}

const STATUS_CHIP_LABEL: Record<MaintenanceStatus, string> = {
  reported:      'REPORTED',
  'in-progress': 'IN PROGRESS',
  resolved:      'RESOLVED',
}

function formatCost(cost: number): string {
  return `₱${cost.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function MaintenanceRow({
  title,
  category,
  date,
  status,
  cost,
  onPress,
}: MaintenanceRowProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 150 })
  }

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 })
  }

  const inner = (
    <View className="flex-row items-center px-4 py-3 bg-surface border-b border-border">
      <View
        className="w-[8px] h-[8px] rounded-full mr-3"
        style={{ backgroundColor: STATUS_DOT_COLOR[status] }}
      />

      <View className="flex-1 mr-3">
        <Text className="text-[15px] font-semibold text-text-primary" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-[13px] text-text-secondary mt-[2px]" numberOfLines={1}>
          {category} · {date}
        </Text>
      </View>

      <View className="items-end gap-1">
        <Chip
          variant={STATUS_CHIP_VARIANT[status]}
          label={STATUS_CHIP_LABEL[status]}
        />
        {cost != null && (
          <Text className="text-xs text-text-muted">{formatCost(cost)}</Text>
        )}
      </View>
    </View>
  )

  if (onPress != null) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
      >
        {inner}
      </AnimatedPressable>
    )
  }

  return inner
}
