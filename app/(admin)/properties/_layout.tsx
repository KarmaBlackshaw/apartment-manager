import { Stack } from 'expo-router'
import { darkStackOptions } from '../../../constants/navigation'

export default function PropertiesLayout() {
  return (
    <Stack screenOptions={darkStackOptions}>
      <Stack.Screen name="index"         options={{ title: 'Properties' }} />
      <Stack.Screen name="new"           options={{ title: 'Add Property', presentation: 'modal' }} />
      <Stack.Screen name="[propertyId]"  options={{ headerShown: false }} />
    </Stack>
  )
}
