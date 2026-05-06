import React from 'react'
import { View, ScrollView, Text, TouchableOpacity } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import dayjs from 'dayjs'
import { useUnitDetail } from '../../../../../../hooks/useUnits'
import {
  AppHeader, LoadingSpinner, StatusChip, AvatarInitials,
  BalanceCard, SectionHeader, AmountText,
} from '../../../../../../components/ui'
import { AmenityChipSelector } from '../../../../../../components/properties/AmenityChipSelector'
import { colors } from '../../../../../../constants/theme'

const UNIT_TYPE_LABELS: Record<string, string> = {
  studio: 'Studio',
  '1br': '1BR',
  '2br': '2BR',
  bedspacer: 'Bedspacer',
}

function unitPaymentChipVariant(balance: number, isOccupied: boolean) {
  if (!isOccupied) return 'neutral' as const
  if (balance <= 0) return 'success' as const
  return 'danger' as const
}

function unitStatusLabel(balance: number, isOccupied: boolean) {
  if (!isOccupied) return 'VACANT'
  if (balance <= 0) return 'PAID'
  return 'OVERDUE'
}

export default function UnitDetailScreen() {
  const { propertyId, id } = useLocalSearchParams<{ propertyId: string; id: string }>()
  const router = useRouter()
  const { data: unit, isLoading } = useUnitDetail(id)

  if (isLoading) return <LoadingSpinner />
  if (!unit) return (
    <View className="flex-1 items-center justify-center p-8 bg-app">
      <Text className="text-danger text-center">Unit not found.</Text>
    </View>
  )

  const isOccupied = unit.status === 'occupied' && unit.tenant != null
  const balance = unit.balance
  const chipVariant = unitPaymentChipVariant(balance, isOccupied)
  const chipLabel = unitStatusLabel(balance, isOccupied)
  const amenities: string[] = unit.amenities ? JSON.parse(unit.amenities) : []
  const unitTypeLabel = unit.unit_type ? UNIT_TYPE_LABELS[unit.unit_type] ?? unit.unit_type : null

  return (
    <View className="flex-1 bg-app">
      <AppHeader
        title={unit.unit_number}
        right={
          <View style={{ marginRight: 8 }}>
            <StatusChip variant={chipVariant} label={chipLabel} />
          </View>
        }
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Unit info card */}
        <View
          className="mx-4 mt-4 rounded-xl p-4"
          style={{ backgroundColor: colors.surface }}
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-base font-bold" style={{ color: colors.textPrimary }}>
                {unit.unit_number}{unit.floor != null ? ` — Floor ${unit.floor}` : ''}
              </Text>
              {unitTypeLabel && (
                <Text className="text-sm mt-[2px]" style={{ color: colors.textSecondary }}>
                  {unitTypeLabel}{unit.size_sqm != null ? ` · ${unit.size_sqm}sqm` : ''}
                </Text>
              )}
            </View>
            {/* Furnished / unit-type badge */}
            {unitTypeLabel && (
              <View
                className="px-2 py-[3px] rounded-full ml-2"
                style={{ backgroundColor: colors.elevated }}
              >
                <Text className="text-[11px] font-medium" style={{ color: colors.textSecondary }}>
                  {unitTypeLabel}
                </Text>
              </View>
            )}
          </View>

          {amenities.length > 0 && (
            <View className="mt-3">
              <AmenityChipSelector selected={amenities} readOnly />
            </View>
          )}
        </View>

        {/* Current tenant */}
        {isOccupied && unit.tenant && (
          <TouchableOpacity
            onPress={() => router.push(`/(admin)/tenants/${unit.tenant!.id}`)}
            className="mx-4 mt-3 rounded-xl p-4 flex-row items-center"
            style={{ backgroundColor: colors.surface }}
            activeOpacity={0.7}
          >
            <AvatarInitials name={unit.tenant.full_name} size="md" />
            <View className="flex-1 ml-3">
              <Text className="text-[15px] font-semibold" style={{ color: colors.textPrimary }}>
                {unit.tenant.full_name}
              </Text>
              <Text className="text-[13px] mt-[2px]" style={{ color: colors.textSecondary }}>
                Move-in {dayjs(unit.tenant.move_in_date).format('MMM D, YYYY')} · {unit.tenant.billing_type === 'monthly' ? 'MTM' : 'Daily'}
              </Text>
            </View>
            <View className="items-end">
              <AmountText amount={balance} variant={balance > 0 ? 'owed' : 'zero'} />
              <Text className="text-[11px] mt-[2px]" style={{ color: colors.textMuted }}>
                balance
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Balance card */}
        {isOccupied && (
          <View className="mt-3">
            <BalanceCard
              amount={balance}
              variant={balance > 0 ? 'danger' : 'success'}
              onRecordPayment={() => router.push('/(admin)/billing/new')}
            />
          </View>
        )}

        {/* Maintenance section */}
        <View className="mt-4">
          <SectionHeader
            title="Maintenance"
            count={unit.openMaintenanceCount}
            onViewAll={() =>
              router.push(`/(admin)/maintenance?unitId=${id}` as never)
            }
          />
          {unit.openMaintenanceCount === 0 && (
            <View className="px-4 pb-2">
              <Text className="text-[13px]" style={{ color: colors.textMuted }}>
                No open maintenance issues
              </Text>
            </View>
          )}
        </View>

        {/* Documents section */}
        <View className="mt-2">
          <SectionHeader
            title="Documents"
            onViewAll={() =>
              router.push(
                `/(admin)/properties/${propertyId}/units/${id}/documents` as never,
              )
            }
          />
          {unit.documentCategories.length > 0 ? (
            <View className="flex-row flex-wrap gap-2 px-4 pb-2">
              {unit.documentCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() =>
                    router.push(
                      `/(admin)/properties/${propertyId}/units/${id}/documents` as never,
                    )
                  }
                  className="px-3 py-[6px] rounded-full"
                  style={{ backgroundColor: colors.elevated }}
                >
                  <Text
                    className="text-[12px] capitalize"
                    style={{ color: colors.textSecondary }}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="px-4 pb-2">
              <Text className="text-[13px]" style={{ color: colors.textMuted }}>
                No documents
              </Text>
            </View>
          )}
        </View>

        {/* Bed map row (Bedspacer only) */}
        {unit.unit_type === 'bedspacer' && (
          <TouchableOpacity
            onPress={() =>
              router.push(
                `/(admin)/properties/${propertyId}/units/${id}/bed-map` as never,
              )
            }
            className="mx-4 mt-4 rounded-xl p-4 flex-row items-center justify-between"
            style={{ backgroundColor: colors.surface }}
            activeOpacity={0.75}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="grid-outline" size={20} color={colors.primary} />
              <Text className="text-[15px] font-medium" style={{ color: colors.textPrimary }}>
                View Bed Map
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  )
}
