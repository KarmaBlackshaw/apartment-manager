import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { colors, radius, spacing } from '../../constants/theme'

interface KPICardProps {
  label: string
  value: string
  subtitle?: string
  accentColor: string
  accentBg?: string
}

export function KPICard({
  label,
  value,
  subtitle,
  accentColor,
  accentBg,
}: KPICardProps) {
  return (
    <View
      style={[
        styles.card,
        { borderTopColor: accentColor },
        accentBg != null && { backgroundColor: accentBg },
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle != null && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing[4],
    borderTopWidth: 3,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
})
