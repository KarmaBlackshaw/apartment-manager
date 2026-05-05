import React, { useState, useEffect } from 'react'
import { View, ScrollView, Alert, Switch } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTabBarScrollHandler } from '../../../hooks/useTabBarScrollHandler'
import { useTenant, useUpdateTenant, useDeactivateTenant } from '../../../hooks/useTenants'
import { fetchLastBillForTenant, createBill } from '../../../lib/api/bills'
import { fetchUnit } from '../../../lib/api/units'
import { Input, Button, AppText, LoadingSpinner, Card, Badge, billingBadge, tenantStatusBadge } from '../../../components/ui'

export default function TenantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const tabBarScroll = useTabBarScrollHandler()
  const { data: tenant, isLoading, isError } = useTenant(id)
  const { mutateAsync: update, isPending: updating } = useUpdateTenant()
  const { mutateAsync: deactivate, isPending: deactivating } = useDeactivateTenant()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; phone?: string }>({})
  const [extendDays, setExtendDays] = useState('')
  const [extending, setExtending] = useState(false)

  useEffect(() => {
    if (tenant) {
      setFullName(tenant.full_name)
      setEmail(tenant.email)
      setPhone(tenant.phone)
    }
  }, [tenant])

  if (isLoading) return <LoadingSpinner />
  if (isError) return (
    <View className="flex-1 items-center justify-center p-8 bg-app">
      <AppText color="danger" className="text-center">Could not load tenant. Please restart the app.</AppText>
    </View>
  )
  if (!tenant) return (
    <View className="flex-1 items-center justify-center p-8 bg-app">
      <AppText color="danger" className="text-center">Tenant not found.</AppText>
    </View>
  )

  const billing = billingBadge(tenant.billing_type)
  const statusBadge = tenantStatusBadge(tenant.status)

  async function handleSave() {
    const errs: typeof errors = {}
    if (!fullName.trim()) errs.fullName = 'Name is required'
    if (!email.trim()) errs.email = 'Email is required'
    if (!phone.trim()) errs.phone = 'Phone is required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    try {
      await update({ id, input: { full_name: fullName.trim(), email: email.trim(), phone: phone.trim() } })
      router.back()
    } catch {
      Alert.alert('Error', 'Could not save changes. Please try again.')
    }
  }

  async function handleExtend() {
    const t = tenant!
    const d = parseInt(extendDays)
    if (isNaN(d) || d < 1) { Alert.alert('Error', 'Enter a valid number of days'); return }
    if (!t.unit_id) { Alert.alert('Error', 'Tenant has no unit assigned'); return }
    setExtending(true)
    try {
      const [lastBill, unit] = await Promise.all([
        fetchLastBillForTenant(id),
        fetchUnit(t.unit_id),
      ])
      if (!unit?.daily_rate) { Alert.alert('Error', 'Unit has no daily rate configured'); return }
      const startDate = (() => {
        const base = lastBill?.period_end ?? t.move_in_date
        const dt = new Date(base)
        dt.setDate(dt.getDate() + 1)
        return dt.toISOString().split('T')[0]
      })()
      const endDate = (() => {
        const dt = new Date(startDate)
        dt.setDate(dt.getDate() + d - 1)
        return dt.toISOString().split('T')[0]
      })()
      await createBill({
        tenant_id: id,
        unit_id: t.unit_id,
        amount: parseFloat((unit.daily_rate * d).toFixed(2)),
        billing_type: 'daily',
        period_start: startDate,
        period_end: endDate,
        due_date: endDate,
      })
      setExtendDays('')
      Alert.alert('Done', `Extended stay by ${d} day${d > 1 ? 's' : ''}.`)
    } catch {
      Alert.alert('Error', 'Could not extend stay. Please try again.')
    } finally {
      setExtending(false)
    }
  }

  function handleDeactivate() {
    Alert.alert('Move Out Tenant', `Mark ${tenant!.full_name} as moved out?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Move Out', style: 'destructive',
        onPress: async () => {
          try {
            await deactivate({ id, unitId: tenant!.unit_id! })
            router.back()
          } catch {
            Alert.alert('Error', 'Could not move out tenant. Please try again.')
          }
        },
      },
    ])
  }

  return (
    <ScrollView className="flex-1 bg-app" contentContainerClassName="p-4 pb-32" {...tabBarScroll}>

      <Card className="mb-4">
        <View className="flex-row items-center gap-2 mb-2">
          <Badge label={statusBadge.label} variant={statusBadge.variant} />
          <Badge label={billing.label} variant={billing.variant} />
        </View>
        {tenant.unit && <AppText color="secondary" variant="caption">Unit {tenant.unit.unit_number}</AppText>}
        <AppText color="secondary" variant="caption">Move-in: {tenant.move_in_date}</AppText>
        {tenant.due_day != null && (
          <AppText color="secondary" variant="caption">Due: every {tenant.due_day} of the month</AppText>
        )}
        {tenant.address && <AppText color="secondary" variant="caption">Address: {tenant.address}</AppText>}
        {tenant.emergency_contact && (
          <AppText color="secondary" variant="caption">Emergency: {tenant.emergency_contact}</AppText>
        )}
        {tenant.billing_type === 'monthly' && (
          <>
            <AppText color="secondary" variant="caption">
              Internet: {tenant.include_internet ? 'Included' : 'Not included'}
            </AppText>
            {tenant.water_reading != null && (
              <AppText color="secondary" variant="caption">Initial water: {tenant.water_reading} cu.m</AppText>
            )}
            {tenant.electricity_reading != null && (
              <AppText color="secondary" variant="caption">Initial electricity: {tenant.electricity_reading} kWh</AppText>
            )}
          </>
        )}
      </Card>

      <Input label="Full Name" value={fullName} onChangeText={setFullName} error={errors.fullName} />
      <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
      <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" error={errors.phone} />

      <Button label="Save Changes" onPress={handleSave} loading={updating} className="mb-3" />

      {tenant.billing_type === 'monthly' && tenant.status === 'active' && (
        <Button label="Create Bill" variant="secondary"
          onPress={() => router.push({ pathname: '/(admin)/billing/new', params: { tenantId: id } })}
          className="mb-3" />
      )}

      {tenant.billing_type === 'daily' && tenant.status === 'active' && (
        <Card className="mb-3">
          <AppText variant="subheading" className="mb-3">Extend Stay</AppText>
          <Input label="Additional Days" value={extendDays} onChangeText={setExtendDays} keyboardType="number-pad" placeholder="e.g. 3" />
          <Button label="Extend Stay" onPress={handleExtend} loading={extending} />
        </Card>
      )}

      {tenant.status === 'active' && (
        <Button label="Move Out Tenant" variant="danger" onPress={handleDeactivate} loading={deactivating} />
      )}
    </ScrollView>
  )
}
