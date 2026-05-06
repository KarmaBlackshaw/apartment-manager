import React from 'react'
import { ScrollView, Text, StyleSheet, Pressable } from 'react-native'
import * as Haptics from 'expo-haptics'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { colors, radius, spacing } from '../../constants/theme'

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
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress(option.value)
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <Text
        style={[
          styles.chipLabel,
          isSelected ? styles.chipLabelSelected : styles.chipLabelUnselected,
        ]}
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
      contentContainerStyle={styles.contentContainer}
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

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    minHeight: 44,
    justifyContent: 'center',
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
    fontWeight: '500',
  },
  chipLabelSelected: {
    color: '#FFFFFF',
  },
  chipLabelUnselected: {
    color: colors.textSecondary,
  },
})
