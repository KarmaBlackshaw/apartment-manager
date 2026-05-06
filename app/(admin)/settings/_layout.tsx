import { View } from 'react-native'
import { Stack } from 'expo-router'
import { darkStackOptions } from '../../../constants/navigation'

export default function SettingsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0d0d0d' }}>
      <Stack screenOptions={darkStackOptions}>
        <Stack.Screen name="index"    options={{ headerShown: false }} />
        <Stack.Screen name="general"  options={{ title: 'General' }} />
        <Stack.Screen name="rates"    options={{ title: 'Rates' }} />
        <Stack.Screen name="security" options={{ title: 'Security' }} />
        <Stack.Screen name="units"    options={{ headerShown: false }} />
      </Stack>
    </View>
  )
}
