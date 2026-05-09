import React from 'react'
import { Text, View } from 'react-native'
import { colors } from '~/constants/theme'

export type ChipVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'advance'

interface ChipProps {
  variant: ChipVariant
  label: string
  size?: 'xs' | 'sm' | 'md'
}

const bgColor: Record<ChipVariant, string> = {
  success: colors.successBg,
  warning: colors.warningBg,
  danger:  colors.dangerBg,
  info:    colors.infoBg,
  neutral: colors.neutralBg,
  advance: colors.infoBg,
}

const textColor: Record<ChipVariant, string> = {
  success: colors.successText,
  warning: colors.warningText,
  danger:  colors.dangerText,
  info:    colors.infoText,
  neutral: colors.neutralText,
  advance: colors.infoText,
}

const SIZE_CLASSES: Record<NonNullable<ChipProps['size']>, { container: string; text: string }> = {
  xs: { container: 'px-[6px] py-[2px]', text: 'text-[8px]'  },
  sm: { container: 'px-2 py-1',         text: 'text-[11px]' },
  md: { container: 'px-3 py-[6px]',     text: 'text-xs'     },
}

export function Chip({ variant, label, size = 'sm' }: ChipProps) {
  const { container, text } = SIZE_CLASSES[size]
  return (
    <View className={`rounded-sm self-start ${container}`} style={{ backgroundColor: bgColor[variant] }}>
      <Text className={`font-semibold uppercase tracking-wide ${text}`} style={{ color: textColor[variant] }}>
        {label}
      </Text>
    </View>
  )
}
