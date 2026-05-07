import React from 'react'
import { View } from 'react-native'
import { AppText } from '~/components/ui/AppText'
import { cn } from '~/lib/utils'

type Variant = 'neutral' | 'warning' | 'danger'

interface InfoNoteProps {
  children: React.ReactNode
  variant?: Variant
  className?: string
}

const variantStyles: Record<Variant, { container: string; text: string }> = {
  neutral: {
    container: 'bg-elevated',
    text: 'text-text-secondary',
  },
  warning: {
    container: 'bg-amber/10',
    text: 'text-amber',
  },
  danger: {
    container: 'bg-red/10',
    text: 'text-danger',
  },
}

export function InfoNote({ children, variant = 'neutral', className = '' }: InfoNoteProps) {
  const { container, text } = variantStyles[variant]

  return (
    // @ts-ignore
    <View className={cn(`rounded-lg p-3 ${container}`, className)}>
      <AppText variant="caption" className={text}>
        {children}
      </AppText>
    </View>
  )
}
