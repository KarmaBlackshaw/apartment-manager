import React, { type ComponentProps } from 'react'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AppText } from '~/components/ui/AppText'
import { Card } from '~/components/ui/Card'

interface ReportCardProps {
  label: string
  value: string
  sub: string
  iconName: ComponentProps<typeof Ionicons>['name']
  iconBg: string
  iconColor: string
  onPress: () => void
}

export function ReportCard({ label, value, sub, iconName, iconBg, iconColor, onPress }: ReportCardProps) {
  return (
    <Card onPress={onPress} size="sm" accessibilityLabel={label}>
      <View
        className="w-8 h-8 rounded-[8px] items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        <Ionicons name={iconName} size={15} color={iconColor} />
      </View>
      <View className="mt-2.5 gap-0.5">
        <AppText className="text-[11px] font-medium text-text-secondary">
          {label}
        </AppText>
        <AppText className="text-[11px] font-bold" style={{ color: iconColor }}>
          {value}
        </AppText>
        <AppText className="text-[10px] font-normal text-text-muted">
          {sub}
        </AppText>
      </View>
    </Card>
  )
}
