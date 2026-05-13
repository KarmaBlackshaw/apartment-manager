import React from 'react'
import { View } from 'react-native'
import { colors } from '~/constants/theme'
import { Card } from '~/components/ui/Card'
import { AppText } from '~/components/ui/AppText'
import { Chip } from '~/components/ui/Chip'
import type { ChipVariant } from '~/components/ui/Chip'

export type UnitStatus = 'paid' | 'overdue' | 'vacant' | 'partial'

interface UnitGridCardProps {
  unitName: string
  tenantName?: string
  status: UnitStatus
  onPress: () => void
}

const borderColorMap: Record<UnitStatus, string> = {
  paid:    colors.success,
  overdue: colors.danger,
  partial: colors.warning,
  vacant:  colors.textMuted,
}

const chipVariantMap: Record<UnitStatus, ChipVariant> = {
  paid:    'success',
  overdue: 'danger',
  partial: 'warning',
  vacant:  'neutral',
}

const chipLabelMap: Record<UnitStatus, string> = {
  paid:    'PAID',
  overdue: 'OVERDUE',
  partial: 'PARTIAL',
  vacant:  'VACANT',
}

export function UnitGridCard({ unitName, tenantName, status, onPress }: UnitGridCardProps) {
  return (
    <Card
      radius="sm"
      onPress={onPress}
      size="sm"
      accessibilityLabel={unitName}
    >
      <AppText variant="caption" color="primary" className="font-semibold">{unitName}</AppText>
      <AppText variant="caption" color="secondary" className="text-xs mt-[2px]">{tenantName ?? 'Vacant'}</AppText>
      <View className="mt-[6px]">
        <Chip variant={chipVariantMap[status]} label={chipLabelMap[status]} size="xs" />
      </View>
    </Card>
  )
}
