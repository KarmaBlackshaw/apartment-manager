import React from 'react'
import { Stack } from 'expo-router'
import { darkStackOptions } from '../../constants/navigation'

interface AppHeaderProps {
  title: string
  right?: React.ReactNode
  left?: React.ReactNode
}

export function AppHeader({ title, right, left }: AppHeaderProps) {
  return (
    <Stack.Screen
      options={{
        ...darkStackOptions,
        headerShown: true,
        title,
        ...(right != null && { headerRight: () => <>{right}</> }),
        ...(left != null && { headerLeft: () => <>{left}</> }),
      }}
    />
  )
}
