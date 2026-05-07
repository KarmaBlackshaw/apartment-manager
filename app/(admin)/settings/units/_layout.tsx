import { Stack } from 'expo-router'
import { darkStackOptions } from '~/constants/navigation'

export default function UnitsLayout() {
  return (
    <Stack screenOptions={{ ...darkStackOptions, headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="new"   options={{ presentation: 'modal' }} />
    </Stack>
  )
}
