import React from 'react'
import { View } from 'react-native'
import { colors } from '~/constants/theme'
import { Chip, ChipVariant } from '~/components/ui/Chip'
import { Card } from '~/components/ui/Card'
import { AppText } from '~/components/ui/AppText'
import { formatPHP } from '~/lib/format'

type MaintenanceStatus = 'reported' | 'in-progress' | 'resolved'

interface MaintenanceRowProps {
  title: string
  category: string
  date: string
  status: MaintenanceStatus
  cost?: number
  onPress?: () => void
}

const STATUS_DOT_COLOR: Record<MaintenanceStatus, string> = {
  reported:      colors.warning,
  'in-progress': colors.danger,
  resolved:      colors.success,
}

const STATUS_CHIP_VARIANT: Record<MaintenanceStatus, ChipVariant> = {
  reported:      'neutral',
  'in-progress': 'warning',
  resolved:      'success',
}

const STATUS_CHIP_LABEL: Record<MaintenanceStatus, string> = {
  reported:      'REPORTED',
  'in-progress': 'IN PROGRESS',
  resolved:      'RESOLVED',
}

export function MaintenanceRow({
  title,
  category,
  date,
  status,
  cost,
  onPress,
}: MaintenanceRowProps) {
  return (
    <Card onPress={onPress} accessibilityLabel={title}>
      <View className="flex-row items-center">
        <View
          className="w-[8px] h-[8px] rounded-full mr-3"
          style={{ backgroundColor: STATUS_DOT_COLOR[status] }}
        />

        <View className="flex-1 mr-3">
          <AppText className="text-[15px] font-semibold text-text-primary" numberOfLines={1}>
            {title}
          </AppText>
          <AppText className="text-[13px] text-text-secondary mt-[2px]" numberOfLines={1}>
            {category} · {date}
          </AppText>
        </View>

        <View className="items-end gap-1">
          <Chip
            variant={STATUS_CHIP_VARIANT[status]}
            label={STATUS_CHIP_LABEL[status]}
          />
          {cost != null && (
            <AppText className="text-xs text-text-muted">{formatPHP(cost)}</AppText>
          )}
        </View>
      </View>
    </Card>
  )
}
