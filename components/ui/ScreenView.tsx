import React from 'react'
import { ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '~/constants/theme'

type Edge = 'top' | 'bottom'

interface ScreenViewProps {
  children: React.ReactNode
  /**
   * Which edges to apply safe-area inset.
   * - With `ScreenLayout`: `['bottom']` (top is owned by `ScreenHeader`).
   * - Standalone (lock, onboarding, modals without `ScreenLayout`): default `['top', 'bottom']`.
   */
  edges?: Edge[]
  className?: string
  style?: ViewStyle
}

export function ScreenView({
  children,
  edges = ['top', 'bottom'],
  className,
  style,
}: ScreenViewProps) {
  return (
    <SafeAreaView
      edges={edges}
      className={`flex-1${className ? ` ${className}` : ''}`}
      style={[{ backgroundColor: colors.background }, style]}
    >
      {children}
    </SafeAreaView>
  )
}
