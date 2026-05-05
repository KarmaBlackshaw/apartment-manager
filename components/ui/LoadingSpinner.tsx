import React from 'react'
import { View, ActivityIndicator } from 'react-native'

export function LoadingSpinner() {
  return (
    // @ts-ignore — className handled by NativeWind babel transform at runtime
    <View className="flex-1 items-center justify-center bg-app">
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  )
}
