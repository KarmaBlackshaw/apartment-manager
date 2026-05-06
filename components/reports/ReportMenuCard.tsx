import React from 'react'
import { View, Text, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'

interface ReportMenuCardProps {
  icon: string
  iconBg: string
  label: string
  onPress: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function ReportMenuCard({ icon, iconBg, label, onPress }: ReportMenuCardProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <AnimatedPressable
      className="bg-surface rounded-md p-4 items-center"
      style={animatedStyle}
      onPressIn={() => {
        scale.value = withTiming(0.96, { duration: 100 })
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 150 })
      }}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View
        className="w-[48px] h-[48px] rounded-md items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        <Ionicons name={icon as any} size={24} color="#FFFFFF" />
      </View>
      <Text className="text-[13px] font-medium text-text-secondary mt-2 text-center">
        {label}
      </Text>
    </AnimatedPressable>
  )
}
