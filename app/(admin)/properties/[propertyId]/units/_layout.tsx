import { Stack } from 'expo-router'
import { darkStackOptions } from '../../../../../constants/navigation'

export default function UnitsLayout() {
  return (
    <Stack screenOptions={{ ...darkStackOptions, headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="new" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  )
}
