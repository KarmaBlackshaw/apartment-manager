import React from 'react'
import { Card } from '~/components/ui/Card'
import { AppText } from '~/components/ui/AppText'

type BedStatus = 'paid' | 'overdue' | 'vacant'

interface BedSlotCardProps {
  bedLabel: string
  tenantName?: string
  status: BedStatus
  onPress?: () => void
}

const statusBgClass: Record<BedStatus, string> = {
  paid:    'bg-success-bg',
  overdue: 'bg-danger-bg',
  vacant:  'bg-neutral-bg',
}

export function BedSlotCard({
  bedLabel,
  tenantName,
  status,
  onPress,
}: BedSlotCardProps) {
  return (
    <Card
      size="sm"
      className={statusBgClass[status]}
      onPress={onPress}
      accessibilityLabel={bedLabel}
    >
      <AppText className="text-xs font-semibold text-text-primary">{bedLabel}</AppText>
      <AppText className="text-[11px] text-text-secondary mt-[2px]">
        {tenantName ?? 'Vacant'}
      </AppText>
    </Card>
  )
}

