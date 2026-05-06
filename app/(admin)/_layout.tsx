import { Tabs } from 'expo-router'
import { FloatingTabBar } from '../../components/admin/FloatingTabBar'
import { TabBarVisibilityProvider } from '../../context/TabBarVisibilityContext'
import { TenantSearchProvider, useTenantSearch } from '../../context/TenantSearchContext'
import { TenantQuickSearchModal } from '../../components/admin/TenantQuickSearchModal'

function GlobalTenantSearch() {
  const { isOpen, close } = useTenantSearch()
  return <TenantQuickSearchModal visible={isOpen} onClose={close} />
}

export default function AdminLayout() {
  return (
    <TenantSearchProvider>
      <TabBarVisibilityProvider>
        <Tabs
          tabBar={(props) => <FloatingTabBar {...props} />}
          screenOptions={{
            headerShown: false,
            // @ts-ignore — contentStyle is valid at runtime but missing from expo-router's TS types
            contentStyle: { paddingBottom: 88 },
          }}
        >
          <Tabs.Screen name="index"      options={{ title: 'Home' }} />
          <Tabs.Screen name="tenants"    options={{ title: 'Tenants' }} />
          <Tabs.Screen name="billing"    options={{ title: 'Billing' }} />
          <Tabs.Screen name="reports"    options={{ title: 'Reports' }} />
          <Tabs.Screen name="properties" options={{ href: null, title: 'Properties' }} />
          <Tabs.Screen name="payments"   options={{ href: null, title: 'Payments' }} />
          <Tabs.Screen name="settings"   options={{ href: null, title: 'Settings' }} />
        </Tabs>
        <GlobalTenantSearch />
      </TabBarVisibilityProvider>
    </TenantSearchProvider>
  )
}
