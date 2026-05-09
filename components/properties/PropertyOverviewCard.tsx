import React from 'react'
import { View } from 'react-native'
import { Card } from '~/components/ui/Card'
import { AppText } from '~/components/ui/AppText'

interface PropertyChip {
  label: string
  variant?: 'neutral' | 'success' | 'danger'
}

interface PropertyOverviewCardProps {
  name: string
  address: string
  chips: PropertyChip[]
  monthlyIncome: number
  occupancyPct: number
  onPress: () => void
}

const chipBgClass: Record<'neutral' | 'success' | 'danger', string> = {
  neutral: 'bg-elevated',
  success: 'bg-success-bg',
  danger:  'bg-danger-bg',
}

const chipTextClass: Record<'neutral' | 'success' | 'danger', string> = {
  neutral: 'text-text-secondary',
  success: 'text-success-text',
  danger:  'text-danger-text',
}

function PropertyChipBadge({ label, variant = 'neutral' }: PropertyChip) {
  return (
    <View className={`px-2 py-[3px] rounded-full ${chipBgClass[variant]}`}>
      <AppText className={`text-[11px] font-medium ${chipTextClass[variant]}`}>{label}</AppText>
    </View>
  )
}

export function PropertyOverviewCard({
  name,
  address,
  chips,
  monthlyIncome,
  occupancyPct,
  onPress,
}: PropertyOverviewCardProps) {
  const clampedPct = Math.min(100, Math.max(0, occupancyPct))

  return (
    <Card onPress={onPress} size="lg" className="mb-3" accessibilityLabel={name}>
      <AppText className="text-base font-bold text-text-primary">{name}</AppText>
      <AppText className="text-[13px] text-text-secondary mt-[2px]">{address}</AppText>

      <View className="flex-row gap-[6px] mt-2 flex-wrap">
        {chips.map((chip, index) => (
          <PropertyChipBadge key={index} label={chip.label} variant={chip.variant} />
        ))}
      </View>

      <View className="mt-3 w-full h-1 rounded-full bg-elevated overflow-hidden">
        <View
          className="h-1 rounded-full bg-success"
          style={{ width: `${clampedPct}%` }}
        />
      </View>

      <View className="mt-2 flex-row justify-between">
        <AppText className="text-xs text-text-muted">Monthly income</AppText>
        <AppText className="text-xs text-text-secondary" style={{ fontVariant: ['tabular-nums'] }}>
          {`₱${monthlyIncome.toLocaleString('en-PH')}`}
        </AppText>
      </View>
    </Card>
  )
}
