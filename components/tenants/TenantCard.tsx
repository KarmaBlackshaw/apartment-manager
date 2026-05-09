import React from 'react'
import { View } from 'react-native'
import { Card } from '~/components/ui/Card'
import { AppText } from '~/components/ui/AppText'
import { Badge, billingBadge, tenantStatusBadge } from '~/components/ui/Badge'
import type { TenantWithUnit } from '~/types'

interface TenantCardProps {
  tenant: TenantWithUnit
  onPress: () => void
}

export function TenantCard({ tenant, onPress }: TenantCardProps) {
  const billing = billingBadge(tenant.billing_type)
  const status = tenantStatusBadge(tenant.status)

  return (
    <Card onPress={onPress} accessibilityLabel={tenant.full_name} className="mb-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <AppText variant="subheading">{tenant.full_name}</AppText>
          <AppText color="secondary" variant="caption">{tenant.email}</AppText>
        </View>
        <Badge label={status.label} variant={status.variant} />
      </View>
      <View className="flex-row items-center gap-2 mt-2">
        <Badge label={billing.label} variant={billing.variant} />
        {tenant.unit && (
          <AppText variant="caption" color="secondary">Unit {tenant.unit.unit_number}</AppText>
        )}
      </View>
    </Card>
  )
}
