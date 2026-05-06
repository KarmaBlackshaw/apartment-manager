import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { colors } from '../../constants/theme'
import { StatusChip } from './StatusChip'
import type { ChipVariant } from './StatusChip'

export type UnitStatus = 'paid' | 'overdue' | 'vacant' | 'partial'

interface UnitGridCardProps {
  unitName: string
  tenantName?: string
  status: UnitStatus
  onPress: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const borderColorMap: Record<UnitStatus, string> = {
  paid:    colors.success,
  overdue: colors.danger,
  partial: colors.warning,
  vacant:  colors.textMuted,
}

const chipVariantMap: Record<UnitStatus, ChipVariant> = {
  paid:    'success',
  overdue: 'danger',
  partial: 'warning',
  vacant:  'neutral',
}

const chipLabelMap: Record<UnitStatus, string> = {
  paid:    'PAID',
  overdue: 'OVERDUE',
  partial: 'PARTIAL',
  vacant:  'VACANT',
}

export function UnitGridCard({ unitName, tenantName, status, onPress }: UnitGridCardProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <AnimatedPressable
      style={[
        styles.card,
        { borderLeftColor: borderColorMap[status] },
        animatedStyle,
      ]}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 100 })
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 150 })
      }}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={styles.unitName}>{unitName}</Text>
      <Text style={styles.tenantName}>
        {tenantName ?? 'Vacant'}
      </Text>
      <View style={styles.chipContainer}>
        <StatusChip variant={chipVariantMap[status]} label={chipLabelMap[status]} size="sm" />
      </View>
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
  },
  unitName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tenantName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chipContainer: {
    marginTop: 6,
  },
})
