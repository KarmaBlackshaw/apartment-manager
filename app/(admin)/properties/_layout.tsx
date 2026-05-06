import { Stack } from 'expo-router'

const darkHeader = {
  headerStyle: { backgroundColor: '#111111' },
  headerTintColor: '#f1f1f1',
  headerShadowVisible: false,
}

export default function PropertiesLayout() {
  return (
    <Stack screenOptions={darkHeader}>
      <Stack.Screen name="index" options={{ title: 'Properties' }} />
      <Stack.Screen name="new" options={{ title: 'Add Property', presentation: 'modal' }} />
      <Stack.Screen name="[propertyId]" options={{ headerShown: false }} />
    </Stack>
  )
}
