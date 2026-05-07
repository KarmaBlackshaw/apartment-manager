import { Stack } from 'expo-router'

const darkHeader = {
  headerStyle: { backgroundColor: '#111111' },
  headerTintColor: '#f1f1f1',
  headerShadowVisible: false,
}

export default function BillingPaymentsLayout() {
  return (
    <Stack screenOptions={{ ...darkHeader, headerShown: false }}>
      <Stack.Screen name="[id]" />
    </Stack>
  )
}
