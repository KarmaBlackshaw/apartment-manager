import React from 'react'
import { View, TextInput, TextInputProps } from 'react-native'
import { AppText } from '~/components/ui/AppText'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  hint?: string
  className?: string
}

export function Input({ label, error, hint, className = '', ...props }: InputProps) {
  return (
    // @ts-ignore — className handled by NativeWind babel transform at runtime
    <View className="mb-4">
      {label && <AppText variant="label" color="secondary" className="mb-2">{label}</AppText>}
      <TextInput
        // @ts-ignore — className handled by NativeWind babel transform at runtime
        className={`border rounded-xl px-4 py-4 text-base text-[#f1f1f1] bg-surface ${error ? 'border-danger' : 'border-[#2a2a2a]'} ${className}`}
        placeholderTextColor="#555555"
        {...props}
      />
      {error && <AppText variant="caption" color="danger" className="mt-1">{error}</AppText>}
      {hint && !error && <AppText variant="caption" color="muted" className="mt-1">{hint}</AppText>}
    </View>
  )
}
