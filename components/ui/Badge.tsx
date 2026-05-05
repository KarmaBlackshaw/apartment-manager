import React from 'react'
import { View } from 'react-native'
import { AppText } from './AppText'
import type { BillingType, UnitStatus, BillStatus, TenantStatus } from '../../types'

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const bg: Record<BadgeVariant, string> = {
  success: 'bg-[#14532d]', warning: 'bg-[#78350f]',
  danger:  'bg-[#7f1d1d]', info:    'bg-[#1e3a5f]', neutral: 'bg-elevated',
}
const txt: Record<BadgeVariant, string> = {
  success: 'text-success', warning: 'text-warning',
  danger:  'text-danger',  info:    'text-[#60a5fa]', neutral: 'text-[#888888]',
}

export function Badge({ label, variant = 'neutral' }: { label: string; variant?: BadgeVariant }) {
  return (
    // @ts-ignore — className handled by NativeWind babel transform at runtime
    <View className={`px-2.5 py-0.5 rounded-full ${bg[variant]}`}>
      <AppText variant="caption" className={`font-medium ${txt[variant]}`}>{label}</AppText>
    </View>
  )
}

export const billingBadge = (t: BillingType) =>
  t === 'monthly' ? { label: 'Monthly', variant: 'info' as BadgeVariant } : { label: 'Daily', variant: 'warning' as BadgeVariant }

export const unitStatusBadge = (s: UnitStatus): { label: string; variant: BadgeVariant } => ({
  available:   { label: 'Available',   variant: 'success' as BadgeVariant },
  occupied:    { label: 'Occupied',    variant: 'info' as BadgeVariant },
  maintenance: { label: 'Maintenance', variant: 'warning' as BadgeVariant },
}[s])

export const billStatusBadge = (s: BillStatus): { label: string; variant: BadgeVariant } => ({
  pending: { label: 'Pending', variant: 'warning' as BadgeVariant },
  paid:    { label: 'Paid',    variant: 'success' as BadgeVariant },
  overdue: { label: 'Overdue', variant: 'danger' as BadgeVariant },
}[s])

export const tenantStatusBadge = (s: TenantStatus) =>
  s === 'active' ? { label: 'Active', variant: 'success' as BadgeVariant } : { label: 'Inactive', variant: 'neutral' as BadgeVariant }
