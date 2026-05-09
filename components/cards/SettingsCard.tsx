import React from 'react'
import { View, Pressable, Switch } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { AppText } from '~/components/ui/AppText'
import { colors } from '~/constants/theme'
import { cn } from '~/lib/utils'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type ValueColor = 'primary' | 'success' | 'warning' | 'danger'

interface SettingsCardProps {
  label: string
  value?: string
  right?: React.ReactNode
  chevron?: boolean
  valueColor?: ValueColor
  valueMono?: boolean
  onPress?: () => void
  accessibilityLabel?: string
}

export function SettingsCard({
  label,
  value,
  right,
  chevron = false,
  valueColor,
  valueMono = false,
  onPress,
  accessibilityLabel,
}: SettingsCardProps) {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const valueColorClass =
    valueColor === 'success' ? 'text-success'
    : valueColor === 'warning' ? 'text-warning'
    : valueColor === 'danger'  ? 'text-danger'
    : valueColor === 'primary' ? 'text-primary'
    : 'text-text-secondary'

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => { scale.value = withTiming(0.97, { duration: 100 }) }}
        onPressOut={() => { scale.value = withTiming(1, { duration: 150 }) }}
        style={animatedStyle}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        className="bg-surface rounded-md px-4 py-3.5 flex-row items-center justify-between min-h-[44px]"
      >
        <AppText className="text-[11px] font-medium text-text-primary flex-1" numberOfLines={1}>
          {label}
        </AppText>
        <View className="flex-row items-center gap-1.5">
          {right ?? (
            value != null && (
              <AppText className={cn('text-[8px] font-normal', valueColorClass, valueMono && 'font-mono')}>
                {value}
              </AppText>
            )
          )}
          {chevron && (
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          )}
        </View>
      </AnimatedPressable>
    )
  }

  return (
    <View className="bg-surface rounded-md px-4 py-3.5 flex-row items-center justify-between min-h-[44px]">
      <AppText className="text-[11px] font-medium text-text-primary flex-1" numberOfLines={1}>
        {label}
      </AppText>
      <View className="flex-row items-center gap-1.5">
        {right ?? (
          value != null && (
            <AppText className={cn('text-[8px] font-normal', valueColorClass, valueMono && 'font-mono')}>
              {value}
            </AppText>
          )
        )}
        {chevron && (
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        )}
      </View>
    </View>
  )
}
