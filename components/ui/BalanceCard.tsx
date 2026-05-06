import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { colors, radius, spacing } from '../../constants/theme'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type BalanceVariant = 'danger' | 'success' | 'neutral'

interface BalanceCardProps {
  amount: number
  variant: BalanceVariant
  breakdown?: string
  onRecordPayment?: () => void
  label?: string
}

const containerStyle: Record<BalanceVariant, { backgroundColor: string; borderColor: string }> = {
  danger:  { backgroundColor: colors.dangerBg,  borderColor: colors.danger },
  success: { backgroundColor: colors.successBg, borderColor: colors.success },
  neutral: { backgroundColor: colors.elevated,  borderColor: colors.border },
}

const amountColor: Record<BalanceVariant, string> = {
  danger:  colors.balanceOwed,
  success: colors.balanceZero,
  neutral: colors.textPrimary,
}

function formatAmount(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function BalanceCard({
  amount,
  variant,
  breakdown,
  onRecordPayment,
  label = 'CURRENT BALANCE',
}: BalanceCardProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 150 })
  }

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 })
  }

  const { backgroundColor, borderColor } = containerStyle[variant]

  return (
    <View
      style={[
        styles.card,
        { backgroundColor, borderColor },
      ]}
    >
      <Text style={styles.label}>{label}</Text>

      <Text style={[styles.amount, { color: amountColor[variant] }]}>
        {formatAmount(amount)}
      </Text>

      {breakdown != null && (
        <Text style={styles.breakdown}>{breakdown}</Text>
      )}

      {onRecordPayment != null && (
        <AnimatedPressable
          onPress={onRecordPayment}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.button, animatedStyle]}
        >
          <Text style={styles.buttonText}>Record Payment</Text>
        </AnimatedPressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    padding: spacing[4],
    marginHorizontal: spacing[4],
    borderWidth: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  amount: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  breakdown: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  button: {
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
})
