import React, { useState, useEffect } from 'react'
import { ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useTabBarScrollHandler } from '~/hooks/useTabBarScrollHandler'
import { useSettings, useUpdateSetting } from '~/hooks/useSettings'
import { Input } from '~/components/ui/Input'
import { Button } from '~/components/ui/Button'
import { LoadingSpinner } from '~/components/ui/LoadingSpinner'
import { ScreenView } from '~/components/ui/ScreenView'
export default function GeneralSettingsScreen() {
  const tabBarScroll = useTabBarScrollHandler()
  const { data: settings, isLoading } = useSettings()
  const { mutateAsync: save, isPending } = useUpdateSetting()

  const [apartmentName, setApartmentName] = useState('')
  const [ownerName, setOwnerName] = useState('')

  useEffect(() => {
    if (!settings) return
    setApartmentName(settings.apartment_name)
    setOwnerName(settings.owner_name)
  }, [settings])

  async function handleSave() {
    try {
      await save({ key: 'apartment_name', value: apartmentName.trim() })
      await save({ key: 'owner_name', value: ownerName.trim() })
      Alert.alert('Saved', 'General settings updated.')
    } catch {
      Alert.alert('Error', 'Could not save settings.')
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <ScreenView>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerClassName="p-4 pb-32" {...tabBarScroll}>
          <Input label="Apartment Name" value={apartmentName} onChangeText={setApartmentName} placeholder="My Apartment" />
          <Input label="Owner Name" value={ownerName} onChangeText={setOwnerName} placeholder="Juan dela Cruz" />
          <Button label="Save" onPress={handleSave} loading={isPending} className="mt-4" />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenView>
  )
}
