import { Stack } from 'expo-router'
import { darkStackOptions } from '../../../constants/navigation'

export default function BillingLayout() {
  return (
    <Stack screenOptions={darkStackOptions}>
      <Stack.Screen name="index"    />
      <Stack.Screen name="new"      options={{ presentation: 'modal' }} />
      <Stack.Screen name="[id]"     />
      <Stack.Screen name="receipt"  />
      <Stack.Screen name="utility"  />
      <Stack.Screen name="generate" />
      <Stack.Screen name="payments" options={{ headerShown: false }} />
    </Stack>
  )
}
