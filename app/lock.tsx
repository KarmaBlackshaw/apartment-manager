import React, { useState, useEffect } from 'react'
import { View, Text, Pressable, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '~/context/AuthContext'
import { ScreenView } from '~/components/ui/ScreenView'
export default function LockScreen() {
  const router = useRouter()
  const { authenticate, verifyPin, isAuthenticated, clearPin } = useAuth()
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(admin)/' as any)
      return
    }
    attemptBiometric()
  }, [])

  async function attemptBiometric() {
    const ok = await authenticate()
    if (ok) router.replace('/(admin)/' as any)
    else setShowPin(true)
  }

  function handleKey(key: string) {
    if (pin.length >= 6) return
    const next = pin + key
    setPin(next)
    setError('')
    if (next.length === 6) submit(next)
  }

  function handleDelete() {
    setPin((p) => p.slice(0, -1))
    setError('')
  }

  async function submit(code: string) {
    const ok = await verifyPin(code)
    if (ok) {
      router.replace('/(admin)/' as any)
    } else {
      setPin('')
      setError('Incorrect PIN')
    }
  }

  function handleForgot() {
    Alert.alert(
      'Forgot PIN',
      'This will clear your PIN and require setup again. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset PIN', style: 'destructive',
          onPress: async () => {
            await clearPin()
            router.replace('/setup-pin')
          },
        },
      ]
    )
  }

  const dots = Array.from({ length: 6 }, (_, i) => i < pin.length)

  return (
    <ScreenView className="items-center justify-center px-8">
      <Text className="text-[#f1f1f1] text-2xl font-bold mb-2">Enter PIN</Text>
      <Text className="text-[#888888] text-sm mb-10">Apartment Manager</Text>

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
              <Pressable key={k} onPress={() => handleKey(k)}
                className="flex-1 h-16 bg-surface rounded-2xl items-center justify-center border border-[#2a2a2a]">
                <Text className="text-[#f1f1f1] text-2xl font-semibold">{k}</Text>
              </Pressable>
            ))}
          </View>
        ))}
        <View className="flex-row gap-3">
          <Pressable
            onPress={() => { setShowPin(false); attemptBiometric() }}
            accessibilityLabel="Use biometric authentication"
            className="flex-1 h-16 bg-surface rounded-2xl items-center justify-center border border-[#2a2a2a]"
          >
            <Text className="text-primary text-sm font-medium">Biometric</Text>
          </Pressable>
          <Pressable onPress={() => handleKey('0')}
            className="flex-1 h-16 bg-surface rounded-2xl items-center justify-center border border-[#2a2a2a]">
            <Text className="text-[#f1f1f1] text-2xl font-semibold">0</Text>
          </Pressable>
          <Pressable
            onPress={handleDelete}
            accessibilityLabel="Delete last digit"
            className="flex-1 h-16 bg-surface rounded-2xl items-center justify-center border border-[#2a2a2a]"
          >
            <Text className="text-[#f1f1f1] text-xl">⌫</Text>
          </Pressable>
        </View>
      </View>

      <Pressable onPress={handleForgot} className="mt-10">
        <Text className="text-[#888888] text-sm">Forgot PIN?</Text>
      </Pressable>
    </ScreenView>
  )
}
