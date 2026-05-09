import React from 'react'
import { View } from 'react-native'
import { AppText } from '~/components/ui/AppText'
import { Button } from '~/components/ui/Button'
import { EmptyStateIllustration } from '~/components/illustrations/EmptyStateIllustration'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  size?: 'lg' | 'md' | 'sm' | 'none'
}

const ILLUSTRATION_SIZE: Record<Exclude<NonNullable<EmptyStateProps['size']>, 'none'>, number> = {
  lg: 220,
  md: 160,
  sm: 96,
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  size = 'md',
}: EmptyStateProps) {
  return (
    // @ts-ignore — className handled by NativeWind babel transform at runtime
    <View className="flex-1 items-center justify-center px-8 py-10 bg-background">
      {size !== 'none' && (
        <View className="mb-4 opacity-90">
          <EmptyStateIllustration size={ILLUSTRATION_SIZE[size]} />
        </View>
      )}
      <AppText variant="heading" className="text-center mb-2">{title}</AppText>
      {description && <AppText color="secondary" className="text-center mb-6">{description}</AppText>}
      {actionLabel && onAction && <Button label={actionLabel} onPress={onAction} className="self-stretch" />}
    </View>
  )
}
