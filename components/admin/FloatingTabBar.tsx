import React, { useEffect, useState } from 'react'
import { Animated, Pressable, Text, StyleSheet, View } from 'react-native'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTabBarVisibility } from '../../context/TabBarVisibilityContext'
import { useTenantSearch } from '../../context/TenantSearchContext'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const ICONS: Record<string, { on: IoniconName; off: IoniconName }> = {
  index:      { on: 'home',       off: 'home-outline' },
  properties: { on: 'business',   off: 'business-outline' },
  tenants:    { on: 'people',     off: 'people-outline' },
  payments:   { on: 'cash',       off: 'cash-outline' },
  reports:    { on: 'bar-chart',  off: 'bar-chart-outline' },
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

  const visible = state.routes.filter((r) => !descriptors[r.key].options.tabBarButton)
  const activeKey = state.routes[state.index].key

  return (
    <Animated.View
      pointerEvents={pointerEvents}
      style={[styles.wrap, { bottom: insets.bottom + 10, opacity: visibility, transform: [{ translateY }] }]}
    >
      <View style={styles.tabs}>
        {visible.map((route) => {
          const focused = route.key === activeKey
          const icons = ICONS[route.name] ?? { on: 'apps', off: 'apps-outline' }
          const label = descriptors[route.key].options.title ?? route.name

          return (
            <Pressable
              key={route.key}
              style={styles.tab}
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
                color={focused ? '#3b82f6' : '#4a4a4a'}
              />
              <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
            </Pressable>
          )
        })}
      </View>

      <View style={styles.divider} />

      <Pressable
        style={styles.searchBtn}
        onPress={openSearch}
        accessibilityRole="button"
        accessibilityLabel="Search tenants"
      >
        <Ionicons name="search-outline" size={20} color="#4a4a4a" />
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161616',
    borderRadius: 36,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 14,
  },
  tabs: {
    flex: 1,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 2,
  },
  label: {
    fontSize: 9,
    fontWeight: '600',
    color: '#4a4a4a',
    letterSpacing: 0.3,
  },
  labelActive: {
    color: '#3b82f6',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#2a2a2a',
    marginHorizontal: 4,
  },
  searchBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
