import React, { useEffect, useState } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTabBarVisibility } from '~/context/TabBarVisibilityContext'
import { useTenantSearch } from '~/context/TenantSearchContext'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const ICONS: Record<string, { on: IoniconName; off: IoniconName }> = {
  index:      { on: 'home',      off: 'home-outline' },
  tenants:    { on: 'people',    off: 'people-outline' },
  billing:    { on: 'card',      off: 'card-outline' },
  properties: { on: 'business',  off: 'business-outline' },
  reports:    { on: 'bar-chart', off: 'bar-chart-outline' },
}

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const { visibility } = useTabBarVisibility()
  const { open: openSearch } = useTenantSearch()
  const [pointerEvents, setPointerEvents] = useState<'auto' | 'none'>('auto')

  const translateY = visibility.interpolate({ inputRange: [0, 1], outputRange: [120, 0] })

  useEffect(() => {
    const id = visibility.addListener(({ value }) => {
      setPointerEvents(value <= 0.05 ? 'none' : 'auto')
    })
    return () => visibility.removeListener(id)
  }, [visibility])

  const visible = state.routes.filter((r) => {
    const opts = descriptors[r.key].options as any
    return !opts.tabBarButton && opts.href !== null
  })
  const activeKey = state.routes[state.index].key

  return (
    <Animated.View
      pointerEvents={pointerEvents}
      style={{
        bottom: insets.bottom + 10,
        opacity: visibility,
        transform: [{ translateY }],
      }}
      className="absolute left-4 right-4 flex-row items-center bg-[#161616] rounded-[36px] py-[10px] px-2 border border-[#2a2a2a]"
    >
      <View className="flex-1 flex-row">
        {visible.map((route) => {
          const focused = route.key === activeKey
          const icons = ICONS[route.name] ?? { on: 'apps', off: 'apps-outline' }
          const label = descriptors[route.key].options.title ?? route.name

          return (
            <Pressable
              key={route.key}
              className="flex-1 items-center justify-center gap-[3px] py-[2px]"
              onPress={() => {
                const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
                if (!focused && !e.defaultPrevented) navigation.navigate(route.name)
              }}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
            >
              <Ionicons
                name={focused ? icons.on : icons.off}
                size={20}
                color={focused ? '#3b82f6' : '#64748B'}
              />
              <Text className={`text-[9px] font-semibold tracking-[0.3px] ${focused ? 'text-[#3b82f6]' : 'text-[#64748B]'}`}>
                {label}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <View className="w-px h-7 bg-[#2a2a2a] mx-1" />

      <Pressable
        className="w-11 h-11 items-center justify-center"
        onPress={openSearch}
        accessibilityRole="button"
        accessibilityLabel="Search tenants"
      >
        <Ionicons name="search-outline" size={20} color="#4a4a4a" />
      </Pressable>
    </Animated.View>
  )
}
