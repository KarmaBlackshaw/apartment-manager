import { Stack } from 'expo-router'

const darkHeader = {
  headerStyle: { backgroundColor: '#111111' },
  headerTintColor: '#f1f1f1',
  headerShadowVisible: false,
}

export default function UnitsLayout() {
  return (
    <Stack screenOptions={darkHeader}>
      <Stack.Screen name="index" options={{ title: 'Units' }} />
      <Stack.Screen name="new" options={{ title: 'Add Unit', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Unit' }} />
    </Stack>
  )
}
