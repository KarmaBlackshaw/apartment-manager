import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Card } from '~/components/ui/Card'
import { AppText } from '~/components/ui/AppText'
import { Badge } from '~/components/ui/Badge'
import type { Property } from '~/types'

interface PropertyCardProps {
  property: Property
  unitCount?: number
  onPress: () => void
}

export function PropertyCard({ property, unitCount, onPress }: PropertyCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="mb-3">
      <Card>
        <AppText variant="subheading">{property.name}</AppText>
        <AppText color="secondary" className="mt-1">{property.address}</AppText>
        {unitCount !== undefined && (
          <View className="flex-row items-center mt-2">
            <Badge label={`${unitCount} unit${unitCount !== 1 ? 's' : ''}`} variant="neutral" />
          </View>
        )}
      </Card>
    </TouchableOpacity>
  )
}
