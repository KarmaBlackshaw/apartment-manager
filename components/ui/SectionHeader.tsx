import React from 'react'
import { View, Text, Pressable } from 'react-native'

interface SectionHeaderProps {
  title: string
  count?: number
  onViewAll?: () => void
}

export function SectionHeader({ title, count, onViewAll }: SectionHeaderProps) {
  const displayTitle = count !== undefined ? `${title} (${count})` : title

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <Text className="text-[13px] font-semibold text-text-secondary uppercase tracking-wide">
        {displayTitle}
      </Text>
      {onViewAll && (
        <Pressable onPress={onViewAll} hitSlop={8} accessibilityRole="button">
          <Text className="text-[13px] text-primary">View all</Text>
        </Pressable>
      )}
    </View>
  )
}
