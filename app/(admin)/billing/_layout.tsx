import { Stack } from 'expo-router'

const darkHeader = {
  headerStyle: { backgroundColor: '#111111' },
  headerTintColor: '#f1f1f1',
  headerShadowVisible: false,
}

export default function BillingLayout() {
  return (
    <Stack screenOptions={darkHeader}>
      <Stack.Screen name="index" options={{ title: 'Billing' }} />
      <Stack.Screen name="new" options={{ title: 'New Bill', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Bill' }} />
    </Stack>
  )
}
