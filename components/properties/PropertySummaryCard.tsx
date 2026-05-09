import React from 'react'
import { Text, View } from 'react-native'
import { Chip } from '~/components/ui/Chip'

interface PropertySummaryCardProps {
  occupancyPct: number
  collectedThisMonth: number
  expectedMonthlyIncome: number
  openIssueCount: number
  overdueCount: number
  expiringContracts: number
}

export function PropertySummaryCard({
  occupancyPct,
  collectedThisMonth,
  expectedMonthlyIncome,
  openIssueCount,
  overdueCount,
  expiringContracts,
}: PropertySummaryCardProps) {
  const collectionPct =
    expectedMonthlyIncome > 0
      ? Math.min(100, Math.round((collectedThisMonth / expectedMonthlyIncome) * 100))
      : 0

  const hasChips = openIssueCount > 0 || overdueCount > 0 || expiringContracts > 0

  return (
    <View
      className="flex-row items-center bg-surface rounded-2xl"
      style={{ paddingVertical: 14, paddingHorizontal: 16, gap: 14 }}
    >
      <View className="items-center" style={{ minWidth: 52 }}>
        <Text className="text-[26px] font-bold text-success">{occupancyPct}%</Text>
        <Text className="text-[9px] text-text-muted">occupied</Text>
      </View>

      <View className="bg-border" style={{ width: 1, alignSelf: 'stretch' }} />

      <View className="flex-1">
        <Text className="text-[10px] text-text-muted" style={{ marginBottom: 4 }}>
          ₱{collectedThisMonth.toLocaleString('en-PH')} / ₱{expectedMonthlyIncome.toLocaleString('en-PH')} collected
        </Text>

        <View className="h-1.5 bg-elevated rounded-sm" style={{ marginBottom: 5 }}>
          <View className="h-full bg-success rounded-sm" style={{ width: `${collectionPct}%` }} />
        </View>

        {hasChips && (
          <View className="flex-row" style={{ gap: 5 }}>
            {openIssueCount > 0 && (
              <Chip variant="danger" size="xs" label={`${openIssueCount} issues`} />
            )}
            {overdueCount > 0 && (
              <Chip variant="danger" size="xs" label={`${overdueCount} overdue`} />
            )}
            {expiringContracts > 0 && (
              <Chip variant="warning" size="xs" label={`${expiringContracts} expiring`} />
            )}
          </View>
        )}
      </View>
    </View>
  )
}
