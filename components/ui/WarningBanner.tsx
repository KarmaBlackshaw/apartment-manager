import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../../constants/theme'

type BannerVariant = 'warning' | 'danger' | 'info'

interface WarningBannerProps {
  message: string
  variant?: BannerVariant
}

const bgColor: Record<BannerVariant, string> = {
  warning: colors.warningBg,
  danger:  colors.dangerBg,
  info:    colors.infoBg,
}

const textColor: Record<BannerVariant, string> = {
  warning: colors.warningText,
  danger:  colors.dangerText,
  info:    colors.infoText,
}

export function WarningBanner({ message, variant = 'warning' }: WarningBannerProps) {
  return (
    <View style={[styles.container, { backgroundColor: bgColor[variant] }]}>
      <Text style={[styles.message, { color: textColor[variant] }]}>
        {message}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  message: {
    fontSize: 13,
  },
})
