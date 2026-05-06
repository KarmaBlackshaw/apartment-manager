import React, { useState } from 'react'
import { View, ScrollView, Text, StyleSheet, Pressable, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import dayjs from 'dayjs'
import {
  ScreenHeader,
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
    <View style={styles.container}>
      <ScreenHeader title="Generate Bills" left="back" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Month selector */}
        <View style={styles.monthSelectorWrap}>
          <MonthTabSelector
            months={monthEntries.map((m) => m.label)}
            selected={selectedLabel}
            onChange={setSelectedLabel}
          />
        </View>

        {/* Scope toggle */}
        <View style={styles.scopeWrap}>
          <SegmentedControl
            options={['All Properties']}
            selected="All Properties"
            onChange={() => {}}
            fullWidth={true}
          />
        </View>

        {/* Preview card */}
        <View style={styles.previewCard}>
          <SectionHeader
            title={`Preview — ${dayjs(selectedMonth).format('MMMM YYYY')}`}
          />
          {previewLoading ? (
            <View style={styles.previewLoading}>
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
        <View style={styles.bannerWrap}>
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
        <Pressable onPress={router.back} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </BottomCTABar>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  monthSelectorWrap: {
    marginTop: 16,
  },
  scopeWrap: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  previewCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
  },
  previewLoading: {
    height: 120,
  },
  bannerWrap: {
    marginTop: 12,
    marginHorizontal: 16,
  },
  cancelButton: {
    alignItems: 'center',
    paddingTop: 12,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
})
