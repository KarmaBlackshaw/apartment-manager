import { Stack } from 'expo-router'
import { darkStackOptions } from '~/constants/navigation'

export default function UnitLayout() {
  return (
    <Stack screenOptions={{ ...darkStackOptions, headerShown: false }} />
  )
}
