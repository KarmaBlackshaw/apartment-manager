import React from 'react'
import { Text, View, Pressable, Switch } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '~/constants/theme'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type SettingsRowType = 'navigate' | 'toggle' | 'info'

interface SettingsRowProps {
  label: string
  value?: string
  type: SettingsRowType
  onPress?: () => void
  isEnabled?: boolean
  onToggle?: (val: boolean) => void
  valueColor?: string
}

export function SettingsRow({
  label,
  value,
  type,
  onPress,
  isEnabled,
  onToggle,
  valueColor,
}: SettingsRowProps) {
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

  const resolvedValueColor = valueColor ?? colors.textSecondary

  const inner = (
    <View className="flex-row items-center bg-surface px-4 py-4 border-b border-border min-h-[44px]">
      <Text className="flex-1 text-[15px] text-text-primary">{label}</Text>

      {type === 'navigate' && (
        <View className="flex-row items-center gap-1">
          {value != null && (
            <Text style={{ color: resolvedValueColor }} className="text-sm">
              {value}
            </Text>
          )}
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      )}

      {type === 'toggle' && (
        <Switch
          value={isEnabled ?? false}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={colors.border}
        />
      )}

      {type === 'info' && value != null && (
        <Text style={{ color: resolvedValueColor }} className="text-sm">
          {value}
        </Text>
      )}
    </View>
  )

  if (type === 'navigate' && onPress != null) {
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
