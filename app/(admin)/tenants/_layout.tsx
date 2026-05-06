import { Stack } from 'expo-router'

const darkHeader = {
  headerStyle: { backgroundColor: '#111111' },
  headerTintColor: '#f1f1f1',
  headerShadowVisible: false,
}

export default function TenantsLayout() {
  return (
    <Stack screenOptions={darkHeader}>
      <Stack.Screen name="index" options={{ title: 'Tenants' }} />
      <Stack.Screen name="new" options={{ title: 'Add Tenant', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  )
}
