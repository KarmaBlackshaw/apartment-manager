import React from 'react'
import { Text, View, Pressable, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { colors } from '../../constants/theme'

type BedStatus = 'paid' | 'overdue' | 'vacant'

interface BedSlotCardProps {
  bedLabel: string
  tenantName?: string
  status: BedStatus
  onPress?: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const statusBg: Record<BedStatus, string> = {
  paid:    colors.successBg,
  overdue: colors.dangerBg,
  vacant:  colors.neutralBg,
}

export function BedSlotCard({
  bedLabel,
  tenantName,
  status,
  onPress,
}: BedSlotCardProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 })
  }

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 })
  }

  const cardStyle = [
    styles.card,
    { backgroundColor: statusBg[status] },
  ]

  const inner = (
    <View style={cardStyle}>
      <Text style={styles.bedLabel}>{bedLabel}</Text>
      <Text style={styles.tenantName}>
        {tenantName ?? 'Vacant'}
      </Text>
    </View>
  )

  if (onPress != null) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
      >
        {inner}
      </AnimatedPressable>
    )
  }

  return inner
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 10,
  },
  bedLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tenantName: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
})
