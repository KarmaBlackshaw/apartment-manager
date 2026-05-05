import React, { useState, useEffect } from 'react'
import { View, ScrollView, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTabBarScrollHandler } from '../../../../../hooks/useTabBarScrollHandler'
import { useUnit, useUpdateUnit, useDeleteUnit } from '../../../../../hooks/useUnits'
import { Input, Button, AppText, LoadingSpinner, unitStatusBadge } from '../../../../../components/ui'
import type { BillingType, UnitStatus } from '../../../../../types'

export default function UnitDetailScreen() {
  const { propertyId, id } = useLocalSearchParams<{ propertyId: string; id: string }>()
  const router = useRouter()
  const tabBarScroll = useTabBarScrollHandler()
  const { data: unit, isLoading, isError } = useUnit(id)
  const { mutateAsync: update, isPending: updating } = useUpdateUnit(propertyId)
  const { mutateAsync: remove, isPending: deleting } = useDeleteUnit(propertyId)

  const [unitNumber, setUnitNumber] = useState('')
  const [floor, setFloor] = useState('')
  const [bedrooms, setBedrooms] = useState('1')
  const [bathrooms, setBathrooms] = useState('1')
  const [billingType, setBillingType] = useState<BillingType>('monthly')
  const [monthlyRate, setMonthlyRate] = useState('')
  const [dailyRate, setDailyRate] = useState('')
  const [status, setStatus] = useState<UnitStatus>('available')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (unit) {
      setUnitNumber(unit.unit_number)
      setFloor(unit.floor?.toString() ?? '')
      setBedrooms(unit.bedrooms.toString())
      setBathrooms(unit.bathrooms.toString())
      setBillingType(unit.billing_type)
      setMonthlyRate(unit.monthly_rate?.toString() ?? '')
      setDailyRate(unit.daily_rate?.toString() ?? '')
      setStatus(unit.status)
    }
  }, [unit])

  if (isLoading) return <LoadingSpinner />
  if (isError) return (
    <View className="flex-1 items-center justify-center p-8 bg-app">
      <AppText color="danger" className="text-center">Could not load unit. Please restart the app.</AppText>
    </View>
  )
  if (!unit) return (
    <View className="flex-1 items-center justify-center p-8 bg-app">
      <AppText color="danger" className="text-center">Unit not found.</AppText>
    </View>
  )

  async function handleSave() {
    const errs: Record<string, string> = {}
    if (!unitNumber.trim()) errs.unitNumber = 'Unit number is required'
    if (billingType === 'monthly' && !monthlyRate) errs.rate = 'Monthly rate is required'
    if (billingType === 'daily' && !dailyRate) errs.rate = 'Daily rate is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    try {
      await update({
        id,
        input: {
          unit_number: unitNumber.trim(),
          floor: floor ? parseInt(floor) : null,
          bedrooms: parseInt(bedrooms) || 1,
          bathrooms: parseInt(bathrooms) || 1,
          billing_type: billingType,
          monthly_rate: billingType === 'monthly' ? parseFloat(monthlyRate) : null,
          daily_rate: billingType === 'daily' ? parseFloat(dailyRate) : null,
          status,
        },
      })
      router.back()
    } catch {
      Alert.alert('Error', 'Could not save changes. Please try again.')
    }
  }

  function handleDelete() {
    Alert.alert('Delete Unit', 'Delete this unit?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await remove(id)
            router.back()
          } catch {
            Alert.alert('Error', 'Could not delete unit. Please try again.')
          }
        }
      },
    ])
  }

  const statusBadge = unitStatusBadge(status)

  return (
    <ScrollView className="flex-1 bg-app" contentContainerClassName="p-4 pb-32" {...tabBarScroll}>
      <Input label="Unit Number" value={unitNumber} onChangeText={setUnitNumber} error={errors.unitNumber} />
      <Input label="Floor" value={floor} onChangeText={setFloor} keyboardType="number-pad" />
      <Input label="Bedrooms" value={bedrooms} onChangeText={setBedrooms} keyboardType="number-pad" />
      <Input label="Bathrooms" value={bathrooms} onChangeText={setBathrooms} keyboardType="number-pad" />

      <AppText variant="label" color="secondary" className="mb-2">Billing Type</AppText>
      <View className="flex-row gap-2 mb-4">
        {(['monthly', 'daily'] as BillingType[]).map((t) => (
          <Button key={t} label={t === 'monthly' ? 'Monthly' : 'Daily'} size="sm"
            variant={billingType === t ? 'primary' : 'secondary'}
            onPress={() => setBillingType(t)} className="flex-1" />
        ))}
      </View>

      {billingType === 'monthly'
        ? <Input label="Monthly Rate ($)" value={monthlyRate} onChangeText={setMonthlyRate} keyboardType="decimal-pad" error={errors.rate} />
        : <Input label="Daily Rate ($)" value={dailyRate} onChangeText={setDailyRate} keyboardType="decimal-pad" error={errors.rate} />
      }

      <AppText variant="label" color="secondary" className="mb-2">Status</AppText>
      <View className="flex-row gap-2 mb-4">
        {(['available', 'occupied', 'maintenance'] as UnitStatus[]).map((s) => {
          const b = unitStatusBadge(s)
          return (
            <Button key={s} label={b.label} size="sm"
              variant={status === s ? 'primary' : 'secondary'}
              onPress={() => setStatus(s)} className="flex-1" />
          )
        })}
      </View>

      <Button label="Save Changes" onPress={handleSave} loading={updating} className="mb-3" />
      <Button label="Delete Unit" variant="danger" onPress={handleDelete} loading={deleting} />
    </ScrollView>
  )
}
