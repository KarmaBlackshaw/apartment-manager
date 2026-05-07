import React from 'react'
import { Pressable, View } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

interface ToggleProps {
  value: boolean
  onValueChange: (next: boolean) => void
  disabled?: boolean
  accessibilityLabel?: string
}

const TRACK_WIDTH = 44
const TRACK_HEIGHT = 26
const THUMB_SIZE = 22
const PADDING = 2

export function Toggle({ value, onValueChange, disabled = false, accessibilityLabel }: ToggleProps) {
  const position = useSharedValue(value ? TRACK_WIDTH - THUMB_SIZE - PADDING : PADDING)

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }))

  const handlePress = () => {
    if (disabled) return
    const newValue = !value
    Haptics.selectionAsync()
    position.value = withTiming(newValue ? TRACK_WIDTH - THUMB_SIZE - PADDING : PADDING, {
      duration: 150,
      easing: Easing.out(Easing.cubic),
    })
    onValueChange(newValue)
  }

  React.useEffect(() => {
    position.value = withTiming(value ? TRACK_WIDTH - THUMB_SIZE - PADDING : PADDING, {
      duration: 150,
      easing: Easing.out(Easing.cubic),
    })
  }, [value])

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      // @ts-ignore
      className={`w-11 h-[26px] rounded-full ${value ? 'bg-primary' : 'bg-elevated border border-border'} ${disabled ? 'opacity-50' : ''}`}
    >
      <Animated.View
        // @ts-ignore
        className="w-[22px] h-[22px] rounded-full bg-white"
        style={[{ marginTop: PADDING }, animatedThumbStyle]}
      />
    </Pressable>
  )
}
