import React from 'react'
import { Text, View } from 'react-native'

interface KPICardProps {
  label: string
  value: string
  subtitle?: string
  accentColor: string
}

export function KPICard({
  label,
  value,
  subtitle,
  accentColor,
}: KPICardProps) {
  return (
    <View
      className="bg-surface rounded-[16px] border-t-2"
      style={{
        paddingTop: 14,
        paddingHorizontal: 14,
        paddingBottom: 12,
        borderTopColor: accentColor,
      }}
    >
      <Text className="text-[10px] font-medium text-text-muted mb-1">{label}</Text>
      <Text className="text-[22px] font-bold text-text-primary">{value}</Text>
      {subtitle != null && (
        <Text className="text-[11px] font-normal text-text-muted mt-0.5">{subtitle}</Text>
      )}
    </View>
  )
}
