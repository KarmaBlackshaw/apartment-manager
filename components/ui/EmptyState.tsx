import React from 'react'
import { View } from 'react-native'
import { AppText } from './AppText'
import { Button } from './Button'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    // @ts-ignore — className handled by NativeWind babel transform at runtime
    <View className="flex-1 items-center justify-center p-8 bg-app">
      <AppText variant="heading" className="text-center mb-2">{title}</AppText>
      {description && <AppText color="secondary" className="text-center mb-6">{description}</AppText>}
      {actionLabel && onAction && <Button label={actionLabel} onPress={onAction} className="self-stretch" />}
    </View>
  )
}
