import React from 'react'
import { Pressable, Text, View } from 'react-native'
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
    <Pressable
      className="bg-surface rounded-[12px] flex-row items-center justify-between"
      style={{ padding: 12, paddingHorizontal: 14 }}
      onPress={onPress}
    >
      {/* Left column */}
      <View className="flex-1 gap-[2px]">
        <Text className="text-[13px] font-semibold text-text-primary">
          Unit {unitName} · {propertyName}
        </Text>
        <Text className="text-[11px] font-normal text-text-muted">
          Vacant {daysVacant} days
        </Text>
      </View>

      {/* Right column */}
      {lostAmount !== null ? (
        <Text className="text-[10px] font-bold" style={{ color: '#FF5C6A' }}>
          ~{formatPHP(lostAmount)} lost
        </Text>
      ) : (
        <View />
      )}
    </Pressable>
  )
}
