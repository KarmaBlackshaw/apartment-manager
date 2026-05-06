import React from 'react'
import { Text, View } from 'react-native'
import { colors } from '../../constants/theme'

interface CollectionProgressBarProps {
  paid: number
  partial: number
  unpaid: number
  total: number
  showCounts?: boolean
}

export function CollectionProgressBar({
  paid,
  partial,
  unpaid,
  total,
  showCounts = true,
}: CollectionProgressBarProps) {
  const isEmpty = total === 0

  if (isEmpty) {
    return (
      <View className="items-center py-2">
        <Text className="text-xs text-text-muted">No bills this month</Text>
      </View>
    )
  }

  return (
    <View>
      <View className="h-[6px] rounded-full overflow-hidden flex-row">
        {paid > 0 && (
          <View
            className="h-[6px]"
            style={{ flex: paid / total, backgroundColor: colors.success }}
          />
        )}
        {partial > 0 && (
          <View
            className="h-[6px]"
            style={{ flex: partial / total, backgroundColor: colors.warning }}
          />
        )}
        {unpaid > 0 && (
          <View
            className="h-[6px]"
            style={{ flex: unpaid / total, backgroundColor: colors.danger }}
          />
        )}
      </View>

      {showCounts && (
        <View className="flex-row mt-2 gap-4">
          <View className="flex-row items-center">
            <View className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: colors.success }} />
            <Text className="text-xs text-text-secondary ml-1">Paid: {paid}</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: colors.warning }} />
            <Text className="text-xs text-text-secondary ml-1">Partial: {partial}</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: colors.danger }} />
            <Text className="text-xs text-text-secondary ml-1">Unpaid: {unpaid}</Text>
          </View>
        </View>
      )}
    </View>
  )
}
