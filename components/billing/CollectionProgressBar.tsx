import React from 'react'
import { Text, View } from 'react-native'
import { colors } from '~/constants/theme'
import { formatPHP } from '~/lib/format'

interface CollectionProgressBarProps {
  paid: number
  partial: number
  unpaid: number
  total: number
  showCounts?: boolean
  monthLabel?: string
  collectedAmount?: number
  billedAmount?: number
  pct?: number
}

export function CollectionProgressBar({
  paid,
  partial,
  unpaid,
  total,
  showCounts = true,
  monthLabel,
  collectedAmount,
  billedAmount,
  pct,
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
      {monthLabel && (
        <View className="mb-2">
          <Text className="text-[11px] font-normal text-text-muted">{monthLabel}</Text>
          <Text className="text-sm font-bold text-text-primary">
            {formatPHP(collectedAmount ?? 0)} of {formatPHP(billedAmount ?? 0)} — {pct ?? 0}%
          </Text>
          <View className="mb-2" />
        </View>
      )}

      {monthLabel ? (
        <View className="h-[4px] rounded-full overflow-hidden bg-muted mb-2">
          <View
            className="h-[4px] rounded-full"
            style={{ width: `${pct ?? 0}%`, backgroundColor: '#22C98A' }}
          />
        </View>
      ) : (
        <View className="h-[4px] rounded-full overflow-hidden flex-row">
          {paid > 0 && (
            <View className="h-[4px]" style={{ flex: paid / total, backgroundColor: colors.success }} />
          )}
          {partial > 0 && (
            <View className="h-[4px]" style={{ flex: partial / total, backgroundColor: colors.warning }} />
          )}
          {unpaid > 0 && (
            <View className="h-[4px]" style={{ flex: unpaid / total, backgroundColor: colors.danger }} />
          )}
        </View>
      )}

      {showCounts && monthLabel && (
        <View className="flex-row gap-3">
          <Text className="text-[10px] font-medium text-[#22C98A]">Paid: {paid}</Text>
          <Text className="text-[10px] font-medium text-[#FFB020]">Partial: {partial}</Text>
          <Text className="text-[10px] font-medium text-[#FF5C6A]">Unpaid: {unpaid}</Text>
        </View>
      )}
      {showCounts && !monthLabel && (
        <View className="flex-row mt-2 gap-4">
          <View className="flex-row items-center">
            <View className="w-[6px] h-[6px] rounded-full bg-success" />
            <Text className="text-xs text-text-secondary ml-1">Paid: {paid}</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-[6px] h-[6px] rounded-full bg-warning" />
            <Text className="text-xs text-text-secondary ml-1">Partial: {partial}</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-[6px] h-[6px] rounded-full bg-danger" />
            <Text className="text-xs text-text-secondary ml-1">Unpaid: {unpaid}</Text>
          </View>
        </View>
      )}
    </View>
  )
}
