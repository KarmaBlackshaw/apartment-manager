import React, { useState, useEffect } from 'react'
import { ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useTabBarScrollHandler } from '../../../hooks/useTabBarScrollHandler'
import { useSettings, useUpdateSetting } from '../../../hooks/useSettings'
import { Input, Button, LoadingSpinner } from '../../../components/ui'

export default function RatesSettingsScreen() {
  const tabBarScroll = useTabBarScrollHandler()
  const { data: settings, isLoading } = useSettings()
  const { mutateAsync: save, isPending } = useUpdateSetting()

  const [waterRate, setWaterRate] = useState('')
  const [elecRate, setElecRate] = useState('')
  const [internetRate, setInternetRate] = useState('')

  useEffect(() => {
    if (!settings) return
    setWaterRate(String(settings.water_rate))
    setElecRate(String(settings.electricity_rate))
    setInternetRate(String(settings.internet_rate))
  }, [settings])

  async function handleSave() {
    const wr = parseFloat(waterRate)
    const er = parseFloat(elecRate)
    const ir = parseFloat(internetRate)
    if (isNaN(wr) || wr <= 0) { Alert.alert('Error', 'Invalid water rate'); return }
    if (isNaN(er) || er <= 0) { Alert.alert('Error', 'Invalid electricity rate'); return }
    if (isNaN(ir) || ir < 0)  { Alert.alert('Error', 'Invalid internet rate'); return }
    try {
      await save({ key: 'water_rate', value: String(wr) })
      await save({ key: 'electricity_rate', value: String(er) })
      await save({ key: 'internet_rate', value: String(ir) })
      Alert.alert('Saved', 'Rates updated.')
    } catch {
      Alert.alert('Error', 'Could not save rates.')
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#0d0d0d' }}>
      <ScrollView contentContainerClassName="p-4 pb-32" {...tabBarScroll}>
        <Input label="Water Rate (PHP / cu.m)" value={waterRate} onChangeText={setWaterRate} keyboardType="decimal-pad" />
        <Input label="Electricity Rate (PHP / kWh)" value={elecRate} onChangeText={setElecRate} keyboardType="decimal-pad" />
        <Input label="Internet Rate (PHP / mo)" value={internetRate} onChangeText={setInternetRate} keyboardType="decimal-pad" />
        <Button label="Save Rates" onPress={handleSave} loading={isPending} className="mt-4" />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
