import React from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { colors } from '../../constants/theme'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface FABProps {
  onPress: () => void
  icon?: React.ComponentProps<typeof Ionicons>['name']
  bottomOffset?: number
}

export function FAB({ onPress, icon = 'add', bottomOffset = 100 }: FABProps) {
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
      style={[styles.fab, { bottom: insets.bottom + bottomOffset }, animatedStyle]}
    >
      <Ionicons name={icon} size={28} color="#FFFFFF" />
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
})
