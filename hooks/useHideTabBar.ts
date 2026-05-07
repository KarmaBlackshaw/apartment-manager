import { useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { useTabBarVisibility } from '~/context/TabBarVisibilityContext'

export function useHideTabBar() {
  const { setVisible } = useTabBarVisibility()
  useFocusEffect(
    useCallback(() => {
      setVisible(false)
      return () => setVisible(true)
    }, [setVisible]),
  )
}
