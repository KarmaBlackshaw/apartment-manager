import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { StatusChip } from '../../components/ui'
import { formatPHP } from '../../lib/format'

export interface AttentionRowProps {
  tenantName: string
  unitNumber?: string | null
  status: 'overdue' | 'pending'
  amount: number
  onPress?: () => void
}

export function AttentionRow({
  tenantName,
  unitNumber,
  status,
  amount,
  onPress,
}: AttentionRowProps) {
  const statusColor = status === 'overdue' ? '#FF5C6A' : '#FFB020'

  return (
    <Pressable
      className="bg-surface rounded-[12px] flex-row items-center justify-between"
      style={{ padding: 12, paddingHorizontal: 14 }}
      onPress={onPress}
    >
      {/* Left column */}
      <View className="flex-1 gap-[2px]">
        <Text className="text-[13px] font-semibold text-text-primary">
          {tenantName}
        </Text>
        {unitNumber && (
          <Text className="text-[11px] font-normal text-text-muted">
            {unitNumber}
          </Text>
        )}
      </View>

      {/* Right column */}
      <View className="items-end gap-1">
        <StatusChip
          variant={status === 'overdue' ? 'danger' : 'warning'}
          label={status === 'overdue' ? 'OVERDUE' : 'PENDING'}
        />
        <Text className="text-[13px] font-bold" style={{ color: statusColor }}>
          {formatPHP(amount)}
        </Text>
      </View>
    </Pressable>
  )
}
