import React from 'react'
import { Text, View, StyleSheet, Pressable, Switch } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../constants/theme'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type SettingsRowType = 'navigate' | 'toggle' | 'info'

interface SettingsRowProps {
  label: string
  value?: string
  type: SettingsRowType
  onPress?: () => void
  isEnabled?: boolean
  onToggle?: (val: boolean) => void
  valueColor?: string
}

export function SettingsRow({
  label,
  value,
  type,
  onPress,
  isEnabled,
  onToggle,
  valueColor,
}: SettingsRowProps) {
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

  const resolvedValueColor = valueColor ?? colors.textSecondary

  const inner = (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>

      {type === 'navigate' && (
        <View style={styles.trailingRow}>
          {value != null && (
            <Text style={[styles.value, { color: resolvedValueColor }]}>
              {value}
            </Text>
          )}
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      )}

      {type === 'toggle' && (
        <Switch
          value={isEnabled ?? false}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={colors.border}
        />
      )}

      {type === 'info' && value != null && (
        <Text style={[styles.value, { color: resolvedValueColor }]}>
          {value}
        </Text>
      )}
    </View>
  )

  if (type === 'navigate' && onPress != null) {
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
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 44,
  },
  label: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  trailingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontSize: 14,
  },
})
