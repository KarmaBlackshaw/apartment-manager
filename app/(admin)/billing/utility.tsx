import React, { useState, useEffect } from 'react'
import { View, ScrollView, Text, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import dayjs from 'dayjs'
import {
  ScreenHeader,
  FilterChipBar,
  InfoRow,
  AmountText,
  BottomCTABar,
  Button,
  LoadingSpinner,
} from '../../../components/ui'
import { Input } from '../../../components/ui'
import { colors } from '../../../constants/theme'
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
    <View style={styles.container}>
      <ScreenHeader title="Utility Reading" left="back" />

      {/* Context label */}
      <Text style={styles.contextLabel}>
        {unit ? `Unit ${unit.unit_number}` : 'Unit —'} · {dayjs(month).format('MMMM YYYY')}
      </Text>

      {/* Utility type selector */}
      <FilterChipBar
        options={UTILITY_OPTIONS}
        selected={utilityType}
        onChange={(v) => setUtilityType(v as 'electricity' | 'water')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Fields section */}
        <View style={styles.fieldsCard}>
          <InfoRow
            label="Previous reading"
            value={`${prevReading.toFixed(1)} ${unitLabel}`}
            showDivider={true}
          />

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Current reading</Text>
            <Input
              keyboardType="numeric"
              autoFocus
              placeholder="0.00"
              value={currentReading}
              onChangeText={setCurrentReading}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Rate per {unitLabel}</Text>
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
        <View style={styles.computedCard}>
          <Text style={styles.computedLabel}>COMPUTED CHARGE</Text>
          <AmountText amount={computedCharge} variant="paid" size="large" />
          <Text style={styles.computedDetail}>
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contextLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  fieldsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    overflow: 'hidden',
  },
  inputWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  inputLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  computedCard: {
    backgroundColor: colors.successBg,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    alignItems: 'center',
  },
  computedLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  computedDetail: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
})
