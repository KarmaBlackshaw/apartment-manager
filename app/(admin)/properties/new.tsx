import React, { useState } from 'react'
import { ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useTabBarScrollHandler } from '~/hooks/useTabBarScrollHandler'
import { useCreateProperty } from '~/hooks/useProperties'
import { Input } from '~/components/ui/Input'
import { Button } from '~/components/ui/Button'
import { ScreenLayout } from '~/layouts/ScreenLayout'

export default function NewPropertyScreen() {
  const router = useRouter()
  const tabBarScroll = useTabBarScrollHandler()
  const { mutateAsync, isPending } = useCreateProperty()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<{ name?: string; address?: string }>({})

  async function handleSubmit() {
    const errs: typeof errors = {}
    if (!name.trim()) errs.name = 'Property name is required'
    if (!address.trim()) errs.address = 'Address is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    try {
      await mutateAsync({ name: name.trim(), address: address.trim(), description: description.trim() || null })
      router.back()
    } catch (e) {
      console.error('[createProperty]', e)
      Alert.alert('Error', 'Could not save property. Please try again.')
    }
  }

  return (
    <ScreenLayout title="Add Property" backHref="/(admin)/properties">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerClassName="px-4 pt-3 pb-[88px]" {...tabBarScroll}>
          <Input label="Property Name" value={name} onChangeText={setName} error={errors.name} placeholder="e.g. Sunset Apartments" />
          <Input label="Address" value={address} onChangeText={setAddress} error={errors.address} placeholder="123 Main Street" />
          <Input label="Description (optional)" value={description} onChangeText={setDescription} multiline numberOfLines={3} placeholder="Additional notes..." />
          <Button label="Create Property" onPress={handleSubmit} loading={isPending} className="mt-4" />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  )
}
