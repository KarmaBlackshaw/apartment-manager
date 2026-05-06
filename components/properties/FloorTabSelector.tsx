import React from 'react'
import { ScrollView, Text, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'

interface FloorTabSelectorProps {
  floors: number[]
  selected: number
  onChange: (floor: number) => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface FloorChipProps {
  floor: number
  isSelected: boolean
  onPress: (floor: number) => void
}

function FloorChip({ floor, isSelected, onPress }: FloorChipProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <AnimatedPressable
      className={`px-[14px] py-2 rounded-full ${
        isSelected ? 'bg-primary' : 'bg-surface border border-border'
      }`}
      style={animatedStyle}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 100 })
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 150 })
      }}
      onPress={() => onPress(floor)}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <Text
        className={`text-[13px] ${
          isSelected ? 'text-white font-semibold' : 'text-text-secondary font-normal'
        }`}
      >
        {`Floor ${floor}`}
      </Text>
    </AnimatedPressable>
  )
}

export function FloorTabSelector({ floors, selected, onChange }: FloorTabSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16 }}
    >
      {floors.map((floor) => (
        <FloorChip
          key={floor}
          floor={floor}
          isSelected={floor === selected}
          onPress={onChange}
        />
      ))}
    </ScrollView>
  )
}

