import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { colors, radius } from '../../constants/theme'

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
      style={[
        styles.base,
        { backgroundColor: bgColor[variant] },
        isMd ? styles.containerMd : styles.containerSm,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: textColor[variant] },
          isMd ? styles.textMd : styles.textSm,
        ]}
      >
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  containerSm: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  containerMd: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  textSm: {
    fontSize: 11,
  },
  textMd: {
    fontSize: 12,
  },
})
