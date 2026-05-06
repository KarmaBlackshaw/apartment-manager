import { Stack } from 'expo-router'
import { darkStackOptions } from '../../../../../../constants/navigation'

export default function UnitLayout() {
  return (
    <Stack screenOptions={{ ...darkStackOptions, headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="bed-map" options={{ headerShown: false }} />
      <Stack.Screen name="documents" options={{ headerShown: false }} />
    </Stack>
  )
}
