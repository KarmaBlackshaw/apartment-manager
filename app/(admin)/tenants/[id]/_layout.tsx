import { Stack } from 'expo-router'
import { darkStackOptions } from '~/constants/navigation'

export default function TenantDetailLayout() {
  return (
    <Stack screenOptions={{ ...darkStackOptions, headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="move-out" />
      <Stack.Screen name="payment-history" />
      <Stack.Screen name="documents" />
    </Stack>
  )
}
