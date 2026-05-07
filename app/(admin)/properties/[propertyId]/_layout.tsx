import { Stack } from 'expo-router'
import { darkStackOptions } from '~/constants/navigation'

export default function PropertyLayout() {
  return (
    <Stack screenOptions={{ ...darkStackOptions, headerShown: false }} />
  )
}
