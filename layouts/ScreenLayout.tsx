import React from 'react'
import { ScreenHeader, ScreenView } from '../components/ui'

interface ScreenLayoutProps {
  title: string
  /** Header left slot. Pass 'back' (default) for detail screens, undefined for root tab screens. */
  headerLeft?: 'back' | 'close' | React.ReactNode
  headerRight?: React.ReactNode
  children: React.ReactNode
}

/**
 * Screen wrapper that avoids the headerShown timing race from AppHeader + Stack.Screen.
 * ScreenHeader handles top insets; ScreenView handles bottom.
 */
export function ScreenLayout({ title, headerLeft = 'back', headerRight, children }: ScreenLayoutProps) {
  return (
    <ScreenView edges={['bottom']}>
      <ScreenHeader title={title} left={headerLeft} right={headerRight} />
      {children}
    </ScreenView>
  )
}
