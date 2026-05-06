import React from 'react'
import { Text, StyleSheet } from 'react-native'
import { colors } from '../../constants/theme'

export type AmountVariant = 'owed' | 'credit' | 'paid' | 'zero' | 'muted' | 'default'
export type AmountSize = 'large' | 'medium' | 'small'

interface AmountTextProps {
  amount: number
  variant?: AmountVariant
  size?: AmountSize
  showSign?: boolean
}

const textColor: Record<AmountVariant, string> = {
  owed:    colors.balanceOwed,
  credit:  colors.balanceCredit,
  paid:    colors.balanceZero,
  zero:    colors.balanceZero,
  muted:   colors.textMuted,
  default: colors.textPrimary,
}

const fontStyles: Record<AmountSize, { fontSize: number; fontWeight: '700' | '600' }> = {
  large:  { fontSize: 28, fontWeight: '700' },
  medium: { fontSize: 20, fontWeight: '600' },
  small:  { fontSize: 15, fontWeight: '600' },
}

export function AmountText({
  amount,
  variant = 'default',
  size = 'small',
  showSign = true,
}: AmountTextProps) {
  const formatted = amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const display = showSign ? `₱${formatted}` : formatted

  return (
    <Text
      style={[
        styles.base,
        { color: textColor[variant] },
        fontStyles[size],
      ]}
    >
      {display}
    </Text>
  )
}

const styles = StyleSheet.create({
  base: {
    fontVariant: ['tabular-nums'],
  },
})
