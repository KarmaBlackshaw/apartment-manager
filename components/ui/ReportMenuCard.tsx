import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { colors, radius } from '../../constants/theme'

interface ReportMenuCardProps {
  icon: string
  iconBg: string
  label: string
  onPress: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function ReportMenuCard({ icon, iconBg, label, onPress }: ReportMenuCardProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <AnimatedPressable
      style={[styles.card, animatedStyle]}
      onPressIn={() => {
        scale.value = withTiming(0.96, { duration: 100 })
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 150 })
      }}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={[styles.iconSquare, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.label}>{label}</Text>
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
  },
  iconSquare: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
})
