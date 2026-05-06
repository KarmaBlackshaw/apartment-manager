import React from 'react'
import { Text, View, Pressable, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import Ionicons from '@expo/vector-icons/Ionicons'
import { colors, radius } from '../../constants/theme'

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
}

function KeyButton({ onPress, children }: KeyProps) {
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

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.key, animatedStyle]}
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
    <View style={styles.container}>
      {/* Dot indicators */}
      <View style={styles.dots}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < enteredLength ? styles.dotFilled : styles.dotEmpty,
            ]}
          />
        ))}
      </View>

      {/* Digit rows 1-9 */}
      {DIGIT_ROWS.map((row) => (
        <View key={row.join('')} style={styles.row}>
          {row.map((digit) => (
            <KeyButton key={digit} onPress={() => onDigit(digit)}>
              <Text style={styles.digitText}>{digit}</Text>
            </KeyButton>
          ))}
        </View>
      ))}

      {/* Bottom row: biometric | 0 | backspace */}
      <View style={styles.row}>
        {/* Biometric or empty placeholder */}
        {onBiometric != null ? (
          <KeyButton onPress={onBiometric}>
            <Ionicons name="finger-print" size={24} color={colors.textLink} />
          </KeyButton>
        ) : (
          <View style={styles.keyPlaceholder} />
        )}

        <KeyButton onPress={() => onDigit('0')}>
          <Text style={styles.digitText}>0</Text>
        </KeyButton>

        <KeyButton onPress={onBackspace}>
          <Ionicons name="backspace-outline" size={24} color={colors.textSecondary} />
        </KeyButton>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotFilled: {
    backgroundColor: colors.primary,
  },
  dotEmpty: {
    backgroundColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPlaceholder: {
    width: 72,
    height: 72,
    backgroundColor: 'transparent',
  },
  digitText: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.textPrimary,
  },
})
