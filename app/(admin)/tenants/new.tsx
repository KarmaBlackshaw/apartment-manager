import React, { useState, useEffect, useMemo } from 'react'
import { View, ScrollView, KeyboardAvoidingView, Platform, Switch } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner-native'
import dayjs from 'dayjs'
import { useTabBarScrollHandler } from '../../../hooks/useTabBarScrollHandler'
import { useCreateTenant } from '../../../hooks/useTenants'
import { useProperties } from '../../../hooks/useProperties'
import { useUnits } from '../../../hooks/useUnits'
import { Input, Button, AppText, Select, DateInput } from '../../../components/ui'
import type { BillingType } from '../../../types'
import { fetchUnit } from '../../../lib/api/units'
import { createBill as createBillFn } from '../../../lib/api/bills'

const schema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required'),
  phone: z.string().min(1, 'Phone is required'),
  moveInDate: z.string().min(1, 'Move-in date is required'),
  selectedUnitId: z.string().min(1, 'Please select a unit'),
  // monthly-only (optional at schema level, validated conditionally in onSubmit)
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  waterReading: z.string().optional(),
  electricityReading: z.string().optional(),
  dueDay: z.string().optional(),
  // daily-only
  days: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function NewTenantScreen() {
  const router = useRouter()
  const tabBarScroll = useTabBarScrollHandler()
  const { mutateAsync, isPending } = useCreateTenant()
  const { data: properties } = useProperties()

  // UI mode toggles — not validated fields
  const [billingType, setBillingType] = useState<BillingType>('monthly')
  const [includeInternet, setIncludeInternet] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState('')

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      moveInDate: dayjs().format('YYYY-MM-DD'),
      selectedUnitId: '',
      address: '',
      emergencyContact: '',
      waterReading: '',
      electricityReading: '',
      dueDay: '15',
      days: '1',
    },
  })

  const moveInDate = watch('moveInDate')

  useEffect(() => {
    const day = parseInt(moveInDate.split('-')[2] ?? '1', 10)
    if (!isNaN(day) && day >= 1 && day <= 28) setValue('dueDay', String(day))
  }, [moveInDate, setValue])

  const { data: units } = useUnits(selectedPropertyId)
  const availableUnits =
    units?.filter((u) => u.status === 'available' && u.billing_type === billingType) ?? []

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

  const onSubmit = async (data: FormData) => {
    // Conditional validation for billing-type-specific fields
    let hasConditionalError = false

    if (billingType === 'monthly') {
      if (!data.address?.trim()) {
        setError('address', { message: 'Address is required' })
        hasConditionalError = true
      }
      if (!data.emergencyContact?.trim()) {
        setError('emergencyContact', { message: 'Emergency contact is required' })
        hasConditionalError = true
      }
      const wd = parseFloat(data.waterReading ?? '')
      if (isNaN(wd) || wd < 0) {
        setError('waterReading', { message: 'Valid water reading required' })
        hasConditionalError = true
      }
      const ed = parseFloat(data.electricityReading ?? '')
      if (isNaN(ed) || ed < 0) {
        setError('electricityReading', { message: 'Valid electricity reading required' })
        hasConditionalError = true
      }
      const dd = parseInt(data.dueDay ?? '')
      if (isNaN(dd) || dd < 1 || dd > 28) {
        setError('dueDay', { message: 'Due day must be 1–28' })
        hasConditionalError = true
      }
    }

    if (billingType === 'daily') {
      const d = parseInt(data.days ?? '')
      if (isNaN(d) || d < 1) {
        setError('days', { message: 'Number of days must be at least 1' })
        hasConditionalError = true
      }
    }

    if (hasConditionalError) return

    try {
      const createdTenant = await mutateAsync({
        unit_id: data.selectedUnitId,
        full_name: data.fullName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        billing_type: billingType,
        move_in_date: data.moveInDate,
        ...(billingType === 'monthly'
          ? {
              address: data.address!.trim(),
              emergency_contact: data.emergencyContact!.trim(),
              water_reading: parseFloat(data.waterReading!),
              electricity_reading: parseFloat(data.electricityReading!),
              due_day: parseInt(data.dueDay!),
              include_internet: includeInternet,
            }
          : {}),
      })

      if (billingType === 'daily' && data.selectedUnitId) {
        const unit = await fetchUnit(data.selectedUnitId)
        if (unit && unit.daily_rate) {
          const numDays = parseInt(data.days!)
          const periodEnd = (() => {
            const d = new Date(data.moveInDate)
            d.setDate(d.getDate() + numDays - 1)
            return dayjs(d).format('YYYY-MM-DD')
          })()
          await createBillFn({
            tenant_id: createdTenant.id,
            unit_id: data.selectedUnitId,
            amount: parseFloat((unit.daily_rate * numDays).toFixed(2)),
            billing_type: 'daily',
            period_start: data.moveInDate,
            period_end: periodEnd,
            due_date: periodEnd,
          })
        }
      }

      toast.success('Tenant added')
      router.back()
    } catch {
      toast.error('Could not create tenant')
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-app">
      <ScrollView contentContainerClassName="p-4 pb-32" {...tabBarScroll}>
        <Controller
          control={control}
          name="fullName"
          render={({ field }) => (
            <Input
              label="Full Name"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.fullName?.message}
              placeholder="Jane Doe"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input
              label="Email"
              value={field.value}
              onChangeText={field.onChange}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email?.message}
              placeholder="jane@example.com"
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <Input
              label="Phone"
              value={field.value}
              onChangeText={field.onChange}
              keyboardType="phone-pad"
              error={errors.phone?.message}
              placeholder="+1 555 0100"
            />
          )}
        />

        <Controller
          control={control}
          name="moveInDate"
          render={({ field }) => (
            <DateInput
              label="Move-in Date"
              value={field.value}
              onChange={field.onChange}
              error={errors.moveInDate?.message}
            />
          )}
        />

        <AppText variant="label" color="secondary" className="mb-2">
          Billing Type
        </AppText>
        <View className="flex-row gap-2 mb-4">
          {(['monthly', 'daily'] as BillingType[]).map((t) => (
            <Button
              key={t}
              label={t === 'monthly' ? 'Monthly' : 'Daily'}
              size="sm"
              variant={billingType === t ? 'primary' : 'secondary'}
              onPress={() => {
                setBillingType(t)
                setValue('selectedUnitId', '')
                setSelectedPropertyId('')
              }}
              className="flex-1"
            />
          ))}
        </View>

        {billingType === 'daily' && (
          <Controller
            control={control}
            name="days"
            render={({ field }) => (
              <Input
                label="Number of Days"
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="number-pad"
                error={errors.days?.message}
                placeholder="1"
              />
            )}
          />
        )}

        {billingType === 'monthly' && (
          <>
            <Controller
              control={control}
              name="address"
              render={({ field }) => (
                <Input
                  label="Address"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.address?.message}
                  multiline
                  numberOfLines={2}
                />
              )}
            />

            <Controller
              control={control}
              name="emergencyContact"
              render={({ field }) => (
                <Input
                  label="Emergency Contact"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.emergencyContact?.message}
                  placeholder="Name — Phone"
                />
              )}
            />

            <Controller
              control={control}
              name="waterReading"
              render={({ field }) => (
                <Input
                  label="Water Reading (cu.m)"
                  value={field.value}
                  onChangeText={field.onChange}
                  keyboardType="decimal-pad"
                  error={errors.waterReading?.message}
                  placeholder="0"
                />
              )}
            />

            <Controller
              control={control}
              name="electricityReading"
              render={({ field }) => (
                <Input
                  label="Electricity Reading (kWh)"
                  value={field.value}
                  onChangeText={field.onChange}
                  keyboardType="decimal-pad"
                  error={errors.electricityReading?.message}
                  placeholder="0"
                />
              )}
            />

            <Controller
              control={control}
              name="dueDay"
              render={({ field }) => (
                <Input
                  label="Due Day (1–28)"
                  value={field.value}
                  onChangeText={field.onChange}
                  keyboardType="number-pad"
                  error={errors.dueDay?.message}
                  placeholder="15"
                />
              )}
            />

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
          onChange={(val) => {
            setSelectedPropertyId(val)
            setValue('selectedUnitId', '')
          }}
        />

        <Controller
          control={control}
          name="selectedUnitId"
          render={({ field }) => (
            <Select
              label={`Available ${billingType === 'monthly' ? 'Monthly' : 'Daily'} Units`}
              placeholder={selectedPropertyId ? 'Select a unit…' : 'Select a property first'}
              options={unitOptions}
              value={field.value}
              onChange={field.onChange}
              error={errors.selectedUnitId?.message}
              searchable={unitOptions.length > 5}
            />
          )}
        />

        <Button label="Add Tenant" onPress={handleSubmit(onSubmit)} loading={isPending} className="mt-2" />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
