import React from 'react'
import { Pressable } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { darkStackOptions } from '~/constants/navigation'
import { colors } from '~/constants/theme'

interface AppHeaderProps {
  title: string
  right?: React.ReactNode
  left?: React.ReactNode
  showBack?: boolean
}

export function AppHeader({ title, right, left, showBack }: AppHeaderProps) {
  const router = useRouter()

  const backButton = (
    <Pressable onPress={() => router.back()} hitSlop={8} className="pl-2 mr-2">
      <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
    </Pressable>
  )

  const resolvedLeft = left != null ? left : showBack ? backButton : undefined

  return (
    <Stack.Screen
      options={{
        ...darkStackOptions,
        headerShown: true,
        title,
        ...(right != null && { headerRight: () => <>{right}</> }),
        ...(resolvedLeft != null && { headerLeft: () => <>{resolvedLeft}</> }),
      }}
    />
  )
}
