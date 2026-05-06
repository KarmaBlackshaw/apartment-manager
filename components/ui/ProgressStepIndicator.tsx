import React from 'react'
import { View, StyleSheet } from 'react-native'
import { colors, radius } from '../../constants/theme'

interface ProgressStepIndicatorProps {
  steps: number
  current: number
}

export function ProgressStepIndicator({ steps, current }: ProgressStepIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: steps }, (_, i) => {
        const stepIndex = i + 1
        return (
          <View
            key={stepIndex}
            style={[
              styles.bar,
              stepIndex <= current ? styles.barActive : styles.barInactive,
            ]}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
    width: '100%',
  },
  bar: {
    flex: 1,
    height: 3,
    borderRadius: radius.pill,
  },
  barActive: {
    backgroundColor: colors.primary,
  },
  barInactive: {
    backgroundColor: colors.border,
  },
})
