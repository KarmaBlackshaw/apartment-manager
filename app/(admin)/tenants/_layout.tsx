import { Stack } from 'expo-router'
import { darkStackOptions } from '../../../constants/navigation'

export default function TenantsLayout() {
  return (
    <Stack screenOptions={darkStackOptions}>
      <Stack.Screen name="index" options={{ title: 'Tenants' }} />
      <Stack.Screen name="new"   options={{ title: 'Add Tenant', presentation: 'modal' }} />
      <Stack.Screen name="[id]"  options={{ headerShown: false }} />
    </Stack>
  )
}
