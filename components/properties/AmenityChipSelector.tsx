import React from 'react'
import { View, Text, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'

const AMENITIES = ['Aircon', 'WiFi', 'Private CR', 'Furnished', 'Parking', 'Water included']

interface AmenityChipSelectorProps {
  selected: string[]
  onToggle?: (amenity: string) => void
  options?: string[]
  readOnly?: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface AmenityChipProps {
  label: string
  isSelected: boolean
  onPress: () => void
}

function AmenityChip({ label, isSelected, onPress }: AmenityChipProps) {
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
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
    >
      <Text
        className={`text-[13px] ${
          isSelected ? 'text-white font-semibold' : 'text-text-secondary font-normal'
        }`}
      >
        {label}
      </Text>
    </AnimatedPressable>
  )
}

export function AmenityChipSelector({
  selected,
  onToggle,
  options = AMENITIES,
  readOnly = false,
}: AmenityChipSelectorProps) {
  const displayOptions = readOnly ? options.filter((a) => selected.includes(a)) : options
  return (
    <View className="flex-row flex-wrap gap-2">
      {displayOptions.map((amenity) => (
        <AmenityChip
          key={amenity}
          label={amenity}
          isSelected={readOnly ? true : selected.includes(amenity)}
          onPress={() => !readOnly && onToggle?.(amenity)}
        />
      ))}
    </View>
  )
}

