import { Stack } from 'expo-router'

const darkHeader = {
  headerStyle: { backgroundColor: '#111111' },
  headerTintColor: '#f1f1f1',
  headerShadowVisible: false,
}

export default function BillingLayout() {
  return (
    <Stack screenOptions={darkHeader}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="new" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="receipt" options={{ headerShown: false }} />
      <Stack.Screen name="utility" options={{ headerShown: false }} />
      <Stack.Screen name="generate" options={{ headerShown: false }} />
      <Stack.Screen name="payments" options={{ headerShown: false }} />
    </Stack>
  )
}
