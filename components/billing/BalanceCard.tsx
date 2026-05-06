import React from 'react'
import { Text, View } from 'react-native'
import { Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { colors } from '../../constants/theme'

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
      className="rounded-md p-4 mx-4 border"
      style={{ backgroundColor, borderColor }}
    >
      <Text className="text-[11px] font-semibold tracking-wider uppercase text-text-muted">
        {label}
      </Text>

      <Text
        className="text-[28px] font-bold mt-1"
        style={{ color: amountColor[variant], fontVariant: ['tabular-nums'] }}
      >
        {formatAmount(amount)}
      </Text>

      {breakdown != null && (
        <Text className="text-[13px] text-text-muted mt-1">{breakdown}</Text>
      )}

      {onRecordPayment != null && (
        <AnimatedPressable
          onPress={onRecordPayment}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className="mt-3 bg-primary rounded-full h-11 items-center justify-center"
          style={animatedStyle}
        >
          <Text className="text-[15px] font-semibold text-white">Record Payment</Text>
        </AnimatedPressable>
      )}
    </View>
  )
}
