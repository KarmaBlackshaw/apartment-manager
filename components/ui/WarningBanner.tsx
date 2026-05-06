import React from 'react'
import { View, Text } from 'react-native'
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
    <View
      className="p-3 rounded-md mx-4"
      style={{ backgroundColor: bgColor[variant] }}
    >
      <Text className="text-[13px]" style={{ color: textColor[variant] }}>
        {message}
      </Text>
    </View>
  )
}
