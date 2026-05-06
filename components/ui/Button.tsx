import React from 'react'
import { TouchableOpacity, ActivityIndicator, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import Ionicons from '@expo/vector-icons/Ionicons'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'hero'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: Variant
  size?: Size
  disabled?: boolean
  loading?: boolean
  className?: string
  icon?: React.ComponentProps<typeof Ionicons>['name']
}

const bg: Record<Variant, string> = {
  primary:   'bg-primary active:bg-primary-dark',
  secondary: 'bg-elevated active:bg-[#2a2a2a]',
  ghost:     'bg-transparent',
  danger:    'bg-danger',
  hero:      'bg-white active:bg-gray-100',
}
const txtColor: Record<Variant, string> = {
  primary:   'text-white',
  secondary: 'text-[#f1f1f1]',
  ghost:     'text-primary',
  danger:    'text-white',
  hero:      'text-black',
}
const radius: Record<Variant, string> = {
  primary:   'rounded-xl',
  secondary: 'rounded-xl',
  ghost:     'rounded-xl',
  danger:    'rounded-xl',
  hero:      'rounded-full',
}
const padding: Record<Size, string> = {
  sm: 'px-3 py-2.5',
  md: 'px-5 py-4',
  lg: 'px-6 py-5',
}
const txtSize: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}
const iconColor: Record<Variant, string> = {
  primary:   '#fff',
  secondary: '#f1f1f1',
  ghost:     '#3b82f6',
  danger:    '#fff',
  hero:      '#000',
}
const iconSize: Record<Size, number> = { sm: 16, md: 18, lg: 20 }

export function Button({
  label, onPress, variant = 'primary', size = 'md',
  disabled = false, loading = false, className = '',
  icon,
}: ButtonProps) {
  const handlePress = () => {
    if (variant === 'primary' || variant === 'danger') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }
    onPress()
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      // @ts-ignore — className handled by NativeWind babel transform at runtime
      className={`${radius[variant]} items-center justify-center ${bg[variant]} ${padding[size]} ${(disabled || loading) ? 'opacity-50' : ''} ${className}`}
    >
      {loading
        ? <ActivityIndicator testID="btn-loading" size="small" color={variant === 'primary' || variant === 'danger' ? '#fff' : variant === 'hero' ? '#000' : '#3b82f6'} />
        : (
          <View className="flex-row items-center gap-2">
            {icon && <Ionicons name={icon} size={iconSize[size]} color={iconColor[variant]} />}
            <Text className={`font-semibold ${variant === 'hero' ? 'uppercase tracking-widest' : ''} ${txtColor[variant]} ${txtSize[size]}`}>
              {label}
            </Text>
          </View>
        )
      }
    </TouchableOpacity>
  )
}
