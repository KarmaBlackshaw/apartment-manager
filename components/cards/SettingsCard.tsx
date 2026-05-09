import React from 'react'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AppText } from '~/components/ui/AppText'
import { Card } from '~/components/ui/Card'
import { colors } from '~/constants/theme'
import { cn } from '~/lib/utils'

type ValueColor = 'primary' | 'success' | 'warning' | 'danger'

interface SettingsCardProps {
  label: string
  value?: string
  right?: React.ReactNode
  chevron?: boolean
  valueColor?: ValueColor
  valueMono?: boolean
  onPress?: () => void
  accessibilityLabel?: string
}

export function SettingsCard({
  label,
  value,
  right,
  chevron = false,
  valueColor,
  valueMono = false,
  onPress,
  accessibilityLabel,
}: SettingsCardProps) {
  const valueColorClass =
    valueColor === 'success' ? 'text-success'
    : valueColor === 'warning' ? 'text-warning'
    : valueColor === 'danger'  ? 'text-danger'
    : valueColor === 'primary' ? 'text-primary'
    : 'text-text-secondary'

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? label}
      className="flex-row items-center justify-between min-h-[44px]"
    >
      <AppText className="text-sm font-medium text-text-primary flex-1" numberOfLines={1}>
        {label}
      </AppText>
      <View className="flex-row items-center gap-1.5">
        {right ?? (
          value != null && (
            <AppText className={cn('text-sm font-normal', valueColorClass, valueMono && 'font-mono')}>
              {value}
            </AppText>
          )
        )}
        {chevron && (
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        )}
      </View>
    </Card>
  )
}
