import React from 'react'
import { ScrollView, View, Switch } from 'react-native'
import { useRouter } from 'expo-router'
import { useTabBarScrollHandler } from '~/hooks/useTabBarScrollHandler'
import { useAuth } from '~/context/AuthContext'
import { Button } from '~/components/ui/Button'
import { AppText } from '~/components/ui/AppText'
import { Card } from '~/components/ui/Card'
import { ScreenView } from '~/components/ui/ScreenView'
export default function SecuritySettingsScreen() {
  const router = useRouter()
  const tabBarScroll = useTabBarScrollHandler()
  const { isBiometricsEnabled, setBiometricsEnabled } = useAuth()

  return (
    <ScreenView>
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-32" {...tabBarScroll}>
        <Card className="mb-3">
          <View className="flex-row justify-between items-center">
            <View className="flex-1 mr-4">
              <AppText className="font-semibold">Biometric Login</AppText>
              <AppText color="secondary" variant="caption">Use Face ID or Touch ID to unlock</AppText>
            </View>
            <Switch
              value={isBiometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ true: '#3b82f6', false: '#2a2a2a' }}
              thumbColor="#f1f1f1"
            />
          </View>
        </Card>
        <Button label="Change PIN" variant="secondary" onPress={() => router.push('/setup-pin')} />
      </ScrollView>
    </ScreenView>
  )
}
