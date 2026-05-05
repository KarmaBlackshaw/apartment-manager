import React, { useState, useMemo } from 'react'
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert, StatusBar } from 'react-native'
import { useRouter } from 'expo-router'
import { useTabBarScrollHandler } from '../../../../hooks/useTabBarScrollHandler'
import { useCreateUnit } from '../../../../hooks/useUnits'
import { useProperties } from '../../../../hooks/useProperties'
import { Input, Button, AppText, Select } from '../../../../components/ui'
import type { BillingType } from '../../../../types'

export default function NewUnitScreen() {
  const router = useRouter()
  const tabBarScroll = useTabBarScrollHandler()
  const { data: properties } = useProperties()

  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const { mutateAsync, isPending } = useCreateUnit(selectedPropertyId)

  const [unitNumber, setUnitNumber] = useState('')
  const [floor, setFloor] = useState('')
  const [bedrooms, setBedrooms] = useState('1')
  const [bathrooms, setBathrooms] = useState('1')
  const [billingType, setBillingType] = useState<BillingType>('monthly')
  const [monthlyRate, setMonthlyRate] = useState('')
  const [dailyRate, setDailyRate] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const propertyOptions = useMemo(
    () => (properties ?? []).map((p) => ({ value: p.id, label: p.name })),
    [properties],
  )

  async function handleSubmit() {
    const errs: Record<string, string> = {}
    if (!selectedPropertyId) errs.property = 'Please select a property'
    if (!unitNumber.trim()) errs.unitNumber = 'Unit number is required'
    if (billingType === 'monthly' && !monthlyRate) errs.rate = 'Monthly rate is required'
    if (billingType === 'daily' && !dailyRate) errs.rate = 'Daily rate is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    try {
      await mutateAsync({
        property_id: selectedPropertyId,
        unit_number: unitNumber.trim(),
        floor: floor ? parseInt(floor) : null,
        bedrooms: parseInt(bedrooms) || 1,
        bathrooms: parseInt(bathrooms) || 1,
        billing_type: billingType,
        monthly_rate: billingType === 'monthly' ? parseFloat(monthlyRate) : null,
        daily_rate: billingType === 'daily' ? parseFloat(dailyRate) : null,
      })
      router.back()
    } catch {
      Alert.alert('Error', 'Could not create unit. Please try again.')
    }
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0}
      className="flex-1 bg-app"
    >
      <ScrollView contentContainerClassName="p-4 pb-32" keyboardShouldPersistTaps="handled" {...tabBarScroll}>
        <Select
          label="Property"
          placeholder="Select a property…"
          options={propertyOptions}
          value={selectedPropertyId}
          onChange={setSelectedPropertyId}
          error={errors.property}
        />
        <Input label="Unit Number" value={unitNumber} onChangeText={setUnitNumber} error={errors.unitNumber} placeholder="e.g. 101" />
        <Input label="Floor (optional)" value={floor} onChangeText={setFloor} keyboardType="number-pad" placeholder="1" />
        <Input label="Bedrooms" value={bedrooms} onChangeText={setBedrooms} keyboardType="number-pad" />
        <Input label="Bathrooms" value={bathrooms} onChangeText={setBathrooms} keyboardType="number-pad" />

        <AppText variant="label" color="secondary" className="mb-2">Billing Type</AppText>
        <View className="flex-row gap-2 mb-4">
          <Button label="Monthly" size="sm" variant={billingType === 'monthly' ? 'primary' : 'secondary'} onPress={() => setBillingType('monthly')} className="flex-1" />
          <Button label="Daily" size="sm" variant={billingType === 'daily' ? 'primary' : 'secondary'} onPress={() => setBillingType('daily')} className="flex-1" />
        </View>

        {billingType === 'monthly'
          ? <Input label="Monthly Rate (PHP)" value={monthlyRate} onChangeText={setMonthlyRate} keyboardType="decimal-pad" error={errors.rate} placeholder="500.00" />
          : <Input label="Daily Rate (PHP)" value={dailyRate} onChangeText={setDailyRate} keyboardType="decimal-pad" error={errors.rate} placeholder="25.00" />
        }

        <Button label="Create Unit" onPress={handleSubmit} loading={isPending} className="mt-4" />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
