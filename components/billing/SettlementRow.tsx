import React from 'react'
import { Text, View } from 'react-native'
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
      className="flex-row justify-between py-3 px-4"
      style={{ backgroundColor: isTotal ? colors.surface : colors.elevated }}
    >
      <Text
        className={isTotal ? 'text-[15px] font-bold text-text-primary' : 'text-sm text-text-secondary'}
      >
        {label}
      </Text>

      <Text
        style={{
          color: amountCfg.color,
          fontWeight: amountCfg.fontWeight,
          fontSize: amountCfg.fontSize,
          fontVariant: ['tabular-nums'],
        }}
      >
        {amountCfg.prefix}{formatAmount(amount)}
      </Text>
    </View>
  )
}
