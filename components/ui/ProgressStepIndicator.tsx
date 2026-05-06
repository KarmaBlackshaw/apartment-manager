import React from 'react'
import { View } from 'react-native'

interface ProgressStepIndicatorProps {
  steps: number
  current: number
}

export function ProgressStepIndicator({ steps, current }: ProgressStepIndicatorProps) {
  return (
    <View className="flex-row gap-1 w-full">
      {Array.from({ length: steps }, (_, i) => {
        const stepIndex = i + 1
        return (
          <View
            key={stepIndex}
            className={`flex-1 h-[3px] rounded-full ${stepIndex <= current ? 'bg-primary' : 'bg-border'}`}
          />
        )
      })}
    </View>
  )
}
