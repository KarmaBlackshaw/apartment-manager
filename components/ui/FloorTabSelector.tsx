import React from 'react'
import { ScrollView, Text, StyleSheet, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { colors, radius } from '../../constants/theme'

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
      onPress={() => onPress(floor)}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <Text
        style={[
          styles.chipLabel,
          isSelected ? styles.chipLabelSelected : styles.chipLabelUnselected,
        ]}
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
      contentContainerStyle={styles.contentContainer}
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

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
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
