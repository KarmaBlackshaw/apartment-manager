import React from 'react'
import { View, ViewProps } from 'react-native'

export function Card({ children, className = '', ...props }: ViewProps & { children: React.ReactNode; className?: string }) {
  return (
    // @ts-ignore — className handled by NativeWind babel transform at runtime
    <View className={`bg-surface rounded-2xl p-4 border border-[#2a2a2a] ${className}`} {...props}>
      {children}
    </View>
  )
}
