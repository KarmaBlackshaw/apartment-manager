import { useCallback, useRef } from 'react'
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useTabBarVisibility } from '~/context/TabBarVisibilityContext'

export function useTabBarScrollHandler(threshold = 8) {
  const { setVisible } = useTabBarVisibility()
  const lastY = useRef<number>(0)
  const lastDir = useRef<'up' | 'down' | null>(null)

  useFocusEffect(
    useCallback(() => {
      setVisible(true)
      lastY.current = 0
      lastDir.current = null
    }, [setVisible]),
  )

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y

      if (y <= 0) {
        setVisible(true)
        lastDir.current = 'up'
      } else if (y - lastY.current > threshold && lastDir.current !== 'down') {
        setVisible(false)
        lastDir.current = 'down'
      } else if (lastY.current - y > threshold && lastDir.current !== 'up') {
        setVisible(true)
        lastDir.current = 'up'
      }

      lastY.current = y
    },
    [setVisible, threshold],
  )

  return { onScroll, scrollEventThrottle: 16 as const }
}
