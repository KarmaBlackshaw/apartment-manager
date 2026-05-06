import React, { useState } from 'react'
import { View, ScrollView, Text, Pressable, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import dayjs from 'dayjs'
import {
  AppHeader,
  MonthTabSelector,
  SegmentedControl,
  SectionHeader,
  InfoRow,
  WarningBanner,
  BottomCTABar,
  Button,
  LoadingSpinner,
} from '../../../components/ui'
import { colors } from '../../../constants/theme'
import { formatCurrency } from '../../../lib/billing'
import { useBillPreview, useGenerateBills } from '../../../hooks/useBillingOverview'

// Generate 3 months: current-1, current, current+1
function buildMonthEntries() {
  const now = dayjs()
  return [
    { label: now.subtract(1, 'month').format('MMM YYYY'), value: now.subtract(1, 'month').format('YYYY-MM') },
    { label: now.format('MMM YYYY'), value: now.format('YYYY-MM') },
    { label: now.add(1, 'month').format('MMM YYYY'), value: now.add(1, 'month').format('YYYY-MM') },
  ]
}

const monthEntries = buildMonthEntries()

export default function GenerateBillsScreen() {
  const router = useRouter()

  const [selectedLabel, setSelectedLabel] = useState(dayjs().format('MMM YYYY'))
  const selectedMonth =
    monthEntries.find((m) => m.label === selectedLabel)?.value ?? dayjs().format('YYYY-MM')

  const { data: preview, isLoading: previewLoading } = useBillPreview(selectedMonth)
  const { mutateAsync: generateMutate, isPending: isGenerating } = useGenerateBills()

  async function handleGenerate() {
    try {
      const count = await generateMutate({ month: selectedMonth })
      Alert.alert(
        'Done',
        `Generated ${count} bill${count !== 1 ? 's' : ''} for ${dayjs(selectedMonth).format('MMMM YYYY')}`,
        [{ text: 'OK', onPress: () => router.back() }],
      )
    } catch {
      Alert.alert('Error', 'Could not generate bills. Please try again.')
    }
  }

  return (
    <View className="flex-1 bg-background">
      <AppHeader title="Generate Bills" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Month selector */}
        <View className="mt-4">
          <MonthTabSelector
            months={monthEntries.map((m) => m.label)}
            selected={selectedLabel}
            onChange={setSelectedLabel}
          />
        </View>

        {/* Scope toggle */}
        <View className="mx-4 mt-3">
          <SegmentedControl
            options={['All Properties']}
            selected="All Properties"
            onChange={() => {}}
            fullWidth={true}
          />
        </View>

        {/* Preview card */}
        <View className="bg-surface rounded-md mx-4 mt-4 overflow-hidden">
          <SectionHeader
            title={`Preview — ${dayjs(selectedMonth).format('MMMM YYYY')}`}
          />
          {previewLoading ? (
            <View className="h-[120px]">
              <LoadingSpinner />
            </View>
          ) : (
            <>
              <InfoRow
                label="Active tenants"
                value={`${preview?.activeTenants ?? 0}`}
                showDivider={true}
              />
              <InfoRow
                label="Bills to generate"
                value={`${preview?.toGenerate ?? 0}`}
                showDivider={true}
              />
              <InfoRow
                label="Already generated"
                value={`${preview?.alreadyGenerated ?? 0}`}
                valueColor={colors.success}
                showDivider={true}
              />
              <InfoRow
                label="Total billed"
                value={preview ? formatCurrency(preview.totalBilled) : '₱0.00'}
                showDivider={false}
              />
            </>
          )}
        </View>

        {/* Warning banner */}
        <View className="mt-3 mx-4">
          <WarningBanner
            message="Existing bills will not be overwritten."
            variant="info"
          />
        </View>
      </ScrollView>

      <BottomCTABar>
        <Button
          label={`Generate ${preview?.toGenerate ?? 0} Bills for ${dayjs(selectedMonth).format('MMMM YYYY')}`}
          variant="primary"
          onPress={handleGenerate}
          loading={isGenerating}
          disabled={(preview?.toGenerate ?? 0) === 0}
        />
        <Pressable onPress={router.back} className="items-center pt-3">
          <Text className="text-text-secondary text-sm">Cancel</Text>
        </Pressable>
      </BottomCTABar>
    </View>
  )
}
