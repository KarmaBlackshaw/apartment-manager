import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'

export default function SetupPinScreen() {
  const router = useRouter()
  const { setupPin } = useAuth()
  const insets = useSafeAreaInsets()
  const [step, setStep] = useState<'enter' | 'confirm'>('enter')
  const [first, setFirst] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  function handleKey(key: string) {
    if (pin.length >= 6) return
    const next = pin + key
    setPin(next)
    setError('')
    if (next.length === 6) {
      if (step === 'enter') {
        setFirst(next)
        setPin('')
        setStep('confirm')
      } else {
        if (next === first) {
          setupPin(next).then(() => router.replace('/(admin)/' as any))
        } else {
          setPin('')
          setFirst('')
          setStep('enter')
          setError('PINs did not match. Try again.')
        }
      }
    }
  }

  function handleDelete() {
    setPin((p) => p.slice(0, -1))
    setError('')
  }

  const dots = Array.from({ length: 6 }, (_, i) => i < pin.length)

  return (
    <View className="flex-1 bg-app items-center justify-center px-8" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <Text className="text-[#f1f1f1] text-2xl font-bold mb-2">
        {step === 'enter' ? 'Set PIN' : 'Confirm PIN'}
      </Text>
      <Text className="text-[#888888] text-sm mb-10">
        {step === 'enter' ? 'Choose a 6-digit PIN' : 'Enter your PIN again'}
      </Text>

      <View className="flex-row gap-4 mb-8">
        {dots.map((filled, i) => (
          <View key={i} className={`w-4 h-4 rounded-full ${filled ? 'bg-primary' : 'bg-elevated border border-[#2a2a2a]'}`} />
        ))}
      </View>

      {error ? <Text className="text-danger text-sm mb-4">{error}</Text> : <View className="h-6 mb-4" />}

      <View className="w-full max-w-[280px] gap-3">
        {[['1','2','3'],['4','5','6'],['7','8','9']].map((row, ri) => (
          <View key={ri} className="flex-row gap-3">
            {row.map((k) => (
              <TouchableOpacity key={k} onPress={() => handleKey(k)}
                className="flex-1 h-16 bg-surface rounded-2xl items-center justify-center border border-[#2a2a2a]">
                <Text className="text-[#f1f1f1] text-2xl font-semibold">{k}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <View className="flex-row gap-3">
          <View className="flex-1 h-16" />
          <TouchableOpacity onPress={() => handleKey('0')}
            className="flex-1 h-16 bg-surface rounded-2xl items-center justify-center border border-[#2a2a2a]">
            <Text className="text-[#f1f1f1] text-2xl font-semibold">0</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}
            className="flex-1 h-16 bg-surface rounded-2xl items-center justify-center border border-[#2a2a2a]">
            <Text className="text-[#f1f1f1] text-xl">⌫</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
