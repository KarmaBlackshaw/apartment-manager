import React, { ReactNode } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { colors } from '../../constants/theme'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface ListRowProps {
  leading?: ReactNode
  title: string
  subtitle?: string
  trailingChip?: ReactNode
  trailingAmount?: ReactNode
  trailingText?: string
  onPress?: () => void
  showDivider?: boolean
}

export function ListRow({
  leading,
  title,
  subtitle,
  trailingChip,
  trailingAmount,
  trailingText,
  onPress,
  showDivider = true,
}: ListRowProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 150 })
  }

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 })
  }

  const hasTrailing = trailingChip != null || trailingAmount != null || trailingText != null

  const inner = (
    <View
      style={[
        styles.row,
        showDivider && styles.divider,
      ]}
    >
      {leading != null && <View style={styles.leading}>{leading}</View>}

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle != null && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {hasTrailing && (
        <View style={styles.trailing}>
          {trailingChip != null && trailingChip}
          {trailingAmount != null && (
            <View style={trailingChip != null ? styles.trailingAmountGap : undefined}>
              {trailingAmount}
            </View>
          )}
          {trailingText != null && (
            <Text style={styles.trailingText}>{trailingText}</Text>
          )}
        </View>
      )}
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
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.muted,
  },
  leading: {
    marginRight: 12,
  },
  body: {
    flex: 1,
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
  trailingAmountGap: {
    marginTop: 4,
  },
  trailingText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
})
