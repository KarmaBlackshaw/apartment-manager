import React from 'react'
import { Text, View, Pressable } from 'react-native'
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
  overdue:        { bg: colors.dangerBg,  icon: 'alert-circle-outline',    color: colors.dangerText  },
  'high-balance': { bg: colors.dangerBg,  icon: 'alert-circle-outline',    color: colors.dangerText  },
  expiring:       { bg: colors.warningBg, icon: 'time-outline',             color: colors.warningText },
  vacant:         { bg: colors.neutralBg, icon: 'home-outline',             color: colors.neutralText },
  resolved:       { bg: colors.successBg, icon: 'checkmark-circle-outline', color: colors.successText },
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
    <View className="flex-row items-start px-4 py-3 bg-surface border-b border-border">
      <View
        className="w-[40px] h-[40px] rounded-[10px] items-center justify-center"
        style={{ backgroundColor: bg }}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>

      <View className="flex-1 ml-3 mr-2">
        <Text className="text-[15px] font-semibold text-text-primary" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-[13px] text-text-secondary mt-[2px]" numberOfLines={2}>
          {subtitle}
        </Text>
      </View>

      <Text className="text-xs text-text-muted">{timestamp}</Text>
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
