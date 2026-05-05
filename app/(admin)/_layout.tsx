import { Tabs } from 'expo-router'
import { FloatingTabBar } from '../../components/admin/FloatingTabBar'
import { TabBarVisibilityProvider } from '../../context/TabBarVisibilityContext'

export default function AdminLayout() {
  return (
    <TabBarVisibilityProvider>
      <Tabs
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          // @ts-ignore — contentStyle is valid at runtime but missing from expo-router's TS types
          contentStyle: { paddingBottom: 88 },
        }}
      >
        <Tabs.Screen name="index"      options={{ title: 'Dashboard' }} />
        <Tabs.Screen name="tenants"    options={{ title: 'Tenants' }} />
        <Tabs.Screen name="billing"    options={{ title: 'Billing' }} />
        <Tabs.Screen name="settings"   options={{ title: 'Settings' }} />
        <Tabs.Screen name="properties" options={{ href: null, title: 'Properties' }} />
      </Tabs>
    </TabBarVisibilityProvider>
  )
}
