import React from 'react'
import { Text, View } from 'react-native'
import { StatusChip } from '../ui/StatusChip'

interface PropertySummaryCardProps {
  occupancyPct: number
  collectedThisMonth: number
  expectedMonthlyIncome: number
  overdueCount: number
  expiringContracts: number
}

export function PropertySummaryCard({
  occupancyPct,
  collectedThisMonth,
  expectedMonthlyIncome,
  overdueCount,
  expiringContracts,
}: PropertySummaryCardProps) {
  const collectionPct =
    expectedMonthlyIncome > 0
      ? Math.min(100, Math.round((collectedThisMonth / expectedMonthlyIncome) * 100))
      : 0

  const hasChips = overdueCount > 0 || expiringContracts > 0

  return (
    <View
      className="flex-row items-center bg-surface rounded-2xl"
      style={{ paddingVertical: 14, paddingHorizontal: 16, gap: 14 }}
    >
      <View className="items-center" style={{ minWidth: 52 }}>
        <Text className="text-[22px] font-bold text-success">{occupancyPct}%</Text>
        <Text className="text-[9px] text-text-muted">occupied</Text>
      </View>

      <View className="bg-border" style={{ width: 1, alignSelf: 'stretch' }} />

      <View className="flex-1">
        <Text className="text-[10px] text-text-muted" style={{ marginBottom: 4 }}>
          ₱{collectedThisMonth.toLocaleString('en-PH')} / ₱{expectedMonthlyIncome.toLocaleString('en-PH')} collected
        </Text>

        <View className="h-1 bg-elevated rounded-sm" style={{ marginBottom: 5 }}>
          <View className="h-full bg-success rounded-sm" style={{ width: `${collectionPct}%` }} />
        </View>

        {hasChips && (
          <View className="flex-row" style={{ gap: 5 }}>
            {overdueCount > 0 && (
              <StatusChip variant="danger" size="xs" label={`${overdueCount} issues`} />
            )}
            {expiringContracts > 0 && (
              <StatusChip variant="warning" size="xs" label={`${expiringContracts} expiring`} />
            )}
          </View>
        )}
      </View>
    </View>
  )
}
