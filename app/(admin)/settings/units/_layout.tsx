import { Stack } from 'expo-router'
import { darkStackOptions } from '~/constants/navigation'

export default function UnitsLayout() {
  return (
    <Stack screenOptions={darkStackOptions}>
      <Stack.Screen name="index" options={{ title: 'Units' }} />
      <Stack.Screen name="new"   options={{ title: 'Add Unit', presentation: 'modal' }} />
    </Stack>
  )
}
