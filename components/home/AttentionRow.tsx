import React from 'react'
import { View } from 'react-native'
import { AppText } from '~/components/ui/AppText'
import { Card } from '~/components/ui/Card'
import { Chip } from '~/components/ui/Chip'
import { colors } from '~/constants/theme'
import { formatPHP } from '~/lib/format'

export interface AttentionRowProps {
  tenantName: string
  unitNumber?: string | null
  status: 'overdue' | 'pending'
  amount: number
  onPress?: () => void
}

export function AttentionRow({
  tenantName,
  unitNumber,
  status,
  amount,
  onPress,
}: AttentionRowProps) {
  const statusColor = status === 'overdue' ? colors.danger : colors.warning

  return (
    <Card
      size="sm"
      onPress={onPress}
      accessibilityLabel={tenantName}
      className="flex-row items-center justify-between"
    >
      {/* Left column */}
      <View className="flex-1 gap-[2px]">
        <AppText className="text-[13px] font-semibold text-text-primary">
          {tenantName}
        </AppText>
        {unitNumber && (
          <AppText className="text-[11px] font-normal text-text-muted">
            {unitNumber}
          </AppText>
        )}
      </View>

      {/* Right column */}
      <View className="items-end gap-1">
        <Chip
          variant={status === 'overdue' ? 'danger' : 'warning'}
          label={status === 'overdue' ? 'OVERDUE' : 'PENDING'}
        />
        <AppText className="text-[13px] font-bold" style={{ color: statusColor }}>
          {formatPHP(amount)}
        </AppText>
      </View>
    </Card>
  )
}
