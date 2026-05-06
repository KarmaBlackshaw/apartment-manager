import React from 'react'
import { ScrollView, Text, StyleSheet, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { colors, radius } from '../../constants/theme'

interface MonthTabSelectorProps {
  months: string[]
  selected: string
  onChange: (month: string) => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

function MonthTab({
  month,
  isSelected,
  onPress,
}: {
  month: string
  isSelected: boolean
  onPress: () => void
}) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withTiming(0.97, { duration: 80 }) }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 120 }) }}
      onPress={onPress}
      style={[
        styles.tab,
        isSelected ? styles.tabSelected : styles.tabUnselected,
        animatedStyle,
      ]}
      accessibilityRole="tab"
      accessibilityState={{ selected: isSelected }}
    >
      <Text
        style={[
          styles.tabText,
          isSelected ? styles.tabTextSelected : styles.tabTextUnselected,
        ]}
      >
        {month}
      </Text>
    </AnimatedPressable>
  )
}

export function MonthTabSelector({ months, selected, onChange }: MonthTabSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {months.map((month) => (
        <MonthTab
          key={month}
          month={month}
          isSelected={month === selected}
          onPress={() => onChange(month)}
        />
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabSelected: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  tabUnselected: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
  },
  tabTextSelected: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  tabTextUnselected: {
    color: colors.textSecondary,
    fontWeight: '400',
  },
})
