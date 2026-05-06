import React from 'react'
import { ScrollView, Text, Pressable } from 'react-native'
import * as Haptics from 'expo-haptics'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'

interface FilterOption {
  label: string
  value: string
}

interface FilterChipBarProps {
  options: FilterOption[]
  selected: string
  onChange: (value: string) => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface ChipProps {
  option: FilterOption
  isSelected: boolean
  onPress: (value: string) => void
}

function FilterChip({ option, isSelected, onPress }: ChipProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <AnimatedPressable
      className={[
        'px-[14px] py-2 rounded-full min-h-[44px] justify-center',
        isSelected
          ? 'bg-primary'
          : 'bg-surface border border-border',
      ].join(' ')}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 100 })
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 150 })
      }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress(option.value)
      }}
      style={animatedStyle}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <Text
        className={[
          'text-[13px] font-medium',
          isSelected ? 'text-white' : 'text-text-secondary',
        ].join(' ')}
      >
        {option.label}
      </Text>
    </AnimatedPressable>
  )
}

export function FilterChipBar({ options, selected, onChange }: FilterChipBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
        alignItems: 'center',
      }}
      style={{ flexGrow: 0, flexShrink: 0 }}
    >
      {options.map((option) => (
        <FilterChip
          key={option.value}
          option={option}
          isSelected={option.value === selected}
          onPress={onChange}
        />
      ))}
    </ScrollView>
  )
}
