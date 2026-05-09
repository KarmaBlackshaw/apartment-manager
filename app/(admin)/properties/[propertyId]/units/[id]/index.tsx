import React from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import dayjs from 'dayjs'
import { useUnitDetail } from '~/hooks/useUnits'
import { LoadingSpinner } from '~/components/ui/LoadingSpinner'
import { ScreenLayout } from '~/layouts/ScreenLayout'
import { AppText } from '~/components/ui/AppText'
import { StatusChip } from '~/components/ui/StatusChip'
import { AvatarInitials } from '~/components/ui/AvatarInitials'
import { BalanceCard } from '~/components/billing/BalanceCard'
import { SectionHeader } from '~/components/ui/SectionHeader'
import { AmountText } from '~/components/ui/AmountText'
import { InfoRow } from '~/components/ui/InfoRow'
import { MaintenanceRow } from '~/components/maintenance/MaintenanceRow'
import { DocumentRow } from '~/components/documents/DocumentRow'
import { EmptyState } from '~/components/ui/EmptyState'
import { getBalanceBreakdown } from '~/lib/balance'
import { formatPHP } from '~/lib/format'
import { formatDate } from '~/lib/date'

function getOccupancyChip(unitStatus: string): { variant: 'success' | 'neutral' | 'warning'; label: string } {
  switch (unitStatus) {
    case 'occupied':
      return { variant: 'success', label: 'OCCUPIED' }
    case 'available':
      return { variant: 'neutral', label: 'VACANT' }
    case 'maintenance':
      return { variant: 'warning', label: 'MAINTENANCE' }
    default:
      return { variant: 'neutral', label: 'UNKNOWN' }
  }
}

function toMaintenanceRowStatus(status: string): 'reported' | 'in-progress' | 'resolved' {
  switch (status) {
    case 'REPORTED':
      return 'reported'
    case 'IN_PROGRESS':
      return 'in-progress'
    case 'RESOLVED':
      return 'resolved'
    default:
      return 'reported'
  }
}



export default function UnitDetailScreen() {
  const { propertyId, id } = useLocalSearchParams<{ propertyId: string; id: string }>()
  const router = useRouter()
  const { data: unit, isLoading } = useUnitDetail(id)

  if (isLoading) return <LoadingSpinner />
  if (!unit) {
    return (
      <View className="flex-1 items-center justify-center p-8 bg-background">
        <AppText className="text-danger text-center">Unit not found.</AppText>
      </View>
    )
  }

  const isOccupied = unit.status === 'occupied' && unit.tenant != null
  const occupancyChip = getOccupancyChip(unit.status)
  const balance = unit.balance

  const billingDayLabel = unit.billing_day ? `Every ${dayjs().date(unit.billing_day).format('Do')}` : null
  const statusLabel = isOccupied ? `Occupied · ${unit.tenant!.full_name}` : 'Vacant'

  return (
    <ScreenLayout
      title={`Unit ${unit.unit_number}`}
      backHref={`/(admin)/properties/${propertyId}`}
      headerRight={
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => router.push(`/(admin)/properties/${propertyId}/units/${id}/edit` as never)}
            className="p-2"
            accessibilityLabel="Edit unit"
          >
            <Ionicons name="create-outline" size={24} color="#fff" />
          </Pressable>
        </View>
      }
    >
      <ScrollView contentContainerClassName="px-4 pt-3 pb-[88px]">
        {/* Unit info card */}
        <View className="rounded-xl bg-surface p-4">
          <AppText variant="heading" className="mb-3">
            Unit {unit.unit_number}
          </AppText>
          {unit.monthly_rate && <InfoRow label="Rent" value={`${formatPHP(unit.monthly_rate)} / mo`} />}
          {billingDayLabel && <InfoRow label="Billing day" value={billingDayLabel} />}
          <InfoRow label="Status" value={statusLabel} />
          {unit.notes && <InfoRow label="Notes" value={unit.notes} />}
        </View>

        {/* Tenant summary (only if occupied) */}
        {isOccupied && unit.tenant && (
          <Pressable
            onPress={() => router.push(`/(admin)/tenants/${unit.tenant!.id}`)}
            className="mt-3 flex-row items-center rounded-xl bg-surface p-4"
            accessibilityLabel={`View tenant ${unit.tenant.full_name}`}
          >
            <AvatarInitials name={unit.tenant.full_name} size="md" />
            <View className="ml-3 flex-1">
              <AppText variant="body" className="font-semibold">
                {unit.tenant.full_name}
              </AppText>
              <AppText variant="caption" color="muted" className="mt-1">
                Move-in {formatDate(unit.tenant.move_in_date)} ·{' '}
                {unit.tenant.billing_type === 'monthly' ? 'Month-to-month' : 'Daily'}
              </AppText>
            </View>
            <View className="items-end">
              <AmountText amount={balance} variant={balance > 0 ? 'owed' : 'zero'} />
              <AppText variant="caption" color="muted" className="mt-1">
                balance
              </AppText>
            </View>
          </Pressable>
        )}

        {/* Balance card (only if occupied) */}
        {isOccupied && (
          <View className="mt-3">
            <BalanceCard
              amount={balance}
              variant={balance > 0 ? 'danger' : 'success'}
              breakdown={getBalanceBreakdown(unit)}
              onRecordPayment={() =>
                router.push({
                  pathname: '/(admin)/billing/new',
                  params: { tenantId: unit.tenant!.id, unitId: id },
                })
              }
            />
          </View>
        )}

        {/* Maintenance section */}
        <View className="mt-3">
          <SectionHeader
            title="Maintenance"
            count={unit.openMaintenanceCount}
            onViewAll={() => router.push(`/(admin)/maintenance?unitId=${id}` as never)}
          />
          {unit.recentMaintenance.length > 0 ? (
            unit.recentMaintenance.map((issue) => (
              <MaintenanceRow
                key={issue.id}
                title={issue.description}
                category={issue.category}
                date={issue.reported_at}
                status={toMaintenanceRowStatus(issue.status)}
                onPress={() => router.push(`/(admin)/maintenance/${issue.id}` as never)}
              />
            ))
          ) : (
            <AppText variant="caption" color="muted" className="px-4 py-2">
              No open maintenance issues
            </AppText>
          )}
        </View>

        {/* Documents section */}
        <View className="mt-3">
          <SectionHeader
            title="Documents"
            count={unit.recentDocuments.length}
            onViewAll={() =>
              router.push(`/(admin)/properties/${propertyId}/units/${id}/documents` as never)
            }
          />
          {unit.recentDocuments.length > 0 ? (
            unit.recentDocuments.map((doc) => (
              <DocumentRow
                key={doc.id}
                title={doc.title}
                category={doc.category as 'contract' | 'photo' | 'permit' | 'gov-id' | 'other'}
                date={doc.created_at}
                onPress={() =>
                  router.push(`/(admin)/properties/${propertyId}/units/${id}/documents` as never)
                }
              />
            ))
          ) : (
            <EmptyState size="sm" title="No documents" />
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  )
}
