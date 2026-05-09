import React from 'react'
import { View } from 'react-native'
import { Card } from '~/components/ui/Card'
import { AppText } from '~/components/ui/AppText'
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
    <Card size="lg" className="flex-row items-center gap-3.5">
      <View className="items-center" style={{ minWidth: 52 }}>
        <AppText className="text-[26px] font-bold text-success">{occupancyPct}%</AppText>
        <AppText className="text-[9px] text-text-muted">occupied</AppText>
      </View>

      <View className="bg-border" style={{ width: 1, alignSelf: 'stretch' }} />

      <View className="flex-1">
        <AppText className="text-[10px] text-text-muted mb-1">
          ₱{collectedThisMonth.toLocaleString('en-PH')} / ₱{expectedMonthlyIncome.toLocaleString('en-PH')} collected
        </AppText>

        <View className="h-1.5 bg-elevated rounded-sm mb-[5px]">
          <View className="h-full bg-success rounded-sm" style={{ width: `${collectionPct}%` }} />
        </View>

        {hasChips && (
          <View className="flex-row gap-[5px]">
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
    </Card>
  )
}
