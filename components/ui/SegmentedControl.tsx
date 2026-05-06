import React from 'react'
import { Text, View, StyleSheet, Pressable } from 'react-native'
import * as Haptics from 'expo-haptics'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { colors, radius } from '../../constants/theme'

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
      style={[
        styles.option,
        fullWidth && styles.optionFlex,
        isSelected ? styles.optionSelected : styles.optionUnselected,
        animatedStyle,
      ]}
      accessibilityRole="tab"
      accessibilityState={{ selected: isSelected }}
    >
      <Text
        style={[
          styles.optionText,
          isSelected ? styles.optionTextSelected : styles.optionTextUnselected,
        ]}
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
    <View style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.elevated,
    borderRadius: radius.md,
    padding: 4,
    flexDirection: 'row',
  },
  option: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: 8,
  },
  optionFlex: {
    flex: 1,
  },
  optionSelected: {
    backgroundColor: colors.primary,
  },
  optionUnselected: {
    backgroundColor: 'transparent',
  },
  optionText: {
    fontSize: 14,
  },
  optionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  optionTextUnselected: {
    color: colors.textSecondary,
    fontWeight: '400',
  },
})
