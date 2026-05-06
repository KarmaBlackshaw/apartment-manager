import React from 'react'
import { Text, View } from 'react-native'
import { colors } from '../../constants/theme'

export type ChipVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'advance'

interface StatusChipProps {
  variant: ChipVariant
  label: string
  size?: 'sm' | 'md'
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

export function StatusChip({ variant, label, size = 'sm' }: StatusChipProps) {
  const isMd = size === 'md'
  return (
    <View
      className={`rounded-sm self-start ${isMd ? 'px-3 py-[6px]' : 'px-2 py-1'}`}
      style={{ backgroundColor: bgColor[variant] }}
    >
      <Text
        className={`font-semibold uppercase tracking-wide ${isMd ? 'text-xs' : 'text-[11px]'}`}
        style={{ color: textColor[variant] }}
      >
        {label}
      </Text>
    </View>
  )
}
