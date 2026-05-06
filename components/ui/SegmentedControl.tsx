import React from 'react'
import { Text, View, Pressable } from 'react-native'
import * as Haptics from 'expo-haptics'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'

interface SegmentedControlProps {
  options: string[]
  selected: string
  onChange: (value: string) => void
  fullWidth?: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

function Segment({
  label,
  isSelected,
  onPress,
  fullWidth,
}: {
  label: string
  isSelected: boolean
  onPress: () => void
  fullWidth: boolean
}) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withTiming(0.97, { duration: 80 }) }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 120 }) }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
      }}
      className={`py-2 items-center justify-center min-h-[44px] rounded-md ${fullWidth ? 'flex-1' : ''} ${isSelected ? 'bg-primary' : 'bg-transparent'}`}
      style={animatedStyle}
      accessibilityRole="tab"
      accessibilityState={{ selected: isSelected }}
    >
      <Text
        className={`text-sm ${isSelected ? 'text-white font-semibold' : 'text-text-secondary font-normal'}`}
      >
        {label}
      </Text>
    </AnimatedPressable>
  )
}

export function SegmentedControl({
  options,
  selected,
  onChange,
  fullWidth = true,
}: SegmentedControlProps) {
  return (
    <View className="bg-elevated rounded-md p-1 flex-row">
      {options.map((option) => (
        <Segment
          key={option}
          label={option}
          isSelected={option === selected}
          onPress={() => onChange(option)}
          fullWidth={fullWidth}
        />
      ))}
    </View>
  )
}
