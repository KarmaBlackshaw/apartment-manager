import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { colors } from '../../constants/theme'

type SettlementVariant = 'deduction' | 'credit' | 'neutral' | 'total'

interface SettlementRowProps {
  label: string
  amount: number
  variant: SettlementVariant
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

type AmountStyle = {
  color: string
  fontWeight: '500' | '600' | '700'
  fontSize: number
  prefix: string
}

const AMOUNT_CONFIG: Record<SettlementVariant, AmountStyle> = {
  deduction: { color: colors.danger,      fontWeight: '600', fontSize: 14, prefix: '−₱' },
  credit:    { color: colors.success,     fontWeight: '600', fontSize: 14, prefix: '+₱' },
  neutral:   { color: colors.textPrimary, fontWeight: '500', fontSize: 14, prefix: '₱'  },
  total:     { color: colors.textPrimary, fontWeight: '700', fontSize: 15, prefix: '₱'  },
}

export function SettlementRow({ label, amount, variant }: SettlementRowProps) {
  const isTotal = variant === 'total'
  const amountCfg = AMOUNT_CONFIG[variant]

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: isTotal ? colors.surface : colors.elevated },
      ]}
    >
      <Text
        style={[
          styles.label,
          isTotal && styles.labelTotal,
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.amount,
          {
            color: amountCfg.color,
            fontWeight: amountCfg.fontWeight,
            fontSize: amountCfg.fontSize,
          },
        ]}
      >
        {amountCfg.prefix}{formatAmount(amount)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  labelTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  amount: {
    fontVariant: ['tabular-nums'],
  },
})
