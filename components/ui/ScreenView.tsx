import React from 'react'
import { View, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '~/constants/theme'

type Edge = 'top' | 'bottom'

interface ScreenViewProps {
  children: React.ReactNode
  /**
   * Which edges to apply safe-area padding.
   * - Screens using ScreenLayout: edges={['bottom']} — top is handled by ScreenHeader's own SafeAreaView
   * - Custom-header screens (onboarding, lock, modals): default ['top', 'bottom']
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
  const insets = useSafeAreaInsets()
  return (
    <View
      className={`flex-1${className ? ` ${className}` : ''}`}
      style={[
        {
          backgroundColor: colors.background,
          paddingTop: edges.includes('top') ? insets.top : undefined,
          paddingBottom: edges.includes('bottom') ? insets.bottom : undefined,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}
