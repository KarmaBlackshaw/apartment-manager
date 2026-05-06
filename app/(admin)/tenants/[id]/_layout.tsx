import { Stack } from 'expo-router'
import { colors } from '../../../../constants/theme'

const darkHeader = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.textPrimary,
  headerShadowVisible: false,
  headerShown: false, // all screens in this group use ScreenHeader component
}

export default function TenantDetailLayout() {
  return (
    <Stack screenOptions={darkHeader}>
      <Stack.Screen name="index" />
      <Stack.Screen name="move-out" />
      <Stack.Screen name="payment-history" />
      <Stack.Screen name="documents" />
    </Stack>
  )
}
