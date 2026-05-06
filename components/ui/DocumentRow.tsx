import React from 'react'
import { Text, View, StyleSheet, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { colors, radius } from '../../constants/theme'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type DocCategory = 'contract' | 'photo' | 'permit' | 'gov-id' | 'other'

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
      <View style={styles.row}>
        <View style={[styles.iconContainer, { backgroundColor: bg }]}>
          <Ionicons name={icon} size={20} color="#FFFFFF" />
        </View>

        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {category} · {date}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </AnimatedPressable>
  )
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  body: {
    flex: 1,
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
})
