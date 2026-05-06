import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { colors, radius } from '../../constants/theme'

const AMENITIES = ['Aircon', 'WiFi', 'Private CR', 'Furnished', 'Parking', 'Water included']

interface AmenityChipSelectorProps {
  selected: string[]
  onToggle: (amenity: string) => void
  options?: string[]
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
      style={[
        styles.chip,
        isSelected ? styles.chipSelected : styles.chipUnselected,
        animatedStyle,
      ]}
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
        style={[
          styles.chipLabel,
          isSelected ? styles.chipLabelSelected : styles.chipLabelUnselected,
        ]}
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
}: AmenityChipSelectorProps) {
  return (
    <View style={styles.container}>
      {options.map((amenity) => (
        <AmenityChip
          key={amenity}
          label={amenity}
          isSelected={selected.includes(amenity)}
          onPress={() => onToggle(amenity)}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  chipUnselected: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipLabel: {
    fontSize: 13,
  },
  chipLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  chipLabelUnselected: {
    color: colors.textSecondary,
    fontWeight: '400',
  },
})
