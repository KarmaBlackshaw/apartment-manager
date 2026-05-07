import React from 'react'
import { Text, View, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '~/constants/theme'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export type DocCategory = 'contract' | 'photo' | 'permit' | 'gov-id' | 'other'

interface DocumentRowProps {
  title: string
  category: DocCategory
  date: string
  onPress: () => void
}

type CategoryConfig = {
  icon: React.ComponentProps<typeof Ionicons>['name']
  bg: string
}

const CATEGORY_MAP: Record<DocCategory, CategoryConfig> = {
  contract: { icon: 'document-outline', bg: '#1E3A5F' },
  photo:    { icon: 'image-outline',    bg: '#1A3A2A' },
  permit:   { icon: 'ribbon-outline',   bg: '#2A2A1A' },
  'gov-id': { icon: 'card-outline',     bg: '#2A1A2A' },
  other:    { icon: 'folder-outline',   bg: '#1E2533' },
}

export function DocumentRow({ title, category, date, onPress }: DocumentRowProps) {
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

  const { icon, bg } = CATEGORY_MAP[category]

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      <View className="flex-row items-center px-4 py-3 bg-surface border-b border-border">
        <View
          className="w-[40px] h-[40px] rounded-[8px] items-center justify-center mr-3"
          style={{ backgroundColor: bg }}
        >
          <Ionicons name={icon} size={20} color="#FFFFFF" />
        </View>

        <View className="flex-1 mr-2">
          <Text className="text-[15px] font-semibold text-text-primary" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-[13px] text-text-secondary mt-[2px]" numberOfLines={1}>
            {category} · {date}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </AnimatedPressable>
  )
}
