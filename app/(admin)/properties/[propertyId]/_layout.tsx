import { Stack } from 'expo-router'
import { darkStackOptions } from '../../../../constants/navigation'

export default function PropertyLayout() {
  return (
    <Stack screenOptions={{ ...darkStackOptions, headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="edit" options={{ ...darkStackOptions, headerShown: false }} />
      <Stack.Screen name="units" options={{ headerShown: false }} />
    </Stack>
  )
}
