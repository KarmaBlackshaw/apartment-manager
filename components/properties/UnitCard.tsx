import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Card, AppText, Badge, unitStatusBadge, billingBadge } from '../ui'
import type { Unit } from '../../types'

interface UnitCardProps {
  unit: Unit
  onPress: () => void
}

export function UnitCard({ unit, onPress }: UnitCardProps) {
  const statusBadge = unitStatusBadge(unit.status)
  const billing = billingBadge(unit.billing_type)
  const rate = unit.billing_type === 'monthly' ? unit.monthly_rate : unit.daily_rate

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="mb-3">
      <Card>
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <AppText variant="subheading">Unit {unit.unit_number}</AppText>
            {unit.floor !== null && <AppText color="secondary" variant="caption">Floor {unit.floor}</AppText>}
          </View>
          <Badge label={statusBadge.label} variant={statusBadge.variant} />
        </View>
        <View className="flex-row items-center gap-2 mt-2">
          <Badge label={billing.label} variant={billing.variant} />
          <AppText variant="caption" color="secondary">
            {rate != null ? `$${rate.toFixed(2)} / ${unit.billing_type === 'monthly' ? 'mo' : 'day'}` : 'No rate set'}
          </AppText>
        </View>
      </Card>
    </TouchableOpacity>
  )
}
