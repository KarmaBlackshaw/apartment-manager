import React from 'react'
import { Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface FABProps {
  onPress: () => void
  icon?: React.ComponentProps<typeof Ionicons>['name']
  bottomOffset?: number
}

export function FAB({ onPress, icon = 'add', bottomOffset = 82 }: FABProps) {
  const insets = useSafeAreaInsets()
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withTiming(0.92, { duration: 120 }) }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 150 }) }}
      className="absolute right-5 w-11 h-11 rounded-full bg-primary items-center justify-center"
      style={[
        {
          bottom: insets.bottom + bottomOffset,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        },
        animatedStyle,
      ]}
    >
      <Ionicons name={icon} size={20} color="#FFFFFF" />
    </AnimatedPressable>
  )
}
