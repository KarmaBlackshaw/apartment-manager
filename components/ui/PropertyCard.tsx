import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { Pressable } from 'react-native'
import { colors, radius } from '../../constants/theme'

interface PropertyChip {
  label: string
  variant?: 'neutral' | 'success' | 'danger'
}

interface PropertyCardProps {
  name: string
  address: string
  chips: PropertyChip[]
  monthlyIncome: number
  occupancyPct: number
  onPress: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

function PropertyChipBadge({ label, variant = 'neutral' }: PropertyChip) {
  return (
    <View style={[styles.chip, chipBgStyle[variant]]}>
      <Text style={[styles.chipText, chipTextStyle[variant]]}>{label}</Text>
    </View>
  )
}

export function PropertyCard({
  name,
  address,
  chips,
  monthlyIncome,
  occupancyPct,
  onPress,
}: PropertyCardProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const clampedPct = Math.min(100, Math.max(0, occupancyPct))

  return (
    <AnimatedPressable
      style={[styles.card, animatedStyle]}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 100 })
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 150 })
      }}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.address}>{address}</Text>

      <View style={styles.chipsRow}>
        {chips.map((chip, index) => (
          <PropertyChipBadge key={index} label={chip.label} variant={chip.variant} />
        ))}
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${clampedPct}%` }]} />
      </View>

      <View style={styles.incomeRow}>
        <Text style={styles.incomeLabel}>Monthly income</Text>
        <Text style={styles.incomeValue}>
          {`₱${monthlyIncome.toLocaleString('en-PH')}`}
        </Text>
      </View>
    </AnimatedPressable>
  )
}

const chipBgStyle: Record<'neutral' | 'success' | 'danger', object> = {
  neutral: { backgroundColor: colors.elevated },
  success: { backgroundColor: colors.successBg },
  danger:  { backgroundColor: colors.dangerBg },
}

const chipTextStyle: Record<'neutral' | 'success' | 'danger', object> = {
  neutral: { color: colors.textSecondary },
  success: { color: colors.successText },
  danger:  { color: colors.dangerText },
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  address: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressTrack: {
    marginTop: 12,
    width: '100%',
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.elevated,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
  },
  incomeRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  incomeLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  incomeValue: {
    fontSize: 12,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
})
