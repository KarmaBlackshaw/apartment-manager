import React, { type ReactNode } from 'react'
import { View, Pressable } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { cn } from '~/lib/utils'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type CardSize = 'sm' | 'md' | 'lg'
type CardRadius = 'sm' | 'md' | 'lg' | 'pill'

interface CardProps {
  children: ReactNode
  /** Padding scale. sm = px-4 py-3 · md = px-4 py-3.5 (default) · lg = p-4 */
  size?: CardSize
  /** Border-radius scale. sm = 8px · md = 12px (default) · lg = 16px · pill = 9999px */
  radius?: CardRadius
  accentBorder?: { side: 'left' | 'top'; color: string; width?: number }
  onPress?: () => void
  className?: string
  accessibilityLabel?: string
}

const SIZE_CLASSES: Record<CardSize, string> = {
  sm: 'px-4 py-3',
  md: 'px-4 py-3.5',
  lg: 'p-4',
}

const RADIUS_CLASSES: Record<CardRadius, string> = {
  sm:   'rounded-lg',   // 8px  — tight chips, dense rows
  md:   'rounded-xl',   // 12px — standard cards
  lg:   'rounded-2xl',  // 16px — sheets, hero cards
  pill: 'rounded-full', // 9999px — pill-shaped surfaces
}

export function Card({
  children,
  size = 'md',
  radius = 'md',
  accentBorder,
  onPress,
  className,
  accessibilityLabel,
}: CardProps) {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const accentStyle = accentBorder
    ? accentBorder.side === 'left'
      ? { borderLeftColor: accentBorder.color, borderLeftWidth: accentBorder.width ?? 3 }
      : { borderTopColor: accentBorder.color, borderTopWidth: accentBorder.width ?? 2 }
    : undefined

  const baseClassName = cn('bg-surface', RADIUS_CLASSES[radius], SIZE_CLASSES[size], className)

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => { scale.value = withTiming(0.97, { duration: 100 }) }}
        onPressOut={() => { scale.value = withTiming(1, { duration: 150 }) }}
        style={[animatedStyle, accentStyle]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        className={baseClassName}
      >
        {children}
      </AnimatedPressable>
    )
  }

  return (
    <View style={accentStyle} className={baseClassName}>
      {children}
    </View>
  )
}
