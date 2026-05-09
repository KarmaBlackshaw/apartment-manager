import React from 'react'
import { Pressable, View } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { Card } from '~/components/ui/Card'
import { AppText } from '~/components/ui/AppText'
import { Badge } from '~/components/ui/Badge'
import type { Property } from '~/types'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface PropertyCardProps {
  property: Property
  unitCount?: number
  onPress: () => void
}

export function PropertyCard({ property, unitCount, onPress }: PropertyCardProps) {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <AnimatedPressable
      style={animatedStyle}
      onPressIn={() => { scale.value = withTiming(0.97, { duration: 100 }) }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 150 }) }}
      onPress={onPress}
      className="mb-3"
    >
      <Card>
        <AppText variant="subheading">{property.name}</AppText>
        <AppText color="secondary" className="mt-1">{property.address}</AppText>
        {unitCount !== undefined && (
          <View className="flex-row items-center mt-2">
            <Badge label={`${unitCount} unit${unitCount !== 1 ? 's' : ''}`} variant="neutral" />
          </View>
        )}
      </Card>
    </AnimatedPressable>
  )
}
