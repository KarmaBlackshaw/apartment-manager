import { Stack } from 'expo-router'
import { darkStackOptions } from '~/constants/navigation'

export default function PropertiesLayout() {
  return (
    <Stack screenOptions={{ ...darkStackOptions, headerShown: false }}>
      <Stack.Screen name="index"         />
      <Stack.Screen name="new"           options={{ headerShown: true, title: 'Add Property', presentation: 'modal' }} />
      <Stack.Screen name="[propertyId]"  />
    </Stack>
  )
}
