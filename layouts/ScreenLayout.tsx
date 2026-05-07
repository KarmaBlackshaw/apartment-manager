import React from 'react'
import { useRouter } from 'expo-router'
import { ScreenHeader, ScreenView } from '../components/ui'

interface ScreenLayoutProps {
  title: string
  /** Header left slot. Pass 'back' (default) for detail screens, undefined for root tab screens. */
  headerLeft?: 'back' | 'close' | React.ReactNode
  /** Explicit URL to navigate to when back is pressed. Use on nested Stack screens where router.back() is unreliable. */
  backHref?: string
  headerRight?: React.ReactNode
  children: React.ReactNode
}

export function ScreenLayout({ title, headerLeft = 'back', backHref, headerRight, children }: ScreenLayoutProps) {
  const router = useRouter()
  const onLeftPress = backHref ? () => router.navigate(backHref as never) : undefined
  return (
    <ScreenView edges={['bottom']}>
      <ScreenHeader title={title} left={headerLeft} right={headerRight} onLeftPress={onLeftPress} />
      {children}
    </ScreenView>
  )
}
