import React from 'react'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Card } from '~/components/ui/Card'
import { AppText } from '~/components/ui/AppText'

interface ReportMenuCardProps {
  icon: string
  iconBg: string
  label: string
  onPress: () => void
}

export function ReportMenuCard({ icon, iconBg, label, onPress }: ReportMenuCardProps) {
  return (
    <Card size="lg" onPress={onPress} className="items-center" accessibilityLabel={label}>
      <View
        className="w-[48px] h-[48px] rounded-md items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        <Ionicons name={icon as any} size={24} color="#FFFFFF" />
      </View>
      <AppText variant="caption" color="secondary" className="mt-2 text-center">
        {label}
      </AppText>
    </Card>
  )
}
