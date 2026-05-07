import React from 'react'
import { ScrollView, Text, Pressable } from 'react-native'
import * as Haptics from 'expo-haptics'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'

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
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
      }}
      className={[
        'px-[14px] py-[6px] min-h-[32px] justify-center items-center',
        isSelected ? 'bg-primary rounded-full' : 'bg-transparent',
      ].join(' ')}
      style={animatedStyle}
      accessibilityRole="tab"
      accessibilityState={{ selected: isSelected }}
    >
      <Text
        className={[
          'text-[13px]',
          isSelected ? 'text-text-primary font-semibold' : 'text-text-secondary font-normal',
        ].join(' ')}
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
      style={{ height: 48 }}
      contentContainerStyle={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 16,
      }}
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
