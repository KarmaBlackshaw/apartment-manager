import React, { useState, useEffect, useMemo } from 'react'
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert, Switch } from 'react-native'
import { useRouter } from 'expo-router'
import { useTabBarScrollHandler } from '../../../hooks/useTabBarScrollHandler'
import { useCreateTenant } from '../../../hooks/useTenants'
import { useProperties } from '../../../hooks/useProperties'
import { useUnits } from '../../../hooks/useUnits'
import { Input, Button, AppText, Select, DateInput } from '../../../components/ui'
import type { BillingType } from '../../../types'
import { fetchUnit } from '../../../lib/api/units'
import { createBill as createBillFn } from '../../../lib/api/bills'

export default function NewTenantScreen() {
  const router = useRouter()
  const tabBarScroll = useTabBarScrollHandler()
  const { mutateAsync, isPending } = useCreateTenant()
  const { data: properties } = useProperties()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [billingType, setBillingType] = useState<BillingType>('monthly')
  const [moveInDate, setMoveInDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [selectedUnitId, setSelectedUnitId] = useState('')
  const [address, setAddress] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [waterReading, setWaterReading] = useState('')
  const [electricityReading, setElectricityReading] = useState('')
  const [dueDay, setDueDay] = useState('15')
  const [includeInternet, setIncludeInternet] = useState(false)
  const [days, setDays] = useState('1')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const day = parseInt(moveInDate.split('-')[2] ?? '1', 10)
    if (!isNaN(day) && day >= 1 && day <= 28) setDueDay(String(day))
  }, [moveInDate])

  const { data: units } = useUnits(selectedPropertyId)
  const availableUnits = units?.filter((u) => u.status === 'available' && u.billing_type === billingType) ?? []

  const propertyOptions = useMemo(
    () => (properties ?? []).map((p) => ({ value: p.id, label: p.name })),
    [properties],
  )

  const unitOptions = useMemo(
    () =>
      availableUnits.map((u) => ({
        value: u.id,
        label:
          billingType === 'monthly'
            ? `Unit ${u.unit_number}${u.monthly_rate != null ? ` — PHP ${u.monthly_rate.toFixed(2)}/mo` : ''}`
            : `Unit ${u.unit_number}${u.daily_rate != null ? ` — PHP ${u.daily_rate.toFixed(2)}/day` : ''}`,
      })),
    [availableUnits, billingType],
  )

  async function handleSubmit() {
    const errs: Record<string, string> = {}
    if (!fullName.trim()) errs.fullName = 'Name is required'
    if (!email.trim()) errs.email = 'Email is required'
    if (!phone.trim()) errs.phone = 'Phone is required'
    if (!selectedUnitId) errs.unit = 'Please select a unit'
    if (!moveInDate) errs.moveInDate = 'Move-in date is required'
    if (billingType === 'monthly') {
      if (!address.trim()) errs.address = 'Address is required'
      if (!emergencyContact.trim()) errs.emergencyContact = 'Emergency contact is required'
      const wd = parseFloat(waterReading)
      const ed = parseFloat(electricityReading)
      const dd = parseInt(dueDay)
      if (isNaN(wd) || wd < 0) errs.waterReading = 'Valid water reading required'
      if (isNaN(ed) || ed < 0) errs.electricityReading = 'Valid electricity reading required'
      if (isNaN(dd) || dd < 1 || dd > 28) errs.dueDay = 'Due day must be 1–28'
    }
    if (billingType === 'daily') {
      const d = parseInt(days)
      if (isNaN(d) || d < 1) errs.days = 'Number of days must be at least 1'
    }
    if (Object.keys(errs).length) { setErrors(errs); return }

    try {
      const createdTenant = await mutateAsync({
        unit_id: selectedUnitId,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        billing_type: billingType,
        move_in_date: moveInDate,
        ...(billingType === 'monthly' ? {
          address: address.trim(),
          emergency_contact: emergencyContact.trim(),
          water_reading: parseFloat(waterReading),
          electricity_reading: parseFloat(electricityReading),
          due_day: parseInt(dueDay),
          include_internet: includeInternet,
        } : {}),
      })

      if (billingType === 'daily' && selectedUnitId) {
        const unit = await fetchUnit(selectedUnitId)
        if (unit && unit.daily_rate) {
          const numDays = parseInt(days)
          const periodEnd = (() => {
            const d = new Date(moveInDate)
            d.setDate(d.getDate() + numDays - 1)
            return d.toISOString().split('T')[0]
          })()
          await createBillFn({
            tenant_id: createdTenant.id,
            unit_id: selectedUnitId,
            amount: parseFloat((unit.daily_rate * numDays).toFixed(2)),
            billing_type: 'daily',
            period_start: moveInDate,
            period_end: periodEnd,
            due_date: periodEnd,
          })
        }
      }

      router.back()
    } catch {
      Alert.alert('Error', 'Could not create tenant. Please try again.')
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-app">
      <ScrollView contentContainerClassName="p-4 pb-32" {...tabBarScroll}>
        <Input label="Full Name" value={fullName} onChangeText={setFullName} error={errors.fullName} placeholder="Jane Doe" />
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} placeholder="jane@example.com" />
        <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" error={errors.phone} placeholder="+1 555 0100" />
        <DateInput label="Move-in Date" value={moveInDate} onChange={setMoveInDate} error={errors.moveInDate} />

        <AppText variant="label" color="secondary" className="mb-2">Billing Type</AppText>
        <View className="flex-row gap-2 mb-4">
          {(['monthly', 'daily'] as BillingType[]).map((t) => (
            <Button key={t} label={t === 'monthly' ? 'Monthly' : 'Daily'} size="sm"
              variant={billingType === t ? 'primary' : 'secondary'}
              onPress={() => { setBillingType(t); setSelectedUnitId('') }}
              className="flex-1" />
          ))}
        </View>

        {billingType === 'daily' && (
          <Input label="Number of Days" value={days} onChangeText={setDays} keyboardType="number-pad" error={errors.days} placeholder="1" />
        )}

        {billingType === 'monthly' && (
          <>
            <Input label="Address" value={address} onChangeText={setAddress} error={errors.address} multiline numberOfLines={2} />
            <Input label="Emergency Contact" value={emergencyContact} onChangeText={setEmergencyContact} error={errors.emergencyContact} placeholder="Name — Phone" />
            <Input label="Water Reading (cu.m)" value={waterReading} onChangeText={setWaterReading} keyboardType="decimal-pad" error={errors.waterReading} placeholder="0" />
            <Input label="Electricity Reading (kWh)" value={electricityReading} onChangeText={setElectricityReading} keyboardType="decimal-pad" error={errors.electricityReading} placeholder="0" />
            <Input label="Due Day (1–28)" value={dueDay} onChangeText={setDueDay} keyboardType="number-pad" error={errors.dueDay} placeholder="15" />
            <View className="flex-row justify-between items-center mb-4">
              <AppText>Include Internet</AppText>
              <Switch
                value={includeInternet}
                onValueChange={setIncludeInternet}
                trackColor={{ true: '#3b82f6', false: '#2a2a2a' }}
                thumbColor="#f1f1f1"
              />
            </View>
          </>
        )}

        <Select
          label="Property"
          placeholder="Select a property…"
          options={propertyOptions}
          value={selectedPropertyId}
          onChange={(val) => { setSelectedPropertyId(val); setSelectedUnitId('') }}
        />

        <Select
          label={`Available ${billingType === 'monthly' ? 'Monthly' : 'Daily'} Units`}
          placeholder={selectedPropertyId ? 'Select a unit…' : 'Select a property first'}
          options={unitOptions}
          value={selectedUnitId}
          onChange={setSelectedUnitId}
          error={errors.unit}
          searchable={unitOptions.length > 5}
        />

        <Button label="Add Tenant" onPress={handleSubmit} loading={isPending} className="mt-2" />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
