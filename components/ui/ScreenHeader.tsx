import React, { ReactNode } from 'react'
import { View, Text, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { colors } from '~/constants/theme'

interface ScreenHeaderProps {
  title: string
  left?: 'back' | 'close' | ReactNode
  right?: ReactNode
  onLeftPress?: () => void
}

export function ScreenHeader({ title, left, right, onLeftPress }: ScreenHeaderProps) {
  const navigation = useNavigation()

  const handleLeftPress = () => {
    if (onLeftPress) {
      onLeftPress()
    } else {
      navigation.goBack()
    }
  }

  const renderLeft = () => {
    if (left === 'back') {
      return (
        <Pressable onPress={handleLeftPress} className="w-[44px] h-[44px] items-center justify-center" hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
        </Pressable>
      )
    }
    if (left === 'close') {
      return (
        <Pressable onPress={handleLeftPress} className="w-[44px] h-[44px] items-center justify-center" hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
      )
    }

    if (left) {
      return <View className="w-[44px] h-[44px] items-center justify-center">{left as ReactNode}</View>
    }

    return <View className="w-[44px] h-[44px]" />
  }

  return (
    <SafeAreaView edges={['top']} className="bg-app">
      <View className="flex-row items-center h-[56px]">
        {renderLeft()}
        <View className="flex-1 items-center justify-center" pointerEvents="none">
          <Text className="text-lg font-bold text-text-primary text-center" numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View className="w-[44px] h-[44px] items-center justify-center">{right ?? null}</View>
      </View>
    </SafeAreaView>
  )
}
