import React, { useState } from 'react'
import { View, Text, ScrollView, Pressable, Share } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import dayjs from 'dayjs'
import { ScreenLayout } from '~/layouts/ScreenLayout'
import { FilterChipBar } from '~/components/ui/FilterChipBar'
import { SectionHeader } from '~/components/ui/SectionHeader'
import { InfoRow } from '~/components/ui/InfoRow'
import { LoadingSpinner } from '~/components/ui/LoadingSpinner'
import { colors } from '~/constants/theme'
import { buildCSV } from '~/lib/csv'
import { useAnnualSummary } from '~/hooks/useReports'

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = [0, 1, 2].map((i) => ({
  label: String(CURRENT_YEAR - i),
  value: String(CURRENT_YEAR - i),
}))

function formatAmount(n: number) {
  return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function monthPerformanceColor(billed: number, collected: number): string {
  if (billed === 0 || collected === 0) return colors.textMuted
  const ratio = collected / billed
  if (ratio >= 0.9) return colors.success
  if (ratio >= 0.5) return colors.warning
  return colors.danger
}

export default function AnnualSummaryScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>()
  const [year, setYear] = useState(CURRENT_YEAR)
  const { data, isLoading } = useAnnualSummary(year, propertyId)

  const currentMonthShort = dayjs().format('MMM').toUpperCase()

  async function handleExport() {
    if (!data) return
    const csv = buildCSV(
      ['Month', 'Billed', 'Collected'],
      data.monthly.map((m) => [m.month, m.billed, m.collected]),
    )
    await Share.share({ message: csv })
  }

  const exportBtn = (
    <Pressable onPress={handleExport} hitSlop={8} disabled={!data}>
      <Text className="text-primary text-sm font-medium pr-3">Export</Text>
    </Pressable>
  )

  const report = data ?? {
    year,
    ytdIncome: 0,
    projectedFullYear: 0,
    totalBilled: 0,
    totalCollected: 0,
    collectionRate: 0,
    maintenanceSpend: 0,
    monthly: [],
  }

  return (
    <ScreenLayout title="Annual Summary" headerRight={exportBtn} backHref="/(admin)/reports">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 128 }}>
          <FilterChipBar
            options={YEAR_OPTIONS}
            selected={String(year)}
            onChange={(v) => setYear(Number(v))}
          />

          <View className="mx-4 mt-1 rounded-xl p-5 bg-success-bg">
            <Text className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              YTD INCOME (JAN–{currentMonthShort})
            </Text>
            <Text className="text-[32px] font-bold mt-1 text-success">
              {formatAmount(report.ytdIncome)}
            </Text>
            <Text className="text-xs mt-1 text-text-muted">
              Projected full year: {formatAmount(report.projectedFullYear)}
            </Text>
          </View>

          <SectionHeader title="Monthly Breakdown" />
          <View className="mx-4 rounded-xl overflow-hidden bg-surface">
            {report.monthly.map((m, idx) => (
              <InfoRow
                key={m.month}
                label={m.month}
                value={formatAmount(m.collected)}
                valueColor={monthPerformanceColor(m.billed, m.collected)}
                showDivider={idx < report.monthly.length - 1}
              />
            ))}
          </View>

          <SectionHeader title="Summary" />
          <View className="mx-4 rounded-xl overflow-hidden bg-surface">
            <InfoRow label="Total billed" value={formatAmount(report.totalBilled)} />
            <InfoRow
              label="Total collected"
              value={formatAmount(report.totalCollected)}
              valueColor={colors.success}
            />
            <InfoRow
              label="Collection rate"
              value={`${report.collectionRate}%`}
              valueColor={colors.success}
            />
            <InfoRow
              label="Maintenance spend"
              value={formatAmount(report.maintenanceSpend)}
              valueColor={colors.warning}
              showDivider={false}
            />
          </View>
        </ScrollView>
      )}
    </ScreenLayout>
  )
}
