import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../../constants/theme'

interface InfoRowProps {
  label: string
  value: string
  valueColor?: string
  bold?: boolean
  showDivider?: boolean
}

export function InfoRow({
  label,
  value,
  valueColor,
  bold = false,
  showDivider = true,
}: InfoRowProps) {
  return (
    <View
      style={[
        styles.row,
        showDivider ? styles.divider : styles.noDivider,
      ]}
    >
      <Text
        style={[
          styles.label,
          bold && styles.labelBold,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.value,
          bold && styles.valueBold,
          { color: valueColor ?? colors.textPrimary },
        ]}
      >
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  noDivider: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  labelBold: {
    fontWeight: '700',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  valueBold: {
    fontWeight: '700',
  },
})
