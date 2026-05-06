import React, { useState } from 'react'
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCreateUnit } from '../../../../../hooks/useUnits'
import { useHideTabBar } from '../../../../../hooks/useHideTabBar'
import { Input, Button, AppText, AppHeader } from '../../../../../components/ui'
import { AmenityChipSelector } from '../../../../../components/properties/AmenityChipSelector'
import type { UnitType } from '../../../../../types'

const UNIT_TYPES: { value: UnitType; label: string }[] = [
  { value: 'studio', label: 'Studio' },
  { value: '1br', label: '1BR' },
  { value: '2br', label: '2BR' },
  { value: 'bedspacer', label: 'Bedspacer' },
]

export default function NewUnitScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>()
  const router = useRouter()
  const { mutateAsync, isPending } = useCreateUnit(propertyId)
  useHideTabBar()

  const [unitNumber, setUnitNumber] = useState('')
  const [floor, setFloor] = useState('')
  const [sizeSqm, setSizeSqm] = useState('')
  const [unitType, setUnitType] = useState<UnitType>('studio')
  const [monthlyRent, setMonthlyRent] = useState('')
  const [billingDay, setBillingDay] = useState('1')
  const [amenities, setAmenities] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  function toggleAmenity(a: string) {
    setAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    )
  }

  async function handleSubmit() {
    const errs: Record<string, string> = {}
    if (!unitNumber.trim()) errs.unitNumber = 'Unit number / name is required'
    if (!monthlyRent || isNaN(parseFloat(monthlyRent))) errs.monthlyRent = 'Monthly rent is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    try {
      await mutateAsync({
        property_id: propertyId,
        unit_number: unitNumber.trim(),
        floor: floor ? parseInt(floor) : null,
        bedrooms: 1,
        bathrooms: 1,
        billing_type: 'monthly',
        monthly_rate: parseFloat(monthlyRent),
        daily_rate: null,
        unit_type: unitType,
        amenities: JSON.stringify(amenities),
        size_sqm: sizeSqm ? parseFloat(sizeSqm) : null,
        billing_day: billingDay ? parseInt(billingDay) : 1,
      })
      router.back()
    } catch {
      Alert.alert('Error', 'Could not create unit. Please try again.')
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-app"
    >
      <AppHeader title="Add Unit" />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <Input
          label="Unit number / name"
          value={unitNumber}
          onChangeText={setUnitNumber}
          error={errors.unitNumber}
          placeholder="Unit 1A"
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label="Floor"
              value={floor}
              onChangeText={setFloor}
              keyboardType="number-pad"
              placeholder="1"
            />
          </View>
          <View className="flex-1">
            <Input
              label="Size (sqm)"
              value={sizeSqm}
              onChangeText={setSizeSqm}
              keyboardType="decimal-pad"
              placeholder="Optional"
            />
          </View>
        </View>

        <AppText variant="label" color="secondary" className="mb-2 mt-1">Unit type</AppText>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {UNIT_TYPES.map((type) => (
            <Button
              key={type.value}
              label={type.label}
              size="sm"
              variant={unitType === type.value ? 'primary' : 'secondary'}
              onPress={() => setUnitType(type.value)}
              className="flex-1 min-w-[44%]"
            />
          ))}
        </View>

        <Input
          label="Monthly rent (₱)"
          value={monthlyRent}
          onChangeText={setMonthlyRent}
          keyboardType="decimal-pad"
          placeholder="3,500"
          error={errors.monthlyRent}
        />

        <Input
          label="Billing day"
          value={billingDay}
          onChangeText={setBillingDay}
          keyboardType="number-pad"
          placeholder="1st of month"
        />

        <AppText variant="label" color="secondary" className="mb-2 mt-1">Amenities</AppText>
        <AmenityChipSelector selected={amenities} onToggle={toggleAmenity} />

        <Button
          label="Save Unit"
          onPress={handleSubmit}
          loading={isPending}
          className="mt-6"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
