import React, { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface ListRowProps {
  leading?: ReactNode
  title: string
  subtitle?: string
  trailingChip?: ReactNode
  trailingAmount?: ReactNode
  trailingText?: string
  onPress?: () => void
  showDivider?: boolean
}

export function ListRow({
  leading,
  title,
  subtitle,
  trailingChip,
  trailingAmount,
  trailingText,
  onPress,
  showDivider = true,
}: ListRowProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 150 })
  }

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 })
  }

  const hasTrailing = trailingChip != null || trailingAmount != null || trailingText != null

  const inner = (
    <View
      className={[
        'flex-row items-center min-h-[72px] px-4 py-3 bg-surface',
        showDivider ? 'border-b border-muted' : '',
      ].join(' ')}
    >
      {leading != null && <View className="mr-3">{leading}</View>}

      <View className="flex-1">
        <Text className="text-[15px] font-semibold text-text-primary" numberOfLines={1}>
          {title}
        </Text>
        {subtitle != null && (
          <Text className="text-[13px] text-text-secondary mt-[2px]" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {hasTrailing && (
        <View className="items-end gap-1">
          {trailingChip != null && trailingChip}
          {trailingAmount != null && (
            <View style={trailingChip != null ? { marginTop: 4 } : undefined}>
              {trailingAmount}
            </View>
          )}
          {trailingText != null && (
            <Text className="text-[13px] text-text-secondary">{trailingText}</Text>
          )}
        </View>
      )}
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
