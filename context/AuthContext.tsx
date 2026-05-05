import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import * as LocalAuthentication from 'expo-local-authentication'

const PIN_KEY = 'admin_pin'
const BIOMETRICS_KEY = 'biometrics_enabled'

interface AuthContextValue {
  isAuthenticated: boolean
  hasPin: boolean
  authenticate: () => Promise<boolean>
  lock: () => void
  setupPin: (pin: string) => Promise<void>
  verifyPin: (pin: string) => Promise<boolean>
  clearPin: () => Promise<void>
  isBiometricsEnabled: boolean
  setBiometricsEnabled: (val: boolean) => Promise<void>
  checkHasPin: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasPin, setHasPin] = useState(false)
  const [isBiometricsEnabled, setIsBiometricsEnabledState] = useState(true)
  const appState = useRef(AppState.currentState)
  const backgroundedAt = useRef<number | null>(null)
  const AUTH_CACHE_MS = 60_000

  const checkHasPin = useCallback(async () => {
    const stored = await SecureStore.getItemAsync(PIN_KEY)
    setHasPin(!!stored)
    const bioSetting = await SecureStore.getItemAsync(BIOMETRICS_KEY)
    setIsBiometricsEnabledState(bioSetting !== 'false')
  }, [])

  const lock = useCallback(() => {
    setIsAuthenticated(false)
  }, [])

  const setupPin = useCallback(async (pin: string) => {
    await SecureStore.setItemAsync(PIN_KEY, pin)
    setHasPin(true)
  }, [])

  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    const stored = await SecureStore.getItemAsync(PIN_KEY)
    return stored === pin
  }, [])

  const clearPin = useCallback(async () => {
    await SecureStore.deleteItemAsync(PIN_KEY)
    setHasPin(false)
  }, [])

  const setBiometricsEnabled = useCallback(async (val: boolean) => {
    await SecureStore.setItemAsync(BIOMETRICS_KEY, String(val))
    setIsBiometricsEnabledState(val)
  }, [])

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (isBiometricsEnabled) {
      const compatible = await LocalAuthentication.hasHardwareAsync()
      const enrolled = await LocalAuthentication.isEnrolledAsync()
      if (compatible && enrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to continue',
          fallbackLabel: 'Use PIN',
          disableDeviceFallback: true,
        })
        if (result.success) {
          setIsAuthenticated(true)
          return true
        }
      }
    }
    return false
  }, [isBiometricsEnabled])

  React.useEffect(() => {
    checkHasPin()
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      const prev = appState.current
      if (prev === 'active' && next.match(/inactive|background/)) {
        if (backgroundedAt.current === null) backgroundedAt.current = Date.now()
      } else if (prev.match(/inactive|background/) && next === 'active') {
        if (backgroundedAt.current !== null && Date.now() - backgroundedAt.current > AUTH_CACHE_MS) {
          lock()
        }
        backgroundedAt.current = null
      }
      appState.current = next
    })
    return () => sub.remove()
  }, [checkHasPin, lock])

  return (
    <AuthContext.Provider value={{
      isAuthenticated, hasPin, authenticate, lock,
      setupPin, verifyPin, clearPin,
      isBiometricsEnabled, setBiometricsEnabled, checkHasPin,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
