import React from 'react'
import { View, ScrollView, Text, TouchableOpacity } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import dayjs from 'dayjs'
import { useUnitDetail } from '../../../../../../hooks/useUnits'
import {
  AppHeader, LoadingSpinner, StatusChip, AvatarInitials,
  BalanceCard, SectionHeader, AmountText, ScreenView,
} from '../../../../../../components/ui'
import { colors } from '../../../../../../constants/theme'

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

  return (
    <ScreenView edges={['bottom']}>
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
          <Text className="text-base font-bold" style={{ color: colors.textPrimary }}>
            {unit.unit_number}
          </Text>
          {unit.notes && (
            <Text style={{ fontSize: 13, marginTop: 4, color: colors.textMuted }}>{unit.notes}</Text>
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
      </ScrollView>
    </ScreenView>
  )
}
