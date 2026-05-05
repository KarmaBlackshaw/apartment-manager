import React, { useState, useEffect } from 'react'
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useTabBarScrollHandler } from '../../../hooks/useTabBarScrollHandler'
import { useCreateBill } from '../../../hooks/useBills'
import { useTenants } from '../../../hooks/useTenants'
import { useSettings } from '../../../hooks/useSettings'
import { fetchUnit } from '../../../lib/api/units'
import { fetchLastBillForTenant } from '../../../lib/api/bills'
import { Input, Button, AppText, Card, Select, DateInput } from '../../../components/ui'
import { calcDailyAmount, calcMonthlyAmount, calcWaterCharge, calcElectricityCharge, calcInternetCharge, formatCurrency } from '../../../lib/billing'
import type { TenantWithUnit } from '../../../types'

export default function NewBillScreen() {
  const router = useRouter()
  const tabBarScroll = useTabBarScrollHandler()
  const { mutateAsync, isPending } = useCreateBill()
  const { data: tenants } = useTenants({ status: 'active' })
  const { data: settings } = useSettings()

  const [selectedTenantId, setSelectedTenantId] = useState('')
  const selectedTenant = tenants?.find((t) => t.id === selectedTenantId) ?? null
  const [periodStart, setPeriodStart] = useState(new Date().toISOString().split('T')[0])
  const [periodEnd, setPeriodEnd] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Monthly-only reading state
  const [waterPrevious, setWaterPrevious] = useState('')
  const [waterCurrent, setWaterCurrent] = useState('')
  const [elecPrevious, setElecPrevious] = useState('')
  const [elecCurrent, setElecCurrent] = useState('')

  // Auto-fill previous readings when tenant changes
  useEffect(() => {
    if (!selectedTenant || selectedTenant.billing_type !== 'monthly') {
      setWaterPrevious('')
      setWaterCurrent('')
      setElecPrevious('')
      setElecCurrent('')
      return
    }
    fetchLastBillForTenant(selectedTenant.id).then((lastBill) => {
      setWaterPrevious(
        lastBill?.water_current != null
          ? String(lastBill.water_current)
          : selectedTenant.water_reading != null
          ? String(selectedTenant.water_reading)
          : ''
      )
      setElecPrevious(
        lastBill?.electricity_current != null
          ? String(lastBill.electricity_current)
          : selectedTenant.electricity_reading != null
          ? String(selectedTenant.electricity_reading)
          : ''
      )
    })
  }, [selectedTenant])

  // Live amount preview for monthly tenants
  const liveAmount = (() => {
    if (!selectedTenant || selectedTenant.billing_type !== 'monthly' || !selectedTenant.unit_id) return null
    if (!settings) return null
    const wp = parseFloat(waterPrevious)
    const wc = parseFloat(waterCurrent)
    const ep = parseFloat(elecPrevious)
    const ec = parseFloat(elecCurrent)
    if (isNaN(wp) || isNaN(wc) || isNaN(ep) || isNaN(ec)) return null
    if (wc < wp || ec < ep) return null
    // We don't have unit.monthly_rate here without fetching; show N/A until submit
    return null // will be calculated at submit time; show line items if we can
  })()

  // Derived line items for preview (no async needed for utilities)
  const previewLines = (() => {
    if (!selectedTenant || selectedTenant.billing_type !== 'monthly' || !settings) return null
    const wp = parseFloat(waterPrevious)
    const wc = parseFloat(waterCurrent)
    const ep = parseFloat(elecPrevious)
    const ec = parseFloat(elecCurrent)
    if (isNaN(wp) || isNaN(wc) || isNaN(ep) || isNaN(ec)) return null
    if (wc < wp || ec < ep) return null
    const waterAmt = calcWaterCharge(wp, wc, settings.water_rate)
    const elecAmt = calcElectricityCharge(ep, ec, settings.electricity_rate)
    const internetAmt = calcInternetCharge(selectedTenant.include_internet ?? false, settings.internet_rate)
    return { waterAmt, elecAmt, internetAmt, waterUsage: wc - wp, elecUsage: ec - ep, includeInternet: selectedTenant.include_internet }
  })()

  async function handleSubmit() {
    const errs: Record<string, string> = {}
    if (!selectedTenant) errs.tenant = 'Please select a tenant'
    if (!periodStart) errs.periodStart = 'Period start is required'
    if (!periodEnd) errs.periodEnd = 'Period end is required'
    if (!dueDate) errs.dueDate = 'Due date is required'

    if (selectedTenant?.billing_type === 'monthly') {
      const wp = parseFloat(waterPrevious)
      const wc = parseFloat(waterCurrent)
      const ep = parseFloat(elecPrevious)
      const ec = parseFloat(elecCurrent)
      if (isNaN(wp) || isNaN(wc)) errs.water = 'Valid water readings required'
      else if (wc < wp) errs.water = 'Current reading must be ≥ previous'
      if (isNaN(ep) || isNaN(ec)) errs.electricity = 'Valid electricity readings required'
      else if (ec < ep) errs.electricity = 'Current reading must be ≥ previous'
    }

    if (Object.keys(errs).length) { setErrors(errs); return }
    if (!selectedTenant!.unit_id) { setErrors({ tenant: 'Tenant has no unit assigned' }); return }

    try {
      const unit = await fetchUnit(selectedTenant!.unit_id)
      if (!unit) { setErrors({ tenant: 'Unit not found' }); return }

      let amount: number
      let billExtras: {
        water_previous?: number
        water_current?: number
        electricity_previous?: number
        electricity_current?: number
      } = {}

      if (selectedTenant!.billing_type === 'monthly') {
        if (!settings) { Alert.alert('Error', 'Settings not loaded. Please try again.'); return }
        const rent = calcMonthlyAmount(unit.monthly_rate ?? 0)
        const wp = parseFloat(waterPrevious)
        const wc = parseFloat(waterCurrent)
        const ep = parseFloat(elecPrevious)
        const ec = parseFloat(elecCurrent)
        const waterAmt = calcWaterCharge(wp, wc, settings.water_rate)
        const elecAmt = calcElectricityCharge(ep, ec, settings.electricity_rate)
        const internetAmt = calcInternetCharge(selectedTenant!.include_internet ?? false, settings.internet_rate)
        amount = parseFloat((rent + waterAmt + elecAmt + internetAmt).toFixed(2))
        billExtras = { water_previous: wp, water_current: wc, electricity_previous: ep, electricity_current: ec }
      } else {
        amount = calcDailyAmount(unit.daily_rate ?? 0, periodStart, periodEnd)
      }

      if (amount <= 0) {
        setErrors({ tenant: 'Unit has no rate configured. Set a rate on the unit first.' })
        return
      }

      await mutateAsync({
        tenant_id: selectedTenant!.id,
        unit_id: selectedTenant!.unit_id,
        amount,
        billing_type: selectedTenant!.billing_type,
        period_start: periodStart,
        period_end: periodEnd,
        due_date: dueDate,
        notes: notes.trim() || undefined,
        ...billExtras,
      })
      router.back()
    } catch {
      Alert.alert('Error', 'Could not create bill. Please try again.')
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-app">
      <ScrollView contentContainerClassName="p-4 pb-32" {...tabBarScroll}>
        <Select
          label="Tenant"
          placeholder="Select a tenant…"
          options={(tenants ?? []).map((t) => ({
            value: t.id,
            label: `${t.full_name} — Unit ${t.unit?.unit_number ?? '?'} (${t.billing_type})`,
          }))}
          value={selectedTenantId}
          onChange={(val) => setSelectedTenantId(val)}
          error={errors.tenant}
        />

        {selectedTenant?.billing_type === 'monthly' && (
          <Card className="mb-4 mt-2">
            <AppText variant="subheading" className="mb-3">Meter Readings</AppText>
            <Input label="Water Previous (cu.m)" value={waterPrevious} onChangeText={setWaterPrevious} keyboardType="decimal-pad" error={errors.water} />
            <Input label="Water Current (cu.m)" value={waterCurrent} onChangeText={setWaterCurrent} keyboardType="decimal-pad" />
            <Input label="Electricity Previous (kWh)" value={elecPrevious} onChangeText={setElecPrevious} keyboardType="decimal-pad" error={errors.electricity} />
            <Input label="Electricity Current (kWh)" value={elecCurrent} onChangeText={setElecCurrent} keyboardType="decimal-pad" />

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
                {previewLines.includeInternet && (
                  <View className="flex-row justify-between">
                    <AppText color="secondary">Internet</AppText>
                    <AppText>{formatCurrency(previewLines.internetAmt)}</AppText>
                  </View>
                )}
                {!previewLines.includeInternet && (
                  <View className="flex-row justify-between">
                    <AppText color="secondary">Internet</AppText>
                    <AppText color="muted">Free</AppText>
                  </View>
                )}
              </View>
            )}
          </Card>
        )}

        <DateInput label="Period Start" value={periodStart} onChange={setPeriodStart} error={errors.periodStart} />
        <DateInput label="Period End" value={periodEnd} onChange={setPeriodEnd} error={errors.periodEnd} />
        <DateInput label="Due Date" value={dueDate} onChange={setDueDate} error={errors.dueDate} />
        <Input label="Notes (optional)" value={notes} onChangeText={setNotes} multiline numberOfLines={2} />

        <Button label="Create Bill" onPress={handleSubmit} loading={isPending} className="mt-4" />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
