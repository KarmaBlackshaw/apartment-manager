import React from 'react'
import { View, Text } from 'react-native'
import { AmountText } from '../ui/AmountText'
import { colors } from '../../constants/theme'
import type { PerUnitIncomeEntry, PerUnitIncomeStatus } from '../../types'

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
    <View className="mx-4 mb-2 flex-row rounded-xl overflow-hidden" style={{ backgroundColor: colors.surface }}>
      <View style={{ width: 3, backgroundColor: borderColor }} />
      <View className="flex-1 flex-row items-center justify-between p-3">
        <View className="flex-1 mr-3">
          <Text className="text-[15px] font-semibold text-text-primary" numberOfLines={1}>
            {entry.unit_label}
            {entry.unit_type ? ` — ${entry.unit_type}` : ''}
          </Text>
          <Text className="text-[13px] text-text-secondary mt-[2px]" numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <View className="items-end">
          <AmountText amount={entry.collected} size="small" />
          <Text className="text-xs mt-[2px]" style={{ color: colors.textMuted }}>
            {entry.pct}%
          </Text>
        </View>
      </View>
    </View>
  )
}
