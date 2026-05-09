import React from 'react'
import { View } from 'react-native'
import { AppText } from '~/components/ui/AppText'
import { Card } from '~/components/ui/Card'
import { colors } from '~/constants/theme'
import { formatPHP } from '~/lib/format'

export interface VacantRowProps {
  unitName: string
  propertyName: string
  daysVacant: number
  monthlyRate?: number | null
  onPress?: () => void
}

export function VacantRow({
  unitName,
  propertyName,
  daysVacant,
  monthlyRate,
  onPress,
}: VacantRowProps) {
  const hasMonthlyRate = monthlyRate && monthlyRate > 0
  const lostAmount = hasMonthlyRate
    ? Math.round(daysVacant * (monthlyRate / 30))
    : null

  return (
    <Card
      size="sm"
      onPress={onPress}
      accessibilityLabel={unitName}
      className="flex-row items-center justify-between"
    >
      {/* Left column */}
      <View className="flex-1 gap-[2px]">
        <AppText className="text-[13px] font-semibold text-text-primary">
          Unit {unitName} · {propertyName}
        </AppText>
        <AppText className="text-[11px] font-normal text-text-muted">
          Vacant {daysVacant} days
        </AppText>
      </View>

      {/* Right column */}
      {lostAmount !== null ? (
        <AppText className="text-[10px] font-bold" style={{ color: colors.danger }}>
          ~{formatPHP(lostAmount)} lost
        </AppText>
      ) : (
        <View />
      )}
    </Card>
  )
}
