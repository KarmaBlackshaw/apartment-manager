import React from 'react'
import { Text, View, StyleSheet, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { colors } from '../../constants/theme'
import { StatusChip, ChipVariant } from './StatusChip'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type MaintenanceStatus = 'reported' | 'in-progress' | 'resolved'

interface MaintenanceRowProps {
  title: string
  category: string
  date: string
  status: MaintenanceStatus
  cost?: number
  onPress?: () => void
}

const STATUS_DOT_COLOR: Record<MaintenanceStatus, string> = {
  reported:    colors.warning,
  'in-progress': colors.danger,
  resolved:    colors.success,
}

const STATUS_CHIP_VARIANT: Record<MaintenanceStatus, ChipVariant> = {
  reported:    'neutral',
  'in-progress': 'warning',
  resolved:    'success',
}

const STATUS_CHIP_LABEL: Record<MaintenanceStatus, string> = {
  reported:    'REPORTED',
  'in-progress': 'IN PROGRESS',
  resolved:    'RESOLVED',
}

function formatCost(cost: number): string {
  return `₱${cost.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function MaintenanceRow({
  title,
  category,
  date,
  status,
  cost,
  onPress,
}: MaintenanceRowProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 150 })
  }

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 })
  }

  const inner = (
    <View style={styles.row}>
      <View
        style={[
          styles.dot,
          { backgroundColor: STATUS_DOT_COLOR[status] },
        ]}
      />

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {category} · {date}
        </Text>
      </View>

      <View style={styles.trailing}>
        <StatusChip
          variant={STATUS_CHIP_VARIANT[status]}
          label={STATUS_CHIP_LABEL[status]}
        />
        {cost != null && (
          <Text style={styles.cost}>{formatCost(cost)}</Text>
        )}
      </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  body: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: 4,
  },
  cost: {
    fontSize: 12,
    color: colors.textMuted,
  },
})
