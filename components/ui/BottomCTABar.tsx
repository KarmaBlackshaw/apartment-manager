import React, { ReactNode } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface BottomCTABarProps {
  children: ReactNode
}

export function BottomCTABar({ children }: BottomCTABarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View
      className="px-4 pt-3 bg-surface border-t border-border"
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      {children}
    </View>
  )
}
