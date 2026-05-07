import React from 'react'
import { View, Text, Pressable } from 'react-native'

interface SectionHeaderProps {
  title: string
  count?: number
  onViewAll?: () => void
  actionLabel?: string
}

export function SectionHeader({ title, count, onViewAll, actionLabel = 'View all' }: SectionHeaderProps) {
  const displayTitle = count !== undefined ? `${title} (${count})` : title

  return (
    <View className="flex-row items-center justify-between py-1">
      <Text className="text-[11px] font-semibold text-text-secondary">
        {displayTitle}
      </Text>
      {onViewAll && (
        <Pressable onPress={onViewAll} hitSlop={8} accessibilityRole="button">
          <Text className="text-[11px] font-medium text-primary">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  )
}
