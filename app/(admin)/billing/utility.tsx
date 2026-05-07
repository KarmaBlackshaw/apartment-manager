import React, { useState, useEffect } from 'react'
import { View, ScrollView, Text } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import dayjs from 'dayjs'
import {
  FilterChipBar,
  InfoRow,
  AmountText,
  BottomCTABar,
  Button,
  LoadingSpinner,
  Input,
} from '../../../components/ui'
import { ScreenLayout } from '../../../layouts/ScreenLayout'
import { useSettings } from '../../../hooks/useSettings'
import { useUnit } from '../../../hooks/useUnits'
import { useUtilityReading, useUpsertUtilityReading } from '../../../hooks/useUtilityReadings'

const UTILITY_OPTIONS = [
  { label: 'Electricity', value: 'electricity' },
  { label: 'Water', value: 'water' },
]

export default function UtilityReadingScreen() {
  const { unitId = '', month: monthParam = dayjs().format('YYYY-MM') } =
    useLocalSearchParams<{ unitId: string; month: string }>()
  const month = monthParam
  const router = useRouter()

  const { data: settings } = useSettings()
  const { data: unit, isLoading: unitLoading } = useUnit(unitId)

  const [utilityType, setUtilityType] = useState<'electricity' | 'water'>('electricity')
  const [currentReading, setCurrentReading] = useState('')
  const [rateInput, setRateInput] = useState('')

  const { data: existingReading, isLoading: readingLoading } = useUtilityReading(
    unitId,
    month,
    utilityType,
  )
  const { mutateAsync, isPending } = useUpsertUtilityReading()

  // Pre-fill rate from settings when type or settings changes
  useEffect(() => {
    if (settings) {
      const defaultRate =
        utilityType === 'electricity'
          ? String(settings.electricity_rate)
          : String(settings.water_rate)
      setRateInput(defaultRate)
    }
  }, [utilityType, settings])

  // Pre-fill current reading from existing if available
  useEffect(() => {
    if (existingReading?.current_reading != null) {
      setCurrentReading(String(existingReading.current_reading))
    } else {
      setCurrentReading('')
    }
  }, [existingReading])

  const prevReading = existingReading?.previous_reading ?? 0
  const parsedCurrent = parseFloat(currentReading) || 0
  const parsedRate = parseFloat(rateInput) || 0
  const usage = Math.max(0, parsedCurrent - prevReading)
  const computedCharge = usage * parsedRate
  const unitLabel = utilityType === 'electricity' ? 'kWh' : 'cu.m'

  async function handleSave() {
    await mutateAsync({
      unit_id: unitId,
      month,
      type: utilityType,
      previous_reading: prevReading,
      current_reading: parsedCurrent,
      rate: parsedRate,
    })
    router.back()
  }

  if (unitLoading || readingLoading) return <LoadingSpinner />

  return (
    <ScreenLayout title="Utility Reading" backHref="/(admin)/billing">

      {/* Context label */}
      <Text className="text-text-secondary text-[13px] text-center py-2">
        {unit ? `Unit ${unit.unit_number}` : 'Unit —'} · {dayjs(month).format('MMMM YYYY')}
      </Text>

      {/* Utility type selector */}
      <FilterChipBar
        options={UTILITY_OPTIONS}
        selected={utilityType}
        onChange={(v) => setUtilityType(v as 'electricity' | 'water')}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Fields section */}
        <View className="bg-surface rounded-md mx-4 mt-2 overflow-hidden">
          <InfoRow
            label="Previous reading"
            value={`${prevReading.toFixed(1)} ${unitLabel}`}
            showDivider={true}
          />

          <View className="px-4 pt-3 pb-1">
            <Text className="text-[13px] text-text-secondary mb-1.5 font-medium">
              Current reading
            </Text>
            <Input
              keyboardType="numeric"
              autoFocus
              placeholder="0.00"
              value={currentReading}
              onChangeText={setCurrentReading}
              returnKeyType="next"
            />
          </View>

          <View className="px-4 pt-3 pb-1">
            <Text className="text-[13px] text-text-secondary mb-1.5 font-medium">
              Rate per {unitLabel}
            </Text>
            <Input
              keyboardType="numeric"
              placeholder="0.00"
              value={rateInput}
              onChangeText={setRateInput}
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Computed charge card */}
        <View className="bg-success-bg rounded-md mx-4 mt-3 p-4 items-center">
          <Text
            className="text-text-muted text-xs uppercase mb-1"
            style={{ letterSpacing: 0.5 }}
          >
            COMPUTED CHARGE
          </Text>
          <AmountText amount={computedCharge} variant="paid" size="large" />
          <Text className="text-text-muted text-[13px] mt-1">
            {usage.toFixed(1)} {unitLabel} × ₱{parsedRate.toFixed(2)}/unit
          </Text>
        </View>
      </ScrollView>

      <BottomCTABar>
        <Button
          label={`Add to ${dayjs(month).format('MMMM YYYY')} Bill`}
          variant="primary"
          onPress={handleSave}
          loading={isPending}
        />
      </BottomCTABar>
    </ScreenLayout>
  )
}
