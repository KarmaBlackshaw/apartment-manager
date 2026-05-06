import React from 'react'
import { Text, View } from 'react-native'

interface KPICardProps {
  label: string
  value: string
  subtitle?: string
  accentColor: string
  accentBg?: string
}

export function KPICard({
  label,
  value,
  subtitle,
  accentColor,
  accentBg,
}: KPICardProps) {
  return (
    <View
      className="bg-surface rounded-md p-4 border-t-[3px]"
      style={{
        borderTopColor: accentColor,
        ...(accentBg != null && { backgroundColor: accentBg }),
      }}
    >
      <Text className="text-xs text-text-secondary mb-1">{label}</Text>
      <Text className="text-xl font-bold text-text-primary">{value}</Text>
      {subtitle != null && (
        <Text className="text-xs text-text-muted mt-0.5">{subtitle}</Text>
      )}
    </View>
  )
}
