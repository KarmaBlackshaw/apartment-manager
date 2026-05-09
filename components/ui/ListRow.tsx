import React, { ReactNode } from 'react'
import { View } from 'react-native'
import { Card } from '~/components/ui/Card'
import { AppText } from '~/components/ui/AppText'

interface ListRowProps {
  leading?: ReactNode
  title: string
  subtitle?: string
  trailingChip?: ReactNode
  trailingAmount?: ReactNode
  trailingText?: string
  onPress?: () => void
  /** @deprecated No-op — Card model uses gap/spacing instead of dividers */
  showDivider?: boolean
}

export function ListRow({
  leading,
  title,
  subtitle,
  trailingChip,
  trailingAmount,
  trailingText,
  onPress,
}: ListRowProps) {
  const hasTrailing = trailingChip != null || trailingAmount != null || trailingText != null

  return (
    <Card onPress={onPress} accessibilityLabel={title} className="min-h-[72px] justify-center">
      <View className="flex-row items-center">
        {leading != null && <View className="mr-3">{leading}</View>}

        <View className="flex-1">
          <AppText className="text-[15px] font-semibold text-text-primary" numberOfLines={1}>
            {title}
          </AppText>
          {subtitle != null && (
            <AppText className="text-[13px] text-text-secondary mt-[2px]" numberOfLines={1}>
              {subtitle}
            </AppText>
          )}
        </View>

        {hasTrailing && (
          <View className="items-end gap-1">
            {trailingChip != null && trailingChip}
            {trailingAmount != null && (
              <View style={trailingChip != null ? { marginTop: 4 } : undefined}>
                {trailingAmount}
              </View>
            )}
            {trailingText != null && (
              <AppText className="text-[13px] text-text-secondary">{trailingText}</AppText>
            )}
          </View>
        )}
      </View>
    </Card>
  )
}
