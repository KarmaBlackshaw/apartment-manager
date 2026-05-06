import React from 'react'
import { Text, View, StyleSheet, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../constants/theme'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type NotifType = 'overdue' | 'expiring' | 'vacant' | 'high-balance' | 'resolved'

interface NotificationRowProps {
  type: NotifType
  title: string
  subtitle: string
  timestamp: string
  onPress?: () => void
}

type IconConfig = {
  bg: string
  icon: React.ComponentProps<typeof Ionicons>['name']
  color: string
}

const TYPE_MAP: Record<NotifType, IconConfig> = {
  overdue:      { bg: colors.dangerBg,  icon: 'alert-circle-outline',    color: colors.dangerText  },
  'high-balance': { bg: colors.dangerBg,  icon: 'alert-circle-outline',  color: colors.dangerText  },
  expiring:     { bg: colors.warningBg, icon: 'time-outline',             color: colors.warningText },
  vacant:       { bg: colors.neutralBg, icon: 'home-outline',             color: colors.neutralText },
  resolved:     { bg: colors.successBg, icon: 'checkmark-circle-outline', color: colors.successText },
}

export function NotificationRow({
  type,
  title,
  subtitle,
  timestamp,
  onPress,
}: NotificationRowProps) {
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

  const { bg, icon, color } = TYPE_MAP[type]

  const inner = (
    <View style={styles.row}>
      <View style={[styles.iconContainer, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>

      <Text style={styles.timestamp}>{timestamp}</Text>
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
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
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
  timestamp: {
    fontSize: 12,
    color: colors.textMuted,
  },
})
