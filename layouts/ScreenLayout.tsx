import React from 'react'
import { Stack, useRouter } from 'expo-router'
import { ScreenHeader } from '~/components/ui/ScreenHeader'
import { ScreenView } from '~/components/ui/ScreenView'
interface ScreenLayoutProps {
  title?: string
  /** Header left slot. Defaults to 'back' for detail screens. Pass null for root tab screens (undefined triggers JS default). */
  headerLeft?: 'back' | 'close' | React.ReactNode | null
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
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title={title ?? ''} left={headerLeft} right={headerRight} onLeftPress={onLeftPress} />
      {children}
    </ScreenView>
  )
}
