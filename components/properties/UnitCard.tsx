import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Card } from '~/components/ui/Card'
import { AppText } from '~/components/ui/AppText'
import { Badge, unitStatusBadge } from '~/components/ui/Badge'
import type { Unit } from '~/types'

interface UnitCardProps {
  unit: Unit
  onPress: () => void
}

export function UnitCard({ unit, onPress }: UnitCardProps) {
  const statusBadge = unitStatusBadge(unit.status)

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="mb-3">
      <Card>
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <AppText variant="subheading">Unit {unit.unit_number}</AppText>
            {unit.monthly_rate != null && (
              <AppText variant="caption" color="secondary" className="mt-1">
                ₱{unit.monthly_rate.toLocaleString('en-PH')} / mo
              </AppText>
            )}
          </View>
          <Badge label={statusBadge.label} variant={statusBadge.variant} />
        </View>
      </Card>
    </TouchableOpacity>
  )
}
