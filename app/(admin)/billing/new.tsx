import React, { useEffect } from 'react'
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner-native'
import dayjs from 'dayjs'
import { useTabBarScrollHandler } from '../../../hooks/useTabBarScrollHandler'
import { useCreateBill } from '../../../hooks/useBills'
import { useTenants } from '../../../hooks/useTenants'
import { useSettings } from '../../../hooks/useSettings'
import { fetchUnit } from '../../../lib/api/units'
import { fetchLastBillForTenant } from '../../../lib/api/bills'
import { Input, Button, AppText, Card, Select, DateInput } from '../../../components/ui'
import {
  calcDailyAmount,
  calcMonthlyAmount,
  calcWaterCharge,
  calcElectricityCharge,
  calcInternetCharge,
  formatCurrency,
} from '../../../lib/billing'

const today = dayjs().format('YYYY-MM-DD')

const schema = z.object({
  tenantId: z.string().min(1, 'Please select a tenant'),
  periodStart: z.string().min(1, 'Period start is required'),
  periodEnd: z.string().min(1, 'Period end is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
  waterPrevious: z.string().optional(),
  waterCurrent: z.string().optional(),
  elecPrevious: z.string().optional(),
  elecCurrent: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function NewBillScreen() {
  const router = useRouter()
  const tabBarScroll = useTabBarScrollHandler()
  const { mutateAsync, isPending } = useCreateBill()
  const { data: tenants } = useTenants({ status: 'active' })
  const { data: settings } = useSettings()

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
      tenantId: '',
      periodStart: today,
      periodEnd: today,
      dueDate: '',
      notes: '',
      waterPrevious: '',
      waterCurrent: '',
      elecPrevious: '',
      elecCurrent: '',
    },
  })

  const watchedTenantId = watch('tenantId')
  const selectedTenant = tenants?.find((t) => t.id === watchedTenantId) ?? null

  const [watchedWP, watchedWC, watchedEP, watchedEC] = watch([
    'waterPrevious',
    'waterCurrent',
    'elecPrevious',
    'elecCurrent',
  ])

  // Auto-fill previous readings when tenant changes
  useEffect(() => {
    if (!selectedTenant || selectedTenant.billing_type !== 'monthly') {
      setValue('waterPrevious', '')
      setValue('waterCurrent', '')
      setValue('elecPrevious', '')
      setValue('elecCurrent', '')
      return
    }
    fetchLastBillForTenant(selectedTenant.id).then((lastBill) => {
      setValue(
        'waterPrevious',
        lastBill?.water_current != null
          ? String(lastBill.water_current)
          : selectedTenant.water_reading != null
          ? String(selectedTenant.water_reading)
          : ''
      )
      setValue(
        'elecPrevious',
        lastBill?.electricity_current != null
          ? String(lastBill.electricity_current)
          : selectedTenant.electricity_reading != null
          ? String(selectedTenant.electricity_reading)
          : ''
      )
    })
  }, [selectedTenant, setValue])

  const previewLines = (() => {
    if (!selectedTenant || selectedTenant.billing_type !== 'monthly' || !settings) return null
    const wp = parseFloat(watchedWP ?? '')
    const wc = parseFloat(watchedWC ?? '')
    const ep = parseFloat(watchedEP ?? '')
    const ec = parseFloat(watchedEC ?? '')
    if (isNaN(wp) || isNaN(wc) || isNaN(ep) || isNaN(ec)) return null
    if (wc < wp || ec < ep) return null
    const waterAmt = calcWaterCharge(wp, wc, settings.water_rate)
    const elecAmt = calcElectricityCharge(ep, ec, settings.electricity_rate)
    const internetAmt = calcInternetCharge(selectedTenant.include_internet ?? false, settings.internet_rate)
    return {
      waterAmt,
      elecAmt,
      internetAmt,
      waterUsage: wc - wp,
      elecUsage: ec - ep,
      includeInternet: selectedTenant.include_internet,
    }
  })()

  const onSubmit = async (data: FormData) => {
    if (!selectedTenant) {
      setError('tenantId', { message: 'Please select a tenant' })
      return
    }

    // billing_type-specific validation (needs derived numeric values)
    if (selectedTenant.billing_type === 'monthly') {
      const wp = parseFloat(data.waterPrevious ?? '')
      const wc = parseFloat(data.waterCurrent ?? '')
      const ep = parseFloat(data.elecPrevious ?? '')
      const ec = parseFloat(data.elecCurrent ?? '')

      let hasError = false
      if (isNaN(wp) || isNaN(wc)) {
        setError('waterPrevious', { message: 'Valid water readings required' })
        hasError = true
      } else if (wc < wp) {
        setError('waterPrevious', { message: 'Current reading must be ≥ previous' })
        hasError = true
      }
      if (isNaN(ep) || isNaN(ec)) {
        setError('elecPrevious', { message: 'Valid electricity readings required' })
        hasError = true
      } else if (ec < ep) {
        setError('elecPrevious', { message: 'Current reading must be ≥ previous' })
        hasError = true
      }
      if (hasError) return
    }

    if (!selectedTenant.unit_id) {
      setError('tenantId', { message: 'Tenant has no unit assigned' })
      return
    }

    try {
      const unit = await fetchUnit(selectedTenant.unit_id)
      if (!unit) {
        setError('tenantId', { message: 'Unit not found' })
        return
      }

      let amount: number
      let billExtras: {
        water_previous?: number
        water_current?: number
        electricity_previous?: number
        electricity_current?: number
      } = {}

      if (selectedTenant.billing_type === 'monthly') {
        if (!settings) {
          toast.error('Settings not loaded. Please try again.')
          return
        }
        const rent = calcMonthlyAmount(unit.monthly_rate ?? 0)
        const wp = parseFloat(data.waterPrevious ?? '')
        const wc = parseFloat(data.waterCurrent ?? '')
        const ep = parseFloat(data.elecPrevious ?? '')
        const ec = parseFloat(data.elecCurrent ?? '')
        const waterAmt = calcWaterCharge(wp, wc, settings.water_rate)
        const elecAmt = calcElectricityCharge(ep, ec, settings.electricity_rate)
        const internetAmt = calcInternetCharge(selectedTenant.include_internet ?? false, settings.internet_rate)
        amount = parseFloat((rent + waterAmt + elecAmt + internetAmt).toFixed(2))
        billExtras = { water_previous: wp, water_current: wc, electricity_previous: ep, electricity_current: ec }
      } else {
        amount = calcDailyAmount(unit.daily_rate ?? 0, data.periodStart, data.periodEnd)
      }

      if (amount <= 0) {
        setError('tenantId', { message: 'Unit has no rate configured. Set a rate on the unit first.' })
        return
      }

      await mutateAsync({
        tenant_id: selectedTenant.id,
        unit_id: selectedTenant.unit_id,
        amount,
        billing_type: selectedTenant.billing_type,
        period_start: data.periodStart,
        period_end: data.periodEnd,
        due_date: data.dueDate,
        notes: data.notes?.trim() || undefined,
        ...billExtras,
      })
      toast.success('Bill created')
      router.back()
    } catch {
      toast.error('Could not create bill. Please try again.')
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-app">
      <ScrollView contentContainerClassName="p-4 pb-32" {...tabBarScroll}>
        <Controller
          control={control}
          name="tenantId"
          render={({ field }) => (
            <Select
              label="Tenant"
              placeholder="Select a tenant…"
              options={(tenants ?? []).map((t) => ({
                value: t.id,
                label: `${t.full_name} — Unit ${t.unit?.unit_number ?? '?'} (${t.billing_type})`,
              }))}
              value={field.value}
              onChange={field.onChange}
              error={errors.tenantId?.message}
            />
          )}
        />

        {selectedTenant?.billing_type === 'monthly' && (
          <Card className="mb-4 mt-2">
            <AppText variant="subheading" className="mb-3">Meter Readings</AppText>

            <Controller
              control={control}
              name="waterPrevious"
              render={({ field }) => (
                <Input
                  label="Water Previous (cu.m)"
                  value={field.value ?? ''}
                  onChangeText={field.onChange}
                  keyboardType="decimal-pad"
                  error={errors.waterPrevious?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="waterCurrent"
              render={({ field }) => (
                <Input
                  label="Water Current (cu.m)"
                  value={field.value ?? ''}
                  onChangeText={field.onChange}
                  keyboardType="decimal-pad"
                  error={errors.waterCurrent?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="elecPrevious"
              render={({ field }) => (
                <Input
                  label="Electricity Previous (kWh)"
                  value={field.value ?? ''}
                  onChangeText={field.onChange}
                  keyboardType="decimal-pad"
                  error={errors.elecPrevious?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="elecCurrent"
              render={({ field }) => (
                <Input
                  label="Electricity Current (kWh)"
                  value={field.value ?? ''}
                  onChangeText={field.onChange}
                  keyboardType="decimal-pad"
                  error={errors.elecCurrent?.message}
                />
              )}
            />

            {previewLines && (
              <View className="mt-3 gap-1">
                <AppText variant="label" color="secondary">Utility Preview</AppText>
                <View className="flex-row justify-between">
                  <AppText color="secondary">Water ({previewLines.waterUsage} cu.m)</AppText>
                  <AppText>{formatCurrency(previewLines.waterAmt)}</AppText>
                </View>
                <View className="flex-row justify-between">
                  <AppText color="secondary">Electricity ({previewLines.elecUsage} kWh)</AppText>
                  <AppText>{formatCurrency(previewLines.elecAmt)}</AppText>
                </View>
                {previewLines.includeInternet ? (
                  <View className="flex-row justify-between">
                    <AppText color="secondary">Internet</AppText>
                    <AppText>{formatCurrency(previewLines.internetAmt)}</AppText>
                  </View>
                ) : (
                  <View className="flex-row justify-between">
                    <AppText color="secondary">Internet</AppText>
                    <AppText color="muted">Free</AppText>
                  </View>
                )}
              </View>
            )}
          </Card>
        )}

        <Controller
          control={control}
          name="periodStart"
          render={({ field }) => (
            <DateInput
              label="Period Start"
              value={field.value}
              onChange={field.onChange}
              error={errors.periodStart?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="periodEnd"
          render={({ field }) => (
            <DateInput
              label="Period End"
              value={field.value}
              onChange={field.onChange}
              error={errors.periodEnd?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="dueDate"
          render={({ field }) => (
            <DateInput
              label="Due Date"
              value={field.value}
              onChange={field.onChange}
              error={errors.dueDate?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <Input
              label="Notes (optional)"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              multiline
              numberOfLines={2}
            />
          )}
        />

        <Button label="Create Bill" onPress={handleSubmit(onSubmit)} loading={isPending} className="mt-4" />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
