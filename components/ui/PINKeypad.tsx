import React from 'react'
import { Text, View, Pressable } from 'react-native'
import * as Haptics from 'expo-haptics'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import Ionicons from '@expo/vector-icons/Ionicons'
import { colors } from '~/constants/theme'

interface PINKeypadProps {
  enteredLength: number
  onDigit: (digit: string) => void
  onBackspace: () => void
  onBiometric?: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface KeyProps {
  onPress: () => void
  children: React.ReactNode
  haptic?: 'light' | 'heavy'
}

function KeyButton({ onPress, children, haptic = 'light' }: KeyProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withTiming(0.9, { duration: 100 })
  }

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 })
  }

  const handlePress = () => {
    Haptics.impactAsync(
      haptic === 'heavy'
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Light
    )
    onPress()
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className="bg-elevated items-center justify-center"
      style={[{ width: 72, height: 72, borderRadius: 12 }, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  )
}

const DIGIT_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
]

export function PINKeypad({
  enteredLength,
  onDigit,
  onBackspace,
  onBiometric,
}: PINKeypadProps) {
  return (
    <View className="items-center">
      {/* Dot indicators */}
      <View className="flex-row gap-4 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: i < enteredLength ? colors.primary : colors.border,
            }}
          />
        ))}
      </View>

      {/* Digit rows 1-9 */}
      {DIGIT_ROWS.map((row) => (
        <View key={row.join('')} className="flex-row gap-3 mb-3 px-6">
          {row.map((digit) => (
            <KeyButton key={digit} onPress={() => onDigit(digit)} haptic="heavy">
              <Text className="text-[24px] font-medium text-text-primary">{digit}</Text>
            </KeyButton>
          ))}
        </View>
      ))}

      {/* Bottom row: biometric | 0 | backspace */}
      <View className="flex-row gap-3 mb-3 px-6">
        {onBiometric != null ? (
          <KeyButton onPress={onBiometric}>
            <Ionicons name="finger-print" size={24} color={colors.textLink} />
          </KeyButton>
        ) : (
          <View style={{ width: 72, height: 72, backgroundColor: 'transparent' }} />
        )}

        <KeyButton onPress={() => onDigit('0')} haptic="heavy">
          <Text className="text-[24px] font-medium text-text-primary">0</Text>
        </KeyButton>

        <KeyButton onPress={onBackspace} haptic="light">
          <Ionicons name="backspace-outline" size={24} color={colors.textSecondary} />
        </KeyButton>
      </View>
    </View>
  )
}
