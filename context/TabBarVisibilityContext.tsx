import React, { createContext, useContext, useRef, useMemo } from 'react'
import { Animated } from 'react-native'

interface TabBarVisibilityContextValue {
  visibility: Animated.Value
  setVisible: (v: boolean) => void
}

const TabBarVisibilityContext = createContext<TabBarVisibilityContextValue | null>(null)

export function TabBarVisibilityProvider({ children }: { children: React.ReactNode }) {
  const visibilityRef = useRef(new Animated.Value(1))

  const setVisible = (v: boolean) => {
    Animated.timing(visibilityRef.current, {
      toValue: v ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }

  const value = useMemo(() => ({
    visibility: visibilityRef.current,
    setVisible,
  }), [])

  return (
    <TabBarVisibilityContext.Provider value={value}>
      {children}
    </TabBarVisibilityContext.Provider>
  )
}

export function useTabBarVisibility() {
  const ctx = useContext(TabBarVisibilityContext)
  if (!ctx) throw new Error('useTabBarVisibility must be used within TabBarVisibilityProvider')
  return ctx
}
