import React from 'react'
import { Text } from 'react-native'
import { cn } from '~/lib/utils'

interface SectionLabelProps {
  children: React.ReactNode
  className?: string
}

export function SectionLabel({ children, className = '' }: SectionLabelProps) {
  // @ts-ignore — className handled by NativeWind babel transform at runtime
  return (
    <Text
      className={cn(
        'text-text-secondary text-xs uppercase tracking-wider mb-2 mt-4 font-medium',
        className,
      )}
    >
      {children}
    </Text>
  )
}
