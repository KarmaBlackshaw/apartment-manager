import React, { useState } from 'react'
import { ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCreateUnit } from '~/hooks/useUnits'
import { Input } from '~/components/ui/Input'
import { Button } from '~/components/ui/Button'
import { ScreenLayout } from '~/layouts/ScreenLayout'

export default function NewUnitScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>()
  const router = useRouter()
  const { mutateAsync, isPending } = useCreateUnit(propertyId)

  const [unitNumber, setUnitNumber] = useState('')
  const [monthlyRent, setMonthlyRent] = useState('')
  const [billingDay, setBillingDay] = useState('1')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit() {
    const errs: Record<string, string> = {}
    if (!unitNumber.trim()) errs.unitNumber = 'Unit number / name is required'
    if (!monthlyRent || isNaN(parseFloat(monthlyRent))) errs.monthlyRent = 'Monthly rent is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    try {
      await mutateAsync({
        property_id: propertyId,
        unit_number: unitNumber.trim(),
        monthly_rate: parseFloat(monthlyRent),
        billing_day: billingDay ? parseInt(billingDay) : 1,
        notes: notes.trim() || null,
      })
      router.replace(`/(admin)/properties/${propertyId}`)
    } catch {
      Alert.alert('Error', 'Could not create unit. Please try again.')
    }
  }

  return (
    <ScreenLayout title="Add Unit" backHref={`/(admin)/properties/${propertyId}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="p-4 pb-[88px]"
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

          <Input
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Button
            label="Save Unit"
            onPress={handleSubmit}
            loading={isPending}
            className="mt-6"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  )
}
