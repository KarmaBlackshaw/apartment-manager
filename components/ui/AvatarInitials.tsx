import React from 'react'
import { Text, View } from 'react-native'

interface AvatarInitialsProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

const AVATAR_COLORS = [
  '#1E3A5F',
  '#1A3A2A',
  '#3A1A1A',
  '#2A1A3A',
  '#1A2A3A',
  '#3A2A1A',
  '#1A3A3A',
  '#2D2D1A',
] as const

const DIMENSION: Record<'sm' | 'md' | 'lg', number> = {
  sm: 32,
  md: 40,
  lg: 48,
}

const FONT_SIZE: Record<'sm' | 'md' | 'lg', number> = {
  sm: 13,
  md: 16,
  lg: 18,
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

function hashName(name: string): number {
  let sum = 0
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i)
  }
  return sum % 8
}

export function AvatarInitials({ name, size = 'md' }: AvatarInitialsProps) {
  const initials = getInitials(name)
  const bgColor = AVATAR_COLORS[hashName(name)]
  const dimension = DIMENSION[size]
  const fontSize = FONT_SIZE[size]

  return (
    <View
      className="items-center justify-center"
      style={{
        width: dimension,
        height: dimension,
        borderRadius: 999,
        backgroundColor: bgColor,
      }}
    >
      <Text
        className="text-text-primary font-semibold"
        style={{ fontSize }}
      >
        {initials}
      </Text>
    </View>
  )
}
