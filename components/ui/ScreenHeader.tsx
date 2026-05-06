import React, { ReactNode } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { colors, spacing } from '../../constants/theme'

interface ScreenHeaderProps {
  title: string
  left?: 'back' | 'close' | ReactNode
  right?: ReactNode
  onLeftPress?: () => void
}

export function ScreenHeader({ title, left, right, onLeftPress }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const handleLeftPress = () => {
    if (onLeftPress) {
      onLeftPress()
    } else {
      router.back()
    }
  }

  const renderLeft = () => {
    if (left === 'back') {
      return (
        <Pressable onPress={handleLeftPress} style={styles.iconSlot} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
        </Pressable>
      )
    }
    if (left === 'close') {
      return (
        <Pressable onPress={handleLeftPress} style={styles.iconSlot} hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
      )
    }
    if (left) {
      return <View style={styles.iconSlot}>{left as ReactNode}</View>
    }
    return <View style={styles.iconSlot} />
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, height: 56 + insets.top },
      ]}
    >
      {renderLeft()}
      <View style={styles.titleContainer} pointerEvents="none">
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={styles.iconSlot}>{right ?? null}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconSlot: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
})
