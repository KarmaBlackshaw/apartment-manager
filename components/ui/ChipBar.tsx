import React from 'react'
import { ScrollView, Text, Pressable } from 'react-native'
import * as Haptics from 'expo-haptics'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'

export interface ChipOption {
  value: string
  label: string
}

interface ChipBarProps {
  options: ChipOption[] | string[]
  selected: string
  onChange: (value: string) => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

function toOptions(input: ChipOption[] | string[]): ChipOption[] {
  return input.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
}

interface ChipProps {
  option: ChipOption
  isSelected: boolean
  onPress: (value: string) => void
}

function Chip({ option, isSelected, onPress }: ChipProps) {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <AnimatedPressable
      style={animatedStyle}
      className={`px-4 h-[32px] rounded-full justify-center items-center ${
        isSelected ? 'bg-primary' : 'bg-surface'
      }`}
      onPressIn={() => { scale.value = withTiming(0.97, { duration: 100 }) }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 150 }) }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress(option.value)
      }}
      accessibilityRole="tab"
      accessibilityState={{ selected: isSelected }}
    >
      <Text
        className={`text-[12px] font-medium ${
          isSelected ? 'text-white' : 'text-text-secondary'
        }`}
      >
        {option.label}
      </Text>
    </AnimatedPressable>
  )
}

export function ChipBar({ options, selected, onChange }: ChipBarProps) {
  const opts = toOptions(options)
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="flex-row items-center gap-2 px-4 py-1.5"
      className="grow-0 shrink-0"
    >
      {opts.map((opt) => (
        <Chip
          key={opt.value}
          option={opt}
          isSelected={opt.value === selected}
          onPress={onChange}
        />
      ))}
    </ScrollView>
  )
}
