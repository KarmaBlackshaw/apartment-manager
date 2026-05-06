import React, { ReactNode } from 'react'
import { View, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing } from '../../constants/theme'

interface BottomCTABarProps {
  children: ReactNode
}

export function BottomCTABar({ children }: BottomCTABarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom + 12 },
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[4],
    paddingTop: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
})
