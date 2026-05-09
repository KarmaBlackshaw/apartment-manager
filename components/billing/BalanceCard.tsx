import React from 'react'
import { Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { colors } from '~/constants/theme'
import { Card } from '~/components/ui/Card'
import { AppText } from '~/components/ui/AppText'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type BalanceVariant = 'danger' | 'success' | 'neutral'

interface BalanceCardProps {
  amount: number
  variant: BalanceVariant
  breakdown?: string
  onRecordPayment?: () => void
  label?: string
}

const containerClass: Record<BalanceVariant, string> = {
  danger:  'bg-danger-bg border border-danger',
  success: 'bg-success-bg border border-success',
  neutral: 'bg-elevated border border-border',
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

  return (
    <Card size="lg" className={`mx-4 ${containerClass[variant]}`}>
      <AppText className="text-[11px] font-semibold tracking-wider uppercase text-text-muted">
        {label}
      </AppText>

      <AppText
        className="text-[28px] font-bold mt-1"
        style={{ color: amountColor[variant], fontVariant: ['tabular-nums'] }}
      >
        {formatAmount(amount)}
      </AppText>

      {breakdown != null && (
        <AppText className="text-[13px] text-text-muted mt-1">{breakdown}</AppText>
      )}

      {onRecordPayment != null && (
        <AnimatedPressable
          onPress={onRecordPayment}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className="mt-3 bg-primary rounded-full h-11 items-center justify-center"
          style={animatedStyle}
        >
          <AppText className="text-[15px] font-semibold text-white">Record Payment</AppText>
        </AnimatedPressable>
      )}
    </Card>
  )
}
