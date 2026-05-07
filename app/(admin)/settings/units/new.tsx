import React, { useState, useMemo } from 'react'
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useTabBarScrollHandler } from '../../../../hooks/useTabBarScrollHandler'
import { useCreateUnit } from '../../../../hooks/useUnits'
import { useProperties } from '../../../../hooks/useProperties'
import { Input, Button, Select, AppHeader } from '../../../../components/ui'

export default function NewUnitScreen() {
  const router = useRouter()
  const tabBarScroll = useTabBarScrollHandler()
  const { data: properties } = useProperties()

  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const { mutateAsync, isPending } = useCreateUnit(selectedPropertyId)

  const [unitNumber, setUnitNumber] = useState('')
  const [monthlyRate, setMonthlyRate] = useState('')
  const [billingDay, setBillingDay] = useState('1')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const propertyOptions = useMemo(
    () => (properties ?? []).map((p) => ({ value: p.id, label: p.name })),
    [properties],
  )

  async function handleSubmit() {
    const errs: Record<string, string> = {}
    if (!selectedPropertyId) errs.property = 'Please select a property'
    if (!unitNumber.trim()) errs.unitNumber = 'Unit number is required'
    if (!monthlyRate || isNaN(parseFloat(monthlyRate))) errs.monthlyRate = 'Monthly rate is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    try {
      await mutateAsync({
        property_id: selectedPropertyId,
        unit_number: unitNumber.trim(),
        monthly_rate: parseFloat(monthlyRate),
        billing_day: billingDay ? parseInt(billingDay) : 1,
        notes: notes.trim() || null,
      })
      router.back()
    } catch {
      Alert.alert('Error', 'Could not create unit. Please try again.')
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-app">
      <AppHeader title="New Unit" />
      <ScrollView contentContainerClassName="p-4 pb-32" keyboardShouldPersistTaps="handled" {...tabBarScroll}>
        <Select
          label="Property"
          placeholder="Select a property…"
          options={propertyOptions}
          value={selectedPropertyId}
          onChange={setSelectedPropertyId}
          error={errors.property}
        />
        <Input label="Unit number / name" value={unitNumber} onChangeText={setUnitNumber} error={errors.unitNumber} placeholder="Unit 1A" />
        <Input label="Monthly rent (₱)" value={monthlyRate} onChangeText={setMonthlyRate} keyboardType="decimal-pad" error={errors.monthlyRate} placeholder="3,500" />
        <Input label="Billing day" value={billingDay} onChangeText={setBillingDay} keyboardType="number-pad" placeholder="1" />
        <Input label="Notes (optional)" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
        <Button label="Create Unit" onPress={handleSubmit} loading={isPending} className="mt-4" />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
