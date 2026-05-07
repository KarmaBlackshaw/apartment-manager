import React from 'react'
import { Text, View } from 'react-native'
import { colors } from '~/constants/theme'

export type ChipVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'advance'

interface StatusChipProps {
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

export function StatusChip({ variant, label, size = 'sm' }: StatusChipProps) {
  let containerClass: string
  let textClass: string

  if (size === 'xs') {
    containerClass = 'px-[6px] py-[2px]'
    textClass = 'text-[8px]'
  } else if (size === 'md') {
    containerClass = 'px-3 py-[6px]'
    textClass = 'text-xs'
  } else {
    // 'sm' is default
    containerClass = 'px-2 py-1'
    textClass = 'text-[11px]'
  }

  return (
    <View
      className={`rounded-sm self-start ${containerClass}`}
      style={{ backgroundColor: bgColor[variant] }}
    >
      <Text
        className={`font-semibold uppercase tracking-wide ${textClass}`}
        style={{ color: textColor[variant] }}
      >
        {label}
      </Text>
    </View>
  )
}
