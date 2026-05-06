import React, { useState, useEffect } from 'react'
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTabBarScrollHandler } from '../../../../hooks/useTabBarScrollHandler'
import { useProperty, useUpdateProperty, useDeleteProperty } from '../../../../hooks/useProperties'
import { useUnits } from '../../../../hooks/useUnits'
import { Input, Button, AppText, LoadingSpinner, Card } from '../../../../components/ui'
import { UnitCard } from '../../../../components/admin/UnitCard'

export default function PropertyDetailScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>()
  const router = useRouter()
  const tabBarScroll = useTabBarScrollHandler()
  const { data: property, isLoading } = useProperty(propertyId)
  const { data: units } = useUnits(propertyId)
  const { mutateAsync: update, isPending: updating } = useUpdateProperty()
  const { mutateAsync: remove, isPending: deleting } = useDeleteProperty()

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<{ name?: string; address?: string }>({})

  useEffect(() => {
    if (property) {
      setName(property.name)
      setAddress(property.address)
      setDescription(property.description ?? '')
    }
  }, [property])

  if (isLoading) return <LoadingSpinner />
  if (!property) return (
    <View className="flex-1 items-center justify-center p-8 bg-app">
      <AppText color="danger" className="text-center">Property not found.</AppText>
    </View>
  )

  async function handleSave() {
    const errs: { name?: string; address?: string } = {}
    if (!name.trim()) errs.name = 'Property name is required'
    if (!address.trim()) errs.address = 'Address is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    try {
      await update({ id: propertyId, input: { name: name.trim(), address: address.trim(), description: description.trim() || null } })
      router.back()
    } catch {
      Alert.alert('Error', 'Could not save changes. Please try again.')
    }
  }

  function handleDelete() {
    Alert.alert('Delete Property', 'This will delete the property and all its units. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await remove(propertyId)
          router.back()
        } catch {
          Alert.alert('Error', 'Could not delete property. Please try again.')
        }
      } },
    ])
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-app">
      <ScrollView contentContainerClassName="p-4 pb-32" {...tabBarScroll}>
        <AppText variant="subheading" className="mb-4">Edit Property</AppText>
        <Input label="Property Name" value={name} onChangeText={setName} error={errors.name} />
        <Input label="Address" value={address} onChangeText={setAddress} error={errors.address} />
        <Input label="Description" value={description} onChangeText={setDescription} multiline numberOfLines={3} />
        <Button label="Save Changes" onPress={handleSave} loading={updating} className="mb-3" />

        <View className="flex-row items-center justify-between mb-3 mt-4">
          <AppText variant="subheading">Units ({units?.length ?? 0})</AppText>
          <Button label="Add Unit" size="sm" onPress={() => router.push(`/(admin)/properties/${propertyId}/units/new`)} />
        </View>
        {units?.map((unit) => (
          <UnitCard key={unit.id} unit={unit} onPress={() => router.push(`/(admin)/properties/${propertyId}/units/${unit.id}`)} />
        ))}

        <Button label="Delete Property" variant="danger" onPress={handleDelete} loading={deleting} className="mt-8" />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
