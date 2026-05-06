import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { colors, spacing } from '../../constants/theme'

interface SectionHeaderProps {
  title: string
  count?: number
  onViewAll?: () => void
}

export function SectionHeader({ title, count, onViewAll }: SectionHeaderProps) {
  const displayTitle = count !== undefined ? `${title} (${count})` : title

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{displayTitle}</Text>
      {onViewAll && (
        <Pressable onPress={onViewAll} hitSlop={8} accessibilityRole="button">
          <Text style={styles.viewAll}>View all</Text>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  viewAll: {
    fontSize: 13,
    color: colors.textLink,
  },
})
