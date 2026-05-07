import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { StatusChip } from '~/components/ui/StatusChip'

type UnitStatus = 'occupied-paid' | 'occupied-overdue' | 'vacant'

interface UnitCellProps {
  unitNumber: string
  tenantName?: string | null
  status: UnitStatus
  onPress?: () => void
}

const statusColor: Record<UnitStatus, string> = {
  'occupied-paid': '#22C98A',
  'occupied-overdue': '#FF5C6A',
  'vacant': '#424860',
}

export function UnitCell({ unitNumber, tenantName, status, onPress }: UnitCellProps) {
  const borderColor = statusColor[status]

  return (
    <Pressable
      className="bg-surface rounded-[12px]"
      style={{
        paddingTop: 11,
        paddingBottom: 11,
        paddingHorizontal: 12,
        borderLeftWidth: 3,
        borderLeftColor: borderColor,
      }}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={{ fontSize: 12, fontWeight: '700' }} className="text-text-primary">
        {unitNumber}
      </Text>
      <Text style={{ fontSize: 10, fontWeight: '400' }} className="text-text-muted">
        {tenantName ?? 'Vacant'}
      </Text>
      {status === 'occupied-overdue' && (
        <View style={{ marginTop: 6 }}>
          <StatusChip variant="danger" label="OVERDUE" />
        </View>
      )}
      {status === 'vacant' && (
        <View style={{ marginTop: 6 }}>
          <StatusChip variant="neutral" label="VACANT" />
        </View>
      )}
    </Pressable>
  )
}
