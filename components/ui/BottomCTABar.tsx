import React, { ReactNode } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useHideTabBar } from '~/hooks/useHideTabBar'

interface BottomCTABarProps {
  children: ReactNode
}

export function BottomCTABar({ children }: BottomCTABarProps) {
  const insets = useSafeAreaInsets()
  useHideTabBar()

  return (
    <View
      className="px-4 pt-3 bg-surface border-t border-border"
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      {children}
    </View>
  )
}
