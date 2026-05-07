import React, { type ComponentProps } from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'

interface ReportCardProps {
  label: string
  value: string
  sub: string
  iconName: ComponentProps<typeof Ionicons>['name']
  iconBg: string
  iconColor: string
  onPress: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function ReportCard({ label, value, sub, iconName, iconBg, iconColor, onPress }: ReportCardProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <AnimatedPressable
      className="bg-surface rounded-[16px]"
      style={[animatedStyle, { paddingVertical: 14, paddingHorizontal: 12 }]}
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
        className="w-8 h-8 rounded-[8px] items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        <Ionicons name={iconName} size={15} color={iconColor} />
      </View>
      <View style={{ marginTop: 10, gap: 2 }}>
        <Text style={{ fontSize: 11, fontWeight: '500' }} className="text-text-secondary">
          {label}
        </Text>
        <Text style={{ fontSize: 11, fontWeight: '700', color: iconColor, marginTop: 2 }}>
          {value}
        </Text>
        <Text style={{ fontSize: 10, fontWeight: '400', marginTop: 1 }} className="text-text-muted">
          {sub}
        </Text>
      </View>
    </AnimatedPressable>
  )
}
