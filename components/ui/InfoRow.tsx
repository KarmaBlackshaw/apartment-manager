import React from 'react'
import { View } from 'react-native'
import { AppText } from '~/components/ui/AppText'
import { colors } from '~/constants/theme'

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
      className={[
        'flex-row justify-between px-4 py-3',
        showDivider ? 'border-b border-border' : '',
      ].join(' ')}
    >
      <AppText
        className={[
          'text-sm text-text-secondary',
          bold ? 'font-bold' : 'font-normal',
        ].join(' ')}
      >
        {label}
      </AppText>
      <AppText
        className={[
          'text-sm',
          bold ? 'font-bold' : 'font-medium',
        ].join(' ')}
        style={{ color: valueColor ?? colors.textPrimary }}
      >
        {value}
      </AppText>
    </View>
  )
}
