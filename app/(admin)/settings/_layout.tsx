import { View } from 'react-native'
import { Stack } from 'expo-router'
import { darkStackOptions } from '~/constants/navigation'

export default function SettingsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0d0d0d' }}>
      <Stack screenOptions={darkStackOptions}>
        <Stack.Screen name="index"          options={{ headerShown: false }} />
        <Stack.Screen name="rates"          options={{ title: 'Rates' }} />
        <Stack.Screen name="security"       options={{ title: 'Security' }} />
        <Stack.Screen name="apartment-name" options={{ headerShown: false }} />
        <Stack.Screen name="address"        options={{ headerShown: false }} />
        <Stack.Screen name="billing-day"    options={{ headerShown: false }} />
        <Stack.Screen name="late-fee"       options={{ headerShown: false }} />
      </Stack>
    </View>
  )
}
