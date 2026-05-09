import React from 'react'
import { View } from 'react-native'
import { AmountText } from '~/components/ui/AmountText'
import { AppText } from '~/components/ui/AppText'
import { Card } from '~/components/ui/Card'
import { colors } from '~/constants/theme'
import type { PerUnitIncomeEntry, PerUnitIncomeStatus } from '~/types'

const BORDER_COLOR: Record<PerUnitIncomeStatus, string> = {
  success: colors.success,
  warning: colors.warning,
  danger:  colors.danger,
  neutral: colors.neutral,
}

interface UnitIncomeRowProps {
  entry: PerUnitIncomeEntry
}

export function UnitIncomeRow({ entry }: UnitIncomeRowProps) {
  const borderColor = BORDER_COLOR[entry.status]
  const subtitle = entry.tenant_name
    ? `${entry.tenant_name} · ${entry.status === 'success' ? 'Paid' : entry.status === 'warning' ? 'Partial' : 'Unpaid'}`
    : 'Vacant'

  return (
    <Card
      accentBorder={{ side: 'left', color: borderColor, width: 3 }}
      className="mx-4 mb-2"
      size="sm"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <AppText className="text-[15px] font-semibold text-text-primary" numberOfLines={1}>
            {entry.unit_label}
            {entry.unit_type ? ` — ${entry.unit_type}` : ''}
          </AppText>
          <AppText className="text-[13px] text-text-secondary mt-[2px]" numberOfLines={1}>
            {subtitle}
          </AppText>
        </View>
        <View className="items-end">
          <AmountText amount={entry.collected} size="small" />
          <AppText className="text-xs mt-[2px]" style={{ color: colors.textMuted }}>
            {entry.pct}%
          </AppText>
        </View>
      </View>
    </Card>
  )
}
